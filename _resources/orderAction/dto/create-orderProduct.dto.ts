import { IsInt, IsString, IsOptional } from "class-validator";

export class CreateOrderProductDto {
	@IsInt()
	userId: number;

	@IsInt()
	orderId: number;

	@IsInt()
	orderProductTypeId: number;

	@IsOptional()
	@IsString()
	details?: string;
}
