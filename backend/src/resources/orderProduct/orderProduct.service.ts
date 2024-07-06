import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { OrderProduct } from "@prisma/client";
import { CreateOrderProductDto } from "./dto";

@Injectable()
export class OrderProductService {
	constructor(private prisma: PrismaService) {}

	create(createOrderProductDto: CreateOrderProductDto): Promise<OrderProduct> {
		return this.prisma.orderProduct.create({
			data: createOrderProductDto,
		});
	}

	findAll(): Promise<OrderProduct[]> {
		return this.prisma.orderProduct.findMany();
	}

	findById(id: number): Promise<OrderProduct | null> {
		return this.prisma.orderProduct.findUnique({ where: { id } });
	}
}
