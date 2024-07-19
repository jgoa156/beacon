import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Branch } from "@prisma/client";
import { CreateBranchDto, UpdateBranchDto } from "./dto";

@Injectable()
export class BranchService {
	constructor(private prisma: PrismaService) {}

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
		if (await this.findByName(createBranchDto.name)) {
			throw new BadRequestException("Name already in use");
		}
		if (await this.findByCnpj(createBranchDto.cnpj)) {
			throw new BadRequestException("Cnpj already in use");
		}

		// Criando o curso
		const branch = await this.prisma.branch.create({ data: createBranchDto });

		await this.updateSearchHash(branch.id);

		return branch;
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
					cnpj: true,
					phone: true,
					email: true,
					address: true,
					city: true,
					state: true,
					zipCode: true,

					isActive: true,
					createdAt: true,
					updatedAt: true,
					_count: {
						select: {
							BranchUsers: true,
							Orders: true,
						},
					},
				},
			}),
			this.prisma.branch.count({
				where,
			}),
		]);

		const _branches = branches.map((branch) => {
			return {
				...branch,
				userCount: branch._count.BranchUsers,
				orderCount: branch._count.Orders,
				_count: undefined,
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
				cnpj: true,
				phone: true,
				email: true,
				address: true,
				city: true,
				state: true,
				zipCode: true,

				isActive: true,
				createdAt: true,
				updatedAt: true,
				_count: {
					select: {
						BranchUsers: true,
						Orders: true,
					},
				},
			},
		});

		return {
			...branch,
			userCount: branch._count.BranchUsers,
			orderCount: branch._count.Orders,
			_count: undefined,
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

	async findByCnpj(
		cnpj: string,
		excludeId: number = 0,
	): Promise<Branch | null> {
		return await this.prisma.branch.findFirst({
			where: { cnpj, id: { not: excludeId }, isActive: true },
		});
	}

	async findBranchesByUserId(userId: number) {
		return await this.prisma.branch.findMany({
			where: {
				BranchUsers: {
					some: {
						userId,
					},
				},
			},
		});
	}

	async update(id: number, updateBranchDto: UpdateBranchDto): Promise<Branch> {
		const branch = await this.findById(id);
		if (!branch) throw new BadRequestException("Branch not found");
		if (await this.findByName(updateBranchDto.name, id))
			throw new BadRequestException("Name already in use");
		if (await this.findByCnpj(updateBranchDto.cnpj, id))
			throw new BadRequestException("Cnpj already in use");

		// Updating branch
		await this.prisma.branch.update({ where: { id }, data: updateBranchDto });

		await this.updateSearchHash(id);

		return branch;
	}

	async remove(id: number): Promise<Branch> {
		return await this.prisma.branch.update({
			where: { id },
			data: { isActive: false },
		});
	}
}
