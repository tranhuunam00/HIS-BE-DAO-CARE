import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationOrmEntity } from '../../infrastructure/database/organization.entity';
import { BranchOrmEntity } from '../../infrastructure/database/branch.entity';
import { RoomOrmEntity } from '../../infrastructure/database/room.entity';
import { StaffOrmEntity } from '../../infrastructure/database/staff.entity';
import { PracticingCertificateOrmEntity } from '../../infrastructure/database/practicing-certificate.entity';
import { StaffAssignmentOrmEntity } from '../../infrastructure/database/staff-assignment.entity';
import { DepartmentOrmEntity } from '../../infrastructure/database/department.entity';
import { RoomServiceCapabilityOrmEntity } from '../../infrastructure/database/room-service-capability.entity';

import { OrganizationController } from './controllers/organization.controller';
import { BranchController } from './controllers/branch.controller';
import { RoomController } from './controllers/room.controller';
import { StaffController } from './controllers/staff.controller';
import { DepartmentController } from './controllers/department.controller';

import { IDepartmentRepositoryToken } from '../../domain/repositories/department.repository.interface';
import { DepartmentRepository } from '../../infrastructure/repositories/department.repository';

import { IOrganizationRepositoryToken } from '../../domain/repositories/organization.repository.interface';
import { OrganizationRepository } from '../../infrastructure/repositories/organization.repository';
import { IBranchRepositoryToken } from '../../domain/repositories/branch.repository.interface';
import { BranchRepository } from '../../infrastructure/repositories/branch.repository';
import { IRoomRepositoryToken } from '../../domain/repositories/room.repository.interface';
import { RoomRepository } from '../../infrastructure/repositories/room.repository';
import { IStaffRepositoryToken } from '../../domain/repositories/staff.repository.interface';
import { StaffRepository } from '../../infrastructure/repositories/staff.repository';
import { IStaffAssignmentRepositoryToken } from '../../domain/repositories/staff-assignment.repository.interface';
import { StaffAssignmentRepository } from '../../infrastructure/repositories/staff-assignment.repository';

import { GetOrganizationUseCase } from '../../application/use-cases/get-organization.use-case';
import { UpdateOrganizationUseCase } from '../../application/use-cases/update-organization.use-case';
import { ListBranchesUseCase } from '../../application/use-cases/list-branches.use-case';
import { GetBranchUseCase } from '../../application/use-cases/get-branch.use-case';
import { CreateBranchUseCase } from '../../application/use-cases/create-branch.use-case';
import { UpdateBranchUseCase } from '../../application/use-cases/update-branch.use-case';
import { DeactivateBranchUseCase } from '../../application/use-cases/deactivate-branch.use-case';

import { ListRoomsUseCase } from '../../application/use-cases/list-rooms.use-case';
import { GetRoomUseCase } from '../../application/use-cases/get-room.use-case';
import { CreateRoomUseCase } from '../../application/use-cases/create-room.use-case';
import { UpdateRoomUseCase } from '../../application/use-cases/update-room.use-case';
import { ToggleRoomStatusUseCase } from '../../application/use-cases/toggle-room-status.use-case';
import { AssignStaffsToRoomUseCase } from '../../application/use-cases/assign-staffs-to-room.use-case';

import { ListStaffUseCase } from '../../application/use-cases/list-staff.use-case';
import { GetStaffDetailUseCase } from '../../application/use-cases/get-staff-detail.use-case';
import { CreateStaffUseCase } from '../../application/use-cases/create-staff.use-case';
import { UpdateStaffUseCase } from '../../application/use-cases/update-staff.use-case';
import { ToggleStaffStatusUseCase } from '../../application/use-cases/toggle-staff-status.use-case';
import { UpdateCertificateUseCase } from '../../application/use-cases/update-certificate.use-case';
import { AssignStaffUseCase } from '../../application/use-cases/assign-staff.use-case';

import { CreateDepartmentUseCase } from '../../application/use-cases/create-department.use-case';
import { UpdateDepartmentUseCase } from '../../application/use-cases/update-department.use-case';
import { ListDepartmentsUseCase } from '../../application/use-cases/list-departments.use-case';
import { ToggleDepartmentStatusUseCase } from '../../application/use-cases/toggle-department-status.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrganizationOrmEntity,
      BranchOrmEntity,
      RoomOrmEntity,
      StaffOrmEntity,
      PracticingCertificateOrmEntity,
      StaffAssignmentOrmEntity,
      DepartmentOrmEntity,
      RoomServiceCapabilityOrmEntity,
    ]),
  ],
  controllers: [
    OrganizationController,
    BranchController,
    RoomController,
    StaffController,
    DepartmentController,
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
    {
      provide: IRoomRepositoryToken,
      useClass: RoomRepository,
    },
    {
      provide: IStaffRepositoryToken,
      useClass: StaffRepository,
    },
    {
      provide: IStaffAssignmentRepositoryToken,
      useClass: StaffAssignmentRepository,
    },
    {
      provide: IDepartmentRepositoryToken,
      useClass: DepartmentRepository,
    },
    // Use cases
    GetOrganizationUseCase,
    UpdateOrganizationUseCase,
    ListBranchesUseCase,
    GetBranchUseCase,
    CreateBranchUseCase,
    UpdateBranchUseCase,
    DeactivateBranchUseCase,

    ListRoomsUseCase,
    GetRoomUseCase,
    CreateRoomUseCase,
    UpdateRoomUseCase,
    ToggleRoomStatusUseCase,
    AssignStaffsToRoomUseCase,

    ListStaffUseCase,
    GetStaffDetailUseCase,
    CreateStaffUseCase,
    UpdateStaffUseCase,
    ToggleStaffStatusUseCase,
    UpdateCertificateUseCase,
    AssignStaffUseCase,

    CreateDepartmentUseCase,
    UpdateDepartmentUseCase,
    ListDepartmentsUseCase,
    ToggleDepartmentStatusUseCase,
  ],
  exports: [
    IOrganizationRepositoryToken,
    IBranchRepositoryToken,
    IRoomRepositoryToken,
    IStaffRepositoryToken,
    IStaffAssignmentRepositoryToken,
    IDepartmentRepositoryToken,
  ],
})
export class OrgModule {}
