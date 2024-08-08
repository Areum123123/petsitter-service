import { prisma } from '../utils/prisma.util.js';

export class UserRepository {
  findUserById = async (userId) => {
    return await prisma.users.findFirst({
      where: { id: +userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        address: true,
        role: true,
        image_url: true,
        created_at: true,
        updated_at: true,
      },
    });
  };

  updateUser = async (userId, updateData) => {
    return await prisma.users.update({
      where: { id: +userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        phone_number: true,
        address: true,
        updated_at: true,
      },
    });
  };

  uploadImage = async (userId, imageUrl) => {
    return await prisma.users.update({
      where: { id: +userId },
      data: { image_url: imageUrl },
      select: {
        image_url: true,
      },
    });
  };
}
