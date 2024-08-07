import express from 'express';
import { prisma } from '../utils/prisma.util.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { reviewValidator } from '../validator/review.validator.js';
import { ReviewController } from '../controllers/review.controller.js';

const reviewRouter = express.Router();
const reviewController = new ReviewController();

//본인 리뷰 조회 API(목록)
reviewRouter.get('/my', authMiddleware, reviewController.myReview);

//리뷰 수정 API
reviewRouter.patch(
  '/:reviewId',
  authMiddleware,
  reviewValidator,
  reviewController.updateReview,
);

//리뷰 삭제 API
reviewRouter.delete(
  '/:reviewId',
  authMiddleware,
  reviewController.deleteReview,
);
export default reviewRouter;
