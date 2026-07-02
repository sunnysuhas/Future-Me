const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');
const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Enable CORS
app.use(cors());

// Parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register API Routes
app.use('/api', apiRoutes);

// Serve frontend static assets from ../frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Handle routing for client-side single page app (SPA) fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Register central error handling middleware
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(` FutureMe server is active on: http://localhost:${config.port}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});
