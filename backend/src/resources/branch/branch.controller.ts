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
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import { Roles } from "../../decorators/roles.decorator";
import { UserTypes } from "../../../src/common/constants.constants";
import { ExclusiveRolesGuard } from "../../guards/exclusive-roles.guard";

@Controller("branches")
export class BranchController {
	constructor(private readonly branchService: BranchService) {}

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

	@Post()
	@UseGuards(JwtAuthGuard, ExclusiveRolesGuard)
	@Roles(UserTypes.ADMIN)
	@UsePipes(
		new ValidationPipe({ transform: true, skipMissingProperties: false }),
	)
	async create(@Body() createBranchDto: CreateBranchDto) {
		return await this.branchService.create(createBranchDto);
	}

	@Patch(":id")
	@UseGuards(JwtAuthGuard, ExclusiveRolesGuard)
	@Roles(UserTypes.ADMIN)
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
	@Roles(UserTypes.ADMIN)
	async remove(@Param("id") id: string) {
		return await this.branchService.remove(+id);
	}
}
