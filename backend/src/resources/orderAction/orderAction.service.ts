import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { OrderAction } from "@prisma/client";
import { CreateOrderActionDto } from "./dto";

@Injectable()
export class OrderActionService {
	constructor(private prisma: PrismaService) {}

	create(createOrderActionDto: CreateOrderActionDto): Promise<OrderAction> {
		return this.prisma.orderAction.create({
			data: createOrderActionDto,
		});
	}

	findAll(): Promise<OrderAction[]> {
		return this.prisma.orderAction.findMany();
	}

	findById(id: number): Promise<OrderAction | null> {
		return this.prisma.orderAction.findUnique({ where: { id } });
	}
}
