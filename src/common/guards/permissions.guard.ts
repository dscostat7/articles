import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionName } from '../../permissions/entities/permission.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<PermissionName[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.permission) {
      throw new ForbiddenException('Você não tem permissão para realizar esta ação.');
    }

    const hasPermission = requiredPermissions.some(
      (permission) => user.permission === permission,
    );

    if (!hasPermission) {
      throw new ForbiddenException('Você não tem permissão para realizar esta ação.');
    }

    return true;
  }
}
