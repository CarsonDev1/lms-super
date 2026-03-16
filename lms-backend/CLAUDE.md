# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start with nodemon (auto-reload)
npm start            # Production server

# Linting
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix ESLint errors

# Testing
# No test framework is currently set up. npm test exits with an error.

# Docker (recommended for full stack)
docker-compose up -d        # Start MongoDB + backend + mongo-express
docker-compose down         # Stop all services
docker-compose logs -f      # Tail logs
```

**Ports**: Backend runs on `5000`, Mongo Express UI on `8081`, API docs at `http://localhost:5000/api-docs`.

## Architecture

**Runtime**: Node.js with ES6 modules (`"type": "module"` in package.json — use `import`/`export`, not `require`).

**Entry points**:
- `src/server.js` — Creates HTTP server, initializes Socket.io, handles graceful shutdown
- `src/app.js` — Express setup: MongoDB connection, security middleware, all route registration

**Pattern**: MVC with a service layer. The flow is:
`Routes → Middleware chain → Controllers → Services/Models → Response`

### Request middleware chain
Every protected route follows this pattern:
```javascript
router.post('/endpoint', authenticate, authorize('role'), validationRules, validate, controller)
```
- `authenticate` — Verifies JWT from Bearer header, loads `req.user`
- `authorize(...roles)` — Checks `req.user.role` against allowed roles
- `validationRules` — Arrays of `express-validator` checks (in `src/validators/`)
- `validate` — Middleware in `src/middlewares/validate.js` that throws on validation errors

### Authentication
- **JWT**: Short-lived access tokens (15m) + long-lived refresh tokens (7d, stored in `Session` model)
- **OAuth**: Google and Facebook via Passport.js strategies in `src/config/passport.js`
- **Sessions**: Stored in MongoDB with IP address and user-agent; supports multiple concurrent sessions per user
- **Roles**: `student`, `instructor`, `admin`, `reviewer`, `guest`, `user`

### Database
- MongoDB via Mongoose. Connection config in `src/config/database.js`.
- All 27 models are in `src/models/`. All have timestamps enabled.
- `Course` uses deeply embedded documents: `curriculum → sections → lessons` (no separate Lesson collection).
- For Docker dev: `MONGODB_URI=mongodb://admin:admin123@localhost:27017/lms-database?authSource=admin`

### Real-time (Socket.io)
Initialized in `src/server.js`, configured in `src/config/socket.js`. Requires JWT auth on connection. Handles: online/offline presence, chat rooms, typing indicators, read receipts, and notification push.

### Key cross-cutting concerns
- **Error handling**: Global handler in `src/middlewares/errorHandler.js` — catches all thrown errors, maps Mongoose/JWT errors to HTTP responses. In production, stack traces are suppressed.
- **Logging**: Winston in `src/config/logger.js`. Writes to `logs/error.log` and `logs/combined.log`. Use `logger` (not `console.log`) in application code.
- **File uploads**: Multer (`src/middlewares/upload.js`) + Cloudinary (`src/config/cloudinary.js`).
- **Rate limiting**: 100 requests per 15 minutes (configured in `src/app.js`).

### Environment variables
Copy `.env.example` to `.env`. Required vars: `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLOUDINARY_*` (for uploads), `SMTP_*` (for email), `GOOGLE_*` / `FACEBOOK_*` (for OAuth).
