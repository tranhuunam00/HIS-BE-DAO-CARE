import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationOrmEntity } from '../../infrastructure/database/organization.entity';
import { BranchOrmEntity } from '../../infrastructure/database/branch.entity';
import { OrganizationController } from './controllers/organization.controller';
import { BranchController } from './controllers/branch.controller';
import { IOrganizationRepositoryToken } from '../../domain/repositories/organization.repository.interface';
import { OrganizationRepository } from '../../infrastructure/repositories/organization.repository';
import { IBranchRepositoryToken } from '../../domain/repositories/branch.repository.interface';
import { BranchRepository } from '../../infrastructure/repositories/branch.repository';
import { GetOrganizationUseCase } from '../../application/use-cases/get-organization.use-case';
import { UpdateOrganizationUseCase } from '../../application/use-cases/update-organization.use-case';
import { ListBranchesUseCase } from '../../application/use-cases/list-branches.use-case';
import { GetBranchUseCase } from '../../application/use-cases/get-branch.use-case';
import { CreateBranchUseCase } from '../../application/use-cases/create-branch.use-case';
import { UpdateBranchUseCase } from '../../application/use-cases/update-branch.use-case';
import { DeactivateBranchUseCase } from '../../application/use-cases/deactivate-branch.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrganizationOrmEntity, BranchOrmEntity]),
  ],
  controllers: [
    OrganizationController,
    BranchController,
  ],
  providers: [
    // Repositories
    {
      provide: IOrganizationRepositoryToken,
      useClass: OrganizationRepository,
    },
    {
      provide: IBranchRepositoryToken,
      useClass: BranchRepository,
    },
    // Use cases
    GetOrganizationUseCase,
    UpdateOrganizationUseCase,
    ListBranchesUseCase,
    GetBranchUseCase,
    CreateBranchUseCase,
    UpdateBranchUseCase,
    DeactivateBranchUseCase,
  ],
  exports: [
    IOrganizationRepositoryToken,
    IBranchRepositoryToken,
  ],
})
export class OrgModule {}
