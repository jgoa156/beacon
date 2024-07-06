import { Module } from "@nestjs/common";
import { BranchService } from "./branch.service";
import { BranchController } from "./branch.controller";
import { BranchActivityGroupModule } from "../branchActivityGroup/branchActivityGroup.module";
import { PrismaService } from "../prisma/prisma.service";
import { PrismaModule } from "../prisma/prisma.module";
import { ActivityModule } from "../activity/activity.module";
import { OrderModule } from "../order/order.module";
import { JwtStrategy } from "../../guards/strategies/jwt.strategy";
import { ActivityGroupModule } from "../activityGroup/activityGroup.module";

@Module({
	imports: [PrismaModule, OrderModule],
	exports: [BranchService],
	controllers: [BranchController],
	providers: [BranchService, PrismaService, JwtStrategy],
})
export class BranchModule {}
