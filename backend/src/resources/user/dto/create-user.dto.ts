import { Transform } from "class-transformer";
import {
	IsString,
	IsEmail,
	Validate,
	IsNotEmpty,
	IsOptional,
	Allow,
	IsArray,
} from "class-validator";
import { IsUserType } from "../../../../src/common/validators.validator";

export class CreateUserDto {
	@IsOptional()
	@IsString()
	name: string;

	@IsOptional()
	@IsEmail()
	email: string;

	@IsNotEmpty()
	@IsString()
	@Transform((value) => value.value.toUpperCase())
	@Validate(IsUserType)
	userType: string;

	@IsOptional()
	@IsArray()
	@Allow()
	branchesIds?: number[];
}
