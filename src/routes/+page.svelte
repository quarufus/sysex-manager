<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { Message } from '$lib';
	import { Command, downloadBank, getInfo, getManufacturer } from '$lib';
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
	import { BankBackup, PresetBackup } from '$lib/schema';
	import { default as MyAlert } from '$lib/ui/Alert.svelte';
	import { AlertType, displayAlert } from '$lib/stores/alert';
	import { toggleMode } from 'mode-watcher';
	import Icon from '@iconify/svelte';
	import { bytesToString } from '$lib';

	let selectedInput: string = $state('');
	let selectedOutput: string = $state('');
	let midiInputs: MIDIInput[] = $state([]);
	let midiOutputs: MIDIOutput[] = $state([]);
	let messages: Message[] = $state([]);
	let outgoingMessages: Message[] = $state([]);
	let idx: number = $state(0);
	let dark: boolean = $state(false);
	const outTrigger = $derived(
		midiOutputs.find((d) => d.id === selectedOutput)?.name ?? 'Choose MIDI out device'
	);
	const inTrigger = $derived(
		midiInputs.find((d) => d.id === selectedInput)?.name ?? 'Choose MIDI in device'
	);
	let sendStatus: string = $state('Send');
	let loading: boolean = $state(false);

	let pause: number = $state(0);
	let customCmd: string = $state('');
	let files: FileList | undefined = $state();

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

		const device = midiInputs.find((d) => d.id == selectedInput);
		if (!device?.manufacturer || !device.name) {
			if (getManufacturer(msg.data) == 'Unknown Manufacturer') {
				return;
			}
		}

		const lines = msg.data[0] == 240 ? splitSysExData(msg.data) : [msg.data];
		lines.forEach((l, i) => {
			messages.push(parseMessage(l, messages[i - 1]));
			idx++;
		});
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

		if (outgoingMessages[0].command == Command.BANK_BACKUP && outgoingMessages.length != 65) {
			displayAlert('A Bank Backup command needs to include 64 presets.');
			return;
		}

		const strings: string[] = outgoingMessages.map((m: Message) =>
			m.data
				.map((v: string) => String.fromCharCode(parseInt(v, 16)))
				.join('')
				.slice(6, -1)
		);

		const objects = strings.map((s) => {
			try {
				return JSON.parse(s);
			} catch (e) {
				console.error(e);
			}
		});

		let result;
		if (strings[0].includes('BankBackup')) {
			result = BankBackup.safeParse(objects);
			if (result.error) {
				displayAlert('Error', result.error.message, AlertType.ERROR);
			}
		} else if (strings[0].includes('PresetBackup')) {
			result = PresetBackup.safeParse(objects);
			if (result.error) {
				displayAlert('Error', 'The preset has missing or invalid values', AlertType.ERROR);
			}
		}

		sendStatus = 'Sending';

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

	async function loadFile(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		outgoingMessages = [];
		loading = true;
		await tick();

		try {
			const content = await readFile(file);
			const bytes = new Uint8Array(content);
			if (bytes[0] != 240 || bytes[bytes.length - 1] != 247) {
				displayAlert('Warning', 'File does not contain SysEx messages', AlertType.WARN);
				return;
			}
			const lines = splitSysExData(bytes);
			lines.forEach((l) => {
				outgoingMessages.push(parseMessage(l, outgoingMessages[0]));
				idx++;
			});
		} catch (error) {
			console.error('Error loading file:', error);
			loading = false;
		} finally {
			loading = false;
		}
	}

	function readFile(file: File): Promise<ArrayBuffer> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = () => {
				resolve(reader.result as ArrayBuffer);
			};
			reader.onerror = () => {
				const reason = reader.error ?? new Error('Unknown FileReader error');
				reject(reason instanceof Error ? reason : new Error(String(reason)));
			};

			reader.readAsArrayBuffer(file);
		});
	}

	function splitSysExData(raw: Uint8Array) {
		let index = 0;
		const array: Uint8Array[] = [];
		while (index < raw.length) {
			const newIndex = raw.indexOf(0xf7, index) + 1;
			const bytes: Uint8Array = raw.slice(index, newIndex);
			array.push(bytes);
			index = newIndex;
		}
		return array;
	}

	function parseMessage(raw: Uint8Array, previous: Message | undefined): Message {
		const message = Array.from(raw).map((v) => v.toString(16).padStart(2, '0'));
		const text = message.map((v: string) => String.fromCharCode(parseInt(v, 16))).join('');
		idx++;
		const [manufacturer, model] = getInfo(raw);
		let command: Command;
		switch (true) {
			case text.substring(8, 18) == 'BankBackup':
				command = Command.BANK_BACKUP;
				break;
			case text.substring(7, 19) == 'PresetBackup':
				command = Command.PRESET_BACKUP;
				break;
			case text.includes('base') && previous == undefined:
				command = Command.PRESET;
				break;
			case previous == undefined:
				command = Command.UPDATE;
				break;
			case previous?.command == Command.UPDATE:
				command = Command.UPDATE;
				break;
			case previous?.command == Command.PRESET_BACKUP:
				command = Command.ACTIVE;
				break;
			case text.includes('base'):
				command = Command.PRESET;
				break;
			default:
				command = Command.UNKNOWN;
				break;
		}
		let content;
		try {
			content = JSON.parse(text.slice(6, -1));
		} catch {
			content = '';
		}
		return {
			id: idx + 1000,
			manufacturer: manufacturer,
			model: model,
			data: message,
			raw: raw,
			content: content,
			command: command
		};
	}
