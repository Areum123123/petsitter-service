import { prisma } from '../utils/prisma.util.js';
export class AuthRepository {
  //회원가입
  register = async (hashedPassword, email, name, phone_number, address) => {
    const registered = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone_number,
        address,
      },
    });
    return registered;
  };

  findUserByEmail = async (email) => {
    const user = await prisma.users.findFirst({
      where: { email },
    });
    return user;
  };

  //토큰 재발급
  upsertRefreshToken = async (userId, hashedRefreshToken) => {
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
  };
}
