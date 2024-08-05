import express from 'express';
import { prisma } from '../utils/prisma.util.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { reviewValidator } from '../validator/review.validator.js';

const reviewRouter = express.Router();

//본인 리뷰 조회 API (목록)
reviewRouter.get('/my', authMiddleware, async (req, res, next) => {
  const userId = req.user.id;

  const myReviews = await prisma.reviews.findMany({
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

  const formattedReview = myReviews.map((review) => ({
    review_id: review.id,
    user_id: review.user_id,
    reviews: {
      petsitter_name: review.petsitters.name,
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at,
      updated_at: review.updated_at,
    },
  }));

  return res.status(200).json({
    status: 200,
    message: '본인 리뷰조회 성공!',
    data: formattedReview,
  });
});

//리뷰 수정 API
reviewRouter.patch(
  '/:reviewId',
  authMiddleware,
  reviewValidator,
  async (req, res, next) => {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    try {
      //리뷰찾기
      const review = await prisma.reviews.findUnique({
        where: { id: +reviewId, user_id: +userId },
      });

      if (!review) {
        return res
          .status(404)
          .json({ status: 404, message: '리뷰가 존재하지 않습니다.' });
      }
      //찾은리뷰수정
      const updateReview = await prisma.reviews.update({
        where: { id: +reviewId, user_id: +userId },
        data: {
          rating,
          comment,
        },
      });

      // 펫시터 정보 조회
      const petsitter = await prisma.petsitters.findUnique({
        where: { id: review.pet_sitter_id },
        select: { name: true },
      });

      const formattedReview = {
        review_id: updateReview.id,
        user_id: updateReview.user_id,
        reviews: {
          petsitter_name: petsitter.name,
          rating: updateReview.rating,
          comment: updateReview.comment,
          created_at: updateReview.created_at,
          updated_at: updateReview.updated_at,
        },
      };

      return res.status(200).json({
        status: 200,
        message: '펫시터 리뷰 수정 성공!',
        data: formattedReview,
      });
    } catch (err) {
      next(err);
    }
  },
);
export default reviewRouter;
