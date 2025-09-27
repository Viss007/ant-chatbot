# Ant Chatbot — Bolt Plan

Objective:
1) Boot server (node ../src/server.js)
2) Validate:
   - GET http://localhost:3000/healthz → "ok"
   - POST /api/chat {question:"hello", session_identifier:"bolt-123"} → ok:true
   - GET /api/history?session_identifier=bolt-123 → JSON with >= 2 rows
3) If a check fails: propose a diff, apply it, rerun checks. Show unified diffs and outputs.

Constraints:
- Never print secrets. Ask for SERVICE_ROLE when missing.
- Edits only in ../src and ../package.json unless otherwise stated.
- Stop after checks pass.
