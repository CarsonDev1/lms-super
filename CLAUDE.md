# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Structure

Three independent apps — each must be run separately:

| Directory | Stack | Purpose |
|---|---|---|
| `lms-backend/` | Node.js + Express + MongoDB | REST API + Socket.io server |
| `lms-admin/` | React 18 + Vite + Ant Design | Admin / instructor panel |
| `lms-frontend/` | Next.js 14 + Tailwind CSS | Student-facing storefront |

---

## Commands

### Backend (`lms-backend/`)
```bash
npm run dev          # Nodemon dev server (port 5000)
npm start            # Production
npm run lint         # ESLint
npm run lint:fix     # ESLint auto-fix

# Docker (recommended — starts MongoDB + backend + Mongo Express)
docker-compose up -d
docker-compose down
docker-compose logs -f
```
- API docs: `http://localhost:5000/api-docs` (Swagger UI)
- Mongo Express UI: `http://localhost:8081`
- Docker dev URI: `mongodb://admin:admin123@localhost:27017/lms-database?authSource=admin`

### Admin (`lms-admin/`)
```bash
npm run dev          # Vite dev server (port 3000, proxies /api → localhost:5000)
npm run build        # TypeScript compile + Vite build
npm run lint         # ESLint
```

### Frontend (`lms-frontend/`)
```bash
npm run dev          # Next.js dev server (port 3001 by default)
npm run build        # Next.js production build
npm run lint         # Next.js ESLint
```

**No test framework is configured** in any of the three apps.

---

## Backend Architecture

**Runtime**: ES6 modules (`"type": "module"` in package.json — use `import`/`export`, never `require`).

**Entry points**:
- `src/server.js` — HTTP server, Socket.io init, graceful shutdown
- `src/app.js` — Express setup: MongoDB connection, global middleware, all 24 route registrations

**Pattern**: MVC + service layer. Flow: `Routes → Middleware → Controllers → Services/Models → Response`

### Protected route pattern
```javascript
router.post('/endpoint', authenticate, authorize('role'), validationRules, validate, controller)
```
- `authenticate` — Verifies JWT Bearer header, populates `req.user`
- `authorize(...roles)` — Checks `req.user.role`
- `validationRules` — Arrays of `express-validator` checks (`src/validators/`)
- `validate` — `src/middlewares/validate.js` throws `400` on first error

### Authentication
- JWT: 15m access tokens + 7d refresh tokens stored in the `Session` model
- OAuth: Google + Facebook via Passport.js (`src/config/passport.js`)
- Sessions tracked per-device with IP + user-agent; multiple concurrent sessions supported
- Roles: `student`, `instructor`, `reviewer`, `admin`, `guest`, `user`

### Database
- MongoDB via Mongoose; connection in `src/config/database.js`
- 27 models in `src/models/`, all with `timestamps: true`
- `Course` uses **embedded** curriculum: `course → sections[] → lessons[]` — there is no separate `Lesson` collection

### Real-time
- Socket.io configured in `src/config/socket.js`, requires JWT auth on connection
- Handles: online/offline presence, direct chat, typing indicators, read receipts, live notifications

### Cross-cutting concerns
- **Errors**: Global handler in `src/middlewares/errorHandler.js` — maps Mongoose/JWT errors to HTTP codes; suppresses stack traces in production
- **Logging**: Winston (`src/config/logger.js`) → `logs/error.log` + `logs/combined.log`. Use `logger`, not `console.log`
- **File uploads**: Multer (`src/middlewares/upload.js`) → Cloudinary (`src/config/cloudinary.js`)
- **Rate limiting**: 100 req / 15 min, applied globally in `src/app.js`

### Environment setup
Copy `lms-backend/.env.example` to `lms-backend/.env`. Minimum required:
`MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLOUDINARY_*`, `GOOGLE_*` / `FACEBOOK_*` (for OAuth), `EMAIL_*` (for email), `SEPAY_*` (for payments).

---

## Admin Panel Architecture (`lms-admin/`)

TypeScript + React 18 SPA built with Vite. Path alias `@/` maps to `src/`.

- **Routing**: `src/config/routes.tsx` — central route definitions; `src/App.tsx` wraps everything in a `DashboardLayout` or login page
- **API layer**: `src/api/client.ts` — Axios instance with base URL from `VITE_API_BASE_URL`; endpoint modules in `src/api/` (auth, users, courses, etc.)
- **State**: Zustand stores in `src/stores/` (`authStore`, `appStore`, `queryStore`)
- **Styling**: Global SCSS in `src/styles/` with a variables file auto-imported by Vite's SCSS preprocessor config

Environment: copy `lms-admin/.env.example` → `lms-admin/.env` with `VITE_API_BASE_URL=http://localhost:5000/api`.

---

## Frontend Architecture (`lms-frontend/`)

Next.js 14 App Router. Path alias `@/` maps to the repo root of `lms-frontend/`.

- **Route groups**: `app/(public)/` (course browsing), `app/(auth)/` (login/register), `app/(learning)/` (enrolled course player)
- **API services**: `services/` — Axios-based API clients
- **State**: Zustand stores in `stores/`
- **UI**: Tailwind CSS + Radix UI primitives; utility helpers in `lib/` (clsx + tailwind-merge pattern)
