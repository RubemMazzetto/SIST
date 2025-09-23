import { PrismaClient } from '@prisma/client';
import { Request, Response, Router, NextFunction, RequestHandler } from 'express';

const prisma = new PrismaClient();
const router = Router();

interface AuthRequest extends Request {
    user?: { id: number };
}

// Tipo explícito para o handler de profile
const profileHandler: RequestHandler<{}, any, {}, {}, AuthRequest> = async (req, res, next) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { user_address: true, permissions: true, user_type: true },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
        next(error);
    }
};

router.get('/profile', profileHandler);

export default router;