import { Transform } from "class-transformer";
import {
	IsString,
	Length,
	IsOptional,
	IsEmail,
	Validate,
} from "class-validator";
import { IsCNPJ } from "src/common/validators.validator";

export class UpdateBranchDto {
	@IsString()
	@IsOptional()
	@Length(3, 100)
	name?: string;

	@IsOptional()
	@Validate(IsCNPJ)
	@Transform((value) => value.value.replace(/\D/g, ""))
	cnpj?: string;

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
