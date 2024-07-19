import { Module } from "@nestjs/common";
import { OrderActionService } from "./orderAction.service";
import { PrismaService } from "../prisma/prisma.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
	imports: [PrismaModule],
	exports: [OrderActionService],
	providers: [OrderActionService, PrismaService],
})
export class OrderActionModule {}
