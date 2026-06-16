// import dotenv from 'dotenv';
// dotenv.config();
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import providerRoutes from './routes/providerRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import HTTP_STATUS from './utils/httpStatusCodes.js';


connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/requests', requestRoutes);




app.get('/', (req, res) => {
    res.send('✅ server.js Multi-Vendor Service Marketplace API is running...');
});

app.use((req, res) => {
    res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(` Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
