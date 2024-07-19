import { IsString, IsOptional, IsDateString } from "class-validator";

export class DangerUpdateUserDto {
	@IsOptional()
	@IsString()
	password?: string;

	@IsOptional()
	@IsString()
	resetToken?: string;

	@IsOptional()
	@IsDateString()
	resetTokenExpires?: Date;
}
