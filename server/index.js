import express from 'express';
import bodyParser from 'body-parser';
import mongoose from "mongoose";
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { MongoClient, ServerApiVersion } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(bodyParser.json());

const MONGO_URI = "";
const DB_NAME = process.env.DB_NAME || 'Compiler';

let db;
let queryHistoryCollection;

async function connectMongo() {
  const client = new MongoClient(MONGO_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  await client.connect();

  await client.db('admin').command({ ping: 1 });
  console.log('✅  connection successful!');

  db = client.db(DB_NAME);
  queryHistoryCollection = db.collection('query_history');
  console.log(`📦  Using database: ${DB_NAME}`);
}


function parseCompilerOutput(raw) {
  
  const matchLine = raw
    .split('\n')
    .find(line => line.toLowerCase().includes('mongodb output'));

  if (!matchLine) {
    throw new Error(`Unrecognised compiler output: ${raw}`);
  }

  
  const line = matchLine.replace(/^MongoDB Output:\s*/i, '').trim();
  console.log('Parsed line:', line);

  
  const match = line.match(/^db\.([^.]+)\.(\w+)\(([\s\S]*?)\);?$/);
  if (!match) {
    throw new Error(`Unrecognised compiler output: ${line}`);
  }

  const collectionName = match[1];
  const operation      = match[2].toLowerCase();  // find / deleteone / deletemany
  const filterStr      = match[3].trim() || '{}';

  console.log('Collection:', collectionName);
  console.log('Operation:', operation);
  console.log('FilterStr:', filterStr);

  
  const jsonReady = filterStr.replace(/'/g, '"');

  let filter = {};
  try {
    filter = JSON.parse(jsonReady);
  } catch {
    
    console.warn('Filter parse failed, using empty filter. Raw:', filterStr);
    filter = {};
  }

  return { collectionName, operation, filter };
}


app.post('/parse', (req, res) => {
  const compilerDir = path.join(__dirname, '../compiler');
  const nlqpProcess = spawn('./nlqp', [], { cwd: compilerDir });

  let responded  = false;
  let output     = '';
  let errOutput  = '';   // ← capture stderr separately

  nlqpProcess.on('error', (err) => {
    console.error('Failed to start compiler:', err);
    if (!responded) {
      responded = true;
      return res.status(500).json({ error: 'Could not start compiler' });
    }
  });

  nlqpProcess.stdout.on('data', (data) => { output    += data.toString(); });
  nlqpProcess.stderr.on('data', (data) => { errOutput += data.toString(); }); // ← collect stderr

  nlqpProcess.on('close', async (code) => {
    if (responded) return;

    console.log(`Compiler exited with code: ${code}`);
    console.log('stdout:', JSON.stringify(output));
    console.log('stderr:', JSON.stringify(errOutput));

    
    if (!output.trim()) {
      responded = true;
      return res.status(400).json({
        error: errOutput.trim() || 'Compiler produced no output'
      });
    }

    try {
      const { collectionName, operation, filter } = parseCompilerOutput(output);

      console.log('Operation:', operation);
      console.log('Collection:', collectionName);
      console.log('Filter:', filter);

      if (operation === 'find') {
        await handleFind(collectionName, filter, output, req, res);

      } else if (operation === 'deleteone') {
        await handleDelete(collectionName, filter, 'deleteOne', output, req, res);

      } else if (operation === 'deletemany') {
        await handleDelete(collectionName, filter, 'deleteMany', output, req, res);

      } else {
        responded = true;
        return res.status(400).json({
          error: `Unsupported operation: ${operation}`,
          compilerOutput: output.trim()
        });
      }

    } catch (err) {
      console.error('Backend error:', err);
      if (!responded) {
        responded = true;
        res.status(500).json({ error: err.message });
      }
    }
  });

  nlqpProcess.stdin.write((req.body.query || '').trim() + '\n');
  nlqpProcess.stdin.end();
});



async function handleFind(collectionName, filter, mongoQuery, req, res) {
  const results = await db.collection(collectionName).find(filter).toArray();

  await queryHistoryCollection.insertOne({
    query_text:      req.body.query,
    generated_query: mongoQuery.trim(),
    operation:       'find',
    result:          results,
    generated_at:    new Date(),
  });

  res.json({ query: mongoQuery.trim(), results });
}

async function handleDelete(collectionName, filter, type, mongoQuery, req, res) {
  const collection = db.collection(collectionName);
  const result = type === 'deleteOne'
    ? await collection.deleteOne(filter)
    : await collection.deleteMany(filter);

  await queryHistoryCollection.insertOne({
    query_text:      req.body.query,
    generated_query: mongoQuery.trim(),
    operation:       type,
    result:          { deletedCount: result.deletedCount },
    generated_at:    new Date(),
  });

  res.json({
    query:        mongoQuery.trim(),
    deletedCount: result.deletedCount,
    message:      `${result.deletedCount} document(s) deleted successfully`
  });
}

app.get('/databases', async (req, res) => {
  try {
    const dbs = await db.admin().listDatabases();

    const formatted = dbs.databases.map((database, index) => ({
      id: index + 1,
      name: database.name,
      lastEdit: new Date().toLocaleDateString()
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to load databases');
  }
});
app.get('/view-table/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    const collection = db.collection(tableName);
    const data = await collection.find({}).toArray();
    console.log(data);
    res.json({ data });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error');
  }
});
app.get('/collections', async (req, res) => {
  try {
    const collections = await db.listCollections().toArray();

    const formatted = collections.map((col, index) => ({
      id: index + 1,
      name: col.name
    }));

    res.json(formatted);

  } catch (err) {
    console.error('Error fetching collections:', err);
    res.status(500).send('Failed to load collections');
  }
});
// GET /history  –  fetch all past queries newest-first
app.get('/history', async (req, res) => {
  try {
    const results = await queryHistoryCollection
      .find({})
      .sort({ generated_at: -1 })
      .toArray();
    res.json(results);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(400).send(`Error fetching history: ${err.message}`);
  }
});

const PORT = process.env.PORT || 5000;

connectMongo()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀  Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌  Could not connect to MongoDB Atlas:', err.message);
    process.exit(1);
  });
