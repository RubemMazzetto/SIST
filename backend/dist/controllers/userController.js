"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// Tipo explícito para o handler de profile
const profileHandler = async (req, res, next) => {
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
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
        next(error);
    }
};
router.get('/profile', profileHandler);
exports.default = router;
