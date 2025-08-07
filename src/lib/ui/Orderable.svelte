<script lang="ts">
	import {
		downloadPreset,
		bytesToString,
		saveMessage,
		validateMessages,
		bytesToAscii
	} from '$lib/utils';
	import { draggable, droppable, type DragDropState } from '@thisux/sveltednd';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { Command, type Message } from '$lib/types';
	import * as Table from '$lib/components/ui/table/index';
	import * as Dialog from '$lib/components/ui/dialog/index';
	import { Edit } from '$lib';
	import { Button } from '$lib/components/ui/button/index';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import { dndState } from '@thisux/sveltednd';
	import { AlertType, displayAlert } from '$lib/stores/alert';
	import TreeNode from './TreeNode.svelte';
	import { Bank, PresetParameters } from '$lib/schema';
	import { z } from 'zod/v4';
	import { type $ZodIssue } from 'zod/v4/core';
	import Icon from '@iconify/svelte';
	import { Badge } from '$lib/components/ui/badge/index';
	import * as Tooltip from '$lib/components/ui/tooltip/index';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index';
	import Input from '$lib/components/ui/input/input.svelte';

	let { items = $bindable() }: { items: Message[] } = $props();
	let editor: boolean = $state(false);
	let viewer: boolean = $state(false);
	let name: boolean = $state(false);
	let nameText: string = $state('');

	let raw: boolean = $state(false);
	let index: number = $state(-1);

	interface Temp {
		content: Record<string, string | number | null>;
		command: Command;
		raw: Uint8Array;
	}

	let tempMessage: Temp = $state({ content: {}, command: Command.UNKNOWN, raw: new Uint8Array() });

	type Fake = Record<string, string | number | null>;

	let data: Fake = $state({});
	let validationErrors: $ZodIssue[] = $state([]);
	const valid: boolean = $derived(validationErrors.length != 0);

	function updateChange(path: string[], value: any) {
		const newData = JSON.parse(JSON.stringify(data));

		let current = newData;
		for (let i = 0; i < path.length - 1; i++) {
			current = current[path[i]];
		}

		current[path[path.length - 1]] = value;

		data = newData;

		const result = PresetParameters.safeParse(data);

		validationErrors = result.error?.issues ?? [];
		if (validationErrors.length == 0) {
			tempMessage.content = JSON.parse(JSON.stringify(data, null, '\t'));
		}
	}

	function formatSize(size: number): string {
		if (size / 1000 > 1) {
			return (size / 1000).toFixed(1).concat('k');
		} else {
			return size.toString();
		}
	}

	function validateDrop(state: DragDropState<Message>) {
		const { targetContainer } = state;

		dndState.invalidDrop = targetContainer == '0' && items[0].command != Command.PRESET;
	}

	const dragDropCallbacks = {
		onDragOver: (state: DragDropState<Message>) => {
			validateDrop(state);
		},
		onDrop: (state: DragDropState<Message>) => {
			if (dndState.invalidDrop) {
				displayAlert('Warning', 'First message must be a Bank Backup message.', AlertType.WARN);
				//alert('Error: first message must be a Bank Backup message');
				return;
			}

			const { draggedItem, targetContainer } = state;
			const dragIndex = items.findIndex((item: Message) => item.id === draggedItem.id);
			const dropIndex = parseInt(targetContainer ?? '0');
			if (dragIndex !== -1 && !isNaN(dropIndex)) {
				const [item] = items.splice(dragIndex, 1);
				items.splice(dropIndex, 0, item);
			}
			validateMessages(items);
		},
		onDragEnd: () => {
			dndState.invalidDrop = true;
		}
	};

	function cmd(item: Message, i: number): string {
		const bank = String.fromCharCode((items[0].content.BankBackup as number) + 65);
		switch (item.command) {
			case Command.BANK_BACKUP:
				return `Bank ${bank} Backup`;
			case Command.PRESET_BACKUP:
				return 'Preset Backup';
			case Command.PRESET:
				return `Preset ${bank}${i.toString()} Backup`;
			case Command.ACTIVE:
				return 'Active Preset';
			case Command.UPDATE:
				return 'Update';
			case Command.UNKNOWN:
				return 'Unknown command';
			default:
				return 'Unknown command';
		}
	}

	interface Part {
		name: string;
		value: string;
	}

	function info(message: Message, index: number): Part[] {
		const parts: Part[] = [];
		if (message.model) parts.push({ name: 'Model name', value: message.model });
		parts.push({ name: 'Sysex command', value: cmd(message, index) });
		const name = message.content.name ? message.content.name.toString() : null;
		if (name != null) {
			parts.push({ name: 'Preset name', value: name });
		}
		return parts;
	}
</script>

