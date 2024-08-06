import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { prisma } from '../utils/prisma.util.js';
import { updateUserValidator } from '../validator/update-user.validator.js';
import upload from '../config/s3.js';

const userRouter = express.Router();
//내정보 조회 API
userRouter.get('/me', authMiddleware, async (req, res, next) => {
  const userId = req.user.id;

  try {
    const user = await prisma.users.findFirst({
      where: { id: +userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        address: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    return res.status(200).json({
      status: 200,
      message: '내 정보 조회에 성공했습니다',
      data: user,
    });
  } catch (err) {
    next(err);
  }
});

//내 정보 수정 API
userRouter.patch(
  '/me',
  authMiddleware,
  updateUserValidator,
  async (req, res, next) => {
    const userId = req.user.id;
    const { phone_number, address } = req.body;

    const updatedUser = await prisma.users.update({
      where: { id: +userId },
      data: {
        phone_number,
        address,
        updated_at: new Date(),
      },
      select: {
        id: true,
        name: true,
        phone_number: true,
        address: true,
        updated_at: true,
      },
    });

    return res.status(200).json({
      status: 200,
      message: '회원 정보가 성공적으로 수정되었습니다',
      data: updatedUser,
    });
  },
);

// 이미지 업로드 엔드포인트
userRouter.post(
  '/me/upload-images',
  authMiddleware,
  upload.single('image'),
  async (req, res) => {
    const userId = req.body.id;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const imageUrl = req.file.location;
      const updatedUser = await prisma.users.update({
        where: { id: +userId },
        data: { image_url: imageUrl },
      });
      res.status(200).json({
        status: 200,
        message: '이미지업로드 성공!',
      });
    } catch (error) {
      res.status(500).json({ error: 'Something went wrong' });
    }
  },
);

export default userRouter;
