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
      if (err.message === '이미 가입 된 사용자입니다.') {
        return res.status(409).json({
          status: 409,
          message: err.message,
        });
      }
      next(err);
    }
  };

  //로그인
  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const { accessToken } = await this.authService.login(email, password);

      res.header('accessToken', accessToken);
      return res
        .status(200)
        .json({ status: 200, message: '로그인 성공했습니다.', accessToken });
    } catch (err) {
      next(err);
    }
  };
}
