import { SetMetadata } from "@nestjs/common";
import { IConstant } from "src/common/constants.constants";

export const Roles = (...roles: IConstant[]) => SetMetadata("roles", roles);
