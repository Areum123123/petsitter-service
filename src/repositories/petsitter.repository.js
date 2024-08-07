import { prisma } from '../utils/prisma.util.js';

export class PetsitterRepository {
  findAllPetsitters = async (whereObjec) => {
    return await prisma.petsitters.findMany({
      where: whereObjec,
      orderBy: { created_at: 'desc' },
    });
  };

  //펫시터 리뷰작성 트랜잭션
  findPetsittersById = async (petSitterId, prismaInstance) => {
    return await prismaInstance.petsitters.findUnique({
      where: { id: +petSitterId },
    });
  };

  //리뷰생성
  createReview = async (
    userId,
    petSitterId,
    rating,
    comment,
    prismaInstance,
  ) => {
    return await prismaInstance.reviews.create({
      data: {
        user_id: +userId,
        pet_sitter_id: +petSitterId,
        rating,
        comment,
      },
      include: {
        users: {
          select: { name: true },
        },
      },
    });
  };

  // 펫시터 리뷰 조회
  findReviewsByPetSitterId = async (petSitterId, prismaInstance) => {
    return await prismaInstance.reviews.findMany({
      where: { pet_sitter_id: +petSitterId },
    });
  };

  // 펫시터의 total_rate 업데이트
  updateTotalRate = async (petSitterId, averageRating, prismaInstance) => {
    return await prismaInstance.petsitters.update({
      where: { id: +petSitterId },
      data: { total_rate: +averageRating },
    });
  };

  getPetsitter = async (petSitterId) => {
    return await prisma.petsitters.findUnique({
      where: {
        id: +petSitterId,
      },
    });
  };

  getReviewByPetsitterId = async (petSitterId) => {
    return await prisma.reviews.findMany({
      where: { pet_sitter_id: +petSitterId },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        pet_sitter_id: true,
        users: {
          select: {
            name: true,
          },
        },
        rating: true,
        comment: true,
        created_at: true,
        updated_at: true,
      },
    });
  };
}
