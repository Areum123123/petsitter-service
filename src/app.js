import express from 'express';
import { errorHandler } from './middlewares/error-hadler.middleware.js';
import { PORT_NUMBER } from './constant/env.constant.js';
import apiRouter from './routers/index.js';

const app = express();
const PORT = PORT_NUMBER;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', [apiRouter]);

app.get('/', (req, res) => {
  // throw new Error('예상치 못한 에러')    //에러핸들러 잘 연결되었나 확인
  return res.status(200).send('서버가 실행중');
});

app.use(errorHandler); //error 미들웨어 맨 아래위치.
app.listen(PORT, () => {
  console.log(`${PORT} 포트로 서버가 열렸습니다!`);
});
