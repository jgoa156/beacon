import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Category } from "@prisma/client";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto";
import { CategoryActivityGroupService } from "../categoryActivityGroup/categoryActivityGroup.service";
import { ActivityGroups } from "../../common/enums.enum";
import { ActivityService } from "../activity/activity.service";
import { CreateActivityDto } from "../activity/dto";
import { StatusOrders } from "../../common/constants.constants";

@Injectable()
export class CategoryService {
	constructor(
		private prisma: PrismaService,
		private categoryActivityGroupService: CategoryActivityGroupService,
		private activityService: ActivityService,
	) {}

	async updateSearchHash(id: number) {
		const category = await this.findById(id);

		const searchHash = [];

		searchHash.push(category.id);
		searchHash.push(category.name);

		await this.prisma.category.update({
			where: { id },
			data: { searchHash: searchHash.join(";") },
		});
	}

	async create(createCategoryDto: CreateCategoryDto): Promise<any> {
		if (await this.findByName(createCategoryDto.name)) {
			throw new BadRequestException("Name already in use");
		}

		const category = await this.prisma.category.create({
			data: createCategoryDto,
		});

		await this.updateSearchHash(category.id);

		return { ...category };
	}

	/*async getCategoryReport(id: number): Promise<any> {
		const category = await this.findById(id);
		if (!category) throw new BadRequestException("Category not found");

		const totalStudents = await this.prisma.categoryUser.count({
			where: {
				categoryId: id,
				enrollment: { not: null },
			},
		});

		const orders = await this.prisma.order.findMany({
			where: {
				Activity: {
					CategoryActivityGroup: {
						Category: {
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
			category: category,
			totalStudents: totalStudents,
			totalOrders: totalOrders,
			pendingOrders: pendingOrders,
			preApprovedOrders: preApprovedOrders,
			approvedOrders: approvedOrders,
			rejectedOrders: rejectedOrders,
		};
	}*/

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

		const [categories, totalCategories] = await this.prisma.$transaction([
			this.prisma.category.findMany({
				where,
				skip: skip ? skip : undefined,
				take: limit ? parseInt(limit) : undefined,
				select: {
					id: true,
					name: true,
					isActive: true,
					createdAt: true,
					updatedAt: true,
					_count: {
						select: {
							Products: {
								where: { isActive: true },
							},
						},
					},
				},
			}),
			this.prisma.category.count({
				where,
			}),
		]);

		const _categories = categories.map((category) => {
			return {
				...category,
				productCount: category._count.Products,
				_count: undefined,
			};
		});

		return {
			categories: _categories.filter(
				(category) => category !== undefined && category !== null,
			),
			total: totalCategories,
			totalPages: Math.ceil(totalCategories / limit),
			currentPage: parseInt(page),
		};
	}

	async findById(id: number): Promise<Category | null | any> {
		const category = await this.prisma.category.findUnique({
			where: { id, isActive: true },
			select: {
				id: true,
				name: true,
				isActive: true,
				createdAt: true,
				updatedAt: true,
				_count: {
					select: {
						Products: {
							where: { isActive: true },
						},
					},
				},
			},
		});

		return {
			...category,
			productCount: category._count.Products,
			_count: undefined,
		};
	}

	async findByName(
		name: string,
		excludeId: number = 0,
	): Promise<Category | null> {
		return await this.prisma.category.findFirst({
			where: { name, id: { not: excludeId }, isActive: true },
		});
	}

	async update(
		id: number,
		updateCategoryDto: UpdateCategoryDto,
	): Promise<Category> {
		const category = await this.findById(id);
		if (!category) throw new BadRequestException("Category not found");
		if (await this.findByName(updateCategoryDto.name, id))
			throw new BadRequestException("Name already in use");

		// Updating category
		await this.prisma.category.update({
			where: { id },
			data: updateCategoryDto,
		});

		await this.updateSearchHash(id);

		return { ...category };
	}

	async remove(id: number): Promise<Category> {
		return await this.prisma.category.update({
			where: { id },
			data: { isActive: false },
		});
	}
}