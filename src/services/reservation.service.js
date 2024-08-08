import { ReservationRepository } from '../repositories/reservation.repository.js';

export class ReservationService {
  reservationRepository = new ReservationRepository();

  //예약생성
  createBooking = async (
    userId,
    pet_sitter_id,
    dog_name,
    dog_breed,
    dog_age,
    dog_weight,
    request_details,
    booking_date,
  ) => {
    const booking = await this.reservationRepository.createBooking(
      userId,
      pet_sitter_id,
      dog_name,
      dog_breed,
      dog_age,
      dog_weight,
      request_details,
      booking_date,
    );

    return {
      reservation_id: booking.id,
      user_id: +userId,
      pet_details: {
        dog_name: booking.dog_name,
        dog_breed: booking.dog_breed,
        dog_age: booking.dog_age,
        dog_weight: booking.dog_weight,
        request_details: booking.request_details,
      },
      pet_sitter: {
        pet_sitter_id: booking.petsitters.id,
        name: booking.petsitters.name,
        booking_date: booking.booking_date,
      },
      created_at: booking.created_at,
    };
  };

  //예약 목록 조회

  getReservations = async (userId, role, sortOrder) => {
    try {
      const whereObject = {};

      if (role === 'USER') {
        whereObject.user_id = userId;
      }

      const reservations = await this.reservationRepository.findReservations(
        whereObject,
        sortOrder,
      );

      return reservations.map((reservation) => ({
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
    } catch (err) {
      throw err;
    }
  };

  //예약상세조회
  getReservationById = async (reservationId, userId, role) => {
    try {
      const whereObject = { id: +reservationId };

      if (role === 'USER') {
        whereObject.user_id = +userId;
      }

      const reservation =
        await this.reservationRepository.findReservationById(whereObject);

      if (!reservation) {
        return null;
      }

      return {
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
    } catch (err) {
      throw err;
    }
  };

  updateReservation = async (
    userId,
    reservationId,
    dog_name,
    dog_breed,
    dog_age,
    dog_weight,
    request_details,
    booking_date,
  ) => {
    try {
      if (isNaN(userId) || isNaN(reservationId)) {
        throw new Error('유효하지 않은 ID가 전달되었습니다.');
      }

      // 예약 정보 조회
      const reservation =
        await this.reservationRepository.findReservationByIdAndUser(
          +reservationId, // 변환 확인
          +userId, // 변환 확인
        );

      if (!reservation) {
        throw new Error('예약 정보가 존재하지 않습니다.');
      }

      // 현재 예약 날짜가 다른 예약에서 사용 중인지 확인
      if (booking_date) {
        const existingReservation =
          await this.reservationRepository.findExistingReservationByDate(
            reservation.pet_sitter_id, // 변수명 확인
            booking_date,
            +reservationId, // 변환 확인
          );

        if (existingReservation) {
          throw new Error('해당 날짜는 이미 예약되어 있습니다.');
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
      const updatedReservation =
        await this.reservationRepository.updateReservationData(
          +reservationId, // 변환 확인
          updateData,
        );

      return {
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
        },
        created_at: updatedReservation.created_at,
        updated_at: updatedReservation.updated_at,
      };
    } catch (err) {
      throw err; // Next 미들웨어로 전파하기 위해 단순히 throw
    }
  };

  //예약취소
  cancelReservation = async (userId, reservationId, reason) => {
    try {
      return await this.reservationRepository.cancelReservation(
        +userId,
        +reservationId,
        reason,
      );
    } catch (err) {
      throw err;
    }
  };

  //예약상태변경

  updateStatus = async (userId, reservationId, new_status, reason) => {
    return await this.reservationRepository.updateStatus(
      +userId,
      +reservationId,
      new_status,
      reason,
    );
  };
}
