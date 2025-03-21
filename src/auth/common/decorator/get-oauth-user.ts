import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GetOAuthUser = createParamDecorator(
    (data: string | undefined, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest()
        const user = request.user;

        if (!user) {
            throw new Error('User not found in the request object');
        }

        // If a specific property is requested, return only that property
        return data ? user[data] : user;
    },
);