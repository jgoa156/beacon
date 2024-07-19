import { Module } from "@nestjs/common";
import { SupplierService } from "./supplier.service";
import { SupplierController } from "./supplier.controller";
import { PrismaService } from "../prisma/prisma.service";
import { PrismaModule } from "../prisma/prisma.module";
import { JwtStrategy } from "../../guards/strategies/jwt.strategy";

@Module({
	imports: [PrismaModule /*, OrderModule*/],
	exports: [SupplierService],
	controllers: [SupplierController],
	providers: [SupplierService, PrismaService, JwtStrategy],
})
export class SupplierModule {}
