import { IsInt, IsString, IsOptional } from "class-validator";

export class CreateOrderActionDto {
	@IsInt()
	userId: number;

	@IsInt()
	orderId: number;

	@IsInt()
	orderActionTypeId: number;

	@IsOptional()
	@IsString()
	details?: string;
}
