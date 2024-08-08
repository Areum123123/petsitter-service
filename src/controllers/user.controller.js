import { UserRepository } from '../repositories/user.repositroy.js';
import { UserService } from '../services/user.service.js';

export class UserController {
  userService = new UserService();
  userRepository = new UserRepository();

  getMe = async (req, res, next) => {
    const userId = req.user.id;

    try {
      const user = await this.userService.getUserById(userId);

      return res.status(200).json({
        status: 200,
        message: '내 정보 조회에 성공했습니다',
        data: user,
      });
    } catch (err) {
      next(err);
    }
  };

  updateMe = async (req, res, next) => {
    const userId = req.user.id;
    const { phone_number, address } = req.body;

    try {
      const users = await this.userRepository.findUserById(userId);

      // user.service에 넣기 짧아서 컨트롤에 합침
      const updateData = {
        phone_number: phone_number || users.phone_number,
        address: address || users.address,
      };

      const updatedUser = await this.userRepository.updateUser(
        userId,
        updateData,
      );

      return res.status(200).json({
        status: 200,
        message: '회원 정보가 성공적으로 수정되었습니다',
        data: updatedUser,
      });
    } catch (err) {
      next(err);
    }
  };

  uploadImage = async (req, res, next) => {
    const userId = req.user.id;
    const imageUrl = req.file.location;

    if (!req.file) {
      return res.status(400).json({ error: '파일을 업로드 해주세요.' });
    }

    try {
      const updatedUser = await this.userRepository.uploadImage(
        userId,
        imageUrl,
      );

      res.status(200).json({
        status: 200,
        message: '이미지업로드 성공!',
        data: updatedUser,
      });
    } catch (err) {
      next(err);
    }
  };
}
