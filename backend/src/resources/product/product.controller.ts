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
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import { Roles } from "../../decorators/roles.decorator";
import { UserTypes } from "../../common/constants.constants";
import { ExclusiveRolesGuard } from "../../guards/exclusive-roles.guard";

@Controller("products")
export class ProductController {
	constructor(
		private readonly productService: ProductService,
	) {}

	@Get()
	async findAll(
		@Query()
		query: {
			page: number;
			limit: number;
			search: string;
		},
	) {
		return await this.productService.findAll(query);
	}

	@Get(":id")
	async findById(@Param("id") id: string) {
		return await this.productService.findById(+id);
	}

	@Post()
	@UseGuards(JwtAuthGuard, ExclusiveRolesGuard)
	@Roles(UserTypes.ADMIN)
	@UsePipes(
		new ValidationPipe({ transform: true, skipMissingProperties: false }),
	)
	async create(@Body() createProductDto: CreateProductDto) {
		return await this.productService.create(createProductDto);
	}

	@Patch(":id")
	@UseGuards(JwtAuthGuard, ExclusiveRolesGuard)
	@Roles(UserTypes.ADMIN)
	@UsePipes(
		new ValidationPipe({ transform: true, skipMissingProperties: false }),
	)
	async update(
		@Param("id") id: string,
		@Body() updateProductDto: UpdateProductDto,
	) {
		return await this.productService.update(+id, updateProductDto);
	}

	@Delete(":id")
	@UseGuards(JwtAuthGuard, ExclusiveRolesGuard)
	@Roles(UserTypes.ADMIN)
	async remove(@Param("id") id: string) {
		return await this.productService.remove(+id);
	}
}
