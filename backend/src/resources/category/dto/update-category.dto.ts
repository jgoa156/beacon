import { IsString, Length, IsOptional } from "class-validator";

export class UpdateCategoryDto {
	@IsOptional()
	@IsString()
	@Length(3, 100)
	name?: string;

	@IsString()
	@IsOptional()
	description?: string;
}
