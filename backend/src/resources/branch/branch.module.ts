import { Module } from "@nestjs/common";
import { BranchService } from "./branch.service";
import { BranchController } from "./branch.controller";
import { PrismaService } from "../prisma/prisma.service";
import { PrismaModule } from "../prisma/prisma.module";
import { JwtStrategy } from "../../guards/strategies/jwt.strategy";

@Module({
	imports: [PrismaModule /*, OrderModule*/],
	exports: [BranchService],
	controllers: [BranchController],
	providers: [BranchService, PrismaService, JwtStrategy],
})
export class BranchModule {}
