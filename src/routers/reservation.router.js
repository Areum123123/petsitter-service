import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { reservationValidator } from '../validator/reservation.validator.js';
import { ReservationController } from '../controllers/reservation.controller.js';
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

export default reservationRouter;
