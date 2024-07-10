import { Transform } from "class-transformer";
import {
	IsString,
	Length,
	IsNotEmpty,
	IsOptional,
	Validate,
	IsEmail,
} from "class-validator";
import { IsCNPJ } from "src/common/validators.validator";

export class CreateBranchDto {
	@IsString()
	@IsNotEmpty()
	@Length(3, 100)
	name: string;

	@IsNotEmpty()
	@Validate(IsCNPJ)
	@Transform((value) => value.value.replace(/\D/g, ""))
	cnpj: string;

	@IsString()
	@IsOptional()
	phone?: number;

	@IsOptional()
	@IsEmail()
	email?: string;

	@IsString()
	@IsOptional()
	address?: number;

	@IsString()
	@IsOptional()
	city?: number;

	@IsString()
	@IsOptional()
	state?: number;

	@IsString()
	@IsOptional()
	@Transform((value) => value.value.replace(/\D/g, ""))
	zipCode?: number;
}
