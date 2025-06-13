<script lang="ts">
	import { onMount } from 'svelte';
	import { messageStatus } from '$lib';
	import type { Filters, Message } from '$lib';

	let selectedInput: string = $state('');
	let selectedOutput: string = $state('');
	let midiInputs: MIDIInput[] = $state([]);
	let midiOutputs: MIDIOutput[] = $state([]);
	let messages: Message[] = $state([]);
	let idx: number = $state(0);
	let textarea: string = $state('');

	const filters: Filters = $state({
		clock: false,
		sysex: true,
		note: true,
		after: true,
		cc: true,
		pc: true,
		pressure: true,
		bend: true
	});

	let pause: number = $state(0);
	let files: FileList | null = $state(null);
	let element!: HTMLDivElement;
	let tbody!: HTMLTableSectionElement;

	onMount(() => {
		navigator
			.requestMIDIAccess({ sysex: true })
			.then(handleMIDI)
			.catch((error: unknown) => {
				console.error(error);
			});
	});

	function handleMIDI(access: MIDIAccess) {
		midiInputs = Array.from(access.inputs.values());
		midiOutputs = Array.from(access.outputs.values());
		selectedInput = midiInputs[0].id;
		selectedOutput = midiOutputs[0].id;
		midiInputs[0].onmidimessage = handleMIDIMessage;

		access.onstatechange = () => {
			midiInputs = Array.from(access.inputs.values());
			midiOutputs = Array.from(access.outputs.values());
		};
	}

	function handleMIDIMessage(msg: MIDIMessageEvent) {
		if (!msg.data) {
			return;
		}
		const status = msg.data[0];
		if (status == 248 && !filters.clock) {
			return;
		}
		if ((status == 240 || status == 247) && !filters.sysex) {
			return;
		}
		if (status >= 128 && status <= 159 && !filters.note) {
			return;
		}
		if (status >= 160 && status <= 175 && !filters.after) {
			return;
		}
		if (status >= 176 && status <= 191 && !filters.cc) {
			return;
		}
		if (status >= 192 && status <= 207 && !filters.pc) {
			return;
		}
		if (status >= 208 && status <= 223 && !filters.pressure) {
			return;
		}
		if (status >= 224 && status <= 239 && !filters.bend) {
			return;
		}

		const device = midiInputs.find((d) => d.id == selectedInput);
		if (!device?.manufacturer || !device.name) {
			return;
		}
		idx++;
		const s: string[] = [];
		msg.data.forEach((v) => s.push(v.toString(16).toUpperCase().padStart(2, '0')));
		messages.push({
			id: idx,
			timestamp: msg.timeStamp,
			manufacturer: device.manufacturer,
			device: device.name,
			message: messageStatus(msg),
			raw: s.join(' '),
			data: msg.data
		});
		scrollToBottom(element);
	}

	function sendInput() {
		/* const data = textarea
			.replaceAll('\n', ' ')
			.split(' ')
			.map((c) => parseInt(c, 16)); */
		let i = 0;
		const device = midiOutputs.find((d) => d.id == selectedOutput);
		const lines = textarea.split('\n');
		const interval = setInterval(function () {
			const data = lines[i].split(' ').map((c) => parseInt(c, 16));
			if (device) {
				device.send(data);
			}
			i++;
			if (i == lines.length) {
				clearInterval(interval);
			}
		}, pause / 10);
	}

	function onInputChange() {
		midiInputs.forEach((input) => {
			input.onmidimessage = null;
		});
		const device = midiInputs.find((d) => d.id == selectedInput);
		if (device) {
			device.onmidimessage = handleMIDIMessage;
		}
	}

	async function loadFile() {
		if (!files) {
			return;
		}
		const text = await files[0].bytes();
		const hex = [];
		for (const c of text) {
			hex.push(c.toString(16).toUpperCase().padStart(2, '0'));
		}
		textarea = hex.join(' ').replaceAll('F7 ', 'F7\n');
		const msgLengths = [];
		while (hex.length > 0) {
			msgLengths.push(hex.splice(0, hex.indexOf('F7') + 1).length);
		}
		//console.log(msgLengths);
	}

	function downloadMessage(msg: Uint8Array) {
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

	function onKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			console.log('lala');
		}
	}

	const scrollToBottom = (node: HTMLDivElement) => {
		node.scrollTop = node.scrollHeight;
	};
