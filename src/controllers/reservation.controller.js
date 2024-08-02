import { ReservationService } from '../services/reservation.service.js';

export class ReservationController {
  reservationService = new ReservationService();

  //예약생성
  createBooking = async (req, res, next) => {
    try {
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

      const createdBooking = await this.reservationService.createBooking(
        userId,
        pet_sitter_id,
        dog_name,
        dog_breed,
        dog_age,
        dog_weight,
        request_details,
        booking_date,
      );

      return res.status(201).json({
        status: 201,
        message: '예약이 접수 되었습니다. 펫시터의 승인을 기다리고 있습니다.',
        data: createdBooking,
      });
    } catch (err) {
      next(err);
    }
  };

  //예약 목록 조회
  getReservations = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const role = req.user.role;
      const { sort } = req.query;
      const sortOrder = sort
        ? sort.toUpperCase() === 'ASC'
          ? 'asc'
          : 'desc'
        : 'desc';

      const reservations = await this.reservationService.getReservations(
        userId,
        role,
        sortOrder,
      );

      return res.status(200).json({
        status: 200,
        message: '예약 조회에 성공했습니다.',
        data: reservations,
      });
    } catch (err) {
      next(err);
    }
  };

  //예약상세조회
  getReservationById = async (req, res, next) => {
    try {
      const { reservationId } = req.params;
      const userId = req.user.id;
      const { role } = req.user;

      const reservation = await this.reservationService.getReservationById(
        reservationId,
        userId,
        role,
      );

      if (!reservation) {
        return res.status(404).json({
          status: 404,
          message: '해당 예약 ID가 존재하지 않습니다.',
          data: [],
        });
      }

      return res.status(200).json({
        status: 200,
        message: '예약 상세조회에 성공했습니다.',
        data: reservation,
      });
    } catch (err) {
      next(err);
    }
  };
}
