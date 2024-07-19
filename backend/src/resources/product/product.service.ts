import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Product } from "@prisma/client";
import { CreateProductDto, UpdateProductDto } from "./dto";
import { CategoryService } from "../category/category.service";

@Injectable()
export class ProductService {
	constructor(
		private prisma: PrismaService,

    private categoryService: CategoryService
	) {}

	async updateSearchHash(id: number) {
		const product = await this.findById(id);

		const searchHash = [];

		searchHash.push(product.id);
		searchHash.push(product.name);
		searchHash.push(product.unitMeasure);
		searchHash.push(product.unitValue);
		searchHash.push(product.description);

		await this.prisma.product.update({
			where: { id },
			data: { searchHash: searchHash.join(";") },
		});
	}

	async create(createProductDto: CreateProductDto): Promise<any> {
		if (await this.findByName(createProductDto.name))
			throw new BadRequestException("Name already in use");
		if (!await this.categoryService.findById(createProductDto.categoryId))
			throw new BadRequestException("Category not found");

		// Criando o curso
		const product = await this.prisma.product.create({ data: createProductDto });

		await this.updateSearchHash(product.id);

		return product;
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
			this.prisma.product.findMany({
				where,
				skip: skip ? skip : undefined,
				take: limit ? parseInt(limit) : undefined,
				select: {
					id: true,
					name: true,
					unitMeasure: true,
          unitValue: true,
          description: true,
          
					isActive: true,
					createdAt: true,
					updatedAt: true,
					_count: {
						select: {
              OrderProducts: true,
						},
					},
				},
			}),
			this.prisma.product.count({
				where,
			}),
		]);

		const _products = products.map((product) => {
			return {
				...product,
        orderCount: product._count.OrderProducts,
				_count: undefined,
			};
		});

		return {
			products: _products.filter(
				(product) => product !== undefined && product !== null,
			),
			total: totalProducts,
			totalPages: Math.ceil(totalProducts / limit),
			currentPage: parseInt(page),
		};
	}

	async findById(id: number): Promise<Product | null | any> {
		const product = await this.prisma.product.findUnique({
			where: { id, isActive: true },
			select: {
				id: true,
					name: true,
					unitMeasure: true,
          unitValue: true,
          description: true,
          
					isActive: true,
					createdAt: true,
					updatedAt: true,
					_count: {
						select: {
              OrderProducts: true,
						},
					},
			},
		});

		return {
			...product,
      orderCount: product._count.OrderProducts,
			_count: undefined,
		};
	}

	async findByName(
		name: string,
		excludeId: number = 0,
	): Promise<Product | null> {
		return await this.prisma.product.findFirst({
			where: { name, id: { not: excludeId }, isActive: true },
		});
	}

	async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
		const product = await this.findById(id);
		if (!product) throw new BadRequestException("Product not found");
		if (await this.findByName(updateProductDto.name))
			throw new BadRequestException("Name already in use");
		if (!await this.categoryService.findById(updateProductDto.categoryId))
			throw new BadRequestException("Category not found");

		// Updating product
		await this.prisma.product.update({ where: { id }, data: updateProductDto });

		await this.updateSearchHash(id);

		return product;
	}

	async remove(id: number): Promise<Product> {
		return await this.prisma.product.update({
			where: { id },
			data: { isActive: false },
		});
	}
}
