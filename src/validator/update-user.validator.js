import Joi from 'joi';

const updateUserSchema = Joi.object({
  phone_number: Joi.string()
    .pattern(/^[0-9]{9,11}$/) //전화번호 9자리에서 11자리까지 허용
    .required()
    .messages({
      'string.pattern.base': '유효한 전화번호를 입력해주세요.',
      'any.required': '전화번호를 입력해주세요.',
      'string.empty': '전화번호를 입력해주세요.',
    }),
  address: Joi.string()
    .min(5) // 주소는 최소 5자 이상
    .max(100) // 주소는 최대 100자 이하
    .pattern(/^[a-zA-Z0-9가-힣\s,.-]+$/) // 알파벳,한글, 숫자, 공백, 쉼표, 마침표 및 대시만 허용
    .required()
    .messages({
      'string.empty': '주소를 입력해주세요.',
      'string.min': '주소는 최소 5자 이상이어야 합니다.',
      'string.max': '주소는 최대 100자 이하이어야 합니다.',
      'string.pattern.base': '주소에 유효하지 않은 문자가 포함되어 있습니다.',
      'any.required': '주소를 입력해주세요.',
    }),
});

export const updateUserValidator = async (req, res, next) => {
  try {
    await updateUserSchema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(', ');
    res.status(400).json({ message: errorMessage });
  }
};
