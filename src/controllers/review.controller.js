import { ReviewService } from '../services/review.service.js';

export class ReviewController {
  reviewService = new ReviewService();

  //본인리뷰조회
  myReview = async (req, res, next) => {
    const userId = req.user.id;

    const myReviews = await this.reviewService.getMyReviews(userId);

    return res.status(200).json({
      status: 200,
      message: '본인 리뷰조회 성공!',
      data: myReviews,
    });
  };

  updateReview = async (req, res, next) => {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    try {
      //리뷰찾기

      const updatedReview = await this.reviewService.updateReview(
        reviewId,
        userId,
        rating,
        comment,
      );

      return res.status(200).json({
        status: 200,
        message: '펫시터 리뷰 수정 성공!',
        data: updatedReview,
      });
    } catch (err) {
      next(err);
    }
  };

  deleteReview = async (req, res, next) => {
    const { reviewId } = req.params;
    const userId = req.user.id;
    try {
      //삭제
      await this.reviewService.deleteReview(reviewId, userId);

      return res
        .status(200)
        .json({ status: 200, message: '리뷰가 성공적으로 삭제되었습니다.' });
    } catch (err) {
      next(err);
    }
  };
}
