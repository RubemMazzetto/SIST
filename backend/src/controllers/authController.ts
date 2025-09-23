import { PrismaClient } from '@prisma/client';
import { Request, Response, Router, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const prisma = new PrismaClient();
const router = Router();

interface RegisterRequestBody {
    first_name: string;
    last_name: string;
    cpf: string;
    email: string;
    phone: string;
    password: string;
    user_type_id: number;
    user_address: {
        cep: string;
        street: string;
        number?: string;
        neighborhood?: string;
        complement?: string;
        town: string;
        state: string;
        country: string;
    };
}

interface LoginRequestBody {
    email: string;
    password: string;
}

const hashPassword = (password: string): string => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

// Tipo explícito para o handler de register
const registerHandler: RequestHandler<{}, { message: string; userId: number }, RegisterRequestBody> = async (req, res, next) => {
    const { first_name, last_name, cpf, email, phone, password, user_type_id, user_address } = req.body;
    const hashedPassword = hashPassword(password);

    try {
        const user = await prisma.user.create({
            data: {
                first_name,
                last_name,
                cpf,
                email,
                phone,
                password: hashedPassword,
                user_type_id,
                user_address: {
                    create: user_address,
                },
            },
        });
        res.status(201).json({ message: 'User registered', userId: user.id });
    } catch (error) {
        res.status(400).json({ error: 'Email, CPF, or phone already exists' });
        next(error);
    }
};

// Tipo explícito para o handler de login
const loginHandler: RequestHandler<{}, { token: string }, LoginRequestBody> = async (req, res, next) => {
    const { email, password } = req.body;
    const hashedPassword = hashPassword(password);

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.password !== hashedPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
        next(error);
    }
};

router.post('/register', registerHandler);
router.post('/login', loginHandler);

export default router;