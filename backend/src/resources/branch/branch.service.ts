import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Branch } from "@prisma/client";
import { CreateBranchDto, UpdateBranchDto } from "./dto";
import { BranchActivityGroupService } from "../branchActivityGroup/branchActivityGroup.service";
import { ActivityGroups } from "../../common/enums.enum";
import { ActivityService } from "../activity/activity.service";
import { CreateActivityDto } from "../activity/dto";
import { StatusOrders } from "../../common/constants.constants";

@Injectable()
export class BranchService {
	constructor(
		private prisma: PrismaService,
		private branchActivityGroupService: BranchActivityGroupService,
		private activityService: ActivityService,
	) {}

	async updateSearchHash(id: number) {
		const branch = await this.findById(id);

		const searchHash = [];

		searchHash.push(branch.id);
		searchHash.push(branch.name);
		searchHash.push(branch.cnpj);
		searchHash.push(branch.phone);
		searchHash.push(branch.email);
		searchHash.push(branch.address);
		searchHash.push(branch.city);
		searchHash.push(branch.state);
		searchHash.push(branch.zipCode);

		await this.prisma.branch.update({
			where: { id },
			data: { searchHash: searchHash.join(";") },
		});
	}

	async create(createBranchDto: CreateBranchDto): Promise<any> {
		const existingBranchByName = await this.findByName(createBranchDto.name);
		if (existingBranchByName) {
			throw new BadRequestException("Name already in use");
		}
		const existingBranchByCode = await this.findByCode(createBranchDto.code);
		if (existingBranchByCode) {
			throw new BadRequestException("Code already in use");
		}

		// Se não houver duplicatas, crie o novo curso
		const { activityGroupsWorkloads, ...branchDto } = createBranchDto;
		const activityGroupsArray = Object.keys(ActivityGroups).map((value) =>
			value.toString().toLowerCase(),
		);

		// Criando o curso
		const branch = await this.prisma.branch.create({ data: branchDto });

		// Definindo a carga horária máxima para cada grupo de atividades
		activityGroupsArray.forEach(async (activityGroup, index) => {
			const value =
				activityGroup in activityGroupsWorkloads
					? activityGroupsWorkloads[activityGroup]
					: 240;

			await this.branchActivityGroupService.create({
				branchId: branch.id,
				activityGroupId: index + 1,
				maxWorkload: value,
			});
		});

		const activityGroups = await this.branchActivityGroupService.findByBranchId(
			branch.id,
		);

		await this.updateSearchHash(branch.id);

		return { ...branch, activityGroups: activityGroups };
	}

	async getBranchReport(id: number): Promise<any> {
		const branch = await this.findById(id);
		if (!branch) throw new BadRequestException("Branch not found");

		const totalStudents = await this.prisma.branchUser.count({
			where: {
				branchId: id,
				enrollment: { not: null },
			},
		});

		const orders = await this.prisma.order.findMany({
			where: {
				Activity: {
					BranchActivityGroup: {
						Branch: {
							id: id,
						},
					},
				},
			},
			select: {
				id: true,
				status: true,
			},
		});

		const totalOrders = orders.length;
		const pendingOrders = orders.filter(
			(order) => order.status === StatusOrders["Submetido"],
		).length;
		const preApprovedOrders = orders.filter(
			(order) => order.status === StatusOrders["Pré-aprovado"],
		).length;
		const approvedOrders = orders.filter(
			(order) => order.status === StatusOrders["Aprovado"],
		).length;
		const rejectedOrders = orders.filter(
			(order) => order.status === StatusOrders["Rejeitado"],
		).length;

		return {
			branch: branch,
			totalStudents: totalStudents,
			totalOrders: totalOrders,
			pendingOrders: pendingOrders,
			preApprovedOrders: preApprovedOrders,
			approvedOrders: approvedOrders,
			rejectedOrders: rejectedOrders,
		};
	}

	async findAll(query: any): Promise<any> {
		const { page, limit, search } = query;
		const skip = (page - 1) * limit;
		const where =
			search && search.trim() !== ""
				? {
						isActive: true,
						searchHash: { contains: search },
					}
				: { isActive: true };

		const [branches, totalBranches] = await this.prisma.$transaction([
			this.prisma.branch.findMany({
				where,
				skip: skip ? skip : undefined,
				take: limit ? parseInt(limit) : undefined,
				select: {
					id: true,
					name: true,
					code: true,
					periods: true,
					minWorkload: true,
					isActive: true,
					createdAt: true,
					updatedAt: true,
					_count: {
						select: {
							BranchUsers: {
								where: { enrollment: { not: null } },
							},
						},
					},
					BranchActivityGroups: {
						include: {
							ActivityGroup: { select: { id: true, name: true } },
						},
					},
				},
			}),
			this.prisma.branch.count({
				where,
			}),
		]);

		const _branches = branches.map((branch) => {
			const activityGroups = branch.BranchActivityGroups.map((cag) => ({
				name: cag.ActivityGroup.name,
				maxWorkload: cag.maxWorkload,
			}));

			return {
				...branch,
				activityGroups: activityGroups,
				userCount: branch._count.BranchUsers,
				_count: undefined,
				BranchActivityGroups: undefined,
			};
		});

		return {
			branches: _branches.filter(
				(branch) => branch !== undefined && branch !== null,
			),
			total: totalBranches,
			totalPages: Math.ceil(totalBranches / limit),
			currentPage: parseInt(page),
		};
	}

