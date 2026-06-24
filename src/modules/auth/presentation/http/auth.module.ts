import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UserOrmEntity } from '../../infrastructure/database/user.entity';
import { RoleOrmEntity } from '../../infrastructure/database/role.entity';
import { PermissionOrmEntity } from '../../infrastructure/database/permission.entity';
import { UserBranchScopeOrmEntity } from '../../infrastructure/database/user-branch-scope.entity';
import { LoginTimeWindowOrmEntity } from '../../infrastructure/database/login-time-window.entity';
import { BranchAllowedIpOrmEntity } from '../../infrastructure/database/branch-allowed-ip.entity';
import { StaffOrmEntity } from '../../../org/infrastructure/database/staff.entity';
import { BranchOrmEntity } from '../../../org/infrastructure/database/branch.entity';
import { IUserRepositoryToken } from '../../domain/repositories/user.repository.interface';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { GetCurrentUserUseCase } from '../../application/use-cases/get-current-user.use-case';
import { ListManagedUsersUseCase } from '../../application/use-cases/list-managed-users.use-case';
import { GetManagedUserUseCase } from '../../application/use-cases/get-managed-user.use-case';
import { CreateManagedUserUseCase } from '../../application/use-cases/create-managed-user.use-case';
import { UpdateManagedUserUseCase } from '../../application/use-cases/update-managed-user.use-case';
import { LockManagedUserUseCase } from '../../application/use-cases/lock-managed-user.use-case';
import { UnlockManagedUserUseCase } from '../../application/use-cases/unlock-managed-user.use-case';
import { ResetManagedUserPasswordUseCase } from '../../application/use-cases/reset-managed-user-password.use-case';
import { ListRolesUseCase } from '../../application/use-cases/list-roles.use-case';
import {
  CreateLoginTimeWindowUseCase,
  ListLoginTimeWindowsUseCase,
  ToggleLoginTimeWindowUseCase,
  UpdateLoginTimeWindowUseCase,
} from '../../application/use-cases/login-time-window.use-cases';
import {
  ListBranchAllowedIpsUseCase,
  UpsertBranchAllowedIpsUseCase,
} from '../../application/use-cases/branch-allowed-ip.use-cases';
import { AuthController } from './controllers/auth.controller';
import { UserAdminController } from './controllers/user-admin.controller';
import { RoleController } from './controllers/role.controller';
import { LoginTimeWindowController } from './controllers/login-time-window.controller';
import { BranchAllowedIpController } from './controllers/branch-allowed-ip.controller';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables for JWT secret
dotenv.config({ path: path.join(__dirname, '../../../../../../.env') });

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserOrmEntity,
      RoleOrmEntity,
      PermissionOrmEntity,
      UserBranchScopeOrmEntity,
      LoginTimeWindowOrmEntity,
      BranchAllowedIpOrmEntity,
      StaffOrmEntity,
      BranchOrmEntity,
    ]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'super_secret_jwt_key_should_be_changed_in_prod',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [
    AuthController,
    UserAdminController,
    RoleController,
    LoginTimeWindowController,
    BranchAllowedIpController,
  ],
  providers: [
    LoginUseCase,
    RegisterUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    GetCurrentUserUseCase,
    ListManagedUsersUseCase,
    GetManagedUserUseCase,
    CreateManagedUserUseCase,
    UpdateManagedUserUseCase,
    LockManagedUserUseCase,
    UnlockManagedUserUseCase,
    ResetManagedUserPasswordUseCase,
    ListRolesUseCase,
    ListLoginTimeWindowsUseCase,
    CreateLoginTimeWindowUseCase,
    UpdateLoginTimeWindowUseCase,
    ToggleLoginTimeWindowUseCase,
    ListBranchAllowedIpsUseCase,
    UpsertBranchAllowedIpsUseCase,
    {
      provide: IUserRepositoryToken,
      useClass: UserRepository,
    },
  ],
  exports: [IUserRepositoryToken],
})
export class AuthModule {}
