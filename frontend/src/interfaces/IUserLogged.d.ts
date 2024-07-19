import ICourse from "./ICourse";

export default interface IUserLogged {
	id: number;
	name: string;
	email: string;
	userTypeId: number;
	profileImage: string;

	branches: ICourse[];
	selectedBranch: ICourse | null;

	logged: boolean;
	token: string;
	refreshToken: string;
}
