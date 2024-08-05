import Joi from 'joi';

const signUpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'any.required': '이메일을 입력해주세요',
    'string.email': '이메일 형식이 올바르지 않습니다.',
    'string.empty': '이메일을 입력해 주세요',
  }),

  password: Joi.string().min(6).required().messages({
    'string.min': '비밀번호는 최소 6자리 이상이어야 합니다.',
    'any.required': '비밀번호를 입력해주세요.',
    'string.empty': '비밀번호를 입력해주세요.',
  }),

  confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
    'any.only': '비밀번호가 일치하지 않습니다.',
    'any.required': '비밀번호 확인을 입력해주세요',
    'string.empty': '비밀번호를 확인을 입력해주세요.',
  }),

  name: Joi.string().min(2).max(30).required().messages({
    'string.base': '이름은 문자열이어야 합니다.',
    'string.empty': '이름을 입력해주세요.',
    'any.required': '이름을 입력해주세요.',
    'string.min': '이름은 최소 2글자 이상이어야 합니다.',
    'string.max': '이름은 최대 10글자 이하여야 합니다.',
  }),

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

export const signUpValidator = async (req, res, next) => {
  try {
    await signUpSchema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(', ');
    res.status(400).json({ message: errorMessage });
  }
};
