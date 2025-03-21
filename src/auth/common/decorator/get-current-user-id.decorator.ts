import { createParamDecorator, ExecutionContext, ForbiddenException } from "@nestjs/common";

export const GetCurrentUserId = createParamDecorator(
    async (data: undefined, context: ExecutionContext): Promise<string> => {
        const request = context.switchToHttp().getRequest()
        if (!request.user) {
            console.warn('User object is undefined in GetCurrentUserId decorator.');
            throw new ForbiddenException('Invalid User')
          }
      
        return request.user['sub'];
    },
);