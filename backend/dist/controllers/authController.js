"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
const hashPassword = (password) => {
    return crypto_1.default.createHash('sha256').update(password).digest('hex');
};
// Tipo explícito para o handler de register
const registerHandler = async (req, res, next) => {
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
    }
    catch (error) {
        res.status(400).json({ error: 'Email, CPF, or phone already exists' });
        next(error);
    }
};
// Tipo explícito para o handler de login
const loginHandler = async (req, res, next) => {
    const { email, password } = req.body;
    const hashedPassword = hashPassword(password);
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.password !== hashedPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
        next(error);
    }
};
router.post('/register', registerHandler);
router.post('/login', loginHandler);
exports.default = router;
