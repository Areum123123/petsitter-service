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
  petsitterController.createReview,
);

//펫시터 리뷰 조회 API
petsitterRouter.get(
  '/:petSitterId/reviews',
  petsitterController.getPetsitterReviews,
);

export default petsitterRouter;
