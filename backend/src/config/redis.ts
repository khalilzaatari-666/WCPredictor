import Redis from 'ioredis';
import logger from '../utils/logger';

let redisClient: Redis | null = null;

export async function connectRedis(): Promise<Redis> {
    if (redisClient) {
        return redisClient;
    }

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    redisClient = new Redis(redisUrl, {
        retryStrategy: (times: number) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
        maxRetriesPerRequest: 3,
    });

    redisClient.on('connect', () => {
        logger.info('Connected to Redis server');
    });

    redisClient.on('error', (err: any) => {
        logger.error('Redis error: ', err);
    });

    return redisClient;
}

export function getRedisClient(): Redis {
    if (!redisClient) {
        throw new Error('Redis client is not initialized.');
    }
    return redisClient;
}

export async function disconnectRedis(): Promise<void> {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
    }
}