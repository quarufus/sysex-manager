import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export function messageStatus(message: MIDIMessageEvent): string {
	if (!message.data) {
		return '';
	}
	const status = message.data[0];
	switch (true) {
		case status >= 128 && status <= 143:
			return 'Note Off';
		case status >= 144 && status <= 159:
			return 'Note On';
		case status >= 160 && status <= 175:
			return 'Aftertouch';
		case status >= 176 && status <= 191:
			return 'Control Change';
		case status >= 192 && status <= 207:
			return 'Program Change';
		case status >= 208 && status <= 223:
			return 'Channel Pressure';
		case status >= 224 && status <= 239:
			return 'Pitch Bend';
		case status == 240:
			return 'SysEx';
		case status == 246:
			return 'Tune Request';
		case status == 248:
			return 'Clock';
		case status == 250:
			return 'Start';
		case status == 251:
			return 'Continue';
		case status == 252:
			return 'Stop';
		case status == 253:
			return 'Active Sensing';
		case status == 254:
			return 'Reset';
		default:
			return '';
	}
}

export function downloadMessage(msg: Uint8Array) {
	const binary = [];
	for (let i = 0; i < msg.length; i++) {
		binary[i] = parseInt(msg[i].toString(16), 16);
	}
	const byteArray = new Uint8Array(binary);
	const blob = new Blob([byteArray], { type: 'application/octet-stream' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.download = 'data.syx';
	a.href = url;
	a.click();
	window.URL.revokeObjectURL(url);
}

export function bytesToString(bytes: Uint8Array): string {
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0').toUpperCase())
		.join(' ');
}
