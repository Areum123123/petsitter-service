import { PetsitterRepository } from '../repositories/petsitter.repository.js';
export class PetsitterService {
  petsitterRepository = new PetsitterRepository();

  //펫시터 목록조회(이름,지역,경력으로 검색)
  findAllPetsitters = async (name, region, experience) => {
    const whereObject = {};
    try {
      if (name) {
        whereObject.name = { contains: name }; //contains 를 사용하면 부분일치 검색이 가능하다.
      }

      if (region) {
        whereObject.region = { contains: region };
      }

      if (experience) {
        whereObject.experience = { contains: experience };
      }

      const findPetsitters =
        await this.petsitterRepository.findAllPetsitters(whereObject);

      return findPetsitters;
    } catch (err) {
      next(err);
    }
  };
}
