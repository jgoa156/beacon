import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	Query,
	UseInterceptors,
	UploadedFile,
	UsePipes,
	ValidationPipe,
	Put,
	Headers,
	ParseFilePipeBuilder,
	HttpStatus,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto, UpdateUserDto } from "./dto";
import { JwtAuthGuard } from "../../../src/guards/jwt-auth.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { IsOwnerGuard } from "../../../src/guards/is-owner.guard";
import { RolesGuard } from "../../../src/guards/roles.guard";
import { Roles } from "../../../src/decorators/roles.decorator";
import { UserTypes } from "../../../src/common/constants.constants";
import { ExclusiveRolesGuard } from "../../../src/guards/exclusive-roles.guard";

@Controller("users")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	@UseGuards(JwtAuthGuard, ExclusiveRolesGuard)
	@Roles(UserTypes.ADMIN, UserTypes.WORKER)
	async findAll(
		@Query()
		query: {
			page: number;
			limit: number;
			search: string;
			type: string;
			branchId: number;
			active: boolean;
		},
	) {
		return await this.userService.findAll(query);
	}

	@Get(":id")
	@UseGuards(JwtAuthGuard, RolesGuard, IsOwnerGuard)
	@Roles(UserTypes.ADMIN, UserTypes.WORKER)
	async findById(@Param("id") id: string) {
		return await this.userService.findById(+id);
	}

	@Post()
	@UseGuards(JwtAuthGuard)
	@UsePipes(
		new ValidationPipe({ transform: true, skipMissingProperties: false }),
	)
	async createUser(
		@Body() createUserDto: CreateUserDto,
		@Headers("Authorization") token: string,
	) {
		return await this.userService.create(createUserDto, token);
	}

	@UseGuards(JwtAuthGuard, IsOwnerGuard)
	@Put(":id/image")
	@UsePipes(
		new ValidationPipe({ transform: true, skipMissingProperties: false }),
	)
	@UseInterceptors(
		FileInterceptor("file", {
			storage: diskStorage({
				destination: `./public/files/tmp`,
				filename: (req, file, cb) =>
					cb(
						null,
						`${req.params.id}-${new Date().getTime()}-${file.originalname}.tmp`,
					),
			}),
		}),
	)
	async updateProfileImage(
		@Param("id") id: string,
		@UploadedFile(
			new ParseFilePipeBuilder()
				.addFileTypeValidator({
					fileType: ".(png|jpeg|jpg)",
				})
				.addMaxSizeValidator({
					maxSize: 1000 * 1024,
				})
				.build({
					errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
				}),
		)
		file: Express.Multer.File,
	) {
		return await this.userService.updateProfileImage(+id, file.filename);
	}

	@Patch(":id")
	@UseGuards(JwtAuthGuard, RolesGuard, IsOwnerGuard)
	@Roles(UserTypes.ADMIN, UserTypes.WORKER)
	@UsePipes(
		new ValidationPipe({ transform: true, skipMissingProperties: false }),
	)
	async update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
		return await this.userService.update(+id, updateUserDto);
	}

	@Post(":id/assign/:branchId")
	@UseGuards(JwtAuthGuard, ExclusiveRolesGuard)
	@Roles(UserTypes.ADMIN)
	@UsePipes(
		new ValidationPipe({ transform: true, skipMissingProperties: false }),
	)
	async assign(@Param("id") id: string, @Param("branchId") branchId: string) {
		return await this.userService.assign(+id, +branchId);
	}

	@Delete(":id/unassign/:branchId")
	@UseGuards(JwtAuthGuard, ExclusiveRolesGuard)
	@Roles(UserTypes.ADMIN)
	@UsePipes(
		new ValidationPipe({ transform: true, skipMissingProperties: false }),
	)
	async unassign(@Param("id") id: string, @Param("branchId") branchId: string) {
		return await this.userService.unassign(+id, +branchId);
	}

	@Delete(":id")
	@UseGuards(JwtAuthGuard, RolesGuard, IsOwnerGuard)
	@Roles(UserTypes.ADMIN)
	@UsePipes(
		new ValidationPipe({ transform: true, skipMissingProperties: false }),
	)
	async remove(@Param("id") id: string) {
		return await this.userService.remove(+id);
	}

	@Delete(":ids/mass-remove")
	@UseGuards(JwtAuthGuard, ExclusiveRolesGuard)
	@Roles(UserTypes.ADMIN)
	@UsePipes(
		new ValidationPipe({ transform: true, skipMissingProperties: false }),
	)
	async massRemove(@Param("ids") ids: string) {
		return await this.userService.massRemove(ids);
	}
}
