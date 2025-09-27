# Ant Chatbot (local demo)
## Setup
1) Copy `.env.example` to `.env` and fill keys (OpenAI, Supabase, Google Drive service account).
2) Install and run:
   ```bash
   npm install
   npm start
   ```
3) Open http://localhost:3000
## Docker
   ```bash
   docker build -t ant-chatbot .
   docker run --env-file .env -p 3000:3000 ant-chatbot
   ```
## Supabase
Run `supabase_schema.sql` in the SQL editor.
