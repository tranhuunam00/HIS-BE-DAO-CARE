import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppDataSource } from '../../../../../infrastructure/database/data-source';
import { RoleOrmEntity } from '../../../infrastructure/database/role.entity';
import { REQUIRE_PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRE_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userPayload = (request as any).user;
    if (!userPayload || !userPayload.roleId) {
      throw new ForbiddenException('Bạn không có quyền thực hiện hành động này');
    }

    // Load role và permissions của người dùng từ Database
    const roleRepository = AppDataSource.getRepository(RoleOrmEntity);
    const role = await roleRepository.findOne({
      where: { id: userPayload.roleId },
      relations: { permissions: true },
    });

    if (!role) {
      throw new ForbiddenException('Không tìm thấy vai trò của người dùng');
    }

    const userPermissions = role.permissions.map((p: any) => p.name);
    const hasPermission = requiredPermissions.every((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasPermission) {
      throw new ForbiddenException('Bạn không có quyền thực hiện hành động này');
    }

    return true;
  }
}
