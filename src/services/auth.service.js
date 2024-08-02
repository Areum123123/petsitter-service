import { AuthRepository } from '../repositories/auth.repository.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET_KEY } from '../constant/env.constant.js';
export class AuthService {
  authRepository = new AuthRepository();

  //회원가입
  register = async (email, password, name, phone_number, address) => {
    try {
      const isExistUser = await this.authRepository.findUserByEmail(email);

      if (isExistUser) {
        throw new Error('이미 가입 된 사용자입니다.');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const registered = await this.authRepository.register(
        hashedPassword,
        email,
        name,
        phone_number,
        address,
      );

      return { registered };
    } catch (err) {
      throw err;
    }
  };

  //로그인
  login = async (email, password) => {
    try {
      const user = await this.authRepository.findUserByEmail(email);

      if (!user) {
        throw new Error('사용자가 존재하지 않습니다.');
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        throw new Error('비밀번호가 일치하지 않습니다.');
      }
      //사용자에게 access token 발급
      const accessToken = jwt.sign(
        {
          id: user.id,
        },
        ACCESS_TOKEN_SECRET_KEY,
        { expiresIn: '12h' },
      );

      return { accessToken };
    } catch (err) {
      throw err;
    }
  };
}
