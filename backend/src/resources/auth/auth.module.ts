import { Module, forwardRef } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "../user/user.module";
import { AuthController } from "./auth.controller";
import { PrismaService } from "../prisma/prisma.service";
import { JwtStrategy } from "../../../src/guards/strategies/jwt.strategy";
import { BranchModule } from "../branch/branch.module";
import { BranchUserModule } from "../branchUser/branchUser.module";

@Module({
	imports: [
		forwardRef(() => UserModule),
		BranchModule,
		BranchUserModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: "1h" },
		}),
	],
	exports: [AuthService],
	controllers: [AuthController],
	providers: [AuthService, PrismaService, JwtStrategy],
})
export class AuthModule {}
