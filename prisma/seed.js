import { PrismaClient } from '@prisma/client';
import petSitters from '../src/utils/petsitterData.js';

const prisma = new PrismaClient();

async function main() {
  for (let petSitter of petSitters) {
    const sitterData = await prisma.petsitters.create({
      data: petSitter,
    });
  }

  console.log('펫시터 데이터 삽입 완료!');
}
// main 함수를 실행
main()
  .catch((e) => {
    console.error(e); // 콘솔에 오류를 출력
    process.exit(1); // 프로세스를 종료
  })
  .finally(async () => {
    await prisma.$disconnect(); // PrismaClient 연결을 종료
  });
