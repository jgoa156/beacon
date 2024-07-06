import { Module } from "@nestjs/common";
import { SupplierService } from "./supplier.service";
import { SupplierController } from "./supplier.controller";
import { SupplierActivityGroupModule } from "../courseActivityGroup/courseActivityGroup.module";
import { PrismaService } from "../prisma/prisma.service";
import { PrismaModule } from "../prisma/prisma.module";
import { ActivityModule } from "../activity/activity.module";
import { OrderModule } from "../order/order.module";
import { JwtStrategy } from "../../guards/strategies/jwt.strategy";
import { ActivityGroupModule } from "../activityGroup/activityGroup.module";

@Module({
	imports: [PrismaModule, OrderModule],
	exports: [SupplierService],
	controllers: [SupplierController],
	providers: [SupplierService, PrismaService, JwtStrategy],
})
export class SupplierModule {}
