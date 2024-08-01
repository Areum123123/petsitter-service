import express from 'express';
import authRouter from './auth.router.js';
import petsitterRouter from './petsitter.router.js';
import reservationRouter from './reservation.router.js';
// import  authMiddleware  from "../middlewares/auth.middleware.js"

const apiRouter = express.Router();

apiRouter.use('/', petsitterRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/reservations', reservationRouter);

export default apiRouter;
