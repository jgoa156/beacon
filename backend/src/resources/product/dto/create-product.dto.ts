import { Transform } from "class-transformer";
import {
	IsInt,
	IsString,
	Length,
	IsNotEmpty,
	IsOptional,
	IsNumber,
} from "class-validator";

export class CreateProductDto {
	@IsString()
	@IsNotEmpty()
	@Length(3, 100)
	name: string;

	@IsInt()
	@IsNotEmpty()
	@Transform((value) => parseInt(value.value))
	categoryId: number;

	@IsString()
	@IsNotEmpty()
	@Length(1, 20)
	unitMeasure: string;

	@IsNumber()
	@IsOptional()
	@Transform((value) => parseFloat(value.value))
	unitValue?: number;

	@IsString()
	@IsOptional()
	description?: string;
}
