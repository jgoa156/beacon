export default interface IBranch {
	id: number;
	name: string;
	cnpj: string;
	phone?: string;
	email?: string;
	address?: string;
	city?: string;
	state?: string;
	zipCode?: string;

	isActive: boolean;
	userCount?: number;
}
