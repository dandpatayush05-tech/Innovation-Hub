# System Architecture

## High-Level System Diagram

The system follows a modern three-tier architecture:

1. **Frontend (Client)**: A React application (using Vite/TypeScript) that provides the user interface. It manages state, renders views, and makes HTTP requests to the backend using Axios.
2. **Backend (API)**: A Node.js application using the Express framework. It exposes RESTful endpoints, handles business logic, authenticates users (JWT), and communicates securely with the database.
3. **Database (Storage)**: A PostgreSQL database managed by Supabase. It stores all application data (users, bookings, businesses).

**Flow:** `React Frontend` <--> `Express API (Node.js)` <--> `Supabase (PostgreSQL)`

## Folder Structure

### Frontend (`src/`)
- `api/`: Axios configuration and API client modules for different resources (e.g., `bookings.ts`, `auth.ts`).
- `assets/`: Static assets like images, SVGs, and fonts.
- `components/`: Reusable, presentation-level React components (buttons, modals, inputs).
- `config/`: Frontend configuration files and environment variable mappings.
- `context/`: React Context API providers for global state management (e.g., AuthContext).
- `data/`: Hardcoded mock data, constants, or static types.
- `pages/`: Top-level React components representing distinct routes/views.
- `utils/`: Helper functions and utility scripts (formatting, calculations).

### Backend (`server/src/`)
- `config/`: Configuration files mapping environment variables.
- `controllers/`: Request handlers that contain the core business logic.
- `middleware/`: Express middleware for cross-cutting concerns (auth checks, error handling, rate limiting).
- `routes/`: Express router definitions that map URLs to specific controller functions.
- `services/`: Modules handling external interactions (Supabase client initialization, AI providers, payment gateways).
- `utils/`: Helper functions (password hashing, JWT generation).
- `validators/`: Zod schemas for validating incoming request payloads.

## Request Lifecycle

When a user performs an action (e.g., booking a tour):
1. **React Component**: The user clicks a button in a React component, triggering a function.
2. **Axios Client**: The component calls a helper in the `api/` directory, which uses the configured Axios client (`api/axios.ts`). Axios attaches the `accessToken` from `localStorage` to the `Authorization` header.
3. **Express Route**: The HTTP request hits the backend Express server at a specific endpoint defined in `server/src/routes/`.
4. **Middleware**: The request passes through middleware. Specifically, `authGuard` verifies the JWT, extracts the user ID/role, and checks permissions. `zod` middleware validates the request body.
5. **Controller**: The request reaches the appropriate controller in `server/src/controllers/`. The controller executes business logic.
6. **Supabase**: The controller uses the Supabase service role client (via `server/src/services/`) to query or mutate data in the PostgreSQL database.
7. **Response**: The database results are returned to the controller, which formats a JSON response and sends it back to the Axios client, and finally, the React component updates the UI.

## Token Refresh Flow

The application uses a dual-token (Access + Refresh) system:
1. When an access token expires, the backend returns a `401 Unauthorized` status.
2. The Axios response interceptor (`src/api/axios.ts`) catches this `401` error.
3. If the request was not to an auth route, the interceptor pauses the failed request and calls the `POST /api/auth/refresh` endpoint.
4. Because the Axios instance is configured with `withCredentials: true`, it automatically sends the HTTP-only cookie containing the `refreshToken`.
5. The backend validates the refresh token and returns a new `accessToken`.
6. The interceptor updates `localStorage` with the new token, rewrites the `Authorization` header of the original paused request, and retries it seamlessly.
7. If the refresh request fails, the user is logged out and redirected to the login page.

## Required Environment Variables

- `PORT`: Port number for the Express server to run on.
- `NODE_ENV`: Current environment (e.g., 'development' or 'production').
- `SUPABASE_URL`: The URL of the Supabase project instance.
- `SUPABASE_SERVICE_ROLE_KEY`: The secret key to bypass RLS and interact with Supabase from the backend.
- `JWT_ACCESS_SECRET`: Secret key used to sign and verify short-lived access tokens.
- `JWT_REFRESH_SECRET`: Secret key used to sign and verify long-lived refresh tokens.
- `JWT_ACCESS_EXPIRY`: Lifespan of the access token (e.g., '15m').
- `JWT_REFRESH_EXPIRY`: Lifespan of the refresh token (e.g., '7d').
- `LLM_API_KEY`: API key for the AI provider (e.g., OpenAI) used for itinerary generation.
- `LLM_PROVIDER`: Identifier for the AI service being used.
- `FRONTEND_ORIGIN`: The URL of the frontend application, used to configure CORS.
- `RATE_LIMIT_WINDOW_MS`: Time window in milliseconds for rate-limiting requests.
- `RATE_LIMIT_MAX`: Maximum number of requests allowed per IP within the rate limit window.
- `RAZORPAY_KEY_ID`: Public key identifier for the Razorpay payment gateway.
- `RAZORPAY_KEY_SECRET`: Secret key for authenticating with the Razorpay payment gateway.
