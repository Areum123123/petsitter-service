import { AuthService } from '../services/auth.service.js';

export class AuthController {
  authService = new AuthService();
  //회원가입 API
  register = async (req, res, next) => {
    try {
      const { email, password, name, phone_number, address } = req.body;
      const registered = await this.authService.register(
        email,
        password,
        name,
        phone_number,
        address,
      );

      return res.status(201).json({
        status: 201,
        message: '회원 가입이 성공적으로 완료되었습니다.',
      }); //data:registered
    } catch (err) {
      next(err);
    }
  };

  //로그인
  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshToken } = await this.authService.login(
        email,
        password,
      );

      return res
        .status(200)
        .json({
          status: 200,
          message: '로그인 성공했습니다.',
          accessToken,
          refreshToken,
        });
    } catch (err) {
      next(err);
    }
  };
}
