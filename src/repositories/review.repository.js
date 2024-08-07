import { prisma } from '../utils/prisma.util.js';

export class ReviewRepository {
  getMyReviews = async (userId) => {
    return await prisma.reviews.findMany({
      where: { user_id: +userId },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        user_id: true,
        petsitters: {
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

  findReviewById = async (reviewId, userId) => {
    return await prisma.reviews.findUnique({
      where: { id: +reviewId, user_id: +userId },
    });
  };

  updateReview = async (reviewId, userId, rating, comment) => {
    return await prisma.reviews.update({
      where: { id: +reviewId, user_id: +userId },
      data: {
        rating,
        comment,
      },
    });
  };

  getPetsitter = async (review) => {
    return await prisma.petsitters.findUnique({
      where: { id: review.pet_sitter_id },
      select: { name: true },
    });
  };

  getMyReview = async (reviewId, userId) => {
    return await prisma.reviews.findFirst({
      where: {
        id: +reviewId,
        user_id: +userId,
      },
    });
  };

  deleteReview = async (reviewId, userId) => {
    return await prisma.reviews.delete({
      where: {
        id: +reviewId,
        user_id: +userId,
      },
    });
  };
}
