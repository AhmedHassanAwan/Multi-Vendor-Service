// import dotenv from 'dotenv';
// dotenv.config();
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import providerRoutes from './routes/providerRoutes.js';
import HTTP_STATUS from './utils/httpStatusCodes.js';

// Environment variables configuration

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/provider', providerRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('✅ server.js Multi-Vendor Service Marketplace API is running...');
});

// 404 Handler
app.use((req, res) => {
    res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 5000;

// Start server after DB connection (handled inside connectDB or just start here if using Mongoose 6+)
app.listen(PORT, () => {
    console.log(` Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
