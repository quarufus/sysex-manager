import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Command, type Message } from './types';

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

export function downloadPreset(content: object, raw: Uint8Array) {
	const ids: number[] = [];
	const cmd = [34, 80, 114, 101, 115, 101, 116, 66, 97, 99, 107, 117, 112, 34];
	for (let i = 0; i < 6; i++) {
		ids[i] = parseInt(raw[i].toString(16), 16);
	}
	const s = JSON.stringify(content);
	const body = [];
	for (let i = 0; i < s.length; i++) {
		body[i] = s.charCodeAt(i);
	}
	const binary = [...ids, ...cmd, 247, ...ids, ...body, 247];
	const byteArray = new Uint8Array(binary);
	const blob = new Blob([byteArray], { type: 'application/octet-stream' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.download = 'data.syx';
	a.href = url;
	a.click();
	window.URL.revokeObjectURL(url);
}

export function saveMessage(message: Message, data: Record<string, number>) {
	message.content = data;
	const ids: number[] = [];
	for (let i = 0; i < 6; i++) {
		ids[i] = parseInt(message.raw[i].toString(16), 16);
	}
	console.log(
		JSON.stringify(data)
			.split('')
			.map((c) => c.charCodeAt(0))
	);
	const raw = JSON.stringify(data)
		.split('')
		.map((c) => c.charCodeAt(0));
	message.raw = new Uint8Array([...ids, ...raw, 247]);
}

export function bytesToString(bytes: Uint8Array): string[] {
	return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0').toUpperCase());
}

export function bytesToAscii(bytes: Uint8Array): string {
	return Array.from(bytes)
		.map((b) => {
			if (b < 33) return '•';
			return String.fromCharCode(b);
		})
		.join('');
}

export function downloadBank(messages: Message[]) {
	if (messages.length == 0) {
		return;
	}
	const binary: number[] = [];
	messages.forEach((m) => binary.push(...m.raw));
	console.log(binary);
	const byteArray = new Uint8Array(binary);
	const blob = new Blob([byteArray], { type: 'application/octet-stream' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.download = 'data.syx';
	a.href = url;
	a.click();
	window.URL.revokeObjectURL(url);
}

export function validateMessages(messages: Message[]) {
	messages.forEach((m, i) => {
		const message = Array.from(m.raw).map((v) => v.toString(16).padStart(2, '0'));
		const text = message.map((v: string) => String.fromCharCode(parseInt(v, 16))).join('');
		let command: Command;
		switch (true) {
			case text.substring(8, 18) == 'BankBackup':
				command = Command.BANK_BACKUP;
				break;
			case text.substring(7, 19) == 'PresetBackup':
				command = Command.PRESET_BACKUP;
				break;
			case text.includes('base') && i == 0:
				command = Command.PRESET;
				break;
			case messages[i - 1].command == Command.PRESET_BACKUP:
				command = Command.ACTIVE;
				break;
			case text.includes('base'):
				command = Command.PRESET;
				break;
			default:
				command = Command.UNKNOWN;
				break;
		}
		m.command = command;
	});
}
