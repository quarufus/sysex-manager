<script lang="ts">
	import { onMount } from 'svelte';
	import type { Filters, Message } from '$lib';
	import { downloadBank, getInfo, getManufacturer } from '$lib';
	import { Settings, Circle, Orderable } from '$lib';
	import * as Select from '$lib/components/ui/select/index';
	import { Button, buttonVariants } from '$lib/components/ui/button/index';
	import { Input } from '$lib/components/ui/input/index';
	import { Label } from '$lib/components/ui/label';
	import * as Dialog from '$lib/components/ui/dialog/index';
	import { Textarea } from '$lib/components/ui/textarea/index';
	import { Slider } from '$lib/components/ui/slider/index';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index';
	import * as Table from '$lib/components/ui/table/index';
	import Load from '$lib/icons/Load.svelte';
	import { ArtemisMessage } from '$lib/schema';
	import { default as MyAlert } from '$lib/ui/Alert.svelte';
	import { AlertType, displayAlert } from '$lib/stores/alert';
	import { toggleMode } from 'mode-watcher';
	import Icon from '@iconify/svelte';
	import z from 'zod/v4';

	let selectedInput: string = $state('');
	let selectedOutput: string = $state('');
	let midiInputs: MIDIInput[] = $state([]);
	let midiOutputs: MIDIOutput[] = $state([]);
	let messages: Message[] = $state([]);
	let outgoingMessages: Message[] = $state([]);
	let idx: number = $state(0);
	const bankpresetIn = $state({ bank: '', preset: 0 });
	let dark: boolean = $state(false);
	const outTrigger = $derived(
		midiOutputs.find((d) => d.id === selectedOutput)?.name ?? 'Choose MIDI out device'
	);
	const inTrigger = $derived(
		midiInputs.find((d) => d.id === selectedInput)?.name ?? 'Choose MIDI in device'
	);
	let sendStatus: string = $state('Send');

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
	let customCmd: string = $state('');
	let files: FileList | undefined = $state();
	let element!: HTMLDivElement;

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
			if (getManufacturer(msg.data) == 'Unknown Manufacturer') {
				return;
			}
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
			console.log(l);
			const [manufacturer, model] = getInfo(l);
			messages.push({
				id: idx,
				manufacturer: manufacturer,
				model: model,
				bankpreset: `${bankpresetIn.bank}${bankpresetIn.preset > 0 ? bankpresetIn.preset.toString() : ''}`,
				name: '',
				data: s,
				raw: l
			});
			idx++;
		});
		scrollToBottom(element);
	}

	function sendSysEx() {
		const device = midiOutputs.find((d) => d.id == selectedOutput);
		if (!selectedOutput) {
			displayAlert('Choose a MIDI out device to send data.');
			return;
		}
		if (outgoingMessages.length == 0) {
			displayAlert('There are no messages to send.');
			return;
		}

		const parsed = outgoingMessages.map((m) => {
			const text = m.data
				.map((v: string) => String.fromCharCode(parseInt(v, 16)))
				.join('')
				.slice(6, -1);
			return JSON.parse(text);
		});

		const result = ArtemisMessage.safeParse(parsed);

		if (result.error) {
			const tree = z.treeifyError(result.error);
			console.log(result.error.issues);
			const errors = tree.errors;
			displayAlert('Error', errors.join('\n'), AlertType.ERROR);
			return;
		}

		sendStatus = 'Sending';

		//const now = performance.now();

		/*
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
		*/

		let i = 0;
		setTimeout(function run() {
			if (device) device.send(outgoingMessages[i].raw);
			if (i == outgoingMessages.length - 1) {
				sendStatus = 'Send';
				return;
			}
			i++;
			setTimeout(run, pause);
		}, pause);
	}

	$effect(() => {
		midiInputs.forEach((input) => {
			input.onmidimessage = null;
		});
		const device = midiInputs.find((d) => d.id == selectedInput);
		if (device) {
			device.onmidimessage = handleMIDIMessage;
		}
	});

	$effect(() => {
		const device = midiOutputs.find((d) => d.id == selectedOutput);
		if (device) {
			device.open().catch((error: unknown) => {
				console.error(error);
			});
		}
	});

	async function loadFile() {
		if (!files) {
			return;
		}
		const buffer = await files[0].arrayBuffer();
		const bytes = new Uint8Array(buffer);
		outgoingMessages = [];
		if (bytes[0] != 240 || bytes[bytes.length - 1] != 247) {
			displayAlert('Warning', 'File does not contain SysEx messages', AlertType.WARN);
			return;
		}
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
			const [manufacturer, model] = getInfo(l);
			outgoingMessages.push({
				id: idx + 1000,
				manufacturer: manufacturer,
				model: model,
				name: text.substring(15, 18),
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
		const text = message.map((v: string) => String.fromCharCode(parseInt(v, 16))).join('');
		idx++;
		let bank = '';
		if (text.substring(8, 18) == 'BankBackup') {
			bank = String.fromCharCode(parseInt(text.substring(20, 21)) + 65);
		}
		const [manufacturer, model] = getInfo(raw);
		return {
			id: idx + 1000,
			manufacturer: manufacturer,
			model: model,
			name: '',
			bankpreset: bank,
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
	<div class="flex items-center gap-4">
		<Select.Root type="single" bind:value={selectedOutput} name="MIDI out">
			<Select.Trigger>
				{outTrigger}
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					<Select.Label>Choose MIDI out device</Select.Label>
					{#each midiOutputs as device (device.id)}
						<Select.Item value={device.id} label={device.name ?? ''}>{device.name}</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>
		<Select.Root type="single" bind:value={selectedInput} name="MIDI in">
			<Select.Trigger>
				{inTrigger}
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					<Select.Label>Choose MIDI in device</Select.Label>
					{#each midiInputs as device (device.id)}
						<Select.Item value={device.id} label={device.name ?? ''}>{device.name}</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>
		<Dialog.Root>
			<Dialog.Trigger><Settings /></Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>Settings</Dialog.Header>
				<div class="flex justify-between">
					<Label>Pause between messages</Label>
					<Input class="w-min text-right" type="number" bind:value={pause} />
				</div>
				<Slider type="single" bind:value={pause} max={5000} step={1} />
			</Dialog.Content>
		</Dialog.Root>

		<button class="size-6 px-0" onclick={toggleMode}>
			<Circle class={dark ? 'hover:fill-background' : 'fill-background hover:fill-foreground'} />
		</button>
	</div>
</div>
<br />
<br />
<div class="m-4 my-2.5 grid h-[80vh] grid-cols-2 grid-rows-[min-content_auto] gap-8">
	<div class="flex items-end justify-between">
		<div class="flex items-end gap-4">
			<div class="grid w-full max-w-sm items-center gap-1.5">
				<label for="file">Open File</label>
				<Input id="file" type="file" accept=".syx" bind:files onchange={loadFile} />
			</div>
			<Dialog.Root>
				<Dialog.Trigger class={buttonVariants({ variant: 'default' })}
					>Create Command</Dialog.Trigger
				>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>Create Command</Dialog.Title>
						<Dialog.Description
							>Create custom sysex commands to send to your device.</Dialog.Description
						>
					</Dialog.Header>
					<Textarea placeholder="Type your command here." bind:value={customCmd} />
					<Dialog.Footer>
						<Dialog.Close>
							<Button
								type="submit"
								onclick={() => {
									outgoingMessages.push(
										parseMessage(Uint8Array.from(customCmd.split(' ').map((v) => parseInt(v, 16))))
									);
								}}>Add command</Button
							>
						</Dialog.Close>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>
			<Button
				onclick={() => {
					downloadBank(outgoingMessages);
				}}><Icon icon="lucide:download" width="24" height="24" /></Button
			>
			<Button
				onclick={() => {
					outgoingMessages = [];
				}}>Clear</Button
			>
		</div>
		<Button
			disabled={sendStatus == 'Sending'}
			class="hover:bg-text hover:text-background"
			onclick={() => {
				sendSysEx();
			}}
		>
			{#if sendStatus == 'Send'}
				{sendStatus} -&gt;
			{:else}
				{sendStatus} <Load class="animate-spin" />
			{/if}
		</Button>
	</div>
	<div class="flex items-end justify-between">
		<Button
			onclick={() => {
				outgoingMessages = messages;
			}}>&lt;- Copy Over</Button
		>
		<Button
			class="hover:bg-text hover:text-background w-min"
			onclick={() => {
				messages = [];
			}}>Clear</Button
		>
	</div>
	<div class="border-shade view overflow-auto rounded-sm border">
		<ScrollArea class="h-full">
			<Orderable items={outgoingMessages} />
		</ScrollArea>
	</div>
	<div
		class="win border-shade view overflow-auto rounded-sm border text-wrap"
		id="in"
		bind:this={element}
	>
		<ScrollArea class="h-full">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>#</Table.Head>
						<Table.Head>Manufacturer</Table.Head>
						<Table.Head>Model</Table.Head>
						<Table.Head>B/P</Table.Head>
						<Table.Head>Name</Table.Head>
						<Table.Head>Command</Table.Head>
						<Table.Head>Length</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each messages as item, index (item.id)}
						<Table.Row>
							<Table.Cell>{index}</Table.Cell>
							<Table.Cell>{item.manufacturer}</Table.Cell>
							<Table.Cell>{item.model}</Table.Cell>
							<Table.Cell>{item.bankpreset}</Table.Cell>
							<Table.Cell>{item.name}</Table.Cell>
							<Table.Cell>{item.data.slice(0, 10)}</Table.Cell>
							<Table.Cell class="text-right font-mono">{item.raw.length}</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</ScrollArea>
	</div>
</div>

<MyAlert />
