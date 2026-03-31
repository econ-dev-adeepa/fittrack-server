import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { UserRole } from "src/users/user.entity";
import { UsersService } from "src/users/users.service";
import { REFRESH_USER_CACHE_KEY } from "../decorators/user-cache.decorator";

@Injectable()
export class RefreshUserInterceptor implements NestInterceptor {
    constructor(
        private readonly usersService: UsersService,
        private readonly reflector: Reflector,
    ) {}

    async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
        const isUserUpdateRequired = this.reflector.getAllAndOverride<boolean>(
            REFRESH_USER_CACHE_KEY, [context.getHandler(), context.getClass()]
        );

        if (!isUserUpdateRequired) {
            return next.handle();
        }

        const request = context.switchToHttp().getRequest();
        if (!request.user) {
            // This can only happen if @RefreshUser is called before the
            // authentication guard, which should never happen. Therefore, always
            // throw an error to alert whoever using this interceptor that they are doing
            // it wrong.
            const message = 'User not found in request. Make sure @RefreshUser is used after the authentication guard.'
            throw new Error(message);
        }

        await this.usersService.createOrUpdate({
            id: request.user.sub,
            username: request.user.preferred_username,
            email: request.user.email,
            role: (request.user.user_role ?? request.user.role) as UserRole,
        });

        return next.handle();
    }

}