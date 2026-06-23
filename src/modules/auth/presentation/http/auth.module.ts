import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UserOrmEntity } from '../../infrastructure/database/user.entity';
import { RoleOrmEntity } from '../../infrastructure/database/role.entity';
import { PermissionOrmEntity } from '../../infrastructure/database/permission.entity';
import { IUserRepositoryToken } from '../../domain/repositories/user.repository.interface';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { AuthController } from './controllers/auth.controller';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables for JWT secret
dotenv.config({ path: path.join(__dirname, '../../../../../../.env') });

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity, RoleOrmEntity, PermissionOrmEntity]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'super_secret_jwt_key_should_be_changed_in_prod',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    RegisterUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    {
      provide: IUserRepositoryToken,
      useClass: UserRepository,
    },
  ],
  exports: [IUserRepositoryToken],
})
export class AuthModule {}
