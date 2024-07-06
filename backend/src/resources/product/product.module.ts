import { Module } from "@nestjs/common";
import { ProductService } from "./product.service";
import { ProductController } from "./product.controller";
import { ProductActivityGroupModule } from "../courseActivityGroup/courseActivityGroup.module";
import { PrismaService } from "../prisma/prisma.service";
import { PrismaModule } from "../prisma/prisma.module";
import { ActivityModule } from "../activity/activity.module";
import { OrderModule } from "../order/order.module";
import { JwtStrategy } from "../../guards/strategies/jwt.strategy";
import { ActivityGroupModule } from "../activityGroup/activityGroup.module";

@Module({
	imports: [PrismaModule, OrderModule],
	exports: [ProductService],
	controllers: [ProductController],
	providers: [ProductService, PrismaService, JwtStrategy],
})
export class ProductModule {}
