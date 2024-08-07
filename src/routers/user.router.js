import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { updateUserValidator } from '../validator/update-user.validator.js';
import upload from '../config/s3-upload.js';
import { UserController } from '../controllers/user.controller.js';

const userRouter = express.Router();
const userController = new UserController();

userRouter.get('/me', authMiddleware, userController.getMe);

//내 정보 수정 API
userRouter.patch(
  '/me',
  authMiddleware,
  updateUserValidator,
  userController.updateMe,
);
// s3 유저 이미지 업로드 API
userRouter.post(
  '/me/upload-images',
  authMiddleware,
  upload.single('image'),
  userController.uploadImage,
);

export default userRouter;
