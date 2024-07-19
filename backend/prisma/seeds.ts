import { PrismaClient } from "@prisma/client";
import { PrismaService } from "../src/resources/prisma/prisma.service";
import * as bcrypt from "bcrypt";
import { UserTypes } from "../src/common/constants.constants";

const prisma = new PrismaClient();

const prismaService = new PrismaService();

async function DefaultAdminSeed() {
	const hashedPassword = bcrypt.hashSync(
		process.env.DEFAULT_ADMIN_PASSWORD,
		10,
	);

	await prisma.user.create({
		data: {
			name: "Admin",
			email: process.env.DEFAULT_ADMIN_EMAIL,
			userTypeId: UserTypes.ADMIN.id,
			password: hashedPassword,
		},
	});
}

function disconnect(message: any) {
	console.log(message);
	prisma.$disconnect();
}

DefaultAdminSeed()
	.then(() => disconnect("Default Admin loaded"))
	.catch((err) => disconnect(err));
