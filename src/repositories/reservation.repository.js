import { prisma } from '../utils/prisma.util.js';
export class ReservationRepository {
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
    return response;
  };

  //예약 조회 모든예약조회
  findReservations = async (whereObject, sortOrder) => {
    return await prisma.reservations.findMany({
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
  };

  //예약상세조회[아이디로예약조회]
  findReservationById = async (whereObject) => {
    return await prisma.reservations.findFirst({
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
  };
}
