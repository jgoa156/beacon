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
import { ProductService } from "./product.service";
import { CreateProductDto, UpdateProductDto } from "./dto";
import { OrderService } from "../order/order.service";
import { CreateActivityDto } from "../activity/dto";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import { Roles } from "../../decorators/roles.decorator";
import { UserTypes } from "../../../src/common/enums.enum";
import { ExclusiveRolesGuard } from "../../guards/exclusive-roles.guard";

@Controller("products")
export class ProductController {
	constructor(
		private readonly courseService: ProductService,
		private readonly orderService: OrderService,
	) {}

	@Get(":id/report")
	@UseGuards(JwtAuthGuard, ExclusiveRolesGuard)
	@Roles(UserTypes.COORDINATOR, UserTypes.SECRETARY)
	async getProductReport(@Param("id") id: string) {
		return await this.courseService.getProductReport(+id);
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
	async findOrdersByProductId(
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
	async findActivitiesByProductAndActivityGroup(
		@Param("id") id: string,
		@Param("activityGroupName") activityGroupName: string,
	) {
		return await this.courseService.findActivitiesByProductAndActivityGroup(
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
	async create(@Body() createProductDto: CreateProductDto) {
		return await this.courseService.create(createProductDto);
	}

	@Post(":id/:activityGroupName/activities")
	@UseGuards(JwtAuthGuard, ExclusiveRolesGuard)
	@Roles(UserTypes.COORDINATOR)
	@UsePipes(
		new ValidationPipe({ transform: true, skipMissingProperties: false }),
	)
	async createActivityByProductAndActivityGroup(
		@Param("id") id: string,
		@Param("activityGroupName") activityGroupName: string,
		@Body() createActivityDto: CreateActivityDto,
	) {
		return await this.courseService.createActivityByProductAndActivityGroup(
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
		@Body() updateProductDto: UpdateProductDto,
	) {
		return await this.courseService.update(+id, updateProductDto);
	}

	@Delete(":id")
	@UseGuards(JwtAuthGuard, ExclusiveRolesGuard)
	@Roles(UserTypes.COORDINATOR)
	async remove(@Param("id") id: string) {
		return await this.courseService.remove(+id);
	}
}
