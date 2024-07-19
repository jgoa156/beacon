import IRide from "./IRide";

export default interface IUser {
	id: number;
	name: string;
	email: string;
	cpf: string;
	branches: any[];

	isActive: boolean;
}
