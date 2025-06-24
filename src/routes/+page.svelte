<script lang="ts">
	import { onMount } from 'svelte';
	import type { Filters, Message } from '$lib';
	import { getManufacturer, toggleThemeValues } from '$lib';
	import { MessageRow, Select, Settings, Circle, Dialog } from '$lib';

	let selectedInput: string = $state('');
	let selectedOutput: string = $state('');
	let midiInputs: MIDIInput[] = $state([]);
	let midiOutputs: MIDIOutput[] = $state([]);
	let messages: Message[] = $state([]);
	let outgoingMessages: Message[] = $state([]);
	let idx: number = $state(0);
	const bankpresetIn = $state({ bank: '', preset: 0 });
	let filename = $state('');
	let dark: boolean = $state(false);

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
		if (
			localStorage.theme ||
			(!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
		) {
			dark = true;
		}

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
			const end = s[1] == '00' ? 4 : 2;
			messages.push({
				id: idx,
				manufacturerId: s.slice(1, 4),
				manufacturer: getManufacturer(s.slice(1, end)),
				modelId: s.slice(end, end + 2),
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

		const now = performance.now();

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
		filename = files[0].name;
		const buffer = await files[0].arrayBuffer();
		const bytes = new Uint8Array(buffer);
		outgoingMessages = [];
		const lines = splitSysExData(bytes);
		let bank = '';
		let preset = 0;
		lines.forEach((l) => {
			const s = Array.from(l).map((v) => v.toString(16).padStart(2, '0'));
			const end = s[1] == '00' ? 4 : 2;
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
				manufacturer: getManufacturer(s.slice(1, end)),
				modelId: s.slice(end, end + 2),
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
		const end = message[1] == '00' ? 4 : 2;
		return {
			id: idx + 1000,
			manufacturerId: message.slice(1, 4),
			manufacturer: getManufacturer(message.slice(1, end)),
			modelId: message.slice(end, end + 2),
			bankpreset: '',
			data: message,
			raw: raw
		};
	}

	function changeTheme() {
		dark = !dark;
		document.documentElement.classList.toggle('dark', dark);
		localStorage.theme = dark ? 'dark' : '';
		toggleThemeValues(dark);
	}

	const scrollToBottom = (node: HTMLDivElement) => {
		if (node.scrollHeight) {
			node.scrollTop = node.scrollHeight;
		}
	};
</script>

<div class="flex items-center justify-between p-4">
	<h1 class="text-2xl">Sysex Manager</h1>
	<div class="flex">
		<button
			class="h-min"
			onclick={() => {
				dialog.showModal();
			}}><Settings class="hover:fill-background" /></button
		>
		<button
			class="hover:bg-background"
			onclick={() => {
				changeTheme();
			}}
			><Circle class={dark ? 'hover:fill-background' : 'fill-background hover:fill-text'} /></button
		>
	</div>
</div>
<br />
<br />
<div class="m-4 my-2.5 grid h-[80vh] grid-cols-2 grid-rows-[min-content_auto_min-content] gap-8">
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
		<Select
			onValueChange={onOutputChange}
			items={midiOutputs.map((d) => ({ value: d.id, label: d.name ?? '' }))}
			bind:value={selectedOutput}
			type="single"
			placeholder="Choose MIDI out device"
		/>
		<input
			class="h-min w-[197px] cursor-pointer hover:bg-yellow-300"
			bind:files
			onchange={loadFile}
			type="file"
			id="file_input"
			hidden
		/>
		<div class="flex items-baseline">
			<label id="file" for="file_input">Open File</label>
			<p>{filename}</p>
		</div>
	</div>
	<div class="flex justify-between">
		<Select
			onValueChange={onInputChange}
			items={midiInputs.map((d) => ({ value: d.id, label: d.name ?? '' }))}
			bind:value={selectedInput}
			type="single"
			placeholder="Choose MIDI in device"
		/>
		<button
			class="hover:bg-text hover:text-background w-min"
			onclick={() => {
				messages = [];
			}}>Clear</button
		>
	</div>
	<div class="border-shade view overflow-auto rounded-sm border">
		<table class="w-full border-separate border-spacing-0">
			<thead class="bg-background sticky top-0 shadow-[inset_0_-1px_0_var(--shade)]">
				<tr class="[&>*]:border-shade">
					<th class="w-[5%] border-r pl-1 text-left">#</th>
					<th class="w-[18%] border-r pl-1 text-left">Manufacturer</th>
					<th class="w-[10%] border-r pl-1 text-left">Model ID</th>
					<th class="w-[5%] border-r pl-1 text-left">B/P</th>
					<th class="w-[18%] border-r pl-1 text-left">Name</th>
					<th class="border-r pl-1 text-left">Command</th>
					<th class="w-[10%] pl-1 text-left">Length</th>
				</tr>
			</thead>
			<tbody>
				{#each outgoingMessages as msg, i (msg.id)}
					<MessageRow message={msg} position={i} />
				{/each}
			</tbody>
		</table>
	</div>
	<div
		class="win border-shade view overflow-auto rounded-sm border text-wrap"
		id="in"
		bind:this={element}
	>
		<table class="w-full border-separate border-spacing-0" id="table">
			<thead class="bg-background sticky top-0 shadow-[inset_0_-1px_0_var(--shade)]">
				<tr class="[&>*]:border-shade border-t-0">
					<th class="w-[5%] border-r pl-1 text-left">#</th>
					<th class="w-[18%] border-r pl-1 text-left">Manufacturer</th>
					<th class="w-[10%] border-r pl-1 text-left">Model ID</th>
					<th class="w-[5%] border-r pl-1 text-left">B/P</th>
					<th class="w-[18%] border-r pl-1 text-left">Name</th>
					<th class="border-r pl-1 text-left">Command</th>
					<th class="w-[10%] pl-1 text-left">Length</th>
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
			class="hover:bg-text hover:text-background"
			onclick={() => {
				custom.showModal();
			}}>Create Command</button
		>
		<button
			class="hover:bg-text hover:text-background"
			onclick={() => {
				sendSysEx();
			}}>Send</button
		>
	</div>
</div>

<Dialog bind:dialog
	>{#snippet content()}
		<div class="flex justify-between">
			<label for="pause">Pause between messages</label>
			<div>
				<input class="bg-shade border-0 text-right" type="number" bind:value={pause} />ms
			</div>
		</div>
		<div class="flex justify-between">
			<p>0</p>
			<input type="range" name="pause" min="0" max="5000" bind:value={pause} />
			<p>5000</p>
		</div>
	{/snippet}</Dialog
>

<Dialog
	bind:dialog={custom}
	actionText="Ok"
	actionCallback={() => {
		custom.close();
		if (custom_cmd.length > 0)
			outgoingMessages.push(
				parseMessage(Uint8Array.from(custom_cmd.split(' ').map((v) => parseInt(v, 16))))
			);
	}}
>
	{#snippet content()}
		<textarea class="bg-shade h-32 w-full" bind:value={custom_cmd} spellcheck="false"></textarea>
	{/snippet}
</Dialog>
