import { IsInt, IsString, IsNotEmpty, IsNumber } from "class-validator";

export class CreateBranchUserDto {
	@IsNotEmpty()
	@IsInt()
	courseId: number;

	@IsNotEmpty()
	@IsInt()
	userId: number;

	@IsNotEmpty()
	@IsString()
	enrollment: string;

	@IsNotEmpty()
	@IsNumber()
	startYear: number;
}
