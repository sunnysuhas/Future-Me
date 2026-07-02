const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');

// Load configurations
const config = require('../../backend/config/config');
const apiRoutes = require('../../backend/routes/api');
const errorHandler = require('../../backend/middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Netlify serverless functions serve paths relative to their function name.
// We mount on both standard /api and Netlify's function path for safety.
app.use('/api', apiRoutes);
app.use('/.netlify/functions/api', apiRoutes);

// Register central error handling middleware
app.use(errorHandler);

module.exports.handler = serverless(app);
