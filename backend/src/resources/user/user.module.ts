import { Module, forwardRef } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { PrismaService } from "../prisma/prisma.service";
import { PrismaModule } from "../prisma/prisma.module";
import { BranchModule } from "../branch/branch.module";
import { BranchUserModule } from "../branchUser/branchUser.module";
import { AuthModule } from "../auth/auth.module";

@Module({
	imports: [
		PrismaModule,
		forwardRef(() => AuthModule),
		BranchModule,
		BranchUserModule,
	],
	exports: [UserService],
	controllers: [UserController],
	providers: [UserService, PrismaService],
})
export class UserModule {}
