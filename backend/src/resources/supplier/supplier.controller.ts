import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	UsePipes,
	ValidationPipe,
	UseGuards,
} from "@nestjs/common";
import { SupplierService } from "./supplier.service";
import { CreateSupplierDto, UpdateSupplierDto } from "./dto";
import { OrderService } from "../order/order.service";
import { CreateActivityDto } from "../activity/dto";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import { Roles } from "../../decorators/roles.decorator";
import { UserTypes } from "../../../src/common/enums.enum";
import { ExclusiveRolesGuard } from "../../guards/exclusive-roles.guard";

@Controller("suppliers")
export class SupplierController {
	constructor(
		private readonly courseService: SupplierService,
		private readonly orderService: OrderService,
	) {}

	@Get(":id/report")
	@UseGuards(JwtAuthGuard, ExclusiveRolesGuard)
	@Roles(UserTypes.COORDINATOR, UserTypes.SECRETARY)
	async getSupplierReport(@Param("id") id: string) {
		return await this.courseService.getSupplierReport(+id);
	}

	@Get()
	async findAll(
		@Query()
		query: {
			page: number;
			limit: number;
			search: string;
		},
	) {
		return await this.courseService.findAll(query);
	}

	@Get(":id")
	async findById(@Param("id") id: string) {
		return await this.courseService.findById(+id);
	}

	@Get(":id/orders")
	@UseGuards(JwtAuthGuard, ExclusiveRolesGuard)
	@Roles(UserTypes.COORDINATOR, UserTypes.SECRETARY)
	async findOrdersBySupplierId(
		@Param("id") id: string,
		@Query()
		query: {
			page: number;
			limit: number;
			search: string;
			activityGroup: string;
			activity: number;
		},
	) {
		return await this.orderService.findAll({
			...query,
			courseId: +id,
		});
	}

	@Get(":id/:activityGroupName/activities")
	async findActivitiesBySupplierAndActivityGroup(
		@Param("id") id: string,
		@Param("activityGroupName") activityGroupName: string,
	) {
		return await this.courseService.findActivitiesBySupplierAndActivityGroup(
			+id,
			activityGroupName,
		);
	}

	@Post()
	@UseGuards(JwtAuthGuard, ExclusiveRolesGuard)
	@Roles(UserTypes.COORDINATOR)
	@UsePipes(
		new ValidationPipe({ transform: true, skipMissingProperties: false }),
	)
	async create(@Body() createSupplierDto: CreateSupplierDto) {
		return await this.courseService.create(createSupplierDto);
	}

	@Post(":id/:activityGroupName/activities")
	@UseGuards(JwtAuthGuard, ExclusiveRolesGuard)
	@Roles(UserTypes.COORDINATOR)
	@UsePipes(
		new ValidationPipe({ transform: true, skipMissingProperties: false }),
	)
	async createActivityBySupplierAndActivityGroup(
		@Param("id") id: string,
		@Param("activityGroupName") activityGroupName: string,
		@Body() createActivityDto: CreateActivityDto,
	) {
		return await this.courseService.createActivityBySupplierAndActivityGroup(
			+id,
			activityGroupName,
			createActivityDto,
		);
	}

	@Patch(":id")
	@UseGuards(JwtAuthGuard, ExclusiveRolesGuard)
	@Roles(UserTypes.COORDINATOR)
	@UsePipes(
		new ValidationPipe({ transform: true, skipMissingProperties: false }),
	)
	async update(
		@Param("id") id: string,
		@Body() updateSupplierDto: UpdateSupplierDto,
	) {
		return await this.courseService.update(+id, updateSupplierDto);
	}

	@Delete(":id")
	@UseGuards(JwtAuthGuard, ExclusiveRolesGuard)
	@Roles(UserTypes.COORDINATOR)
	async remove(@Param("id") id: string) {
		return await this.courseService.remove(+id);
	}
}
