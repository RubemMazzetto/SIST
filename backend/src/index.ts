import dotenv from 'dotenv';
import express, { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import authRoutes from './controllers/authController';
import userRoutes from './controllers/userController';
import authMiddleware from './middleware/auth';

dotenv.config();

const app: Express = express();
const prisma: PrismaClient = new PrismaClient();
const PORT: string | number = process.env.PORT || 3000;

app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/users', authMiddleware, userRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});