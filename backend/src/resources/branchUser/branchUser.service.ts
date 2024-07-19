import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { BranchUser } from "@prisma/client";
import { CreateBranchUserDto } from "./dto";

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

	findByUserIdAndBranchId(
		userId: number,
		branchId: number,
	): Promise<BranchUser | null> {
		return this.prisma.branchUser.findUnique({
			where: { id: { userId, branchId } },
		});
	}

	async linkUserToBranch(
		userId: number,
		branchId: number,
	): Promise<BranchUser> {
		const branchUser = await this.findByUserIdAndBranchId(userId, branchId);

		if (branchUser) return branchUser;

		return await this.create({ userId, branchId });
	}

	async unlinkUserFromBranch(userId: number, branchId: number): Promise<any> {
		const branchUser = await this.findByUserIdAndBranchId(userId, branchId);

		if (!branchUser) throw new BadRequestException("User not linked to branch");

		return await this.prisma.branchUser.delete({
			where: {
				id: { userId, branchId },
			},
		});
	}

	remove(userId: number, branchId: number): Promise<BranchUser> {
		return this.prisma.branchUser.delete({
			where: { id: { userId, branchId } },
		});
	}
}
