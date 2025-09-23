"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const authController_1 = __importDefault(require("./controllers/authController"));
const userController_1 = __importDefault(require("./controllers/userController"));
const auth_1 = __importDefault(require("./middleware/auth"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
// Public routes
app.use('/api/auth', authController_1.default);
// Protected routes
app.use('/api/users', auth_1.default, userController_1.default);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
