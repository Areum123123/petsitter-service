import express from 'express';
import { prisma } from '../utils/prisma.util.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { reservationValidator } from '../validator/reservation.validator.js';

const reservationRouter = express.Router();

//예약생성 API
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
        user_id: +userId,
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

      return res.status(201).json({
        status: 201,
        message: '예약이 접수 되었습니다. 펫시터의 승인을 기다리고 있습니다.',
        data: response,
      });
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

//예약 목록 조회 API
reservationRouter.get('/', authMiddleware, async (req, res, next) => {
  const userId = req.user.id;
  const role = req.user.role; // 사용자 역할
  const { sort } = req.query;
  const sortOrder = sort
    ? sort.toUpperCase() === 'ASC'
      ? 'asc'
      : 'desc'
    : 'desc';
  try {
    const whereObject = {};

    //role이 ADMIN인경우 모든 예약정보를 볼 수 있다. 아닌경우 본인것만
    if (role === 'USER') {
      whereObject.user_id = +userId; //whereObject = {id:2}
    }

    const reservations = await prisma.reservations.findMany({
      where: whereObject,
      orderBy: {
        created_at: sortOrder,
      },
      include: {
        petsitters: {
          select: { name: true, region: true },
        },
        users: {
          select: { name: true, phone_number: true, address: true },
        },
      },
    });

    const result = reservations.map((reservation) => ({
      reservation_id: reservation.id,
      status: reservation.status,
      pet_details: {
        name: reservation.dog_name,
        breed: reservation.dog_breed,
        age: reservation.dog_age,
        weight: reservation.dog_weight,
        request_details: reservation.request_details,
      },
      reservation_details: {
        user_name: reservation.users.name,
        phone_number: reservation.users.phone_number,
        address: reservation.users.address,
      },
      petsitter_details: {
        name: reservation.petsitters.name,
        region: reservation.petsitters.region,
        booking_date: reservation.booking_date,
      },

      created_at: reservation.created_at,
      updated_at: reservation.updated_at,
    }));

    return res.status(200).json({
      status: 200,
      message: '예약 조회에 성공했습니다.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

//예약 상세 조회 API
reservationRouter.get(
  '/:reservationId',
  authMiddleware,
  async (req, res, next) => {
    const { reservationId } = req.params;
    const userId = req.user.id;
    const { role } = req.user;
    try {
      const whereObject = { id: +reservationId };

      if (role === 'USER') {
        whereObject.user_id = +userId;
      }
      const reservation = await prisma.reservations.findFirst({
        where: whereObject,
        include: {
          petsitters: {
            select: { name: true, region: true },
          },
          users: {
            select: { name: true, phone_number: true, address: true },
          },
        },
      });

      if (!reservation) {
        return res.status(404).json({
          status: 404,
          message: '해당 예약 ID가 존재하지 않습니다.',
          data: [],
        });
      }

      const result = {
        reservation_id: reservation.id,
        status: reservation.status,
        pet_details: {
          name: reservation.dog_name,
          breed: reservation.dog_breed,
          age: reservation.dog_age,
          weight: reservation.dog_weight,
          request_details: reservation.request_details,
        },
        reservation_details: {
          user_name: reservation.users.name,
          phone_number: reservation.users.phone_number,
          address: reservation.users.address,
        },
        petsitter_details: {
          name: reservation.petsitters.name,
          region: reservation.petsitters.region,
          booking_date: reservation.booking_date,
        },

        created_at: reservation.created_at,
        updated_at: reservation.updated_at,
      };

      return res.status(200).json({
        status: 200,
        message: '예약 상세조회에 성공했습니다.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },
);

export default reservationRouter;
