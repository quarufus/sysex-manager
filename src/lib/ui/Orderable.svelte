<script lang="ts">
	import { cn, downloadPreset, bytesToString, saveMessage } from '$lib/utils';
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
	import { Bank, PresetBackup, PresetParameters } from '$lib/schema';
	import { type $ZodIssue } from 'zod/v4/core';

	let { items = $bindable() }: { items: Message[] } = $props();
	let open: boolean = $state(false);

	let raw: boolean = $state(false);
	let bank = '';
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

		dndState.invalidDrop = targetContainer == '0';
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
		},
		onDragEnd: () => {
			dndState.invalidDrop = true;
		}
	};

	const command = $derived(
		(function () {
			if (items.length == 0) return '';
			const s = items[0].data.map((v: string) => String.fromCharCode(parseInt(v, 16))).join('');
			if (s.slice(8, 18) == 'BankBackup') {
				bank = String.fromCharCode(parseInt(s.slice(20, 21)) + 65);
				return `Bank ${bank} Backup`;
			} else if (s.slice(7, 19) == 'PresetBackup') {
				return 'Preset Backup';
			}
			return 'Unknown SysEx Command';
		})()
	);

	const messageId = (index: number) => {
		switch (true) {
			case /Bank*/.test(command):
				return `Preset ${bank}${index.toString()} Backup`;
			case command == 'Preset Backup':
				return 'Active Preset';
			case command == 'Unknown Command':
				return 'Unknown SysEx Command';
		}
	};

	function getName(message: Message): string {
		if (typeof message.content == 'string') return '-';
		if ('name' in message.content) {
			return message.content.name?.toString() ?? '';
		}
		return '-';
	}

	function toggleDialog() {
		open = !open;
	}
</script>

<Table.Root class="font-mono">
	<Table.Header>
		<Table.Row>
			<Table.Head>#</Table.Head>
			<Table.Head>Manufacturer</Table.Head>
			<Table.Head>Model</Table.Head>
			<!--<Table.Head>B/P</Table.Head>-->
			<Table.Head>Name</Table.Head>
			<Table.Head>Command</Table.Head>
			<Table.Head>Length</Table.Head>
			<Table.Head class="w-16"></Table.Head>
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
					disabled: item.command == Command.BANK_BACKUP || item.command == Command.PRESET_BACKUP
				}}
				animate:flip={{ duration: 200 }}
				in:fade={{ duration: 150 }}
				out:fade={{ duration: 150 }}
				data-slot="table-row"
				class={cn('hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors')}
			>
				<Table.Cell>{i}</Table.Cell>
				<Table.Cell>{item.manufacturer}</Table.Cell>
				<Table.Cell>{item.model}</Table.Cell>
				<!--<Table.Cell>{getPreset(item.bankpreset, i)}</Table.Cell>-->
				<Table.Cell>{getName(item)}</Table.Cell>
				<Table.Cell>{i == 0 ? command : messageId(i)}</Table.Cell>
				<Table.Cell class="text-right font-mono">{formatSize(item.raw.length)}</Table.Cell>
				<Table.Cell
					><Button
						disabled={i == 0}
						variant="outline"
						onclick={() => {
							tempMessage = {
								command: item.command,
								content: item.content,
								raw: Uint8Array.from(item.raw)
							};
							data = tempMessage.content;
							index = i;
							toggleDialog();
						}}><Edit /></Button
					></Table.Cell
				>
			</tr>
		{/each}
	</Table.Body>
</Table.Root>

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[90vh] lg:max-w-[80vw]">
		<Dialog.Header>
			<Dialog.Title>Inspect SysEx Message</Dialog.Title>
		</Dialog.Header>
		<div class="mt-4 grid grid-cols-2 gap-4">
			<!--<div class="wrap-anywhere">
					{bytesToString(content.raw)}
				</div>-->
			<ScrollArea class="max-h-[70vh] font-mono">
				<TreeNode
					schema={tempMessage.command == Command.BANK_BACKUP
						? Bank
						: tempMessage.command == Command.PRESET_BACKUP
							? PresetBackup
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
					toggleDialog();
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
