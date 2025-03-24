import express from 'express';
import { usageRoutes } from './routes/usageRoutes.js';
import { PORT } from './config/constants.js';
import { websocketHandler } from './websocket/websocketHandler.js';

const app = express();

app.use(express.json());

// Routes
app.use('/api/usage', usageRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Start the HTTP server
app.listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`);
});

// The websocketHandler will automatically start when imported 