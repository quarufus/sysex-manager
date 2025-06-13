export interface Message {
	id: number;
	timestamp: number;
	manufacturer: string;
	device: string;
	message: string;
	raw: string;
	data: Uint8Array;
}

export interface Filters {
	clock: boolean;
	sysex: boolean;
	note: boolean;
	after: boolean;
	cc: boolean;
	pc: boolean;
	pressure: boolean;
	bend: boolean;
}
