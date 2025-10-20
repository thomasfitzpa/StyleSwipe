import express from 'express';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());

// Connect to database
connectDB();

// Import routes
app.use('/api/users', userRoutes);

// Error-handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});