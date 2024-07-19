import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Supplier } from "@prisma/client";
import { CreateSupplierDto, UpdateSupplierDto } from "./dto";

@Injectable()
export class SupplierService {
	constructor(
		private prisma: PrismaService,
	) {}

	async updateSearchHash(id: number) {
		const supplier = await this.findById(id);

		const searchHash = [];

		searchHash.push(supplier.id);
		searchHash.push(supplier.name);
		searchHash.push(supplier.cnpj);
		searchHash.push(supplier.phone);
		searchHash.push(supplier.email);
		searchHash.push(supplier.address);
		searchHash.push(supplier.city);
		searchHash.push(supplier.state);
		searchHash.push(supplier.zipCode);

		await this.prisma.supplier.update({
			where: { id },
			data: { searchHash: searchHash.join(";") },
		});
	}

	async create(createSupplierDto: CreateSupplierDto): Promise<any> {
		if (await this.findByName(createSupplierDto.name)) {
			throw new BadRequestException("Name already in use");
		}
		if (await this.findByCnpj(createSupplierDto.cnpj)) {
			throw new BadRequestException("Cnpj already in use");
		}

		// Criando o curso
		const supplier = await this.prisma.supplier.create({ data: createSupplierDto });

		await this.updateSearchHash(supplier.id);

		return supplier;
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

		const [suppliers, totalSuppliers] = await this.prisma.$transaction([
			this.prisma.supplier.findMany({
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
							Orders: true
						},
					},
				},
			}),
			this.prisma.supplier.count({
				where,
			}),
		]);

		const _suppliers = suppliers.map((supplier) => {
			return {
				...supplier,
				orderCount: supplier._count.Orders,
				_count: undefined,
			};
		});

		return {
			suppliers: _suppliers.filter(
				(supplier) => supplier !== undefined && supplier !== null,
			),
			total: totalSuppliers,
			totalPages: Math.ceil(totalSuppliers / limit),
			currentPage: parseInt(page),
		};
	}

	async findById(id: number): Promise<Supplier | null | any> {
		const supplier = await this.prisma.supplier.findUnique({
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
						Orders: true
					},
				},
			},
		});

		return {
			...supplier,
			userCount: supplier._count.Orders,
			_count: undefined,
		};
	}

	async findByName(
		name: string,
		excludeId: number = 0,
	): Promise<Supplier | null> {
		return await this.prisma.supplier.findFirst({
			where: { name, id: { not: excludeId }, isActive: true },
		});
	}

	async findByCnpj(
		cnpj: string,
		excludeId: number = 0,
	): Promise<Supplier | null> {
		return await this.prisma.supplier.findFirst({
			where: { cnpj, id: { not: excludeId }, isActive: true },
		});
	}

	async update(id: number, updateSupplierDto: UpdateSupplierDto): Promise<Supplier> {
		const supplier = await this.findById(id);
		if (!supplier) throw new BadRequestException("Supplier not found");
		if (await this.findByName(updateSupplierDto.name, id))
			throw new BadRequestException("Name already in use");
		if (await this.findByCnpj(updateSupplierDto.cnpj, id))
			throw new BadRequestException("Cnpj already in use");

		// Updating supplier
		await this.prisma.supplier.update({ where: { id }, data: updateSupplierDto });

		await this.updateSearchHash(id);

		return supplier;
	}

	async remove(id: number): Promise<Supplier> {
		return await this.prisma.supplier.update({
			where: { id },
			data: { isActive: false },
		});
	}
}