</script>

<h1 class="m-4 text-2xl">Sysex Manager</h1>
<div
	class="m-4 my-2.5 grid h-[80vh] grid-cols-2 grid-rows-[min-content_min-content_auto_min-content] gap-2.5"
>
	<div></div>
	<div>
		<input type="checkbox" id="clock" name="clock" bind:checked={filters.clock} />
		<label for="clock">Clock</label>
		<input type="checkbox" id="onoff" name="onoff" bind:checked={filters.note} />
		<label for="onoff">Note On/Off</label>
		<input type="checkbox" id="after" name="after" bind:checked={filters.after} />
		<label for="after">Aftertouch</label>
		<input type="checkbox" id="cc" name="cc" bind:checked={filters.cc} />
		<label for="cc">Control Change</label>
		<input type="checkbox" id="pc" name="pc" bind:checked={filters.pc} />
		<label for="pc">Program Change</label>
		<input type="checkbox" id="pressure" name="pressure" bind:checked={filters.pressure} />
		<label for="pressure">Channel Pressure</label>
		<input type="checkbox" id="bend" name="bend" bind:checked={filters.bend} />
		<label for="bend">Pitch Bend</label>
		<input type="checkbox" id="sysex" name="sysex" bind:checked={filters.sysex} />
		<label for="sysex">SysEx</label>
		<input type="range" name="pause" min="0" max="1000" bind:value={pause} />
		<label for="pause">Pause between messages</label>
	</div>
	<div class="flex justify-between">
		<form>
			<label for="device_out" id="device_out">MIDI out device</label>
			<select class="w-2/3" bind:value={selectedOutput} name="device_out" id="select_out">
				{#each midiOutputs as device (device.id)}
					<option value={device.id}>{device.name}</option>
				{/each}
			</select>
		</form>
		<input bind:files onchange={loadFile} type="file" id="file_input" />
	</div>
	<div class="flex justify-between">
		<form>
			<label for="device" id="device"
				>MIDI in device
				<select bind:value={selectedInput} onchange={onInputChange} name="device" id="select">
					{#each midiInputs as device (device.id)}
						<option value={device.id}>{device.name}</option>
					{/each}
				</select></label
			>
		</form>
		<!-- <button onclick={downloadMessage} id="download">Download last message</button> -->
	</div>
	<!-- <div class="win"> -->
	<textarea
		class="resize-none overflow-auto whitespace-nowrap"
		id="t"
		bind:value={textarea}
		onkeydown={onKeyDown}
	>
	</textarea>
	<!-- </div> -->
	<div class="win overflow-auto border text-wrap" id="in" bind:this={element}>
		<table class="w-full border-collapse" id="table">
			<thead class="sticky top-0">
				<tr class="border-t-0">
					<th class="border border-t-0 border-l-0" style="width: 15%;">Timestamp</th>
					<th class="border border-t-0" style="width: 20%;">Manufacturer</th>
					<th class="border border-t-0" style="width: 10%;">Device</th>
					<th class="border border-t-0" style="width: 30%;">Message</th>
					<th class="border border-t-0 border-r-0" style="width: 25%;">Raw</th>
				</tr>
			</thead>
			<tbody bind:this={tbody}>
				{#each messages as msg (msg.id)}
					<tr class="last:border-b-0">
						<td class="border border-l-0">{msg.timestamp}</td>
						<td class="border">{msg.manufacturer}</td>
						<td class="border">{msg.device}</td>
						<td class="border">{msg.message}</td>
						<td class="border border-r-0 p-2"
							><div class="flex justify-between">
								{msg.raw}<button
									class="cursor-grab border"
									onclick={() => {
										downloadMessage(msg.data);
									}}>dl</button
								>
							</div></td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<button onclick={sendInput}>Send</button>
	<button onclick={() => (messages = [])}>Clear</button>
</div>
