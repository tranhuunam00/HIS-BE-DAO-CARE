import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BranchOrmEntity } from '../../../org/infrastructure/database/branch.entity';
import { BranchAllowedIpOrmEntity } from '../../infrastructure/database/branch-allowed-ip.entity';
import { BranchAllowedIpResponseDto, UpsertBranchAllowedIpDto } from '../dtos/user-admin.dto';

@Injectable()
export class ListBranchAllowedIpsUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(branchId: string): Promise<BranchAllowedIpResponseDto[]> {
    await ensureBranchExists(this.dataSource, branchId);
    const ips = await this.dataSource.getRepository(BranchAllowedIpOrmEntity).find({
      where: { branchId },
      order: { createdAt: 'DESC' },
    });
    return ips.map(mapAllowedIp);
  }
}

@Injectable()
export class UpsertBranchAllowedIpsUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(branchId: string, items: UpsertBranchAllowedIpDto[]): Promise<BranchAllowedIpResponseDto[]> {
    await ensureBranchExists(this.dataSource, branchId);
    const repository = this.dataSource.getRepository(BranchAllowedIpOrmEntity);
    await repository.delete({ branchId });
    const saved = await repository.save(items.map((item) => repository.create({
      branchId,
      ipAddress: item.ipAddress,
      description: item.description ?? null,
      isActive: item.isActive ?? true,
    })));
    return saved.map(mapAllowedIp);
  }
}

async function ensureBranchExists(dataSource: DataSource, branchId: string): Promise<void> {
  const branch = await dataSource.getRepository(BranchOrmEntity).findOneBy({ id: branchId });
  if (!branch) {
    throw new NotFoundException('Không tìm thấy chi nhánh');
  }
}

function mapAllowedIp(entity: BranchAllowedIpOrmEntity): BranchAllowedIpResponseDto {
  return {
    id: entity.id,
    branchId: entity.branchId,
    ipAddress: entity.ipAddress,
    description: entity.description,
    isActive: entity.isActive,
  };
}
