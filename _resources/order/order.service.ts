import { PrismaService } from "../prisma/prisma.service";
import { Order } from "@prisma/client";
import { CreateOrderDto, UpdateOrderDto } from "./dto";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { OrderActionService } from "../orderAction/orderAction.service";
import {
	ActivityGroupIds,
	StatusOrders,
	OrderActionIds,
} from "../../../src/common/constants.constants";
import {
	HttpException,
	HttpStatus,
	Injectable,
	NestMiddleware,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { getFilesLocation } from "../utils";
import * as fs from "fs";
//import { contains } from "class-validator";

@Injectable()
export class FilesCorsMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header(
			"Access-Control-Allow-Methods",
			"GET, PUT, POST, DELETE, PATCH, OPTIONS",
		);
		res.header(
			"Access-Control-Allow-Headers",
			"Origin, X-Requested-With, Content-Type, Accept, Authorization",
		);
		next();
	}
}

@Injectable()
export class OrderService {
	constructor(
		private prisma: PrismaService,
		private orderActionService: OrderActionService,
	) {}

	async updateSearchHash(id: number) {
		const order = await this.findById(id);
		const { branch, supplier } = order;

		const searchHash = [];

		searchHash.push(order.id);
		searchHash.push(order.description);

		searchHash.push(branch.name);
		searchHash.push(branch.cnpj);
		searchHash.push(branch.phone);
		searchHash.push(branch.email);
		searchHash.push(branch.address);
		searchHash.push(branch.city);
		searchHash.push(branch.state);
		searchHash.push(branch.zipCode);

		searchHash.push(supplier.name);
		searchHash.push(supplier.cnpj);
		searchHash.push(supplier.phone);
		searchHash.push(supplier.email);
		searchHash.push(supplier.address);
		searchHash.push(supplier.city);
		searchHash.push(supplier.state);
		searchHash.push(supplier.zipCode);

		await this.prisma.order.update({
			where: { id },
			data: { searchHash: searchHash.join(";") },
		});
	}

	async create(
		userId: number,
		createOrderDto: CreateOrderDto,
		filename: string,
	) {
		const tmpPath = `./public/files/tmp/`;
		const rootPath = `./public/files/orders/`;
		const path = `${rootPath}${filename}`;

		const { activityId, workload, description } = createOrderDto;

		const order = await this.prisma.order.create({
			data: {
				description,
				workload: parseInt(workload.toString()),
				activityId: parseInt(activityId.toString()),
				userId,
				file: filename.replace(".tmp", ""),
			},
		});

		await this.orderActionService
			.create({
				userId,
				orderId: order.id,
				orderActionTypeId: OrderActionIds["submeteu"],
			})
			.then(() => this.updateSearchHash(order.id));

		fs.copyFileSync(`${tmpPath}${filename}`, path.replace(".tmp", ""));

		return order;
	}

	async update(
		id: number,
		updateOrderDto: UpdateOrderDto,
		filename: string,
	): Promise<Order> {
		const tmpPath = `./public/files/tmp/`;
		const rootPath = `./public/files/orders/`;
		const path = `${rootPath}${filename}`;

		const order = await this.findById(id);

		if (order && order.file) {
			const currentFilePath = `${rootPath}${order.file}`;
			if (fs.existsSync(currentFilePath)) {
				fs.unlinkSync(currentFilePath);
			}
		}

		const { userId, details, ...rest } = updateOrderDto;
		const _order = await this.prisma.order.update({
			where: { id, status: { not: StatusOrders["Aprovado"] } },
			data: {
				...rest,
				file: filename.replace(".tmp", ""),
			},
		});

		// Adding to history
		await this.orderActionService
			.create({
				userId,
				orderId: order.id,
				orderActionTypeId: OrderActionIds["editou"],
				details,
			})
			.then(() => this.updateSearchHash(order.id));

		fs.copyFileSync(`${tmpPath}${filename}`, path.replace(".tmp", ""));

		return _order;
	}

	async findById(id: number): Promise<any> {
		const _order = await this.prisma.order.findUnique({
			where: { id },
			include: {
				Activity: {
					include: {
						BranchActivityGroup: {
							include: {
								Branch: {
									select: { id: true, code: true, name: true },
								},
								ActivityGroup: {
									select: { name: true },
								},
							},
						},
					},
				},
				User: {
					include: {
						BranchUsers: {
							include: {
								Branch: {},
							},
						},
					},
				},
				OrderActions: {
					include: {
						OrderActionType: true,
						User: true,
					},

					orderBy: {
						createdAt: "desc",
					},
				},
			},
		});

		if (_order) {
			const { User, Activity, OrderActions, file } = _order;
			const { BranchActivityGroup } = Activity;
			const { Branch, ActivityGroup } = BranchActivityGroup;

			const _userBranch = User.BranchUsers[0];

			const _orderActions = OrderActions.map((action) => {
				const { User, OrderActionType } = action;
				return {
					user: {
						id: User.id,
						name: User.name,
						email: User.email,
						userTypeId: User.userTypeId,
						profileImage: User.profileImage
							? `${getFilesLocation("profile-images")}/${User.profileImage}`
							: null,
					},
					action: OrderActionType.name,
					details: action.details,
					createdAt: action.createdAt,
				};
			});

			return {
				user: {
					id: User.id,
					name: User.name,
					email: User.email,
					cpf: User.cpf,
					course: _userBranch.Branch.name,
					enrollment: _userBranch.enrollment,
					profileImage: User.profileImage
						? `${getFilesLocation("profile-images")}/${User.profileImage}`
						: null,
				},
				activity: {
					id: Activity.id,
					name: Activity.name,
					maxWorkload: Activity.maxWorkload,
					description: Activity.description,
					course: {
						id: Branch.id,
						code: Branch.code,
						name: Branch.name,
					},
					activityGroup: {
						name: ActivityGroup.name,
						maxWorkload: BranchActivityGroup.maxWorkload,
					},
				},
				history: _orderActions,
				fileUrl: `${getFilesLocation("orders")}/${file}`,
				..._order,
				Activity: undefined,
				User: undefined,
				OrderActions: undefined,
			};
		}
	}

