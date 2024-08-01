import express from 'express';
import { prisma } from '../utils/prisma.util.js';

const petsitterRouter = express.Router();

//펫시터 목록 조회 API
petsitterRouter.get('/pet-sitters', async (req, res, next) => {
  try {
    const petSitter = await prisma.petsitters.findMany({
      orderBy: { created_at: 'desc' },
    });

    const result = petSitter.map((sitter) => ({
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

    return res
      .status(200)
      .json({ status: 200, message: '펫시터 목록 조회 성공', data: result });
  } catch (err) {
    next(err);
  }
});

export default petsitterRouter;
