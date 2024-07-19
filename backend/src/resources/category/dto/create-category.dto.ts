import { IsString, Length, IsNotEmpty, IsOptional } from "class-validator";

export class CreateCategoryDto {
	@IsString()
	@IsNotEmpty()
	@Length(3, 100)
	name: string;

	@IsString()
	@IsOptional()
	description?: string;
}
