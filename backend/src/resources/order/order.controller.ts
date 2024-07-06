import {
	Controller,
	Get,
	Body,
	Patch,
	Param,
	Delete,
	UsePipes,
	ValidationPipe,
	UseGuards,
	UseInterceptors,
	UploadedFile,
	Req,
	HttpStatus,
	ParseFilePipeBuilder,
	Res,
} from "@nestjs/common";
import { OrderService } from "./order.service";
import { UpdateOrderDto } from "./dto";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { JwtAuthGuard } from "../../../src/guards/jwt-auth.guard";
import { Roles } from "../../../src/decorators/roles.decorator";
import { UserTypes } from "../../../src/common/enums.enum";
import { RolesGuard } from "../../../src/guards/roles.guard";
import { IsOwnerGuard } from "../../../src/guards/is-owner.guard";
import { CheckOwner } from "../../../src/decorators/owner.decorator";
import { ExclusiveRolesGuard } from "../../../src/guards/exclusive-roles.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { Request } from "express";

@Controller("orders")
export class OrderController {
	constructor(private readonly orderService: OrderService) {}

	@Get(":id/download")
	async downloadOrder(@Param("id") id: string, @Res() res: any) {
		await this.orderService.downloadOrder(+id, res);
	}
	@Get(":id")
	findById(@Param("id") id: string) {
		return this.orderService.findById(+id);
	}

	@Patch(":id")
	@UseGuards(JwtAuthGuard, RolesGuard, IsOwnerGuard)
	@Roles(UserTypes.COORDINATOR, UserTypes.SECRETARY)
	@CheckOwner("order")
	@UsePipes(
		new ValidationPipe({ transform: true, skipMissingProperties: false }),
	)
	@UseInterceptors(
		FileInterceptor("file", {
			storage: diskStorage({
				destination: "./public/files/tmp",
				filename: (req, file, cb) =>
					cb(null, `${new Date().getTime()}-${file.originalname}.tmp`),
			}),
		}),
	)
	async update(
		@Param("id") id: string,
		@Body() updateOrderDto: UpdateOrderDto,
		@UploadedFile(
			new ParseFilePipeBuilder()
				.addFileTypeValidator({
					fileType: "pdf",
				})
				.addMaxSizeValidator({
					maxSize: 5000 * 1024,
				})
				.build({
					errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
				}),
		)
		file: Express.Multer.File,
	) {
		return await this.orderService.update(+id, updateOrderDto, file.filename);
	}

	@Patch(":id/status")
	@UseGuards(JwtAuthGuard, RolesGuard, IsOwnerGuard)
	@Roles(UserTypes.COORDINATOR, UserTypes.SECRETARY)
	@CheckOwner("order")
	@UsePipes(
		new ValidationPipe({ transform: true, skipMissingProperties: false }),
	)
	async updateStatus(
		@Req() req: Request,
		@Param("id") id: string,
		@Body() updateStatusDto: UpdateStatusDto,
	) {
		return await this.orderService.updateStatus(+id, updateStatusDto);
	}

	@Delete(":id")
	@UseGuards(JwtAuthGuard, RolesGuard, IsOwnerGuard)
	@Roles(UserTypes.COORDINATOR)
	@CheckOwner("order")
	async remove(@Param("id") id: string) {
		return await this.orderService.remove(+id);
	}

	@Patch(":ids/status/mass-update")
	@UseGuards(JwtAuthGuard, ExclusiveRolesGuard)
	@Roles(UserTypes.COORDINATOR, UserTypes.SECRETARY)
	@CheckOwner("order")
	@UsePipes(
		new ValidationPipe({ transform: true, skipMissingProperties: false }),
	)
	async massUpdate(
		@Param("ids") ids: string,
		@Body() updateStatusDto: UpdateStatusDto,
	) {
		return await this.orderService.massUpdateStatus(ids, updateStatusDto);
	}

	@Delete(":ids/mass-remove")
	@UseGuards(JwtAuthGuard, RolesGuard, IsOwnerGuard)
	@Roles(UserTypes.STUDENT)
	@CheckOwner("order")
	async massRemove(@Param("ids") ids: string) {
		return await this.orderService.massRemove(ids);
	}
}
