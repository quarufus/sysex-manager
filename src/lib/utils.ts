export function messageStatus(message: MIDIMessageEvent) {
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
	}
}
