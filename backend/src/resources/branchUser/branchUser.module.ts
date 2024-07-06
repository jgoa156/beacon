import { Module } from "@nestjs/common";
import { BranchUserService } from "./branchUser.service";
import { PrismaService } from "../prisma/prisma.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
	imports: [PrismaModule],
	exports: [BranchUserService],
	providers: [BranchUserService, PrismaService],
})
export class BranchUserModule {}
