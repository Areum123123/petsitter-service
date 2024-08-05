import { PetsitterService } from '../services/petsitter.service.js';

export class PetsitterController {
  petsitterService = new PetsitterService();

  //펫시터 목록 조회[이름,지역,경력별 검색]
  getPetsitters = async (req, res, next) => {
    const { name, region, experience } = req.query;

    try {
      const petsitters = await this.petsitterService.findAllPetsitters(
        name,
        region,
        experience,
      );

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
