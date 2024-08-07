import { UserRepository } from '../repositories/user.repositroy.js';

export class UserService {
  userRepository = new UserRepository();

  getUserById = async (userId) => {
    const user = this.userRepository.findUserById(userId);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    return user;
  };
}
