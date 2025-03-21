import { createParamDecorator, ExecutionContext, ForbiddenException } from "@nestjs/common";

export const GetResetPassword = createParamDecorator(
    (data: undefined, context: ExecutionContext): string => {
        const request = context.switchToHttp().getRequest();
        console.log("Request User:", request.user); // Debugging step

        if (!request.user || !request.user.userEmail) {
            throw new ForbiddenException('User Email not found in token');
        }
        return request.user.userEmail; // Extract userEmail from JWT payload
    },
);
