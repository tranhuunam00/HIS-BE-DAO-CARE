import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepositoryToken } from '../../domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class LockManagedUserUseCase {
  constructor(
    @Inject(IUserRepositoryToken)
    private readonly userRepository: IUserRepository
  ) {}

  async execute(id: string, lockedBy: string | null, reason: string | null): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Không tìm thấy user');
    }

    await this.userRepository.save(user.lock(lockedBy, reason));
  }
}
