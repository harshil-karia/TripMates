import { createParamDecorator, ExecutionContext, ForbiddenException } from "@nestjs/common";

export const GetCurrentUserId = createParamDecorator(
    (data: undefined, context: ExecutionContext): number => {
        const request = context.switchToHttp().getRequest()
        if (!request.user) {
            console.warn('User object is undefined in GetCurrentUserId decorator.');
            throw new ForbiddenException('Invalid User')
            return null; // Or throw an exception if this is critical
          }
      
        return request.user['sub'];
    },
);