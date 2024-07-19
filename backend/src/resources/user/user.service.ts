import {
	BadRequestException,
	Inject,
	Injectable,
	forwardRef,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "@prisma/client";
import { CreateUserDto, UpdateUserDto } from "./dto";
import { BranchService } from "../branch/branch.service";
import { BranchUserService } from "../branchUser/branchUser.service";
import { UserTypes } from "../../../src/common/constants.constants";
import {
	decodeToken,
	getFilesLocation,
	getFirstAndLastName,
	getFirstName,
	sendEmail,
} from "../utils";
import { AuthService } from "../auth/auth.service";
import * as fs from "fs";
import * as sharp from "sharp";
import { DangerUpdateUserDto } from "./dto/dangerUpdate-user.dto";

@Injectable()
export class UserService {
	constructor(
		private prisma: PrismaService,
		private branchService: BranchService,
		private branchUserService: BranchUserService,

		@Inject(forwardRef(() => AuthService))
		private authService: AuthService,
	) {}

	async updateSearchHash(id: number) {
		const user = await this.findById(id);
		const branches = await this.branchService.findBranchesByUserId(id);

		const searchHash = [];

		searchHash.push(user.id);
		searchHash.push(user.name);
		searchHash.push(user.email);

		branches.forEach((branch) => {
			searchHash.push(branch.name);
		});

		await this.prisma.user.update({
			where: { id },
			data: { searchHash: searchHash.join(";") },
		});
	}

	async create(createUserDto: CreateUserDto, token: string = ""): Promise<any> {
		if (await this.findByEmail(createUserDto.email)) {
			throw new BadRequestException("Email already in use");
		}
		if (createUserDto.branchesIds) {
			for (const _branchId of createUserDto.branchesIds) {
				if (!(await this.branchService.findById(_branchId))) {
					throw new BadRequestException(`Branch (id: ${_branchId}) not found`);
				}
			}
		}

		const { branchesIds, userType, ..._createUserDto } = createUserDto;

		// Registering user
		const userCreated = await this.prisma.user.create({
			data: {
				..._createUserDto,
				password: null,
				userTypeId: UserTypes[userType].id,
			},
		});

		// Registering branches
		branchesIds.forEach(async (_branchId) => {
			await this.branchUserService.create({
				branchId: _branchId,
				userId: userCreated.id,
			});
		});

		const userResponsible = await this.findById((decodeToken(token) as any).id);
		if (userResponsible) {
			// Setting password reset token and sending welcome email
			const resetToken = await this.authService.createPasswordResetToken(
				userCreated.email,
				48,
			);

			await this.sendWelcomeEmail(userResponsible, userCreated, resetToken);
		}

		const branches = await this.branchService
			.findBranchesByUserId(userCreated.id)
			.then(() => this.updateSearchHash(userCreated.id));

		return {
			user: {
				...userCreated,
				branches,
				profileImage: userCreated.profileImage
					? `${getFilesLocation("profile-images")}/${userCreated.profileImage}`
					: null,
			},
		};
	}

	async sendWelcomeEmail(
		userResponsible: any,
		userCreated: any,
		resetToken: string,
	): Promise<void> {
		const userType = UserTypes[userResponsible.userTypeId].name.toLowerCase();
		const userCreatedType =
			UserTypes[userCreated.userTypeId].name.toLowerCase();

		await sendEmail(
			userCreated.email,
			"Bem vindo ao Beacon!",
			`Olá, ${getFirstName(
				userCreated.name,
			)}! Você foi adicionado como ${userCreatedType} na nossa plataforma pelo ${userType} ${getFirstAndLastName(
				userResponsible.name,
			)}. 
      Para configurar sua senha e começar a gerenciar ordens de compra, clique no link a seguir: ${
				process.env.FRONTEND_URL
			}/conta/senha?token=${resetToken}`,
		);
	}

	async assign(userId: number, branchId: number): Promise<any> {
		const user = await this.findById(userId);
		if (!user) throw new BadRequestException("User not found");
		const branch = await this.branchService.findById(branchId);
		if (!branch) throw new BadRequestException("Branch not found");

		await this.branchUserService
			.create({
				userId,
				branchId,
			})
			.then(() => this.updateSearchHash(userId));

		return await this.branchService.findBranchesByUserId(user.id);
	}

	async unassign(userId: number, branchId: number): Promise<any> {
		const user = await this.findById(userId);
		if (!user) throw new BadRequestException("User not found");
		const branch = await this.branchService.findById(branchId);
		if (!branch) throw new BadRequestException("Branch not found");

		await this.branchUserService
			.unlinkUserFromBranch(userId, branchId)
			.then(() => this.updateSearchHash(userId));

		return await this.branchService.findBranchesByUserId(user.id);
	}

	async findAll(query: any): Promise<any> {
		const { page, limit, search, type, branchId, active } = query;
		const skip = (page - 1) * limit;
		const where =
			search && search.trim() !== ""
				? {
						searchHash: { contains: search },
					}
				: {};

		if (type) {
			const userTypesArray = Object.values(UserTypes).map((value) =>
				value.toString().toLowerCase(),
			);
			where["userTypeId"] =
				userTypesArray.indexOf(type.toString().toLowerCase()) + 1;
		}

		if (branchId && !isNaN(parseInt(branchId))) {
			where["BranchUsers"] = {
				some: {
					branchId: parseInt(branchId),
				},
			};
		}

		if (active !== undefined && active !== null) {
			where["isActive"] = active == "true";
		}

		const [users, totalUsers] = await this.prisma.$transaction([
			this.prisma.user.findMany({
				where,
				skip: skip ? skip : undefined,
				take: limit ? parseInt(limit) : undefined,
				include: {
					BranchesUser: {
						include: {
							Branch: { select: { id: true, name: true } },
						},
					},
				},
			}),
			this.prisma.user.count({
				where,
			}),
		]);

		const _users = await Promise.all(
			users.map(async (user) => {
				const branches = user.BranchesUser.map((branchUser) => ({
					id: branchUser.Branch.id,
					name: branchUser.Branch.name,
				}));

				return {
					...user,
					profileImage: user.profileImage
						? `${getFilesLocation("profile-images")}/${user.profileImage}`
						: null,
					branches,
					BranchesUser: undefined,
					password: undefined,
					userType: UserTypes[user.userTypeId].name,
				};
			}),
		);

		return {
			users: _users.filter((user) => user !== undefined && user !== null),
			total: totalUsers,
			totalPages: Math.ceil(totalUsers / limit),
			currentPage: parseInt(page),
		};
	}

	async findById(id: number): Promise<any | null> {
		return await this.prisma.user.findUnique({ where: { id, isActive: true } });
	}

	// Used to verify availability
	async findByEmail(
		email: string,
		excludeId: number = 0,
	): Promise<User | null> {
		const user = await this.prisma.user.findFirst({
			where: { email, id: { not: excludeId } },
		});
		return user;
	}

	// Used to verify availability
	async findByResetToken(token: string): Promise<User | null> {
		return await this.prisma.user.findFirst({
			where: { resetToken: token, isActive: true },
		});
	}

	async update(id: number, updateUserDto: UpdateUserDto): Promise<any> {
		if (
			updateUserDto.email &&
			(await this.findByEmail(updateUserDto.email, id))
		)
			throw new BadRequestException("Email already in use");

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...user } = await this.prisma.user.update({
			where: { id },
			data: updateUserDto,
		});

		await this.updateSearchHash(id);

		return {
			...user,
			profileImage: user.profileImage
				? `${getFilesLocation("profile-images")}/${user.profileImage}`
				: null,
			password: undefined,
		};
	}

	async dangerUpdate(
		id: number,
		dangerUpdateUserDto: DangerUpdateUserDto,
	): Promise<any> {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...user } = await this.prisma.user.update({
			where: { id },
			data: dangerUpdateUserDto,
		});

		await this.updateSearchHash(id);

		return {
			...user,
			profileImage: user.profileImage
				? `${getFilesLocation("profile-images")}/${user.profileImage}`
				: null,
			password: undefined,
		};
	}

	async updateProfileImage(id: number, filename: string) {
		const tmpPath = `./public/files/tmp/`;
		const rootPath = `./public/files/profile-images/`;
		const path = `${rootPath}${filename}`;

		if (!fs.existsSync(rootPath)) {
			fs.mkdirSync(rootPath, { recursive: true });
		}

		const user = await this.findById(id);
		if (!user) {
			throw new BadRequestException("User not found");
		}

		if (user && user.profileImage) {
			const currentImagePath = `${rootPath}${user.profileImage}`;
			if (fs.existsSync(currentImagePath)) {
				fs.unlinkSync(currentImagePath);
			}
		}

		const resizedImage = await sharp(`${tmpPath}${filename}`)
			.resize({
				fit: "cover",
				width: 250,
				height: 250,
			})
			.toFormat("jpeg", { mozjpeg: true })
			.toBuffer();

		fs.writeFileSync(path.replace(".tmp", ""), resizedImage);

		const _user = await this.prisma.user.update({
			where: { id },
			data: { profileImage: filename.replace(".tmp", "") },
		});

		return {
			..._user,
			profileImage: _user.profileImage
				? `${getFilesLocation("profile-images")}/${_user.profileImage}`
				: null,
			password: undefined,
		};
	}

	async remove(id: number): Promise<User> {
		return await this.prisma.user.update({
			where: { id },
			data: { isActive: false },
		});
	}

	async massRemove(ids: string): Promise<any> {
		const _ids = ids.split(",").map(Number);

		const users = this.prisma.user.updateMany({
			where: {
				id: { in: _ids },
			},
			data: { isActive: false },
		});

		return users;
	}
}
