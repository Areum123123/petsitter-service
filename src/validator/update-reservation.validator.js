import Joi from 'joi';

const updateReservationSchema = Joi.object({
  dog_name: Joi.string().min(1).allow('').optional().messages({
    'string.base': '개의 이름은 문자열이어야 합니다.',
  }),
  dog_breed: Joi.string().min(1).allow('').optional().messages({
    'string.base': '개의 품종은 문자열이어야 합니다.',
  }),
  dog_age: Joi.string().min(1).allow('').optional().messages({
    'string.base': '개의 나이는 문자열이어야 합니다.',
  }),
  dog_weight: Joi.string().min(1).allow('').optional().messages({
    'string.base': '개의 체중은 문자열이어야 합니다.',
  }),
  request_details: Joi.string().allow('').optional().messages({
    'string.base': '요청 세부 사항은 문자열이어야 합니다.',
  }),
  booking_date: Joi.date().iso().allow('').optional().messages({
    'date.base': '예약 날짜는 유효한 날짜 형식이어야 합니다.',
    'date.isoDate': '예약 날짜는 ISO 8601 형식이어야 합니다.',
    'string.base': '예약 날짜는 유효한 날짜 형식이어야 합니다.',
  }),
});

export const updateReservationValidator = async (req, res, next) => {
  try {
    await updateReservationSchema.validateAsync(req.body, {
      abortEarly: false,
    });
    next();
  } catch (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(', ');
    res.status(400).json({ status: 400, message: errorMessage });
  }
};
