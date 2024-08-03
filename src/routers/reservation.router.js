import express from 'express';
import { prisma } from '../utils/prisma.util.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { reservationValidator } from '../validator/reservation.validator.js';

const reservationRouter = express.Router();

//예약목록조회 API
//예약상세조회 API 가 빠졌다.

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

export default reservationRouter;
