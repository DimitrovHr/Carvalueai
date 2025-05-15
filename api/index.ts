import express from 'express';
import { registerRoutes } from '../server/routes';
import session from 'express-session';
import { setupAuth } from '../server/auth';
import { storage } from '../server/storage';
import { json, urlencoded } from 'express';

const app = express();

// Parse request body
app.use(json());
app.use(urlencoded({ extended: false }));

// Setup session
const sessionSettings = {
  secret: process.env.SESSION_SECRET || 'development-secret-key',
  resave: false,
  saveUninitialized: false,
  store: storage.sessionStore,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  }
};

app.set('trust proxy', 1);
app.use(session(sessionSettings));

// Setup authentication
setupAuth(app);

// Register API routes
const server = registerRoutes(app);

// For Vercel serverless function
export default app;