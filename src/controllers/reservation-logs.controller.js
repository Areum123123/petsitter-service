import { LogRepository } from '../repositories/reservation-logs.repository.js';

export class LogController {
  logRepository = new LogRepository();

  getLogs = async (req, res, next) => {
    try {
      const reservationLogs = await this.logRepository.getLogs();

      return res.status(200).json({
        status: 200,
        message: '예약 로그 목록 조회 성공!',
        data: reservationLogs,
      });
    } catch (err) {
      next(err);
    }
  };
}
