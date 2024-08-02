import express from 'express';
import { PetsitterController } from '../controllers/petsitter.controller.js';

const petsitterRouter = express.Router();
const petsitterController = new PetsitterController(); //PetsitterController 인스터화 시킨다.

//펫시터 목록 조회 API
petsitterRouter.get('/pet-sitters', petsitterController.getPetsitters);

export default petsitterRouter;
