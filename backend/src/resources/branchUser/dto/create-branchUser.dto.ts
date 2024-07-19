import { IsInt, IsString, IsNotEmpty, IsNumber } from "class-validator";

export class CreateBranchUserDto {
	@IsNotEmpty()
	@IsInt()
	branchId: number;

	@IsNotEmpty()
	@IsInt()
	userId: number;
}
