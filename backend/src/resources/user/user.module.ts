import { Module, forwardRef } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { PrismaService } from "../prisma/prisma.service";
import { PrismaModule } from "../prisma/prisma.module";
import { UserTypeModule } from "../userType/userType.module";
import { OrderModule } from "../order/order.module";
import { BranchModule } from "../course/course.module";
import { BranchUserModule } from "../courseUser/courseUser.module";
import { AuthModule } from "../auth/auth.module";
import { BranchActivityGroupModule } from "../courseActivityGroup/courseActivityGroup.module";

@Module({
	imports: [
		PrismaModule,
		forwardRef(() => AuthModule),
		UserTypeModule,
		OrderModule,
		BranchModule,
		BranchUserModule,
		BranchActivityGroupModule,
	],
	exports: [UserService],
	controllers: [UserController],
	providers: [UserService, PrismaService],
})
export class UserModule {}
