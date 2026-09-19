# Yatra Setu - Innovation Hub Tourism Ecosystem

Yatra Setu is a comprehensive, production-ready travel platform designed to provide a unified experience for planning, booking, and managing trips. The platform integrates a modern React frontend with a robust Node.js backend.

## 🌟 Key Features

- **AI Trip Planner:** Generates personalized itineraries using LLM-powered structured output with automatic retries.
- **Unified Booking Ecosystem:** Seamlessly book hotels, flights, local transport (autos/cabs), and experiences all from a single dashboard.
- **Smart Search & Geo-filtering:** Discover nearby hotels, attractions, and amenities using geospatial filtering and mapping integration (Google Places API).
- **Interactive Dashboards:** Role-based access control provides dedicated dashboards for Travelers, Businesses, and Admins.
- **Secure Authentication:** JWT-based authentication using short-lived access tokens and secure, `httpOnly` refresh cookies.
- **Flight & Transport APIs:** Flexible provider interfaces (like the `FlightProvider`) that allow swapping between local test data and real-world external flight APIs (Amadeus, Skyscanner, etc.).

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

```
.
├── src/                # Frontend React application code
│   ├── api/            # API client wrappers and types
│   ├── components/     # Reusable UI components (chat, layout, sections, etc.)
│   ├── pages/          # Page components (Dashboard, Flights, Hotels, etc.)
│   └── context/        # React context (AuthContext)
├── server/             # Backend Express application code
│   ├── src/
│   │   ├── controllers/# Route handlers and business logic orchestration
│   │   ├── services/   # Core business logic (maps, flights, etc.)
│   │   ├── validators/ # Zod validation schemas
│   │   └── routes/     # Express route definitions
│   ├── .env.example    # Example environment variables
│   └── README.md       # Backend-specific documentation
└── docs/               # Project documentation and architectural plans
```

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
Create a `.env` file in the `server` directory based on `server/.env.example`. You will need to provide your database URI, JWT secrets, LLM API keys (for AI trip planning), and Google Maps API keys.

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