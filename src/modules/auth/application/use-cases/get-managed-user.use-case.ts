import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { StaffOrmEntity } from '../../../org/infrastructure/database/staff.entity';
import { UserOrmEntity } from '../../infrastructure/database/user.entity';
import { ManagedUserResponseDto } from '../dtos/user-admin.dto';
import { mapManagedUserResponse } from './user-admin.mapper';

@Injectable()
export class GetManagedUserUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(id: string): Promise<ManagedUserResponseDto> {
    const user = await this.dataSource.getRepository(UserOrmEntity).findOne({
      where: { id },
      relations: {
        role: true,
        defaultBranch: true,
        loginTimeWindow: true,
        branchScopes: { branch: true },
      },
    });
    if (!user) {
      throw new NotFoundException('Không tìm thấy user');
    }

    const staff = await this.dataSource.getRepository(StaffOrmEntity).findOneBy({ userId: id });
    return mapManagedUserResponse(user, staff);
  }
}
