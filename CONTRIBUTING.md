# Contributing to Ant Chatbot

Thank you for your interest in contributing to Ant Chatbot! We welcome contributions from the community.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ant-chatbot.git
   cd ant-chatbot
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env and add your Supabase credentials
   ```
5. **Run the database schema**:
   - Go to your Supabase project
   - Run the SQL in `supabase_schema.sql` in the SQL editor

## Development Workflow

1. **Create a branch** for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards (see below)

3. **Test your changes** locally:
   ```bash
   npm start
   # Test endpoints:
   curl http://localhost:3000/healthz
   curl http://localhost:3000/mode
   curl http://localhost:3000/version
   ```

4. **Commit your changes** with a clear message:
   ```bash
   git add .
   git commit -m "Add feature: description of your changes"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request** on GitHub using our PR template

## Coding Standards

### JavaScript Style
- Use **ESM imports** (import/export) instead of CommonJS (require)
- Use **const** and **let** instead of var
- Use **arrow functions** for callbacks and simple functions
- Use **async/await** instead of promise chains
- Use **template literals** for string interpolation
- Add **error handling** with try/catch blocks

### Code Organization
- Keep route handlers in `src/server.js` organized by section
- Use clear, descriptive variable names
- Add comments for complex logic
- Keep functions focused and single-purpose

### API Endpoints
- All API endpoints should be under `/api/*`
- Use appropriate HTTP methods (GET, POST, etc.)
- Return JSON responses with consistent structure
- Include proper error handling and status codes
- Validate input parameters

### Error Handling Pattern
```javascript
try {
  // Your code here
  return res.json({ ok: true, data });
} catch (e) {
  console.error("ERROR_CONTEXT:", e);
  return res.status(500).json({ 
    error: "internal_error", 
    detail: e?.message || String(e) 
  });
}
```

## Testing

Before submitting a PR, ensure:
- [ ] The server starts without errors
- [ ] Health check endpoint works: `curl http://localhost:3000/healthz`
- [ ] Mode endpoint works: `curl http://localhost:3000/mode`
- [ ] Version endpoint works: `curl http://localhost:3000/version`
- [ ] Your new endpoints work as expected
- [ ] No existing functionality is broken

## Pull Request Guidelines

When submitting a PR:
1. **Use the PR template** - it helps us review faster
2. **Include a clear description** of what changes you made and why
3. **Reference any related issues** using #issue_number
4. **Update documentation** if you're adding new features
5. **Update `.env.example`** if you're adding new environment variables
6. **Keep PRs focused** - one feature or fix per PR
7. **Respond to feedback** - we may ask for changes

## Issue Guidelines

When creating an issue:
1. **Use the issue templates** (Bug Report or Feature Request)
2. **Search existing issues** first to avoid duplicates
3. **Provide clear reproduction steps** for bugs
4. **Include relevant logs or screenshots**
5. **Specify your environment** (Node version, OS, etc.)

## Environment Variables

If you add new environment variables:
1. Add them to `.env.example` with placeholder values
2. Document them in the PR description
3. Update `.github/copilot-instructions.md` if relevant
4. Add validation in the code if they're required

## Commit Message Format

Use clear, descriptive commit messages:
- **Good**: "Add rate limiting to chat endpoint"
- **Good**: "Fix session identifier validation bug"
- **Good**: "Update README with deployment instructions"
- **Bad**: "update"
- **Bad**: "fix bug"
- **Bad**: "changes"

## Code Review Process

1. A maintainer will review your PR
2. They may request changes or ask questions
3. Once approved, your PR will be merged
4. Your contribution will be included in the next release

## Questions?

If you have questions about contributing:
- Open an issue with your question
- Check existing documentation in README.md
- Review `.github/copilot-instructions.md` for technical details

## Code of Conduct

Please be respectful and professional in all interactions. We're here to build something great together!

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Ant Chatbot! 🐜
