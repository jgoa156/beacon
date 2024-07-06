import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { BranchUser } from "@prisma/client";
import { CreateBranchUserDto, UpdateBranchUserDto } from "./dto";

@Injectable()
export class BranchUserService {
	// https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/many-to-many-relations
	constructor(private prisma: PrismaService) {}

	create(createBranchUserDto: CreateBranchUserDto): Promise<BranchUser> {
		return this.prisma.branchUser.create({ data: createBranchUserDto });
	}

	findAll(): Promise<BranchUser[]> {
		return this.prisma.branchUser.findMany();
	}

	findById(id: number): Promise<BranchUser | null> {
		return this.prisma.branchUser.findUnique({ where: { id } });
	}

	findByEnrollment(
		enrollment: string,
		excludeId: number = 0,
	): Promise<BranchUser | null> {
		return this.prisma.branchUser.findFirst({
			where: { enrollment, id: { not: excludeId } },
		});
	}

	async findByUserIdAndBranchId(
		userId: number,
		courseId: number,
	): Promise<BranchUser | null> {
		return await this.prisma.branchUser.findFirst({
			where: { userId, courseId },
		});
	}

	async update(
		id: number,
		updateBranchUserDto: UpdateBranchUserDto,
	): Promise<BranchUser> {
		return await this.prisma.branchUser.update({
			where: { id },
			data: updateBranchUserDto,
		});
	}

	async unlinkUserFromBranch(userId: number, courseId: number): Promise<any> {
		const branchUser = await this.findByUserIdAndBranchId(userId, courseId);

		if (!branchUser)
			throw new BadRequestException("User not enrolled in course");

		return await this.prisma.branchUser.delete({
			where: {
				id: branchUser.id,
			},
		});
	}

	remove(id: number): Promise<BranchUser> {
		return this.prisma.branchUser.delete({ where: { id } });
	}
}