</script>

<div class="flex h-[12vh] items-start">
	<div class="flex w-full items-center justify-between p-8">
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
</div>
<div
	style="padding: calc(var(--spacing) * 8);"
	class="grid h-[88vh] w-full grid-cols-[1fr_38.2%] grid-rows-[min-content_auto] gap-8 p-4"
>
	<div class="flex items-end justify-between">
		<div class="flex items-end gap-2">
			<div class="grid w-full max-w-sm items-center gap-1.5">
				<label for="file">Open File</label>
				<Input id="file" type="file" accept=".syx" bind:files onchange={loadFile} />
			</div>
			<Dialog.Root>
				<Dialog.Trigger class={buttonVariants({ variant: 'default' })}
					>Create Command</Dialog.Trigger
				>
				<Dialog.Content class="h-[50vh] w-[50vw]">
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
										parseMessage(
											Uint8Array.from(customCmd.split(' ').map((v) => parseInt(v, 16))),
											outgoingMessages[0]
										)
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
		{#if loading}
			<div class="flex h-full w-full items-center justify-center">
				<Icon icon="lucide:loader-circle" class="size-16 animate-spin" />
			</div>
		{:else}
			<ScrollArea class="h-full">
				<Orderable items={outgoingMessages} />
			</ScrollArea>
		{/if}
	</div>
	<div class="win border-shade view overflow-auto rounded-sm border text-wrap" id="in">
		<ScrollArea class="h-full">
			<Table.Root class="font-mono">
				<Table.Header>
					<Table.Row>
						<Table.Head class="w-0">#</Table.Head>
						<Table.Head class="w-0">Manufacturer</Table.Head>
						<Table.Head class="w-0">Model</Table.Head>
						<!--<Table.Head>B/P</Table.Head>-->
						<!--<Table.Head>Name</Table.Head>-->
						<Table.Head>Content</Table.Head>
						<Table.Head class="w-0">Length</Table.Head>
						<Table.Head class="w-0"></Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each messages as item, index (index)}
						<Table.Row>
							<Table.Cell>{index}</Table.Cell>
							<Table.Cell>{item.manufacturer}</Table.Cell>
							<Table.Cell>{item.model}</Table.Cell>
							<!--<Table.Cell>{item.bankpreset}</Table.Cell>
							<Table.Cell>{item.name}</Table.Cell>-->
							<Table.Cell class="max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap"
								>{bytesToString(item.raw).join(' ')}
							</Table.Cell>
							<Table.Cell class="text-right font-mono">{item.raw.length}</Table.Cell>
							<Table.Cell>
								<Dialog.Root>
									<Dialog.Trigger
										><Button variant="outline" class="mr-2 size-8"
											><Icon icon="lucide:inspect" /></Button
										></Dialog.Trigger
									>
									<Dialog.Content class="lg:max-w-[70vw]">
										<Dialog.Header>
											<Dialog.Title>Inspect MIDI message</Dialog.Title>
										</Dialog.Header>
										<ScrollArea class="h-[50vh] font-mono"
											><div class="wrap-anywhere">
												{bytesToString(item.raw).join(' ')}
											</div></ScrollArea
										>
										<Dialog.Footer>
											<Dialog.Close>
												<Button type="submit">Close</Button>
											</Dialog.Close>
										</Dialog.Footer>
									</Dialog.Content>
								</Dialog.Root></Table.Cell
							>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</ScrollArea>
	</div>
</div>

<MyAlert />
