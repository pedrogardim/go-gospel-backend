import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserType } from '@prisma/client';

export interface UserContext {
  sub: string;
  email: string;
  userType: UserType;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as UserContext;
  },
);
