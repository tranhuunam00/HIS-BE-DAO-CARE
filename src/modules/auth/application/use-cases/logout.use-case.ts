import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUserRepositoryToken } from '../../domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(IUserRepositoryToken)
    private readonly userRepository: IUserRepository
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Xóa Refresh Token Hash khỏi Database để thu hồi quyền
    const updatedUser = user.updateRefreshToken(null);
    await this.userRepository.save(updatedUser);
  }
}
