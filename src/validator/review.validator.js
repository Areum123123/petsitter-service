import Joi from 'joi';

// 리뷰 작성 유효성 검사 스키마
const reviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.base': '평점은 숫자여야 합니다.',
    'number.integer': '평점은 정수여야 합니다.',
    'number.min': '평점은 1에서 5 사이여야 합니다.',
    'number.max': '평점은 1에서 5 사이여야 합니다.',
    'any.required': '평점은 필수 입력 사항입니다.',
  }),
  comment: Joi.string().min(5).max(200).required().messages({
    'string.base': '리뷰 내용은 문자열이어야 합니다.',
    'string.min': '리뷰 내용은 최소 5자 이상이어야 합니다.',
    'string.max': '리뷰 내용은 최대 200자 이하이어야 합니다.',
    'any.required': '리뷰 내용은 필수 입력 사항입니다.',
    'string.empty': '리뷰 내용은 필수 입력 사항입니다.',
  }),
});

export const reviewValidator = async (req, res, next) => {
  try {
    await reviewSchema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(', ');
    res.status(400).json({ message: errorMessage });
  }
};
