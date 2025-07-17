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

	let { items = $bindable() }: { items: Message[] } = $props();
	let editor: boolean = $state(false);
	let viewer: boolean = $state(false);

	let raw: boolean = $state(false);
	let index: number = $state(-1);
	let tempMessage = $state({ content: {}, command: Command.UNKNOWN, raw: new Uint8Array() });

	let data = $state({});
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
		const bank = String.fromCharCode(items[0].content.BankBackup + 65);
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
				return '';
		}
	}

	function getName(message: Message): string | null {
		if (typeof message.content == 'string') return null;
		if (message.content.name) {
			return message.content.name.toString();
		}
		return null;
	}

	function info(message: Message, index: number): string[] {
		const parts: string[] = [];
		if (message.model) parts.push(message.model);
		parts.push(cmd(message, index));
		const name = getName(message);
		if (name != null) {
			parts.push(name);
		}
		return parts;
	}
</script>

<Table.Root class="font-mono">
	<Table.Header>
		<Table.Row>
			<Table.Head class="w-0">#</Table.Head>
			<Table.Head class="w-0">Manufacturer</Table.Head>
			<!--<Table.Head>Model</Table.Head>
			<Table.Head>Name</Table.Head>
			<Table.Head>Command</Table.Head>-->
			<Table.Head class="w-max">Info</Table.Head>
			<Table.Head class="w-0">Length</Table.Head>
			<Table.Head class="w-0"></Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
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
						item.command == Command.UPDATE
				}}
				animate:flip={{ duration: 200 }}
				in:fade={{ duration: 150 }}
				out:fade={{ duration: 150 }}
				data-slot="table-row"
				class="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
			>
				<Table.Cell>{i}</Table.Cell>
				<Table.Cell>{item.manufacturer}</Table.Cell>
				<!--<Table.Cell>{item.model}</Table.Cell>
				<Table.Cell>{getName(item)}</Table.Cell>
				<Table.Cell>{cmd(item, i)}</Table.Cell>-->
				<Table.Cell>
					{#each info(item, i) as part, j (j)}
						<Badge variant="secondary" class="mx-2">{part}</Badge>
					{/each}
				</Table.Cell>
				<Table.Cell class="text-right font-mono">{formatSize(item.raw.length)}</Table.Cell>
				<Table.Cell>
					{#if item.command == Command.UPDATE || item.command == Command.PRESET_BACKUP}
						<Button
							class="mr-2"
							variant="outline"
							onclick={() => {
								tempMessage = {
									command: item.command,
									content: {},
									raw: Uint8Array.from(item.raw)
								};
								viewer = !viewer;
							}}
						>
							<Icon icon="lucide:inspect" />
						</Button>
					{:else}
						<Button
							class="mr-2"
							variant="outline"
							onmousedown={() => {
								tempMessage = {
									command: item.command,
									content: item.content,
									raw: Uint8Array.from(item.raw)
								};
								data = tempMessage.content;
								index = i;
								editor = !editor;
							}}
						>
							<Edit /></Button
						>
					{/if}
				</Table.Cell>
			</tr>
		{/each}
	</Table.Body>
</Table.Root>

<Dialog.Root bind:open={viewer}>
	<Dialog.Content class="p-10 font-mono">
		<ScrollArea class="h-[50vh]">
			<div class="grid grid-cols-[75%_25%]">
				<div>{bytesToString(tempMessage.raw).join(' ')}</div>
				<div class="break-all">{bytesToAscii(tempMessage.raw)}</div>
			</div>
		</ScrollArea>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={editor}>
	<Dialog.Content class="max-h-[90vh] lg:max-w-[80vw]">
		<Dialog.Header>
			<Dialog.Title>Inspect SysEx Message</Dialog.Title>
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
