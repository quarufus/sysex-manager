export interface Message {
	id: number;
	manufacturerId: string[];
	manufacturer: string;
	model: string;
	bankpreset: string;
	name: string;
	data: string[];
	raw: Uint8Array;
}

export interface Bank {
	id: number;
	name: string;
	presets: Preset[];
}

export interface Preset {
	id: number;
	name: string;
	base: string;
	mod_wheel: string;
	velocity: string;
	aftertouch: string;
	cc_74: string;
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
