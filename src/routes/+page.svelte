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
	const bankpresetIn = $state({ bank: '@', preset: 0 });

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
	let custom_cmd: string = $state('');
	let files: FileList | null = $state(null);
	let element!: HTMLDivElement;
	let dialog!: HTMLDialogElement;
	let custom!: HTMLDialogElement;

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
		midiOutputs[0].open().catch((error: unknown) => {
			console.error(error);
		});

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
			// return;
		}
		const lines = msg.data[0] == 240 ? splitSysExData(msg.data) : [msg.data];
		lines.forEach((l) => {
			const s = Array.from(l).map((v) => v.toString(16).toUpperCase().padStart(2, '0'));
			const text = s.map((v: string) => String.fromCharCode(parseInt(v, 16))).join('');
			if (text.substring(8, 18) == 'BankBackup') {
				bankpresetIn.bank = String.fromCharCode(parseInt(text.substring(20, 21)) + 65);
				bankpresetIn.preset = 0;
			} else {
				bankpresetIn.preset++;
			}
			messages.push({
				id: idx,
				manufacturerId: s.slice(1, 4),
				manufacturer: getManufacturer(s.slice(1, 4)),
				modelId: s.slice(4, 6),
				bankpreset: `${bankpresetIn.bank}${bankpresetIn.preset > 0 ? bankpresetIn.preset.toString() : ''}`,
				data: s,
				raw: l
			});
			idx++;
		});
		scrollToBottom(element);
	}

	function sendSysEx() {
		const device = midiOutputs.find((d) => d.id == selectedOutput);
		if (outgoingMessages.length == 0) {
			return;
		}
		// let i = 0;
		// const interval = setInterval(() => {
		// 	if (device) {
		// 		try {
		// 			device.send(outgoingMessages[i].raw);
		// 		} catch (e) {
		// 			console.log(e);
		// 		}
		// 	}
		// 	i++;
		// 	if (i == outgoingMessages.length) {
		// 		clearInterval(interval);
		// 	}
		// }, pause);

		const now = performance.now();
		// const cut = [];
		// for (const message of outgoingMessages) {
		// 	let index = 0;
		// 	const data = message.raw.slice(1, -1);
		// 	while (index < message.raw.length) {
		// 		cut.push([0xf0, ...data.slice(index, index + 1022), 0xf7]);
		// 		index += 1022;
		// 	}
		// }
		// console.log(cut.length);
		// for (let i = 0; i < cut.length; i++) {
		// 	const timestamp = now + i * pause;
		// 	if (device) {
		// 		device.send(cut[i], timestamp);
		// 	}
		// }

		for (let i = 0; i < outgoingMessages.length; i++) {
			const timestamp = now + i * pause;
			if (device) {
				if (pause == 0) {
					device.send(Array.from(outgoingMessages[i].raw));
				} else {
					device.send(outgoingMessages[i].raw, timestamp);
				}
			}
		}
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

	function onOutputChange() {
		const device = midiOutputs.find((d) => d.id == selectedOutput);
		if (device) {
			device.open().catch((error: unknown) => {
				console.error(error);
			});
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
		let bank = '';
		let preset = 0;
		lines.forEach((l) => {
			const s = Array.from(l).map((v) => v.toString(16).padStart(2, '0'));
			const text = s.map((v: string) => String.fromCharCode(parseInt(v, 16))).join('');
			if (text.substring(8, 18) == 'BankBackup') {
				bank = String.fromCharCode(parseInt(text.substring(20, 21)) + 65);
				preset = 0;
			} else {
				preset++;
			}
			outgoingMessages.push({
				id: idx + 1000,
				manufacturerId: s.slice(1, 4),
				manufacturer: getManufacturer(s.slice(1, 4)),
				modelId: s.slice(4, 6),
				bankpreset: `${bank}${preset ? preset.toString() : ''}`,
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

	function parseMessage(raw: Uint8Array): Message {
		const message = Array.from(raw).map((v) => v.toString(16).padStart(2, '0'));
		idx++;
		return {
			id: idx + 1000,
			manufacturerId: message.slice(1, 4),
			manufacturer: getManufacturer(message.slice(1, 4)),
			modelId: message.slice(4, 6),
			bankpreset: '',
			data: message,
			raw: raw
		};
	}

	const scrollToBottom = (node: HTMLDivElement) => {
		if (node.scrollHeight) {
			node.scrollTop = node.scrollHeight;
		}
	};
</script>

<div class="flex items-center justify-between p-4">
	<h1 class="text-2xl">Sysex Manager</h1>
	<button
		class="h-min"
		onclick={() => {
			dialog.showModal();
		}}>Prefferences</button
	>
</div>
<div class="m-4 my-2.5 grid h-[80vh] grid-cols-2 grid-rows-[min-content_auto_min-content] gap-2.5">
	<!--
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
	-->
	<div class="flex items-center justify-between">
		<form class="w-full">
			<label for="device_out" id="device_out">MIDI out device</label>
			<select
				class="w-2/3"
				bind:value={selectedOutput}
				onchange={onOutputChange}
				name="device_out"
				id="select_out"
			>
				{#each midiOutputs as device (device.id)}
					<option value={device.id}>{device.name}</option>
				{/each}
			</select>
		</form>
		<!-- <label class="inline-block cursor-pointer" for="file_input">Open File</label> -->
		<input
			class="inline-block h-min w-[197px] cursor-pointer hover:bg-yellow-300"
			bind:files
			onchange={loadFile}
			type="file"
			id="file_input"
		/>
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
			<thead class="sticky top-0 bg-[#f9f4f9] shadow-[inset_0_-1px_0_black]">
				<tr class="">
					<th class="w-[4%] border-r shadow-[1px_0_0_black]">#</th>
					<th class="w-[18%] border-r border-l shadow-[1px_0_0_black]">Manufacturer</th>
					<th class="w-[10%] border-r border-l shadow-[1px_0_0_black]">Model ID</th>
					<th class="w-[10%] border-r border-l shadow-[1px_0_0_black]">Length</th>
					<th class="w-[5%] border-r border-l shadow-[1px_0_0_black]">B/P</th>
					<th class="w-[18%] border-r border-l shadow-[1px_0_0_black]">Name</th>
					<th class="border-l">Command</th>
				</tr>
			</thead>
			<tbody>
				{#each outgoingMessages as msg, i (msg.id)}
					<MessageRow message={msg} position={i} />
				{/each}
			</tbody>
		</table>
	</div>
	<div class="win overflow-auto border text-wrap" id="in" bind:this={element}>
		<table class="w-full border-collapse" id="table">
			<thead class="sticky top-0 bg-[#f9f4f9] shadow-[inset_0_-1px_0_black]">
				<tr class="border-t-0">
					<th class="w-[4%] border-r shadow-[1px_0_0_black]">#</th>
					<th class="w-[18%] border-r shadow-[1px_0_0_black]">Manufacturer</th>
					<th class="w-[10%] border-r shadow-[1px_0_0_black]">Model ID</th>
					<th class="w-[10%] border-r border-l shadow-[1px_0_0_black]">Length</th>
					<th class="w-[5%] border-r border-l shadow-[1px_0_0_black]">B/P</th>
					<th class="w-[18%] border-r border-l shadow-[1px_0_0_black]">Name</th>
					<th class="border-l">Command</th>
				</tr>
			</thead>
			<tbody>
				{#each messages as msg, i (msg.id)}
					<MessageRow message={msg} position={i} />
				{/each}
			</tbody>
		</table>
	</div>
	<div>
		<button
			onclick={() => {
				custom.showModal();
			}}>Custom</button
		>
		<button
			onclick={() => {
				sendSysEx();
			}}>Send</button
		>
	</div>
	<button
		onclick={() => {
			messages = [];
		}}>Clear</button
	>
</div>

<dialog bind:this={dialog} class="mx-auto mt-16 w-1/3 px-4 pb-4">
	<div class="sticky top-0 border-b-2 bg-white pt-4">
		<div class="flex justify-end">
			<button
				onclick={() => {
					dialog.close();
				}}>Close</button
			>
		</div>
	</div>
	<br />
	<div class="flex justify-between">
		<label for="pause">Pause between messages</label>
		<div><input class="border-0 text-right" type="number" bind:value={pause} />ms</div>
	</div>
	<div class="flex justify-between">
		<p>0</p>
		<input type="range" name="pause" min="0" max="5000" bind:value={pause} />
		<p>5000</p>
	</div>
</dialog>

<dialog bind:this={custom} class="mx-auto mt-16 w-1/3 px-4 pb-4">
	<div class="sticky top-0 border-b-2 bg-white pt-4">
		<div class="flex justify-end">
			<button
				onclick={() => {
					custom.close();
				}}>Close</button
			>
		</div>
	</div>
	<input type="text" bind:value={custom_cmd} autocorrect="off" spellcheck="false" />
	<button
		onclick={() => {
			custom.close();
			outgoingMessages.push(
				parseMessage(Uint8Array.from(custom_cmd.split(' ').map((v) => parseInt(v, 16))))
			);
		}}>Ok</button
	>
</dialog>
