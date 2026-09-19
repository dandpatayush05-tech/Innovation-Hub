# Yatra Setu Backend API

This is the production-minded backend for the Yatra Setu travel platform. It uses Node.js, Express, MongoDB, and TypeScript.

## Features
- **JWT Authentication** (Short-lived access tokens, `httpOnly` secure refresh cookies)
- **Role-based Access Control** (Travelers, Businesses, Admins)
- **AI Trip Planner** (OpenAI structured JSON generation with automatic retries)
- **Security Baseline** (Helmet, CORS, Rate Limiting, bcrypt password hashing)
- **Zod Validation** (Strict compile-time and runtime checks on all incoming requests)

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Ensure you have a `.env` file in the `server` directory (use `.env.example` as a template).
   Required variables include `MONGODB_URI`, JWT secrets, and `LLM_API_KEY` (for OpenAI).

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Seed the database (Optional but recommended):**
   In a separate terminal, run:
   ```bash
   npx tsx seed.ts
   ```
   This will clear the DB and populate it with destinations, hotels, and two demo accounts (`alex@example.com` and `sarah@example.com`, both with password `password123`).

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Check server uptime and health |
| POST | `/api/auth/register` | Public | Create a new user account |
| POST | `/api/auth/login` | Public | Login and receive tokens |
| POST | `/api/auth/refresh` | Cookie | Get a new access token using refresh cookie |
| POST | `/api/auth/logout` | Token | Logout and clear cookies |
| GET | `/api/auth/me` | Token | Get current user profile |
| POST | `/api/itineraries/generate` | Optional | Generate an AI trip plan (Strict Rate Limit) |
| GET | `/api/destinations` | Public | List all destinations |
| GET | `/api/hotels` | Public | List all hotels |
| POST | `/api/hotels` | Business | Add a new hotel |
| POST | `/api/bookings` | Token | Book a hotel |
| PATCH | `/api/bookings/:id/status`| Business | Update a booking status |

## Testing

Run unit/integration tests with Jest:
```bash
npm test
```
*(Tests cover the authentication flow and mock LLM integration)*

## Deployment
For production, ensure `NODE_ENV=production` is set. This enables secure cookie flags, strips stack traces from error responses, and switches morgan logging to `combined` format.