	async findById(id: number): Promise<Branch | null | any> {
		const branch = await this.prisma.branch.findUnique({
			where: { id, isActive: true },
			select: {
				id: true,
				name: true,
				code: true,
				periods: true,
				minWorkload: true,
				isActive: true,
				createdAt: true,
				updatedAt: true,
				_count: {
					select: {
						BranchUsers: {
							where: { enrollment: { not: null } },
						},
					},
				},
				BranchActivityGroups: {
					include: {
						ActivityGroup: { select: { id: true, name: true } },
					},
				},
			},
		});

		const activityGroups = branch.BranchActivityGroups.map((cag) => ({
			name: cag.ActivityGroup.name,
			maxWorkload: cag.maxWorkload,
		}));

		return {
			...branch,
			activityGroups: activityGroups,
			userCount: branch._count.BranchUsers,
			_count: undefined,
			BranchActivityGroups: undefined,
		};
	}

	async findByName(
		name: string,
		excludeId: number = 0,
	): Promise<Branch | null> {
		return await this.prisma.branch.findFirst({
			where: { name, id: { not: excludeId }, isActive: true },
		});
	}

	async findByCode(
		code: string,
		excludeId: number = 0,
	): Promise<Branch | null> {
		return await this.prisma.branch.findFirst({
			where: { code, id: { not: excludeId }, isActive: true },
		});
	}

	async findActivitiesByBranchAndActivityGroup(
		branchId: number,
		activityGroupName: string,
	): Promise<any[]> {
		const activityGroupsArray = Object.keys(ActivityGroups).map((value) =>
			value.toString(),
		);
		const activityGroupId =
			activityGroupsArray.indexOf(activityGroupName.toUpperCase()) + 1;

		const branchActivityGroup =
			await this.branchActivityGroupService.findByBranchAndActivityGroup(
				branchId,
				activityGroupId,
			);

		if (!branchActivityGroup) return [];
		else {
			return await this.activityService.findByBranchActivityGroupId(
				branchActivityGroup.id,
			);
		}
	}

	async createActivityByBranchAndActivityGroup(
		branchId: number,
		activityGroupName: string,
		createActivityDto: CreateActivityDto,
	): Promise<any> {
		const activityGroupsArray = Object.keys(ActivityGroups).map((value) =>
			value.toString(),
		);
		const activityGroupId =
			activityGroupsArray.indexOf(activityGroupName.toUpperCase()) + 1;

		const branchActivityGroup =
			await this.branchActivityGroupService.findByBranchAndActivityGroup(
				branchId,
				activityGroupId,
			);

		if (!branchActivityGroup)
			throw new BadRequestException("Activity group not found");

		return await this.activityService.create({
			...createActivityDto,
			branchActivityGroupId: branchActivityGroup.id,
		});
	}

	async update(id: number, updateBranchDto: UpdateBranchDto): Promise<Branch> {
		const branch = await this.findById(id);
		if (!branch) throw new BadRequestException("Branch not found");
		if (await this.findByName(updateBranchDto.name, id))
			throw new BadRequestException("Name already in use");
		if (await this.findByCode(updateBranchDto.code, id))
			throw new BadRequestException("Code already in use");

		const { activityGroupsWorkloads, ...branchDto } = updateBranchDto;
		const activityGroupsArray = Object.keys(ActivityGroups).map((value) =>
			value.toString().toLowerCase(),
		);

		// Updating branch
		await this.prisma.branch.update({ where: { id }, data: branchDto });

		// Setting max workload for each activity group
		activityGroupsArray.forEach(async (activityGroup, index) => {
			if (activityGroup in activityGroupsWorkloads) {
				const value = activityGroupsWorkloads[activityGroup];
				const branchActivityGroup =
					await this.branchActivityGroupService.findByBranchAndActivityGroup(
						id,
						index + 1,
					);

				if (branchActivityGroup) {
					await this.branchActivityGroupService.update(branchActivityGroup.id, {
						activityGroupId: index + 1,
						maxWorkload: value,
					});
				}
			}
		});

		const activityGroups =
			await this.branchActivityGroupService.findByBranchId(id);

		await this.updateSearchHash(id);

		return { ...branch, activityGroups: activityGroups };
	}

	async remove(id: number): Promise<Branch> {
		return await this.prisma.branch.update({
			where: { id },
			data: { isActive: false },
		});
	}
}
