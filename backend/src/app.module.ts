// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./resources/user/user.module";
import { AuthModule } from "./resources/auth/auth.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";

import { CronService } from "./resources/cron/cron.service";
import { PrismaService } from "./resources/prisma/prisma.service";
import { BranchModule } from "./resources/branch/branch.module";
import { CategoryModule } from "./resources/category/category.module";
import { ProductModule } from "./resources/product/product.module";
import { SupplierModule } from "./resources/supplier/supplier.module";

@Module({
	imports: [
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, "..", "public"),
			serveRoot: "/files",
		}),
		ConfigModule.forRoot(),

		AuthModule,
		UserModule,

		BranchModule,
		SupplierModule,
		CategoryModule,
		ProductModule,
	],
	providers: [CronService, PrismaService],
})
export class AppModule {}
