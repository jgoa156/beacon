import { OrderService } from "./order.service";
import { OrderController } from "./order.controller";
import { PrismaService } from "../prisma/prisma.service";
import { PrismaModule } from "../prisma/prisma.module";
import { OrderActionModule } from "../orderAction/orderAction.module";
import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { FilesCorsMiddleware } from "./order.service";

@Module({
	imports: [PrismaModule, OrderActionModule],
	exports: [OrderService],
	controllers: [OrderController],
	providers: [OrderService, PrismaService],
})
export class OrderModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(FilesCorsMiddleware).forRoutes("/files/orders");
	}
}
