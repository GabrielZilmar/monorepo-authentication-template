import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AdminGuard {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user?.isAdmin) {
      return false;
    }

    return true;
  }
}
