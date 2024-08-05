import express from 'express';
import { signUpValidator } from '../validator/sign-up.validator.js';
import { signInValidator } from '../validator/sign-in.validator.js';
import { ACCESS_TOKEN_SECRET_KEY } from '../constant/env.constant.js';
import { prisma } from '../utils/prisma.util.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { requireRefreshToken } from '../middlewares/refresh-token.middleware.js';

const authRouter = express.Router();

//회원가입 API
authRouter.post('/sign-up', signUpValidator, async (req, res, next) => {
  const { email, password, name, phone_number, address } = req.body;

  try {
    const isExistUser = await prisma.users.findFirst({
      where: {
        email,
      },
    });
    if (isExistUser) {
      return res.status(409).json({
        status: 409,
        message: '이미 가입 된 사용자입니다.',
      });
    }

    //3. **비즈니스 로직(데이터 처리)**
    //- 보안을 위해 비밀번호는 평문으로 저장하지 않고 Hash 된 값을 저장
    const hashedPassword = await bcrypt.hash(password, 10);
    //Users테이블에 사용자를 추가
    const user = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone_number,
        address,
      },
    });

    return res.status(201).json({
      message: '회원 가입이 성공적으로 완료되었습니다.',
    });
  } catch (err) {
    next(err);
  }
});

//로그인 API
authRouter.post('/sign-in', signInValidator, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // - **이메일로 조회되지 않거나 비밀번호가 일치하지 않는 경우** - “인증 정보가 유효하지 않습니다.”
    const user = await prisma.users.findFirst({ where: { email } });

    if (!user) {
      return res
        .status(401)
        .json({ status: 401, message: '인증 정보가 유효하지 않습니다.' });
    }

    //비밀번호 일치
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: 401,
        message: '인증 정보가 유효하지 않습니다.',
      });
    }
    //사용자에게 jwt발급

    const accessToken = jwt.sign(
      {
        id: user.id,
      },
      ACCESS_TOKEN_SECRET_KEY,
      { expiresIn: '12h' },
    );

    //refresh토큰  발급
    const refreshToken = jwt.sign(
      {
        id: user.id,
      },
      REFRESH_TOKEN_SECRET_KEY,
      { expiresIn: '7d' },
    );

    //refresh 토큰 저장(hash 값으로 저장)
    const hashedRefreshToken = bcrypt.hashSync(refreshToken, 10);

    //refresh 토큰 생성 또는 갱신 upsert() 있으면 update 없으면 create
    await prisma.refresh_tokens.upsert({
      where: {
        user_id: user.id,
      },
      update: {
        refresh_token: hashedRefreshToken,
      },
      create: {
        user_id: user.id,
        refresh_token: hashedRefreshToken,
      },
    });

    return res.status(200).json({
      status: 200,
      message: '로그인 성공했습니다.',
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (err) {
    next(err);
  }
});

//토큰 재발급 API

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
