import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { supabase } from './config/supabase';
import { handleRazorpayWebhook } from './controllers/paymentController';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: env.NODE_ENV === 'production' ? env.FRONTEND_ORIGIN : [/http:\/\/localhost:\d+/, /http:\/\/127\.0\.0\.1:\d+/],
  credentials: true
}));

// Webhook route MUST be before express.json() to preserve raw body for signature verification
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), handleRazorpayWebhook);

app.use(express.json());
app.use(cookieParser());

// Custom morgan format for requests to prevent logging sensitive bodies implicitly
if (env.NODE_ENV !== 'test') {
  // Morgan only logs headers/URLs by default anyway, but this custom format explicitly confirms what we track.
  const format = ':method :url :status :res[content-length] - :response-time ms';
  app.use(morgan(format));
}

// Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  message: { error: { message: 'Too many requests from this IP, please try again later.' } }
});
app.use('/api', globalLimiter);

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // limit each IP to 100 writes per 15 minutes
  message: { error: { message: 'Too many write operations, please try again later.' } },
  skip: (req) => req.method === 'GET' || req.method === 'OPTIONS'
});
app.use('/api', writeLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 auth requests per windowMs
  message: { error: { message: 'Too many authentication attempts, please try again later.' } }
});

import authRoutes from './routes/authRoutes';
import travelRoutes from './routes/travelRoutes';
import itineraryRoutes from './routes/itineraryRoutes';
import chatRoutes from './routes/chatRoutes';
import bookingRoutes from './routes/bookingRoutes';
import notificationRoutes from './routes/notificationRoutes';
import paymentRoutes from './routes/paymentRoutes';

// Routes
app.get('/api/health', async (req, res) => {
  try {
    // Lightweight DB check
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error) throw error;
    res.json({ success: true, status: 'healthy', uptime: process.uptime() });
  } catch (_err) {
    console.error(_err);
    res.status(503).json({ success: false, status: 'unhealthy' });
  }
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/conversations', chatRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', travelRoutes);

// Centralized Error Handler
app.use(errorHandler);

export default app;
