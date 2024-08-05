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
    // const reservation =
    return await prisma.reservations.create({
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

  // 예약 변경 API
  findReservationByIdAndUser = async (reservationId, userId) => {
    return prisma.reservations.findFirst({
      where: {
        id: +reservationId, // 변환 확인
        user_id: +userId, // 변환 확인
      },
      include: {
        users: true,
        petsitters: true,
      },
    });
  };

  // 예약 날짜 찾기
  findExistingReservationByDate = async (
    petSitterId,
    bookingDate,
    reservationId,
  ) => {
    return prisma.reservations.findFirst({
      where: {
        pet_sitter_id: +petSitterId, // 변환 확인
        booking_date: new Date(bookingDate),
        id: +reservationId, // 변환 확인
      },
    });
  };

  // 예약 날짜 변경
  updateReservationData = async (reservationId, updateData) => {
    return prisma.reservations.update({
      where: { id: +reservationId }, // 변환 확인
      data: updateData,
      include: {
        users: true,
        petsitters: true,
      },
    });
  };

  //예약취소
  cancelReservation = async (userId, reservationId, reason) => {
    // 트랜잭션으로 예약 삭제 및 로그 기록
    return await prisma.$transaction(async (tx) => {
      // 예약 정보 조회
      const reservation = await tx.reservations.findUnique({
        where: {
          id: +reservationId,
          user_id: +userId,
        },
        include: {
          users: true, // 예약 정보에 사용자 정보 포함
          petsitters: true, // 예약 정보에 펫시터 정보 포함
        },
      });

      if (!reservation) {
        // 응답을 보내고 트랜잭션을 종료
        throw new Error('예약 정보가 존재하지 않습니다.');
      }

      // 예약 로그 기록[수정필요]
      console.log({ reason });
      const result = await tx.reservation_logs.create({
        data: {
          reservation_id: +reservationId,
          user_id: +userId,
          old_status: reservation.status,
          new_status: 'CANCELED',
          reason: reason,
        },
      });
      console.log({ result });

      const cancellationDate = new Date('1900-01-01'); // 기본 과거 날짜
      cancellationDate.setDate(cancellationDate.getDate() + reservationId); // 예약 ID를 날짜에 추가

      // Soft delete
      await tx.reservations.update({
        where: { id: +reservationId, user_id: +userId },
        data: {
          status: 'CANCELED',
          booking_date: cancellationDate,
          deleted_at: new Date(),
        },
      });
    });
  };

  //예약상태변경
  //아이디로 유저 찾기
  findUserById = async (userId) => {
    return await prisma.users.findFirst({
      where: { id: +userId },
    });
  };

  updateStatus = async (userId, reservationId, new_status, reason) => {
    return await prisma.$transaction(async (prisma) => {
      // 예약 정보 조회
      const reservation = await prisma.reservations.findFirst({
        where: { id: +reservationId },
      });

      if (!reservation) {
        throw new Error('예약 정보가 존재하지 않습니다.');
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

      return {
        reservation_id: +reservationId,
        user_id: +userId,
        petsitter_id: updatedReservation.pet_sitter_id,
        // pet_details: {
        //   dog_name: updatedReservation.dog_name,
        //   dog_breed: updatedReservation.dog_breed,
        //   dog_age: updatedReservation.dog_age,
        //   dog_weight: updatedReservation.dog_weight,
        // }, //대기상태변경 강아지 정보
        updated_status: {
          old_status: reservation.status,
          new_status: new_status,
          reason: reason,
        },
        booking_date: updatedReservation.booking_date,
      };
    });
  };
  //추가구현 일로들어와
}
