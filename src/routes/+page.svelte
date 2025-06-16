<script lang="ts">
	import { onMount } from 'svelte';
	import type { Filters, Message } from '$lib';
	import { getManufacturer } from '$lib';
	import { MessageRow } from '$lib';

	let selectedInput: string = $state('');
	let selectedOutput: string = $state('');
	let midiInputs: MIDIInput[] = $state([]);
	let midiOutputs: MIDIOutput[] = $state([]);
	let messages: Message[] = $state([]);
	let outgoingMessages: Message[] = $state([]);
	let idx: number = $state(0);

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
		const lines = msg.data[0] == 240 ? splitSysExData(msg.data) : [msg.data];
		lines.forEach((l) => {
			const s = Array.from(l).map((v) => v.toString(16).toUpperCase().padStart(2, '0'));
			console.log(s.slice(1, 4).join(' '));
			messages.push({
				id: idx,
				manufacturerId: s.slice(1, 4),
				manufacturer: getManufacturer(s.slice(1, 4)),
				modelId: s.slice(4, 6),
				data: s,
				raw: l
			});
			idx++;
		});
		scrollToBottom(element);
	}

	function sendSysEx() {
		let i = 0;
		const device = midiOutputs.find((d) => d.id == selectedOutput);
		const interval = setInterval(function () {
			if (device) {
				device.send(outgoingMessages[i].raw);
			}
			i++;
			if (i == outgoingMessages.length) {
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
		const buffer = await files[0].arrayBuffer();
		const bytes = new Uint8Array(buffer);
		outgoingMessages = [];
		const lines = splitSysExData(bytes);
		lines.forEach((l) => {
			const s = Array.from(l).map((v) => v.toString(16).padStart(2, '0'));
			outgoingMessages.push({
				id: idx + 1000,
				manufacturerId: s.slice(1, 4),
				manufacturer: getManufacturer(s.slice(1, 4)),
				modelId: s.slice(4, 6),
				data: s,
				raw: l
			});
			idx++;
		});
	}

	function splitSysExData(data: Uint8Array) {
		let index = 0;
		const array: Uint8Array[] = [];
		while (index < data.length) {
			const newIndex = data.indexOf(0xf7, index) + 1;
			const bytes: Uint8Array = data.slice(index, newIndex);
			array.push(bytes);
			index = newIndex;
		}
		return array;
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
	</div>
	<div class="overflow-auto border">
		<table class="w-full border-collapse">
			<thead>
				<tr class="border-b">
					<th class="w-[18%] border-r">Manufacturer</th>
					<th class="w-[18%] border-r border-l">Model ID</th>
					<th class="w-[18%] border-r border-l">Length</th>
					<th class="border-l">Preview</th>
				</tr>
			</thead>
			<tbody bind:this={tbody}>
				{#each outgoingMessages as msg (msg.id)}
					<MessageRow message={msg} />
				{/each}
			</tbody>
		</table>
	</div>
	<div class="win overflow-auto border text-wrap" id="in" bind:this={element}>
		<table class="w-full border-collapse" id="table">
			<thead class="sticky top-0">
				<tr class="border-t-0">
					<th class="w-[18%] border border-t-0 border-l-0">Manufacturer</th>
					<th class="w-[18%] border border-t-0">Model ID</th>
					<th class="w-[18%] border border-t-0">Length</th>
					<th class="border border-t-0 border-r-0">Preview</th>
				</tr>
			</thead>
			<tbody>
				{#each messages as msg (msg.id)}
					<MessageRow message={msg} />
				{/each}
			</tbody>
		</table>
	</div>
	<button onclick={sendSysEx}>Send</button>
	<button onclick={() => (messages = [])}>Clear</button>
</div>
