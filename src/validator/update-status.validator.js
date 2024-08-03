import Joi from 'joi';

const updateStatusSchema = Joi.object({
  new_status: Joi.string()
    .valid('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELED')
    .required()
    .messages({
      'any.required': '변경하고자 하는 예약 상태를 입력해 주세요.',
      'string.empty': '변경하고자 하는 예약 상태를 입력해 주세요.',
      'any.only': '유효하지 않은 상태 값입니다.',
    }),
  reason: Joi.string().required().messages({
    'any.required': '예약 상태 변경 사유를 입력해 주세요.',
    'string.empty': '예약 상태 변경 사유를 입력해 주세요.',
  }),
});

export const updateStatusValidator = async (req, res, next) => {
  try {
    await updateStatusSchema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(', ');
    res.status(400).json({ status: 400, message: errorMessage });
  }
};
