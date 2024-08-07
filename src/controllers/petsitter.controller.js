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

  //펫시터 리뷰생성
  createReview = async (req, res, next) => {
    const userId = req.user.id;
    const { petSitterId } = req.params;
    const { rating, comment } = req.body;
    try {
      const transactionResult = await this.petsitterService.createReview(
        userId,
        petSitterId,
        rating,
        comment,
      );

      return res.status(201).json({
        status: 201,
        message: '리뷰가 성공적으로 작성되었습니다.',
        data: transactionResult,
      });
    } catch (err) {
      next(err);
    }
  };

  getPetsitterReviews = async (req, res, next) => {
    const { petSitterId } = req.params;
    try {
      //펫시터 리뷰 찾기
      const reviews =
        await this.petsitterService.getReviewByPetsitterId(petSitterId);

      return res
        .status(200)
        .json({ status: 200, message: '리뷰 조회', data: reviews });
    } catch (err) {
      next(err);
    }
  };
}
