import {
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from "class-validator";
import {
	UserTypes,
	OrderActionTypes,
	StatusTypes,
	PriorityTypes,
} from "./constants.constants";

@ValidatorConstraint({ name: "IsCNPJ", async: false })
export class IsCNPJ implements ValidatorConstraintInterface {
	validate(cnpj: string) {
		const numericCnpj = cnpj.replace(/\D/g, "");
		if (numericCnpj.length !== 14) {
			return false;
		}

		// Checksum
		const calculateChecksum = (slice) => {
			const length = slice.length;

			let checksum = 0;
			let pos = length - 7;

			for (let i = length; i >= 1; i--) {
				checksum += slice.charAt(length - i) * pos--;

				if (pos < 2) pos = 9;
			}

			return checksum % 11 < 2 ? 0 : 11 - (checksum % 11);
		};

		const firstDigit = calculateChecksum(numericCnpj.slice(0, 12));
		const secondDigit = calculateChecksum(numericCnpj.slice(0, 13));

		return (
			parseInt(numericCnpj.charAt(12)) === firstDigit &&
			parseInt(numericCnpj.charAt(13)) === secondDigit
		);
	}

	defaultMessage() {
		return "Invalid CNPJ";
	}
}

@ValidatorConstraint({ name: "IsCPF", async: false })
export class IsCPF implements ValidatorConstraintInterface {
	validate(cpf: string) {
		if (cpf.length == 0) return true;

		const numericCpf = cpf.replace(/\D/g, "");
		if (numericCpf.length !== 11) {
			return false;
		}

		// Checksum
		const calculateChecksum = (slice) => {
			const length = slice.length;

			let checksum = 0;
			let pos = length + 1;

			for (let i = 0; i < length; i++) {
				checksum += slice.charAt(i) * pos--;

				if (pos < 2) pos = 9;
			}

			return checksum % 11 < 2 ? 0 : 11 - (checksum % 11);
		};

		const firstDigit = calculateChecksum(numericCpf.slice(0, 9));
		const secondDigit = calculateChecksum(numericCpf.slice(0, 10));

		return (
			parseInt(numericCpf.charAt(9)) === firstDigit &&
			parseInt(numericCpf.charAt(10)) === secondDigit
		);
	}

	defaultMessage() {
		return "Invalid CPF";
	}
}

function buildValidValuesString(keys: any[]) {
	const keysLength = keys.length;
	let string = "";

	keys.forEach((key, index) => {
		string += index + 1 == keysLength ? `'${key}', ` : `or '${key}'`;
	});
}

@ValidatorConstraint({ name: "IsUserType", async: false })
export class IsUserType implements ValidatorConstraintInterface {
	validate(type: string) {
		return Object.keys(UserTypes).includes(type);
	}

	defaultMessage() {
		return `Invalid user type (must be either ${buildValidValuesString(
			Object.keys(UserTypes),
		)})`;
	}
}

@ValidatorConstraint({ name: "IsOrderActionType", async: false })
export class IsOrderAction implements ValidatorConstraintInterface {
	validate(type: string) {
		return Object.keys(OrderActionTypes).includes(type);
	}

	defaultMessage() {
		return `Invalid order action type (must be either ${buildValidValuesString(
			Object.keys(OrderActionTypes),
		)})`;
	}
}

@ValidatorConstraint({ name: "IsStatusType", async: false })
export class IsStatusType implements ValidatorConstraintInterface {
	validate(type: string) {
		return Object.keys(StatusTypes).includes(type);
	}

	defaultMessage() {
		return `Invalid status type (must be either ${buildValidValuesString(
			Object.keys(StatusTypes),
		)})`;
	}
}

@ValidatorConstraint({ name: "IsPriorityType", async: false })
export class IsStatus implements ValidatorConstraintInterface {
	validate(type: string) {
		return Object.keys(PriorityTypes).includes(type);
	}

	defaultMessage() {
		return `Invalid priority type (must be either ${buildValidValuesString(
			Object.keys(PriorityTypes),
		)})`;
	}
}
