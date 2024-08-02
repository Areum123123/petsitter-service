export const errorHandler = (err, req, res, next) => {
  console.error(err);

  //joi에서 발생한 에러 처리(컨트롤러 catch(err){여기들어갈것들})
  if (err.message === '이미 가입 된 사용자입니다.') {
    return res.status(409).json({
      status: 409,
      message: err.message,
    });
  } else if (err.message === '비밀번호가 일치하지 않습니다.') {
    return res.status(401).json({
      status: 401,
      message: err.message,
    });
  } else if (err.message === '사용자가 존재하지 않습니다.') {
    return res.status(404).json({
      status: 404,
      message: err.message,
    });
  } else if (err.code === 'P2002') {
    // Prisma의 P2002 오류는 고유 제약 조건 위반을 나타냄(터미널에 code:2002뜸)
    return res.status(400).json({
      status: 400,
      message: '이미 같은 날짜에 해당 펫시터에 대한 예약이 존재합니다.',
    });
  }

  // 그 밖의 예상치 못한 에러 처리
  return res.status(500).json({
    status: 500,
    message: '예상치 못한 에러가 발생했습니다. 관리자에게 문의해 주세요.',
  });
};
