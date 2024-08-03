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
//refresh토큰 재발급API
authRouter.post('/token', requireRefreshToken, async (req, res, next) => {
  //RefreshToken**(JWT)을 **Request Header의 Authorization** 값(**`req.headers.authorization`**)으로 전달 받습니다.
  //사용자 정보는 **인증 Middleware(`req.user`)**를 통해서 전달 받습니다.
  const userId = req.user.id;

  try {
    // 2. **비즈니스 로직(데이터 처리)**
    //     - **AccessToken(Payload**에 **`사용자 ID`**를 포함하고, **유효기한**이 **`12시간`)**을 생성합니다.
    //     - **RefreshToken** (**Payload**: **사용자 ID** 포함, **유효기한**: **`7일`**)을 생성합니다.
    const payload = { userId: userId };
    // AccessToken(Payload**에 **`사용자 ID`**를 포함하고, **유효기한**이 **`12시간`)**을 생성합니다.
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET_KEY, {
      expiresIn: '12h',
    });

    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET_KEY, {
      expiresIn: '7d',
    });

    const hashedRefreshToken = bcrypt.hashSync(refreshToken, 10);
    //     - DB에 저장 된 **RefreshToken을 갱신**합니다.
    // 3. **반환 정보**
    //     - **AccessToken, RefreshToken**을 반환합니다.
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
