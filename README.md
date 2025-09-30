# Ant Chatbot 🐜

[![CI](https://github.com/Viss007/ant-chatbot/actions/workflows/ci.yml/badge.svg)](https://github.com/Viss007/ant-chatbot/actions/workflows/ci.yml)

A lightweight, Express-based chatbot application with OpenAI integration and Supabase persistence. Features a clean web interface and fallback to echo mode when OpenAI is not configured.

## Features

- 💬 **Conversational AI**: Powered by OpenAI (optional, falls back to echo mode)
- 💾 **Message Persistence**: All conversations stored in Supabase
- 🚀 **Simple Setup**: Minimal dependencies, easy to deploy
- 🔒 **Session Management**: UUID-based session identifiers
- 📊 **Usage Tracking**: Optional token usage counters
- 🎨 **Clean UI**: Vanilla JavaScript frontend with dark theme
- 🐳 **Docker Ready**: Includes Dockerfile for containerized deployment

## Quick Start

### Prerequisites

- Node.js 18.x or 20.x
- A [Supabase](https://supabase.com) account
- (Optional) An [OpenAI API](https://platform.openai.com) key

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Viss007/ant-chatbot.git
   cd ant-chatbot
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env and add your credentials
   ```

4. **Set up the database**:
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Run the SQL script in `supabase_schema.sql`

5. **Start the server**:
   ```bash
   npm start
   ```

6. **Open in browser**:
   ```
   http://localhost:3000
   ```

## Environment Variables

Create a `.env` file based on `.env.example`:

### Required
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

### Optional
- `PORT`: Server port (default: 3000)
- `OPENAI_API_KEY`: OpenAI API key (runs in echo mode if not set)
- `OPENAI_MODEL`: OpenAI model to use (default: gpt-4o-mini)
- `MAX_OUTPUT_TOKENS`: Maximum tokens per response (default: 200)

## API Endpoints

### Health & Info
- `GET /healthz` - Health check (returns "ok")
- `GET /mode` - Configuration status (OpenAI enabled or not)
- `GET /version` - Application version and timestamp

### Chat
- `POST /api/chat` - Send a message and get a response
  ```json
  {
    "question": "Hello!",
    "session_identifier": "uuid-v4-here"
  }
  ```

- `GET /api/history` - Get conversation history
  ```
  /api/history?session_identifier=uuid-v4-here
  ```

### Testing
- `GET /proof/messages` - Get latest message rows (with optional limit)

## Docker Deployment

Build and run with Docker:

```bash
docker build -t ant-chatbot .
docker run --env-file .env -p 3000:3000 ant-chatbot
```

## Deployment to Railway

1. Fork this repository
2. Create a new project in [Railway](https://railway.app)
3. Connect your GitHub repository
4. Add environment variables in Railway dashboard
5. Deploy!

## Development

### Project Structure
```
ant-chatbot/
├── src/
│   └── server.js          # Main Express server
├── public/
│   └── index.html         # Frontend UI
├── .github/
│   ├── workflows/
│   │   └── ci.yml         # CI/CD pipeline
│   ├── ISSUE_TEMPLATE/    # Issue templates
│   └── PULL_REQUEST_TEMPLATE.md
├── supabase_schema.sql    # Database schema
├── .env.example           # Environment template
├── package.json
└── Dockerfile
```

### Running Tests

The CI pipeline tests:
- Health check endpoint
- Mode endpoint
- Version endpoint
- Server startup and shutdown

Run manual tests:
```bash
# Health check
curl http://localhost:3000/healthz

# Mode check
curl http://localhost:3000/mode

# Version check
curl http://localhost:3000/version

# Send a message
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"Hello!","session_identifier":"test-123"}'

# Get history
curl http://localhost:3000/api/history?session_identifier=test-123
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## CI/CD

GitHub Actions automatically runs tests on:
- Push to main branch
- Pull requests to main branch

The pipeline validates:
- Required files exist
- Dependencies install correctly
- Server starts successfully
- All endpoints respond correctly

## Security

- Never commit `.env` file (it's in .gitignore)
- Use environment variables for all secrets
- Rotate API keys regularly
- Use SUPABASE_SERVICE_ROLE_KEY only on server-side
- Review CORS settings before production deployment

## Troubleshooting

### Server won't start
- Check that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in `.env`
- Verify Node.js version (18.x or 20.x)

### Chat not working
- Ensure Supabase `messages` table exists (run `supabase_schema.sql`)
- Check Supabase credentials are correct

### OpenAI errors
- Verify `OPENAI_API_KEY` is valid
- Check OpenAI account has credits
- Server will fall back to echo mode if OpenAI fails

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

- 🐛 [Report a bug](https://github.com/Viss007/ant-chatbot/issues/new?template=bug_report.md)
- 💡 [Request a feature](https://github.com/Viss007/ant-chatbot/issues/new?template=feature_request.md)
- 💬 [Ask a question](https://github.com/Viss007/ant-chatbot/discussions)

---

Built with ❤️ using Node.js, Express, OpenAI, and Supabase
