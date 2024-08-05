import express from 'express';
import { prisma } from '../utils/prisma.util.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { reservationValidator } from '../validator/reservation.validator.js';
import { updateStatusValidator } from '../validator/update-status.validator.js';
import { updateReservationValidator } from '../validator/update-reservation.validator.js';

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

//예약 목록 조회 API
reservationRouter.get('/', authMiddleware, async (req, res, next) => {
  const userId = req.user.id;
  const role = req.user.role; // 사용자 역할을 가져옵니다
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

//예약정보 수정 API
reservationRouter.patch(
  '/:reservationId',
  authMiddleware,
  updateReservationValidator,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { reservationId } = req.params;
      const {
        dog_name,
        dog_breed,
        dog_age,
        dog_weight,
        request_details,
        booking_date,
      } = req.body;

      // 예약 정보 조회
      const reservation = await prisma.reservations.findUnique({
        where: { id: +reservationId, user_id: +userId },
        // include: { users: true, petsitters: true },
      });

      if (!reservation) {
        return res
          .status(404)
          .json({ status: 404, message: '예약 정보가 존재하지 않습니다.' });
      }

      // 현재 예약 날짜가 다른 예약에서 사용 중인지 확인
      if (booking_date) {
        const existingReservation = await prisma.reservations.findFirst({
          where: {
            pet_sitter_id: reservation.pet_sitter_id,
            booking_date: new Date(booking_date),
            id: +reservationId,
          },
        });

        if (existingReservation) {
          return res.status(400).json({
            status: 400,
            message: '해당 날짜는 이미 예약되어 있습니다.',
          });
        }
      }

      // 업데이트할 데이터 구성
      const updateData = {
        dog_name: dog_name || reservation.dog_name,
        dog_breed: dog_breed || reservation.dog_breed,
        dog_age: dog_age || reservation.dog_age,
        dog_weight: dog_weight || reservation.dog_weight,
        request_details: request_details || reservation.request_details,
        booking_date: booking_date
          ? new Date(booking_date)
          : reservation.booking_date,
        updated_at: new Date(),
      };

      // 예약 정보 업데이트
      const updatedReservation = await prisma.reservations.update({
        where: { id: +reservationId, user_id: +userId },
        data: updateData,
        include: {
          users: true,
          petsitters: true,
        },
      });

      const response = {
        reservation_id: updatedReservation.id,
        status: updatedReservation.status,
        pet_details: {
          name: updatedReservation.dog_name,
          breed: updatedReservation.dog_breed,
          age: updatedReservation.dog_age,
          weight: updatedReservation.dog_weight,
          request_detail: updatedReservation.request_details,
        },
        reservation_details: {
          user_name: updatedReservation.users.name,
          phone_number: updatedReservation.users.phone_number,
          address: updatedReservation.users.address,
        },
        petsitter_details: {
          sitter_name: updatedReservation.petsitters.name,
          region: updatedReservation.petsitters.region,
          booking_date: updatedReservation.booking_date,
          // .toISOString()
          // .split('T')[0], // 날짜만 추출
        },
        created_at: updatedReservation.created_at,
        updated_at: updatedReservation.updated_at,
      };

      return res.status(200).json({
        status: 200,
        message: '예약 수정에 성공했습니다.',
        data: response,
      });
    } catch (err) {
      next(err);
    }
  },
);

//예약취소 - 취소시 log 기록 트랜잭션
reservationRouter.delete(
  '/:reservationId',
  authMiddleware,
  async (req, res, next) => {
    const userId = req.user.id;
    const { reservationId } = req.params;
    const { reason } = req.body;

    try {
      if (!reason || typeof reason !== 'string' || reason.trim() === '') {
        return res.status(400).json({
          status: 400,
          message: '취소 사유는 필수 입력 항목입니다.',
        });
      }
      // 트랜잭션으로 예약 삭제 및 로그 기록
      await prisma.$transaction(async (prisma) => {
        // 예약 정보 조회
        const reservation = await prisma.reservations.findUnique({
          where: {
            id: +reservationId,
            user_id: +userId,
          },
          include: {
            users: true, // 예약 정보에 사용자 정보 포함
            petsitters: true, // 예약 정보에 펫시터 정보 포함
          },
        });
        console.log(reservation);

        if (!reservation) {
          // 응답을 보내고 트랜잭션을 종료
          return res.status(404).json({
            status: 404,
            message: '예약 정보가 존재하지 않습니다',
          });
        }

        // 예약 로그 기록
        await prisma.reservation_logs.create({
          data: {
            reservation_id: +reservationId,
            user_id: +userId,
            old_status: reservation.status,
            new_status: 'CANCELED',
            reason: reason,
          },
        });

        // 예약 삭제
        await prisma.reservations.delete({
          where: { id: +reservationId, user_id: +userId },
        });
      });

      return res.status(200).json({
        status: 200,
        message: '예약이 성공적으로 취소되었습니다.',
        reservationId: `${reservationId}`,
      });
    } catch (err) {
      next(err);
    }
  },
);

//예약상태변경 API[  PENDING ,CONFIRMED ,COMPLETED ,CANCELED   ]
reservationRouter.patch(
  '/:reservationId/status',
  authMiddleware,
  updateStatusValidator,
  async (req, res, next) => {
    const { reservationId } = req.params;
    const { new_status, reason } = req.body;
    const userId = req.user.id;
    try {
      //사용자 정보 조회
      const user = await prisma.users.findFirst({
        where: { id: +userId },
      });

      //관리자인지 확인
      if (user.role !== 'ADMIN') {
        return res.status(403).json({
          status: 403,
          message: '예약 상태를 변경할 권한이 없습니다.',
        });
      }

      const updatedReservation = await prisma.$transaction(async (prisma) => {
        // 예약 정보 조회
        const reservation = await prisma.reservations.findFirst({
          where: { id: +reservationId },
        });

        if (!reservation) {
          return res.status(404).json({
            status: 404,
            message: '예약 정보가 존재하지 않습니다.',
          });
        }

        // 예약 상태 업데이트
        const updatedReservation = await prisma.reservations.update({
          where: { id: +reservationId },
          data: { status: new_status },
        });

        // 예약 로그 기록
        await prisma.reservation_logs.create({
          data: {
            reservation_id: +reservationId,
            user_id: +userId, // 상태 변경을 수행한 사용자 ID 기록
            old_status: reservation.status,
            new_status: new_status,
            reason: reason, // 상태 변경 사유 기록
          },
        });

        const result = {
          reservation_id: +reservationId,
          user_id: +userId,
          petsitter_id: updatedReservation.pet_sitter_id,
          pet_details: {
            dog_name: updatedReservation.dog_name,
            dog_breed: updatedReservation.dog_breed,
            dog_age: updatedReservation.dog_age,
            dog_weight: updatedReservation.dog_weight,
          },
          updated_status: {
            old_status: reservation.status,
            new_status: new_status,
            reason: reason,
          },
          booking_date: updatedReservation.booking_date,
        };
        return result;
      });

      return res.status(200).json({
        status: 200,
        message: '예약 상태가 성공적으로 변경되었습니다.',
        data: updatedReservation,
      });
    } catch (err) {
      next(err);
    }
  },
);

export default reservationRouter;
