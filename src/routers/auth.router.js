import express from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma.util.js';
import jwt from 'jsonwebtoken';
import {
  REFRESH_TOKEN_SECRET_KEY,
  ACCESS_TOKEN_SECRET_KEY,
} from '../constant/env.constant.js';
import { AuthController } from '../controllers/auth.controller.js';
import { signUpValidator } from '../validator/sign-up.validator.js';
import { signInValidator } from '../validator/sign-in.validator.js';
import { requireRefreshToken } from '../middlewares/refresh-token.middleware.js';

const authRouter = express.Router();
const authController = new AuthController(); //AuthController를 인스터화 시킨다.

//회원가입 API
authRouter.post('/sign-up', signUpValidator, authController.register);

//로그인 API
authRouter.post('/sign-in', signInValidator, authController.login);

//토큰 재발급 API 진행중
authRouter.post('/token', requireRefreshToken, async (req, res, next) => {
  const userId = req.user.id;
  const payload = { id: userId };

  try {
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET_KEY, {
      expiresIn: '12h',
    });

    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET_KEY, {
      expiresIn: '7d',
    });

    const hashedRefreshToken = bcrypt.hashSync(refreshToken, 10);

    await prisma.refresh_tokens.upsert({
      where: { user_id: +userId },
      update: {
        refresh_token: hashedRefreshToken,
      },
      create: {
        user_id: +userId,
        refresh_token: hashedRefreshToken,
      },
    });

    return res.status(200).json({
      status: 200,
      message: '토큰 재발급에 성공했습니다.',
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (err) {
    next(err);
  }
});

export default authRouter;
