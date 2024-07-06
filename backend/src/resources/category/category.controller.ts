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
import { CategoryService } from "./category.service";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto";
import { OrderService } from "../order/order.service";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import { Roles } from "../../decorators/roles.decorator";
import { UserTypes } from "../../../src/common/constants.constants";
import { ExclusiveRolesGuard } from "../../guards/exclusive-roles.guard";

@Controller("categories")
export class CategoryController {
	constructor(
		private readonly categoryService: CategoryService,
		private readonly orderService: OrderService,
	) {}

	@Get(":id/report")
	@UseGuards(JwtAuthGuard, ExclusiveRolesGuard)
	@Roles(UserTypes.COORDINATOR, UserTypes.SECRETARY)
	async getCategoryReport(@Param("id") id: string) {
		return await this.categoryService.getCategoryReport(+id);
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
		return await this.categoryService.findAll(query);
	}

	@Get(":id")
	async findById(@Param("id") id: string) {
		return await this.categoryService.findById(+id);
	}

	@Get(":id/orders")
	@UseGuards(JwtAuthGuard, ExclusiveRolesGuard)
	@Roles(UserTypes.COORDINATOR, UserTypes.SECRETARY)
	async findOrdersByCategoryId(
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
			categoryId: +id,
		});
	}

	@Get(":id/:activityGroupName/activities")
	async findActivitiesByCategoryAndActivityGroup(
		@Param("id") id: string,
		@Param("activityGroupName") activityGroupName: string,
	) {
		return await this.categoryService.findActivitiesByCategoryAndActivityGroup(
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
	async create(@Body() createCategoryDto: CreateCategoryDto) {
		return await this.categoryService.create(createCategoryDto);
	}

	@Post(":id/:activityGroupName/activities")
	@UseGuards(JwtAuthGuard, ExclusiveRolesGuard)
	@Roles(UserTypes.COORDINATOR)
	@UsePipes(
		new ValidationPipe({ transform: true, skipMissingProperties: false }),
	)
	async createActivityByCategoryAndActivityGroup(
		@Param("id") id: string,
		@Param("activityGroupName") activityGroupName: string,
		@Body() createActivityDto: CreateActivityDto,
	) {
		return await this.categoryService.createActivityByCategoryAndActivityGroup(
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
		@Body() updateCategoryDto: UpdateCategoryDto,
	) {
		return await this.categoryService.update(+id, updateCategoryDto);
	}

	@Delete(":id")
	@UseGuards(JwtAuthGuard, ExclusiveRolesGuard)
	@Roles(UserTypes.COORDINATOR)
	async remove(@Param("id") id: string) {
		return await this.categoryService.remove(+id);
	}
}
