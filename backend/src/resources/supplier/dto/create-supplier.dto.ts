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

export class CreateSupplierDto {
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
	@Length(1, 20)
	phone?: string;

	@IsOptional()
	@IsEmail()
	email?: string;

	@IsString()
	@IsOptional()
	address?: string;

	@IsString()
	@IsOptional()
	city?: string;

	@IsString()
	@IsOptional()
	state?: string;

	@IsString()
	@IsOptional()
	@Transform((value) => value.value.replace(/\D/g, ""))
	zipCode?: string;
}
