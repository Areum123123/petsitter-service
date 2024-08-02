import { PetsitterRepository } from '../repositories/petsitter.repository.js';
import { PetsitterService } from '../services/petsitter.service.js';

export class PetsitterController {
  petsitterService = new PetsitterService();
  petsitterRepository = new PetsitterRepository();

  //펫시터 목록 조회 controller -> repository  비즈니스로직추가시 수정
  getPetsitters = async (req, res, next) => {
    try {
      const petsitters = await this.petsitterRepository.findAllPetsitters();

      return res.status(200).json({
        status: 200,
        message: '펫시터 목록 조회 성공',
        data: petsitters,
      });
    } catch (err) {
      next(err);
    }
  };
}
