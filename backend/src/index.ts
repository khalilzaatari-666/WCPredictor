import dotenv from 'dotenv';
import logger from './utils/logger';
import prisma from './config/database';
import app from './app';
import { connectRedis } from './config/redis';
import { initializeBlockchain } from './config/blockchain';

dotenv.config();

const PORT = process.env.PORT || 4000;

async function startServer() {
    try {
        // Test database connection
        await prisma.$connect();
        logger.info('Database connected successfully');

        // Connect to Redis
        await connectRedis();
        logger.info('Redis connected successfully');

        // Initialize Blockchain
        initializeBlockchain();

        // Start server
        const server = app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
            logger.info('Environment:', process.env.NODE_ENV || 'development');
            logger.info(`API Endpoint: http://localhost:${PORT}/api`);
        });

        // Graceful shutdown
        const graccefulShutdown = async (signal: string) => {
            logger.info(`Received ${signal}. Shutting down gracefully...`);

            server.close(async () => {
                logger.info('HTTP server closed');

                // Close database connection
                await prisma.$disconnect();
                logger.info('Database disconnected');

                process.exit(0);
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                logger.error('Could not close connections in time, forcing shutdown');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => graccefulShutdown('SIGTERM'));
        process.on('SIGINT', () => graccefulShutdown('SIGINT'));
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();