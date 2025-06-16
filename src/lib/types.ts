export interface Message {
	id: number;
	manufacturerId: string[];
	manufacturer: string;
	modelId: string[];
	data: string[];
	raw: Uint8Array;
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
