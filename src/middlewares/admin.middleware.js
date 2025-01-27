import { prisma } from '../utils/prisma.util.js';

export const adminMiddleware = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const user = await prisma.users.findFirst({
      where: { id: +userId },
    });

    if (user.role !== 'ADMIN') {
      return res.status(403).json({
        status: 403,
        message: '해당 작업에 대한 권한이 없습니다.',
      });
    }
    next();
  } catch (err) {
    next(err);
  }
};
