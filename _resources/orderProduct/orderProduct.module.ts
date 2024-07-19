import { Module } from "@nestjs/common";
import { OrderProductService } from "./orderProduct.service";
import { PrismaService } from "../prisma/prisma.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
	imports: [PrismaModule],
	exports: [OrderProductService],
	providers: [OrderProductService, PrismaService],
})
export class OrderProductModule {}
