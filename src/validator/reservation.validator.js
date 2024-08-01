import Joi from 'joi';

const reservationSchema = Joi.object({
  pet_sitter_id: Joi.number().integer().positive().required().messages({
    'number.base': '펫시터 ID를 입력해주세요.',
    'number.integer': '펫시터 ID는 정수여야 합니다.',
    'number.positive': '펫시터 ID는 양수여야 합니다.',
    'any.required': '펫시터 ID를 입력해주세요.',
  }),
  dog_name: Joi.string().min(1).required().messages({
    'string.base': '개의 이름은 문자열이어야 합니다.',
    'string.empty': '개의 이름을 입력해주세요.',
    'any.required': '개의 이름을 입력해주세요.',
  }),
  dog_breed: Joi.string().min(1).required().messages({
    'string.base': '개의 품종은 문자열이어야 합니다.',
    'string.empty': '개의 품종을 입력해주세요.',
    'any.required': '개의 품종을 입력해주세요.',
  }),
  dog_age: Joi.string().min(1).required().messages({
    'string.base': '개의 나이는 문자열이어야 합니다.',
    'string.empty': '개의 나이를 입력해주세요.',
    'any.required': '개의 나이를 입력해주세요.',
  }),
  dog_weight: Joi.string().min(1).required().messages({
    'string.base': '개의 체중은 문자열이어야 합니다.',
    'string.empty': '개의 체중을 입력해주세요.',
    'any.required': '개의 체중을 입력해주세요.',
  }),
  request_details: Joi.string().allow('').optional().messages({
    'string.base': '요청 세부 사항은 문자열이어야 합니다.',
  }),
  booking_date: Joi.date().iso().required().messages({
    'date.base': '예약 날짜는 유효한 날짜 형식이어야 합니다.',
    'date.isoDate': '예약 날짜는 ISO 8601 형식이어야 합니다.',
    'any.required': '예약 날짜를 입력 해주세요.',
    'string.empty': '예약 날짜는 입력 해주세요.',
  }),
});

export const reservationValidator = async (req, res, next) => {
  try {
    await reservationSchema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(', ');
    res.status(400).json({ status: 400, message: errorMessage });
  }
};
