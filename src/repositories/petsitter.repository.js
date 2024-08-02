import { prisma } from '../utils/prisma.util.js';
export class PetsitterRepository {
  //펫시터 목록 : 아무조건없이 검색이라 controller -> repository로 바로 함 비즈니스 로직 추가하면 controller부터 수정해야함.
  findAllPetsitters = async () => {
    const petSitters = await prisma.petsitters.findMany({
      orderBy: { created_at: 'desc' },
    });

    const result = petSitters.map((sitter) => ({
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
    return result;
  };
}
