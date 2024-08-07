export const errorHandler = (err, req, res, next) => {
  console.error(err);

  // JSON 파싱 오류 처리
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 400,
      message: '별점을 입력해주세요.',
    });
  }

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
  } else if (err.message === '사용자를 찾을 수 없습니다.') {
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
  } else if (err.message === '예약 정보가 존재하지 않습니다.') {
    return res.status(404).json({
      status: 404,
      message: err.message,
    });
  } else if (err.message === '해당 날짜는 이미 예약되어 있습니다.') {
    return res.status(400).json({
      status: 400,
      message: err.message,
    });
  } else if (err.message === '예약 정보가 존재하지 않습니다.') {
    return res.status(404).json({
      status: 404,
      message: err.message,
    });
  } else if (err.message === '예약 상태를 변경할 권한이 없습니다.') {
    return res.status(403).json({
      status: 403,
      message: err.message,
    });
  } else if (err.code === 'P2025') {
    return res.status(404).json({
      status: 404,
      message: `해당 사용자의 refresh_token을 찾을 수 없습니다.`,
    });
  } else if (err.message === '펫시터를 찾을 수 없습니다') {
    return res.status(404).json({
      status: 404,
      message: err.message,
    });
  } else if (err.message === '리뷰가 존재하지 않습니다.') {
    return res.status(404).json({
      status: 404,
      message: err.message,
    });
  }

  // 그 밖의 예상치 못한 에러 처리
  return res.status(500).json({
    status: 500,
    message: '예상치 못한 에러가 발생했습니다. 관리자에게 문의해 주세요.',
  });
};
