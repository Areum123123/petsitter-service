import { PetsitterRepository } from '../repositories/petsitter.repository.js';
import { prisma } from '../utils/prisma.util.js';

export class PetsitterService {
  petsitterRepository = new PetsitterRepository();

  //펫시터 목록조회(이름,지역,경력으로 검색)
  findAllPetsitters = async (name, region, experience) => {
    const whereObject = {};

    if (name) {
      whereObject.name = { contains: name }; //contains 를 사용하면 부분일치 검색이 가능하다.
    }

    if (region) {
      whereObject.region = { contains: region };
    }

    if (experience) {
      whereObject.experience = { contains: experience };
    }

    const petSitters =
      await this.petsitterRepository.findAllPetsitters(whereObject);

    const result = petSitters.map((sitter) => ({
      petSitterId: sitter.id,
      name: sitter.name,
      experience: sitter.experience,
      certification: sitter.certification,
      region: sitter.region,
      total_rate: sitter.total_rate,
      image_url: sitter.image_url,
      created_at: sitter.created_at,
      updated_at: sitter.updated_at,
    }));
    return result;
  };

  createReview = async (userId, petSitterId, rating, comment) => {
    const transactionResult = await prisma.$transaction(async (prisma) => {
      //펫시터 찾기
      const petSitter = await this.petsitterRepository.findPetsittersById(
        petSitterId,
        prisma,
      );

      if (!petSitter) {
        throw new Error('펫시터를 찾을 수 없습니다');
      }

      //리뷰생성
      const createReview = await this.petsitterRepository.createReview(
        userId,
        petSitterId,
        rating,
        comment,
        prisma,
      );
      //리뷰 모두 찾아서
      const petsitterReviews =
        await this.petsitterRepository.findReviewsByPetSitterId(
          petSitterId,
          prisma,
        );

      const averageRating = (
        petsitterReviews.reduce((sum, review) => sum + review.rating, 0) /
        petsitterReviews.length
      ).toFixed(1);
      //리뷰 평점
      await this.petsitterRepository.updateTotalRate(
        petSitterId,
        averageRating,
        prisma,
      );

      return createReview;
    });

    return {
      review_id: transactionResult.id,
      pet_sitter_id: transactionResult.pet_sitter_id,
      reviews: {
        user_name: transactionResult.users.name,
        rating: transactionResult.rating,
        comment: transactionResult.comment,
        created_at: transactionResult.created_at,
        updated_at: transactionResult.updated_at,
      },
    };
  };

  //펫시터 리뷰 조회
  getReviewByPetsitterId = async (petSitterId) => {
    const petsitter = await this.petsitterRepository.getPetsitter(petSitterId);
    if (!petsitter) {
      throw new Error('펫시터를 찾을 수 없습니다.');
    }

    //리뷰찾기
    const reviews =
      await this.petsitterRepository.getReviewByPetsitterId(petSitterId);

    return reviews.map((review) => ({
      review_id: review.id,
      pet_sitter_id: review.pet_sitter_id,
      reviews: {
        user_name: review.users.name,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        updated_at: review.updated_at,
      },
    }));
  };
}
