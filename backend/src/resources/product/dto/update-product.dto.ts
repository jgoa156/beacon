import { Transform } from "class-transformer";
import { IsInt, IsString, Length, IsOptional, IsNumber } from "class-validator";

export class UpdateProductDto {
	@IsString()
	@IsOptional()
	@Length(3, 100)
	name?: string;

	@IsInt()
	@IsOptional()
	@Transform((value) => parseInt(value.value))
	categoryId?: number;

	@IsString()
	@IsOptional()
	@Length(1, 20)
	unitMeasure?: string;

	@IsNumber()
	@IsOptional()
	@Transform((value) => parseFloat(value.value))
	unitValue?: number;

	@IsString()
	@IsOptional()
	description?: string;
}
