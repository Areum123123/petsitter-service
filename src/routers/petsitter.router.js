import express from 'express';
import { PetsitterController } from '../controllers/petsitter.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { prisma } from '../utils/prisma.util.js';
import { reviewValidator } from '../validator/review.validator.js';

const petsitterRouter = express.Router();
const petsitterController = new PetsitterController(); //PetsitterController 인스터화 시킨다.

//펫시터 목록 조회 API
petsitterRouter.get('/', petsitterController.getPetsitters);

//펫시터 리뷰 작성 API
petsitterRouter.post(
  '/:petSitterId/reviews',
  authMiddleware,
  reviewValidator,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { petSitterId } = req.params;
      const { rating, comment } = req.body;

      const transactionResult = await prisma.$transaction(async (prisma) => {
        const petSitter = await prisma.petsitters.findUnique({
          where: { id: +petSitterId },
        });
        if (!petSitter) {
          return res.status(404).json({
            status: 404,
            message: '펫시터를 찾을 수 없습니다',
          });
        }
        //리뷰생성
        const review = await prisma.reviews.create({
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

        //펫시터 리뷰 평점 업데이트 코드시작
        // 모든 리뷰 조회 및 평균 계산
        const reviews = await prisma.reviews.findMany({
          where: { pet_sitter_id: +petSitterId },
        });

        const averageRating = (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1);

        // 펫시터의 total_rate 업데이트
        await prisma.petsitters.update({
          where: { id: +petSitterId },
          data: { total_rate: +averageRating },
        });

        return {
          review,
          //averageRating,
        };
      });

      const formattedReview = {
        review_id: transactionResult.review.id,
        pet_sitter_id: transactionResult.review.pet_sitter_id,
        reviews: {
          user_name: transactionResult.review.users.name,
          rating: transactionResult.review.rating,
          comment: transactionResult.review.comment,
          created_at: transactionResult.review.created_at,
          updated_at: transactionResult.review.updated_at,
        },
      };
      return res.status(201).json({
        status: 201,
        message: '리뷰가 성공적으로 작성되었습니다.',
        data: formattedReview,
      });
    } catch (err) {
      if (err.isJoi) {
        // Joi 유효성 검사 오류
        const errorMessage = err.details
          .map((detail) => detail.message)
          .join(', ');
        return res.status(400).json({ message: errorMessage });
      }
      next(err);
    }
  },
);

//펫시터 리뷰 조회 API
petsitterRouter.get('/:petSitterId/reviews', async (req, res, next) => {
  const { petSitterId } = req.params;
  try {
    //펫시터 존재여부
    const petSitter = await prisma.petsitters.findUnique({
      where: {
        id: +petSitterId,
      },
    });

    if (!petSitter) {
      return res.status(404).json({
        status: 404,
        message: '펫시터를 찾을 수 없습니다.',
        data: [],
      });
    }
    //펫시터 리뷰찾기
    const reviews = await prisma.reviews.findMany({
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

    const formattedReviews = reviews.map((review) => ({
      review_id: review.id,
      pet_sitter_id: review.pet_sitter_id,
      reviews: {
        user_name: review.users.name,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        updated_at: review.updated_at,
      },
    }));

    return res
      .status(200)
      .json({ status: 200, message: '리뷰 조회', data: formattedReviews });
  } catch (err) {
    next(err);
  }
});

export default petsitterRouter;
