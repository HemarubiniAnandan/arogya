import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './config/db.js';
import apiRoutes from './routes/apiRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Endpoints Prefix
app.use('/api', apiRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Initialize Database and Boot Express Server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`🚀 AarogyaRakshak 2.0 Backend Server Running!`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`💾 DB Engine: SQLite (database.sqlite)`);
    console.log(`===================================================`);
  });
}).catch((err) => {
  console.error('Failed to initialize SQLite Database:', err);
});
