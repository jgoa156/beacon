import { Module } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CategoryController } from "./category.controller";
import { PrismaService } from "../prisma/prisma.service";
import { PrismaModule } from "../prisma/prisma.module";
import { OrderModule } from "../order/order.module";
import { JwtStrategy } from "../../guards/strategies/jwt.strategy";

@Module({
	imports: [PrismaModule, OrderModule],
	exports: [CategoryService],
	controllers: [CategoryController],
	providers: [CategoryService, PrismaService, JwtStrategy],
})
export class CategoryModule {}
