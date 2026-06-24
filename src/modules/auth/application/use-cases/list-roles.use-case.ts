import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RoleOrmEntity } from '../../infrastructure/database/role.entity';
import { RoleResponseDto } from '../dtos/user-admin.dto';

@Injectable()
export class ListRolesUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(): Promise<RoleResponseDto[]> {
    const roles = await this.dataSource.getRepository(RoleOrmEntity).find({
      order: { name: 'ASC' },
    });

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
    }));
  }
}
