# 🔍 Natural Language to MongoDB Query Processor
 
> A compiler-based tool that translates plain English queries into MongoDB query syntax using **Lex** (lexical analysis) and **Bison** (parsing), with a full-stack web interface.
 
---
 
## 📌 Overview
 
This project bridges the gap between non-technical users and MongoDB databases. Instead of writing complex query syntax, users type natural language sentences like:
 
> *"show all from users find age is greater than 25"*
 
...and the system automatically converts it into a valid MongoDB query:
 
```json
db.users.find({ "age": { "$gt": 25 } })
```
 
The pipeline is powered by a **Lex/Bison compiler** at its core, wrapped with a **Node.js backend** and a **React frontend** to provide an interactive web experience.
 
---
 
## 🏗️ Project Structure
 
```
├── compiler/          # Lex & Bison source files for NL → MongoDB translation
├── server/            # Node.js/Express backend — runs the compiler & serves API
├── mfrontend/         # React frontend — user interface for query input & results
└── .gitignore
```
 
---
 
## ✨ Features
 
- **Natural Language Input** — type queries in plain English
- **Lex Tokenizer** — recognizes keywords, identifiers, operators, and values
- **Bison Parser** — applies grammar rules to build a structured query tree
- **MongoDB Query Generation** — outputs valid `find()`, `insertOne()`, `updateOne()`, `deleteOne()` style queries
- **REST API** — backend exposes an endpoint to process queries programmatically
- **React Web UI** — clean interface to enter queries and view generated MongoDB output
---
 
## 🛠️ Tech Stack
 
| Layer | Technology |
|---|---|
| Lexer | Flex (Lex) |
| Parser | Bison (YACC) |
| Backend | Node.js, Express |
| Frontend | React.js |
| Database Target | MongoDB |
 
---
 
## ⚙️ Prerequisites
 
Make sure the following are installed on your system:
 
- **Flex** (`flex`) — lexical analyzer generator
- **Bison** (`bison`) — parser generator
- **GCC** — C compiler
- **Node.js** (v16+) and **npm**
### Install Flex & Bison (Linux/macOS)
 
```bash
# Ubuntu / Debian
sudo apt-get install flex bison gcc

## 💬 Supported Query Patterns
 
| Natural Language | MongoDB Query |
|---|---|
| `find all users` | `db.users.find({})` |
| `find all users where age greater than 25` | `db.users.find({ "age": { "$gt": 25 } })` |
| `find all products where price less than 100` | `db.products.find({ "price": { "$lt": 100 } })` |
| `find all orders where status equals delivered` | `db.orders.find({ "status": "delivered" })` |
 
> **Note:** Supported keywords typically include `find`, `where`, `equals`, `greater than`, `less than`, `and`, `or`. Refer to the grammar file in `/compiler` for the full list.
 
---
 
## 📁 Key Files
 
| File | Description |
|---|---|
| `compiler/lexer.l` | Flex rules for tokenizing natural language input |
| `compiler/parser.y` | Bison grammar for parsing tokens into MongoDB queries |
| `server/index.js` | Express server that bridges frontend and compiler |
| `mfrontend/src/App.js` | Main React component for the UI |
 
---
 
## 🐛 Troubleshooting
 
- **`flex: command not found`** — Install Flex using your package manager (see Prerequisites).
- **Compiler build fails** — Ensure GCC is installed and all `.l` / `.y` files are present in `/compiler`.
- **CORS errors on frontend** — Make sure the backend server is running on port 5000 before starting the frontend.
- **Port conflict** — Update the port in `server/index.js` and update the API URL in the frontend accordingly.
---
 
# macOS (via Homebrew)
brew install flex bison gcc
```
 
---
