import { ReviewRepository } from '../repositories/review.repository.js';

export class ReviewService {
  reviewRepository = new ReviewRepository();

  getMyReviews = async (userId) => {
    const myReviews = await this.reviewRepository.getMyReviews(userId);

    return myReviews.map((review) => ({
      review_id: review.id,
      user_id: review.user_id,
      reviews: {
        petsitter_name: review.petsitters.name,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        updated_at: review.updated_at,
      },
    }));
  };

  updateReview = async (reviewId, userId, rating, comment) => {
    //리뷰찾기
    const review = await this.reviewRepository.findReviewById(reviewId, userId);
    if (!review) {
      throw new Error('리뷰가 존재하지 않습니다.');
    }

    //찾은 리뷰 수정
    const updateReview = await this.reviewRepository.updateReview(
      reviewId,
      userId,
      rating,
      comment,
    );

    //수정한 펫시터 리뷰 보기
    const petsitter = await this.reviewRepository.getPetsitter(review);

    return {
      review_id: updateReview.id,
      user_id: updateReview.user_id,
      reviews: {
        petsitter_name: petsitter.name,
        rating: updateReview.rating,
        comment: updateReview.comment,
        created_at: updateReview.created_at,
        updated_at: updateReview.updated_at,
      },
    };
  };

  //리뷰삭제
  deleteReview = async (reviewId, userId) => {
    //리뷰존재여부
    const review = await this.reviewRepository.getMyReview(reviewId, userId);

    if (!review) {
      throw new Error('리뷰가 존재하지 않습니다.');
    }

    //삭제
    await this.reviewRepository.deleteReview(reviewId, userId);
  };
}
