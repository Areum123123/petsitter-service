import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { reservationValidator } from '../validator/reservation.validator.js';
import { ReservationController } from '../controllers/reservation.controller.js';
import { prisma } from '../utils/prisma.util.js';
import { updateReservationValidator } from '../validator/update-reservation.validator.js';
import { updateStatusValidator } from '../validator/update-status.validator.js';
import { adminMiddleware } from '../middlewares/Admin.middleware.js';
const reservationRouter = express.Router();
const reservationController = new ReservationController();
//예약생성 API
reservationRouter.post(
  '/',
  authMiddleware,
  reservationValidator,
  reservationController.createBooking,
);

//예약 목록 조회 API
reservationRouter.get(
  '/',
  authMiddleware,
  reservationController.getReservations,
);

//예약 상세 조회 API
reservationRouter.get(
  '/:reservationId',
  authMiddleware,
  reservationController.getReservationById,
);

//예약변경API
reservationRouter.patch(
  '/:reservationId',
  authMiddleware,
  updateReservationValidator,
  reservationController.updateReservation,
);

//예약취소 - 취소시 log 기록 트랜잭션
reservationRouter.delete(
  '/:reservationId',
  authMiddleware,
  reservationController.cancelReservation,
);

//예약상태변경 API[  PENDING ,CONFIRMED ,COMPLETED ,CANCELED   ]
reservationRouter.patch(
  '/:reservationId/status',
  authMiddleware,
  adminMiddleware,
  updateStatusValidator,
  reservationController.updateStatus,
);

export default reservationRouter;
