import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IConstant } from "src/common/constants.constants";

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.get<IConstant[]>(
			"roles",
			context.getHandler(),
		);
		if (!requiredRoles) {
			// If no roles are required for the route, everyone is allowed
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const user = request.user;

		request.isRoleVerified = requiredRoles.some(
			(role) => user.userType === role.id,
		);

		return true;
	}
}
