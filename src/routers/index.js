import express from 'express';
import authRouter from './auth.router.js';
// import  authMiddleware  from "../middlewares/auth.middleware.js"

const apiRouter = express.Router();

apiRouter.use('/auth', authRouter);

export default apiRouter;
