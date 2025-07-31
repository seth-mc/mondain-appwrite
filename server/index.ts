import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import imageRouter from './image.js';
import videoRouter from './video.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3001;

// Basic middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true // Same origin in production
    : [
        'http://localhost:8080', 
        'http://localhost:3000'
      ],
  credentials: true
}));
app.use(express.json());

// API routes
app.use('/api/image', imageRouter);
app.use('/api/video', videoRouter);

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve static files from React build (for production)
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the built React app
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // Handle React Router - send all non-API routes to React app
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(__dirname, '../dist/index.html'));
    }
  });
}

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log('Test endpoints:');
  console.log(`- http://localhost:${port}/test`);
  console.log(`- http://localhost:${port}/health`);
  console.log(`- http://localhost:${port}/api/image/analyze`);
}); 