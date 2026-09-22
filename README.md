# Yatra Setu - Innovation Hub Tourism Ecosystem

Yatra Setu is a comprehensive, production-ready travel platform designed to provide a unified experience for planning, booking, and managing trips. The platform integrates a modern React frontend with a robust Node.js backend.

## 🌟 Key Features

- **AI Trip Planner:** Generates personalized itineraries using LLM-powered structured output with automatic retries.
- **Unified Booking Ecosystem:** Seamlessly book hotels, flights, local transport (autos/cabs), and experiences all from a single dashboard.
- **Smart Search & Geo-filtering:** Discover nearby hotels, attractions, and amenities using geospatial filtering and mapping integration (Google Places API).
- **Interactive Dashboards:** Role-based access control provides dedicated dashboards for Travelers, Businesses, and Admins.
- **Secure Authentication:** JWT-based authentication using short-lived access tokens and secure, `httpOnly` refresh cookies.
- **Flight & Transport APIs:** Flexible provider interfaces (like the `FlightProvider`) that allow swapping between local test data and real-world external flight APIs (Amadeus, Skyscanner, etc.).

## 🏗️ System Architecture

The system follows a modern three-tier architecture:

1. **Frontend (Client)**: A React application (using Vite/TypeScript) that provides the user interface. It manages state, renders views, and makes HTTP requests to the backend using Axios.
2. **Backend (API)**: A Node.js application using the Express framework. It exposes RESTful endpoints, handles business logic, authenticates users (JWT), and communicates securely with the database.
3. **Database (Storage)**: A PostgreSQL database managed by Supabase. It stores all application data (users, bookings, businesses).

**Flow:** `React Frontend` <--> `Express API (Node.js)` <--> `Supabase (PostgreSQL)`

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Forms & Validation:** `react-hook-form` + `zod`
- **Routing:** React Router v6
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL) / MongoDB (via existing schemas)
- **Validation:** `zod` for strict compile-time and runtime checks on incoming requests
- **Security:** Helmet, CORS, Rate Limiting, bcrypt for password hashing

## 📂 Project Structure

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

## 🔄 Request Lifecycle

When a user performs an action (e.g., booking a tour):
1. **React Component**: The user clicks a button in a React component, triggering a function.
2. **Axios Client**: The component calls a helper in the `api/` directory, which uses the configured Axios client (`api/axios.ts`). Axios attaches the `accessToken` from `localStorage` to the `Authorization` header.
3. **Express Route**: The HTTP request hits the backend Express server at a specific endpoint defined in `server/src/routes/`.
4. **Middleware**: The request passes through middleware. Specifically, `authGuard` verifies the JWT, extracts the user ID/role, and checks permissions. `zod` middleware validates the request body.
5. **Controller**: The request reaches the appropriate controller in `server/src/controllers/`. The controller executes business logic.
6. **Supabase**: The controller uses the Supabase service role client (via `server/src/services/`) to query or mutate data in the PostgreSQL database.
7. **Response**: The database results are returned to the controller, which formats a JSON response and sends it back to the Axios client, and finally, the React component updates the UI.

## 🔐 Token Refresh Flow

The application uses a dual-token (Access + Refresh) system:
1. When an access token expires, the backend returns a `401 Unauthorized` status.
2. The Axios response interceptor (`src/api/axios.ts`) catches this `401` error.
3. If the request was not to an auth route, the interceptor pauses the failed request and calls the `POST /api/auth/refresh` endpoint.
4. Because the Axios instance is configured with `withCredentials: true`, it automatically sends the HTTP-only cookie containing the `refreshToken`.
5. The backend validates the refresh token and returns a new `accessToken`.
6. The interceptor updates `localStorage` with the new token, rewrites the `Authorization` header of the original paused request, and retries it seamlessly.
7. If the refresh request fails, the user is logged out and redirected to the login page.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- A Supabase/PostgreSQL or MongoDB database

### 1. Backend Setup
Navigate to the server directory, install dependencies, and configure your environment:
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory based on `server/.env.example`. Required variables include:
- `PORT`: Port number for the Express server to run on.
- `NODE_ENV`: Current environment (e.g., 'development' or 'production').
- `SUPABASE_URL`: The URL of the Supabase project instance.
- `SUPABASE_SERVICE_ROLE_KEY`: The secret key to bypass RLS and interact with Supabase from the backend.
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`: Secret keys used to sign and verify tokens.
- `JWT_ACCESS_EXPIRY` / `JWT_REFRESH_EXPIRY`: Lifespans of the access and refresh tokens.
- `LLM_API_KEY` / `LLM_PROVIDER`: API key and Provider for the AI service used for itinerary generation.
- `FRONTEND_ORIGIN`: The URL of the frontend application, used to configure CORS.
- `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX`: Rate limiting configurations.
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`: Razorpay payment gateway keys.

Start the backend server:
```bash
npm run dev
```

### 2. Frontend Setup
In a new terminal window, navigate to the root directory, install dependencies, and start the frontend application:
```bash
npm install
npm run dev
```

The frontend will start using Vite, typically accessible at `http://localhost:5173/`.

## 🤝 Contributing
Refer to the `docs/` folder for architectural decisions, feature specs, and integration plans before making structural changes to the codebase.