# Ant Chatbot - GitHub Copilot Instructions

## Project Overview
Ant Chatbot is a lightweight Express-based chatbot application that integrates with OpenAI and Supabase. It provides a clean web interface for conversational AI with message persistence.

## Architecture
- **Backend**: Node.js + Express (ESM modules)
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI API (optional, falls back to echo mode)
- **Frontend**: Vanilla JavaScript with minimal dependencies

## Key Files
- `src/server.js`: Main Express server with all endpoints
- `public/index.html`: Frontend UI (single page)
- `supabase_schema.sql`: Database schema
- `.env`: Environment configuration (not committed)
- `.env.example`: Template for required environment variables

## Endpoints
### Public Endpoints
- `GET /healthz`: Health check (returns "ok")
- `GET /mode`: Returns configuration status (OpenAI enabled or not)
- `GET /version`: Returns version and timestamp

### API Endpoints (under /api/*)
- `POST /api/chat`: Send a message and get a response
- `GET /api/history`: Retrieve conversation history for a session

### Storage Proof
- `GET /proof/messages`: Get latest message rows (for testing)

## Environment Variables
### Required
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (server-side only)

### Optional
- `PORT`: Server port (default: 3000)
- `OPENAI_API_KEY`: OpenAI API key (if not set, uses echo mode)
- `OPENAI_MODEL`: Model to use (default: gpt-4o-mini)
- `MAX_OUTPUT_TOKENS`: Max tokens per response (default: 200)

## Database Schema
Tables in Supabase:
1. `messages`: Stores chat messages
   - `session_identifier`: UUID for session
   - `role`: 'user' or 'assistant'
   - `message_text`: The message content
   - `created_time`: Timestamp

2. `usage_counters` (optional): Tracks token usage
   - `session_identifier`: UUID for session
   - `day`: Date (YYYY-MM-DD)
   - `tokens_used`: Daily token count

## Code Style Guidelines
- Use ESM imports (import/export syntax)
- Use arrow functions for middleware and route handlers
- Keep error handling consistent (try/catch with error responses)
- Use const for immutable values
- Include meaningful error messages in console.error
- Return JSON responses with proper status codes
- Use async/await for asynchronous operations

## Common Patterns
### Error Handling
```javascript
try {
  // operation
  return res.json({ ok: true, data });
} catch (e) {
  console.error("ERROR:", e);
  return res.status(500).json({ error: "internal_error", detail: e?.message || String(e) });
}
```

### Request Validation
```javascript
const { field } = req.body || {};
if (!field) return res.status(400).json({ error: "Missing field" });
```

## Testing
- Health check: `curl http://localhost:3000/healthz`
- Mode check: `curl http://localhost:3000/mode`
- Chat: `curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d '{"question":"test","session_identifier":"test-123"}'`

## Development Workflow
1. Copy `.env.example` to `.env` and fill in your keys
2. Install dependencies: `npm install`
3. Run locally: `npm start`
4. Test endpoints using the scripts in `.bolt-workspace/scripts/`

## CI/CD
- GitHub Actions workflow runs on push and PR
- Tests health check, mode, and version endpoints
- Validates required files exist
- Runs on Node.js 18.x and 20.x

## Deployment
- Can be deployed to Railway, Heroku, or any Node.js hosting
- Requires environment variables to be set in the platform
- Uses PORT from environment or defaults to 3000
- Dockerfile included for containerized deployment

## Security Notes
- Never commit `.env` file (it's in .gitignore)
- Use SUPABASE_SERVICE_ROLE_KEY only on server-side
- CORS is currently open (*) - adjust for production
- Rotate API keys if they are exposed

## Contributing
- Create feature branches from main
- Follow existing code style
- Test locally before opening PR
- Update `.env.example` if adding new variables
- Add tests for new endpoints when possible

## Common Issues
1. **Server won't start**: Check that SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set
2. **Chat not working**: Verify Supabase `messages` table exists (run `supabase_schema.sql`)
3. **OpenAI errors**: Check OPENAI_API_KEY is valid, or run in echo mode without it
4. **Token limit errors**: Adjust MAX_OUTPUT_TOKENS environment variable

## Future Enhancements
- Add rate limiting per session
- Implement conversation context (multi-turn)
- Add authentication for production use
- Implement logging and monitoring
- Add unit and integration tests
- Support for streaming responses
- Add support for file uploads/attachments