	async findAll(query: any): Promise<any> {
		const {
			page,
			limit,
			search,
			userId,
			courseId,
			activityGroup,
			activity,
			status,
		} = query;
		const skip = (page - 1) * limit;
		let where: any =
			search && search.trim() !== ""
				? {
						isActive: true,
						searchHash: { contains: search },
					}
				: { isActive: true, User: { is: { isActive: true } } };

		if (userId && !isNaN(parseInt(userId))) {
			where = {
				...where,
				userId: parseInt(userId),
			};
		}
		if (courseId && !isNaN(parseInt(courseId))) {
			where = {
				...where,
				Activity: {
					BranchActivityGroup: {
						Branch: {
							id: parseInt(courseId),
						},
					},
				},
			};
		}
		if (activityGroup && activityGroup.length > 0) {
			where = {
				...where,
				Activity: {
					BranchActivityGroup: {
						activityGroupId: ActivityGroupIds[activityGroup],
					},
				},
			};
		}
		if (activity && !isNaN(parseInt(activity))) {
			where = {
				...where,
				activityId: parseInt(activity),
			};
		}
		if (status && status.length > 0) {
			const statusArray = status.split("-").map(Number);
			where = {
				...where,
				status: {
					in: statusArray,
				},
			};
		}

		const [orders, totalOrders] = await this.prisma.$transaction([
			this.prisma.order.findMany({
				where,
				skip: skip ? skip : undefined,
				take: limit ? parseInt(limit) : undefined,
				include: {
					Activity: {
						include: {
							BranchActivityGroup: {
								include: {
									Branch: {
										select: { id: true, code: true, name: true },
									},
									ActivityGroup: {
										select: { name: true },
									},
								},
							},
						},
					},
					User: {
						include: {
							BranchUsers: {
								include: {
									Branch: {},
								},
							},
						},
					},
				},
			}),
			this.prisma.order.count({
				where,
			}),
		]);

		const _orders = orders.map((order) => {
			const { User, Activity, file } = order;
			const { BranchActivityGroup } = Activity;
			const { Branch, ActivityGroup } = BranchActivityGroup;

			const _userBranch = User.BranchUsers[0];

			return {
				user: {
					id: User.id,
					name: User.name,
					email: User.email,
					cpf: User.cpf,
					course: _userBranch.Branch.name,
					enrollment: _userBranch.enrollment,
					profileImage: User.profileImage
						? `${getFilesLocation("profile-images")}/${User.profileImage}`
						: null,
				},
				activity: {
					id: Activity.id,
					name: Activity.name,
					maxWorkload: Activity.maxWorkload,
					description: Activity.description,
					course: {
						id: Branch.id,
						code: Branch.code,
						name: Branch.name,
					},
					activityGroup: {
						name: ActivityGroup.name,
						maxWorkload: BranchActivityGroup.maxWorkload,
					},
				},
				fileUrl: `${getFilesLocation("orders")}/${file}`,
				...order,
				Activity: undefined,
				User: undefined,
			};
		});

		return {
			orders: _orders,
			total: totalOrders,
			totalPages: Math.ceil(totalOrders / limit),
			currentPage: parseInt(page),
		};
	}

	async updateStatus(id: number, updateStatusDto: UpdateStatusDto) {
		const { status, userId, details } = updateStatusDto;
		const statusId = StatusOrders[status];
		const order = await this.prisma.order.update({
			where: { id, status: { not: StatusOrders["Aprovado"] } },
			data: { status: statusId },
		});

		// Adding to history
		await this.orderActionService.create({
			userId,
			orderId: order.id,
			orderActionTypeId: statusId,
			details,
		});

		return order;
	}

	async massUpdateStatus(ids: string, updateStatusDto: UpdateStatusDto) {
		const { status, userId, details } = updateStatusDto;
		const statusId = StatusOrders[status];
		const _ids = ids.split(",").map(Number);

		const orders = await this.prisma.order.updateMany({
			where: {
				id: { in: _ids },
				status: { not: StatusOrders["Aprovado"] },
			},
			data: { status: statusId },
		});

		// Adding to history for each order
		_ids.forEach(async (id) => {
			await this.orderActionService.create({
				userId,
				orderId: id,
				orderActionTypeId: statusId,
				details,
			});

			this.updateSearchHash(id);
		});

		return orders;
	}

	async remove(id: number): Promise<Order> {
		return await this.prisma.order.update({
			where: { id, status: { not: StatusOrders["Aprovado"] } },
			data: { isActive: false },
		});
	}

	async massRemove(ids: string): Promise<any> {
		const _ids = ids.split(",").map(Number);

		const orders = this.prisma.order.updateMany({
			where: {
				id: { in: _ids },
				status: { not: StatusOrders["Aprovado"] },
			},
			data: { isActive: false },
		});

		return orders;
	}
}
