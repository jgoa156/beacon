import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Product } from "@prisma/client";
import { CreateProductDto, UpdateProductDto } from "./dto";
import { ProductActivityGroupService } from "../courseActivityGroup/courseActivityGroup.service";
import { ActivityGroups } from "../../common/enums.enum";
import { ActivityService } from "../activity/activity.service";
import { CreateActivityDto } from "../activity/dto";
import { StatusOrders } from "../../common/constants.constants";

@Injectable()
export class ProductService {
	constructor(
		private prisma: PrismaService,
		private courseActivityGroupService: ProductActivityGroupService,
		private activityService: ActivityService,
	) {}

	async updateSearchHash(id: number) {
		const course = await this.findById(id);

		const searchHash = [];

		searchHash.push(course.id);
		searchHash.push(course.name);
		searchHash.push(course.code);
		searchHash.push(course.periods);
		searchHash.push(course.minWorkload);

		await this.prisma.course.update({
			where: { id },
			data: { searchHash: searchHash.join(";") },
		});
	}

	async create(createProductDto: CreateProductDto): Promise<any> {
		const existingProductByName = await this.findByName(createProductDto.name);
		if (existingProductByName) {
			throw new BadRequestException("Name already in use");
		}
		const existingProductByCode = await this.findByCode(createProductDto.code);
		if (existingProductByCode) {
			throw new BadRequestException("Code already in use");
		}

		// Se não houver duplicatas, crie o novo curso
		const { activityGroupsWorkloads, ...courseDto } = createProductDto;
		const activityGroupsArray = Object.keys(ActivityGroups).map((value) =>
			value.toString().toLowerCase(),
		);

		// Criando o curso
		const course = await this.prisma.course.create({ data: courseDto });

		// Definindo a carga horária máxima para cada grupo de atividades
		activityGroupsArray.forEach(async (activityGroup, index) => {
			const value =
				activityGroup in activityGroupsWorkloads
					? activityGroupsWorkloads[activityGroup]
					: 240;

			await this.courseActivityGroupService.create({
				courseId: course.id,
				activityGroupId: index + 1,
				maxWorkload: value,
			});
		});

		const activityGroups =
			await this.courseActivityGroupService.findByProductId(course.id);

		await this.updateSearchHash(course.id);

		return { ...course, activityGroups: activityGroups };
	}

	async getProductReport(id: number): Promise<any> {
		const course = await this.findById(id);
		if (!course) throw new BadRequestException("Product not found");

		const totalStudents = await this.prisma.courseUser.count({
			where: {
				courseId: id,
				enrollment: { not: null },
			},
		});

		const orders = await this.prisma.order.findMany({
			where: {
				Activity: {
					ProductActivityGroup: {
						Product: {
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
			course: course,
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

		const [products, totalProducts] = await this.prisma.$transaction([
			this.prisma.course.findMany({
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
							ProductUsers: {
								where: { enrollment: { not: null } },
							},
						},
					},
					ProductActivityGroups: {
						include: {
							ActivityGroup: { select: { id: true, name: true } },
						},
					},
				},
			}),
			this.prisma.course.count({
				where,
			}),
		]);

		const _products = products.map((course) => {
			const activityGroups = course.ProductActivityGroups.map((cag) => ({
				name: cag.ActivityGroup.name,
				maxWorkload: cag.maxWorkload,
			}));

			return {
				...course,
				activityGroups: activityGroups,
				userCount: course._count.ProductUsers,
				_count: undefined,
				ProductActivityGroups: undefined,
			};
		});

		return {
			products: _products.filter(
				(course) => course !== undefined && course !== null,
			),
			total: totalProducts,
			totalPages: Math.ceil(totalProducts / limit),
			currentPage: parseInt(page),
		};
	}

	async findById(id: number): Promise<Product | null | any> {
		const course = await this.prisma.course.findUnique({
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
						ProductUsers: {
							where: { enrollment: { not: null } },
						},
					},
				},
				ProductActivityGroups: {
					include: {
						ActivityGroup: { select: { id: true, name: true } },
					},
				},
			},
		});

		const activityGroups = course.ProductActivityGroups.map((cag) => ({
			name: cag.ActivityGroup.name,
			maxWorkload: cag.maxWorkload,
		}));

		return {
			...course,
			activityGroups: activityGroups,
			userCount: course._count.ProductUsers,
			_count: undefined,
			ProductActivityGroups: undefined,
		};
	}

