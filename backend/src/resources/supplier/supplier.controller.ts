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
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import { Roles } from "../../decorators/roles.decorator";
import { UserTypes } from "../../common/constants.constants";
import { ExclusiveRolesGuard } from "../../guards/exclusive-roles.guard";

@Controller("suppliers")
export class SupplierController {
	constructor(private readonly supplierService: SupplierService) {}

	@Get()
	async findAll(
		@Query()
		query: {
			page: number;
			limit: number;
			search: string;
		},
	) {
		return await this.supplierService.findAll(query);
	}

	@Get(":id")
	async findById(@Param("id") id: string) {
		return await this.supplierService.findById(+id);
	}

	@Post()
	@UseGuards(JwtAuthGuard, ExclusiveRolesGuard)
	@Roles(UserTypes.ADMIN)
	@UsePipes(
		new ValidationPipe({ transform: true, skipMissingProperties: false }),
	)
	async create(@Body() createSupplierDto: CreateSupplierDto) {
		return await this.supplierService.create(createSupplierDto);
	}

	@Patch(":id")
	@UseGuards(JwtAuthGuard, ExclusiveRolesGuard)
	@Roles(UserTypes.ADMIN)
	@UsePipes(
		new ValidationPipe({ transform: true, skipMissingProperties: false }),
	)
	async update(
		@Param("id") id: string,
		@Body() updateSupplierDto: UpdateSupplierDto,
	) {
		return await this.supplierService.update(+id, updateSupplierDto);
	}

	@Delete(":id")
	@UseGuards(JwtAuthGuard, ExclusiveRolesGuard)
	@Roles(UserTypes.ADMIN)
	async remove(@Param("id") id: string) {
		return await this.supplierService.remove(+id);
	}
}