<Table.Root>
	<Table.Header>
		<Table.Row>
			<Table.Head class="w-0">#</Table.Head>
			<Table.Head class="w-0">Manufacturer</Table.Head>
			<Table.Head class="w-max">Info</Table.Head>
			<Table.Head class="w-0">Length</Table.Head>
			<Table.Head class="w-0"></Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body class="font-mono font-normal">
		{#each items as item, i (i)}
			<tr
				use:droppable={{
					container: i.toString(),
					callbacks: dragDropCallbacks
				}}
				use:draggable={{
					container: i.toString(),
					dragData: item,
					disabled:
						item.command == Command.BANK_BACKUP ||
						item.command == Command.PRESET_BACKUP ||
						item.command == Command.UPDATE ||
						item.command == Command.UNKNOWN
				}}
				animate:flip={{ duration: 200 }}
				in:fade={{ duration: 150 }}
				out:fade={{ duration: 150 }}
				data-slot="table-row"
				class="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
			>
				<Table.Cell>{i}</Table.Cell>
				<Table.Cell>{item.manufacturer}</Table.Cell>
				<Table.Cell>
					{#each info(item, i) as { name, value }, j (j)}
						<Tooltip.Provider>
							<Tooltip.Root>
								<Tooltip.Trigger>
									<Badge
										variant="secondary"
										class={(j == 2 ? 'bg-primary text-primary-foreground' : '') +
											' mr-2 rounded-xl pt-1'}>{value}</Badge
									>
								</Tooltip.Trigger>
								<Tooltip.Content>{name}</Tooltip.Content>
							</Tooltip.Root>
						</Tooltip.Provider>
					{/each}
				</Table.Cell>
				<Table.Cell class="text-right font-mono">{formatSize(item.raw.length)}</Table.Cell>
				<Table.Cell class="text-center">
					{#if item.command == Command.UPDATE || item.command == Command.PRESET_BACKUP || item.command == Command.UNKNOWN || item.command == Command.BANK_BACKUP}
						<Button
							class="mx-2 size-8"
							variant="outline"
							onclick={() => {
								tempMessage = {
									command: item.command,
									content: item.content,
									raw: Uint8Array.from(item.raw)
								};
								viewer = !viewer;
							}}
						>
							<Icon icon="lucide:inspect" />
						</Button>
					{:else}
						<DropdownMenu.Root>
							<DropdownMenu.Trigger class="">
								<Icon icon="lucide:more-horizontal" class="size-5" />
							</DropdownMenu.Trigger>
							<DropdownMenu.Content>
								<DropdownMenu.Group>
									<DropdownMenu.Item
										onclick={() => {
											tempMessage = {
												command: item.command,
												content: item.content,
												raw: Uint8Array.from(item.raw)
											};
											data = tempMessage.content;
											index = i;
											name = !name;
										}}
									>
										<Edit /> Edit name
									</DropdownMenu.Item>
									<DropdownMenu.Item
										onclick={() => {
											tempMessage = {
												command: item.command,
												content: item.content,
												raw: Uint8Array.from(item.raw)
											};
											viewer = !viewer;
										}}
									>
										<Icon icon="lucide:inspect" /> View contents
									</DropdownMenu.Item>
									<DropdownMenu.Item
										onclick={() => {
											tempMessage = {
												command: item.command,
												content: item.content,
												raw: Uint8Array.from(item.raw)
											};
											data = tempMessage.content;
											index = i;
											editor = !editor;
										}}>&thinsp;~&emsp;Full edit</DropdownMenu.Item
									>
								</DropdownMenu.Group>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					{/if}
				</Table.Cell>
			</tr>
		{/each}
	</Table.Body>
</Table.Root>

<Dialog.Root bind:open={viewer}>
	<Dialog.Content class="p-10 lg:max-w-[70vw]">
		<Dialog.Header>
			<Dialog.Title>Inspect MIDI message</Dialog.Title>
		</Dialog.Header>
		{#if [Command.UPDATE, Command.PRESET_BACKUP, Command.UNKNOWN].includes(tempMessage.command)}
			<ScrollArea class="max-h-[70vh] font-mono font-normal">
				<div class="grid grid-cols-[75%_25%]">
					<div>{bytesToString(tempMessage.raw).join(' ')}</div>
					<div class="break-all">{bytesToAscii(tempMessage.raw)}</div>
				</div>
			</ScrollArea>
		{:else}
			<ScrollArea class="max-h-[70vh] font-mono font-normal">
				<div class="grid grid-cols-2 gap-4">
					<div>{bytesToString(tempMessage.raw).join(' ')}</div>
					<pre>{JSON.stringify(tempMessage.content, null, '\t')}</pre>
				</div></ScrollArea
			>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={name}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit the name of the preset</Dialog.Title>
		</Dialog.Header>
		Previous name: {tempMessage.content.name ?? 'none'}
		<Input type="text" max="10" placeholder="Enter new name" bind:value={nameText} />
		<Dialog.Footer>
			<Button
				onclick={() => {
					data.name = nameText;
					saveMessage(items[index], data);
					name = !name;
				}}>Save</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={editor}>
	<Dialog.Content class="max-h-[90vh] lg:max-w-[80vw]">
		<Dialog.Header>
			<Dialog.Title>Inspect and edit Preset</Dialog.Title>
		</Dialog.Header>
		<div class="mt-4 grid grid-cols-2 gap-4">
			<ScrollArea class="max-h-[70vh] font-mono">
				<TreeNode
					schema={tempMessage.command == Command.BANK_BACKUP
						? Bank
						: tempMessage.command == Command.PRESET_BACKUP
							? z.literal('PresetBackup')
							: PresetParameters}
					path={[]}
					value={tempMessage.content}
					{validationErrors}
					updateData={updateChange}
				/>
			</ScrollArea>
			<ScrollArea class="max-h-[70vh] font-mono">
				{#if raw}
					<div class="">{bytesToString(tempMessage.raw).join(' ')}</div>
				{:else}
					<pre class="wrap-anywhere">{JSON.stringify(tempMessage.content, null, '\t')}</pre>
				{/if}
			</ScrollArea>
		</div>
		<Dialog.Footer>
			<Button
				disabled={valid}
				onclick={() => {
					console.log(data);
					saveMessage(items[index], JSON.parse(JSON.stringify(data, null, '\t')));
					editor = !editor;
				}}>Save</Button
			>
			<Button
				onclick={() => {
					downloadPreset(tempMessage.content, tempMessage.raw);
				}}>Download syx file</Button
			>
			<Button onclick={() => (raw = !raw)}>Toggle Raw</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
