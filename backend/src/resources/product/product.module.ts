import { Module } from "@nestjs/common";
import { ProductService } from "./product.service";
import { ProductController } from "./product.controller";
import { PrismaService } from "../prisma/prisma.service";
import { PrismaModule } from "../prisma/prisma.module";
import { JwtStrategy } from "../../guards/strategies/jwt.strategy";
import { CategoryModule } from "../category/category.module";

@Module({
	imports: [PrismaModule, /*OrderModule, */ CategoryModule],
	exports: [ProductService],
	controllers: [ProductController],
	providers: [ProductService, PrismaService, JwtStrategy],
})
export class ProductModule {}