	async findByName(
		name: string,
		excludeId: number = 0,
	): Promise<Product | null> {
		return await this.prisma.course.findFirst({
			where: { name, id: { not: excludeId }, isActive: true },
		});
	}

	async findByCode(
		code: string,
		excludeId: number = 0,
	): Promise<Product | null> {
		return await this.prisma.course.findFirst({
			where: { code, id: { not: excludeId }, isActive: true },
		});
	}

	async findProductsByUser(userId: number): Promise<any[]> {
		const courseUsers = await this.prisma.courseUser.findMany({
			where: { userId },
			select: {
				courseId: true,
				enrollment: true,
				startYear: true,
			},
		});

		const courseIds = courseUsers.map((cu) => cu.courseId);

		const products = await this.prisma.course.findMany({
			where: {
				id: {
					in: courseIds,
				},
				isActive: true,
			},
			select: {
				id: true,
				name: true,
				code: true,
				periods: true,
				minWorkload: true,
			},
		});

		// Anexar informações de inscrição e data de início aos cursos
		const productsWithEnrollmentInfo = products.map((course) => ({
			...course,
			enrollment: courseUsers.find((cu) => cu.courseId === course.id)
				?.enrollment,
			startYear: courseUsers.find((cu) => cu.courseId === course.id)?.startYear,
		}));

		return productsWithEnrollmentInfo;
	}

	async findActivitiesByProductAndActivityGroup(
		courseId: number,
		activityGroupName: string,
	): Promise<any[]> {
		const activityGroupsArray = Object.keys(ActivityGroups).map((value) =>
			value.toString(),
		);
		const activityGroupId =
			activityGroupsArray.indexOf(activityGroupName.toUpperCase()) + 1;

		const courseActivityGroup =
			await this.courseActivityGroupService.findByProductAndActivityGroup(
				courseId,
				activityGroupId,
			);

		if (!courseActivityGroup) return [];
		else {
			return await this.activityService.findByProductActivityGroupId(
				courseActivityGroup.id,
			);
		}
	}

	async createActivityByProductAndActivityGroup(
		courseId: number,
		activityGroupName: string,
		createActivityDto: CreateActivityDto,
	): Promise<any> {
		const activityGroupsArray = Object.keys(ActivityGroups).map((value) =>
			value.toString(),
		);
		const activityGroupId =
			activityGroupsArray.indexOf(activityGroupName.toUpperCase()) + 1;

		const courseActivityGroup =
			await this.courseActivityGroupService.findByProductAndActivityGroup(
				courseId,
				activityGroupId,
			);

		if (!courseActivityGroup)
			throw new BadRequestException("Activity group not found");

		return await this.activityService.create({
			...createActivityDto,
			courseActivityGroupId: courseActivityGroup.id,
		});
	}

	async update(
		id: number,
		updateProductDto: UpdateProductDto,
	): Promise<Product> {
		const course = await this.findById(id);
		if (!course) throw new BadRequestException("Product not found");
		if (await this.findByName(updateProductDto.name, id))
			throw new BadRequestException("Name already in use");
		if (await this.findByCode(updateProductDto.code, id))
			throw new BadRequestException("Code already in use");

		const { activityGroupsWorkloads, ...courseDto } = updateProductDto;
		const activityGroupsArray = Object.keys(ActivityGroups).map((value) =>
			value.toString().toLowerCase(),
		);

		// Updating course
		await this.prisma.course.update({ where: { id }, data: courseDto });

		// Setting max workload for each activity group
		activityGroupsArray.forEach(async (activityGroup, index) => {
			if (activityGroup in activityGroupsWorkloads) {
				const value = activityGroupsWorkloads[activityGroup];
				const courseActivityGroup =
					await this.courseActivityGroupService.findByProductAndActivityGroup(
						id,
						index + 1,
					);

				if (courseActivityGroup) {
					await this.courseActivityGroupService.update(courseActivityGroup.id, {
						activityGroupId: index + 1,
						maxWorkload: value,
					});
				}
			}
		});

		const activityGroups =
			await this.courseActivityGroupService.findByProductId(id);

		await this.updateSearchHash(id);

		return { ...course, activityGroups: activityGroups };
	}

	async remove(id: number): Promise<Product> {
		return await this.prisma.course.update({
			where: { id },
			data: { isActive: false },
		});
	}
}
