import express from 'express';
import authRouter from './auth.router.js';
import petsitterRouter from './petsitter.router.js';
import reservationRouter from './reservation.router.js';
import reviewRouter from './review.router.js';
import logRouter from './reservation-logs.router.js';
// import  authMiddleware  from "../middlewares/auth.middleware.js"

const apiRouter = express.Router();

apiRouter.use('/pet-sitters', petsitterRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/reservations', reservationRouter);
apiRouter.use('/reviews', reviewRouter);
apiRouter.use('/', logRouter);

export default apiRouter;
