# 🔍 Natural Language to MongoDB Query Processor
 
> A compiler-based tool that translates plain English queries into MongoDB query syntax using **Lex** (lexical analysis) and **Bison** (parsing), with a full-stack web interface.
 
---
 
## 📌 Overview
 
This project bridges the gap between non-technical users and MongoDB databases. Instead of writing complex query syntax, users type natural language sentences like:
 
> *"Find all users where age is greater than 25"*
 
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
 
# macOS (via Homebrew)
brew install flex bison gcc
```
 
---
