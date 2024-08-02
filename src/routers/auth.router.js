import express from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { signUpValidator } from '../validator/sign-up.validator.js';
import { signInValidator } from '../validator/sign-in.validator.js';

const authRouter = express.Router();
const authController = new AuthController(); //AuthController를 인스터화 시킨다.

//회원가입 API
authRouter.post('/sign-up', signUpValidator, authController.register);

//로그인 API
authRouter.post('/sign-in', signInValidator, authController.login);

export default authRouter;
