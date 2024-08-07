import { prisma } from '../utils/prisma.util.js';

export class LogRepository {
  getLogs = async () => {
    return await prisma.reservation_logs.findMany({
      orderBy: { created_at: 'desc' },
    });
  };
}
