import { writable } from 'svelte/store';

export enum AlertType {
	WARN,
	INFO,
	SUCCESS
}

//Object.freeze(this);

export const alertTitle = writable('');
export const alertDescription = writable('');
export const alertType = writable(AlertType.INFO);

export function displayAlert(
	title: string,
	description = '',
	type: AlertType = AlertType.INFO
): void {
	alertTitle.set(title);
	alertType.set(type);
	alertDescription.set(description);
}
