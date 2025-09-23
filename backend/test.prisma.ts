import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPrisma() {
    try {
        // Teste 1: Criar um UserType
        const userType = await prisma.userType.create({
            data: {
                type: 'Admin',
            },
        });
        console.log('UserType criado:', userType);

        // Teste 2: Criar um User com UserAddress
        const user = await prisma.user.create({
            data: {
                first_name: 'Test',
                last_name: 'User',
                cpf: '12345678901',
                email: 'test@example.com',
                phone: '5511999999999',
                password: 'hashedpassword',
                user_type_id: userType.id,
                user_address: {
                    create: {
                        cep: '12345678',
                        street: 'Test Street',
                        number: '123',
                        neighborhood: 'Test Neighborhood',
                        complement: 'Apt 1',
                        town: 'Sao Paulo',
                        state: 'SP',
                        country: 'Brazil',
                    },
                },
            },
            include: { user_address: true, user_type: true },
        });
        console.log('User criado:', user);

        // Teste 3: Buscar o User criado
        const foundUser = await prisma.user.findUnique({
            where: { email: 'test@example.com' },
            include: { user_address: true, user_type: true },
        });
        console.log('User encontrado:', foundUser);
    } catch (error) {
        console.error('Erro ao testar o Prisma:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testPrisma();