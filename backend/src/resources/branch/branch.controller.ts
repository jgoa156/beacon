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
import { BranchService } from "./branch.service";
import { CreateBranchDto, UpdateBranchDto } from "./dto";
import { OrderService } from "../order/order.service";
import { CreateActivityDto } from "../activity/dto";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import { Roles } from "../../decorators/roles.decorator";
import { UserTypes } from "../../../src/common/enums.enum";
import { ExclusiveRolesGuard } from "../../guards/exclusive-roles.guard";

@Controller("branches")
export class BranchController {
	constructor(
		private readonly branchService: BranchService,
		private readonly orderService: OrderService,
	) {}

	@Get(":id/report")
	@UseGuards(JwtAuthGuard, ExclusiveRolesGuard)
	@Roles(UserTypes.COORDINATOR, UserTypes.SECRETARY)
	async getBranchReport(@Param("id") id: string) {
		return await this.branchService.getBranchReport(+id);
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
		return await this.branchService.findAll(query);
	}

	@Get(":id")
	async findById(@Param("id") id: string) {
		return await this.branchService.findById(+id);
	}

	@Get(":id/orders")
	@UseGuards(JwtAuthGuard, ExclusiveRolesGuard)
	@Roles(UserTypes.COORDINATOR, UserTypes.SECRETARY)
	async findOrdersByBranchId(
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
			branchId: +id,
		});
	}

	@Get(":id/:activityGroupName/activities")
	async findActivitiesByBranchAndActivityGroup(
		@Param("id") id: string,
		@Param("activityGroupName") activityGroupName: string,
	) {
		return await this.branchService.findActivitiesByBranchAndActivityGroup(
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
	async create(@Body() createBranchDto: CreateBranchDto) {
		return await this.branchService.create(createBranchDto);
	}

	@Post(":id/:activityGroupName/activities")
	@UseGuards(JwtAuthGuard, ExclusiveRolesGuard)
	@Roles(UserTypes.COORDINATOR)
	@UsePipes(
		new ValidationPipe({ transform: true, skipMissingProperties: false }),
	)
	async createActivityByBranchAndActivityGroup(
		@Param("id") id: string,
		@Param("activityGroupName") activityGroupName: string,
		@Body() createActivityDto: CreateActivityDto,
	) {
		return await this.branchService.createActivityByBranchAndActivityGroup(
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
		@Body() updateBranchDto: UpdateBranchDto,
	) {
		return await this.branchService.update(+id, updateBranchDto);
	}

	@Delete(":id")
	@UseGuards(JwtAuthGuard, ExclusiveRolesGuard)
	@Roles(UserTypes.COORDINATOR)
	async remove(@Param("id") id: string) {
		return await this.branchService.remove(+id);
	}
}
