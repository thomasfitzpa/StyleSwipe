import express from 'express';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(express.json());

// Connect to database
connectDB();

// Error-handling middleware
app.use(errorHandler);