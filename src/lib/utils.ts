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

export function toggleThemeValues(dark: boolean) {
	const style = document.documentElement.style;
	if (dark) {
		// style.setProperty('--bg', 'oklch(0.2157 0.0075 99.62)');
		style.setProperty('--bg', 'oklch(0.1 0 0)');
		style.setProperty('--fg', 'oklch(0.8546 0.0176 99.62)');
		style.setProperty('--shade', 'oklch(0.3086 0.0176 99.62)');
	} else {
		style.setProperty('--bg', 'oklch(0.8986 0.0176 99.62)');
		style.setProperty('--fg', 'oklch(0.1667 0.0163 102.15)');
		style.setProperty('--shade', 'oklch(0.7893 0.0176 99.62)');
	}
	style.setProperty('--accent', 'oklch(0.7062 0.1469 77.98)');
}
