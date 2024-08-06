import express from 'express';
import { prisma } from '../utils/prisma.util.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { adminMiddleware } from '../middlewares/Admin.middleware.js';

const logRouter = express.Router();

//예약 로그 목록 조회API [관리자]

logRouter.get(
  '/reservation-logs',
  authMiddleware,
  adminMiddleware,
  async (req, res, next) => {
    try {
      const reservationLogs = await prisma.reservation_logs.findMany({
        orderBy: { created_at: 'desc' },
      });

      return res.status(200).json({
        status: 200,
        message: '예약 로그 목록 조회 성공!',
        data: reservationLogs,
      });
    } catch (err) {
      next(err);
    }
  },
);

export default logRouter;
