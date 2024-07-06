import { PrismaClient } from "@prisma/client";
import { CourseService } from "../src/resources/course/course.service";
import { PrismaService } from "../src/resources/prisma/prisma.service";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const prismaService = new PrismaService();
const courseService = new CourseService(
	prismaService,
	courseActivityGroupService,
	activityService,
);

async function CoursesSeeds() {
	await courseService.create({
		name: "Ciência da Computação",
		code: "IE08",
		periods: 10,
		minWorkload: 240,
		activityGroupsWorkloads: {
			education: 240,
			research: 240,
			extension: 240,
		},
	});

	await courseService.create({
		name: "Engenharia de Software",
		code: "IE17",
		periods: 8,
		minWorkload: 240,
		activityGroupsWorkloads: {
			education: 240,
			research: 240,
			extension: 240,
		},
	});
}

async function DefaultAdminSeed() {
	const hashedPassword = bcrypt.hashSync(
		process.env.DEFAULT_ADMIN_PASSWORD,
		10,
	);

	await prisma.user.create({
		data: {
			name: "Admin",
			email: process.env.DEFAULT_ADMIN_EMAIL,
			userTypeId: UserTypeIds["Coordenador"],
			password: hashedPassword,
		},
	});
}

async function DefaultSecretarySeed() {
	const hashedPassword = bcrypt.hashSync(
		process.env.DEFAULT_ADMIN_PASSWORD + "a",
		10,
	);

	await prisma.user.create({
		data: {
			name: "Secretary",
			email: process.env.DEFAULT_ADMIN_EMAIL + "a",
			userTypeId: UserTypeIds["Secretário"],
			password: hashedPassword,
		},
	});
}

function disconnect(message: any) {
	console.log(message);
	prisma.$disconnect();
}

CoursesSeeds()
	.then(() => disconnect("Default Courses loaded"))
	.catch((err) => disconnect(err));

DefaultAdminSeed()
	.then(() => disconnect("Default Admin loaded"))
	.catch((err) => disconnect(err));

DefaultSecretarySeed()
	.then(() => disconnect("Default Secretary loaded"))
	.catch((err) => disconnect(err));
