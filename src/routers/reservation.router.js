import express from 'express';
import { prisma } from '../utils/prisma.util.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { reservationValidator } from '../validator/reservation.validator.js';

const reservationRouter = express.Router();

//예약생성 API - 다하고 유효성 검사 추가하기
reservationRouter.post(
  '/',
  authMiddleware,
  reservationValidator,
  async (req, res, next) => {
    const userId = req.user.id;
    const {
      pet_sitter_id,
      dog_name,
      dog_breed,
      dog_age,
      dog_weight,
      request_details,
      booking_date,
    } = req.body;
    try {
      const reservation = await prisma.reservations.create({
        data: {
          user_id: +userId,
          pet_sitter_id: +pet_sitter_id,
          dog_name,
          dog_breed,
          dog_age,
          dog_weight,
          request_details,
          booking_date: new Date(booking_date),
        },
        include: {
          petsitters: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      const response = {
        reservation_id: reservation.id,
        pet_details: {
          dog_name: reservation.dog_name,
          dog_breed: reservation.dog_breed,
          dog_age: reservation.dog_age,
          dog_weight: reservation.dog_weight,
          request_details: reservation.request_details,
        },
        pet_sitter: {
          pet_sitter_id: reservation.petsitters.id,
          name: reservation.petsitters.name,
          booking_date: reservation.booking_date,
        },
        created_at: reservation.created_at,
      };

      return res
        .status(201)
        .json({ status: 201, message: '예약완료', data: response });
    } catch (err) {
      if (err.code === 'P2002') {
        // Prisma의 P2002 오류는 고유 제약 조건 위반을 나타냄(터미널에 code:2002뜸)
        return res.status(400).json({
          status: 400,
          message: '이미 같은 날짜에 해당 펫시터에 대한 예약이 존재합니다.',
        });
      }
      next(err);
    }
  },
);

export default reservationRouter;
