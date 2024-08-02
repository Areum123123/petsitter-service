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
      const whereObject = { id: Number(reservationId) };

      if (role === 'USER') {
        whereObject.user_id = Number(userId);
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
}
