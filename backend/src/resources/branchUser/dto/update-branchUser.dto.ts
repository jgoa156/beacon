import { IsString, IsOptional, IsNumber } from "class-validator";

export class UpdateBranchUserDto {
	@IsOptional()
	@IsString()
	enrollment: string;

	@IsOptional()
	@IsNumber()
	startYear: number;
}
