<script lang="ts">
	import { bytesToString, cn, downloadMessage } from '$lib/utils';
	import { draggable, droppable, type DragDropState } from '@thisux/sveltednd';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { type Message } from '$lib/types';
	import * as Table from '$lib/components/ui/table/index';
	import * as Dialog from '$lib/components/ui/dialog/index';
	import { FileJson } from '$lib';
	import { Button } from '$lib/components/ui/button/index';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import { dndState } from '@thisux/sveltednd';

	let { items = $bindable() }: { items: Message[] } = $props();
	let open: boolean = $state(false);
	const content: { raw: Uint8Array; json: string } = $state({ raw: new Uint8Array(), json: '' });

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
		console.log(dndState.invalidDrop);
	}

	const dragDropCallbacks = {
		onDragOver: (state: DragDropState<Message>) => {
			validateDrop(state);
		},
		onDrop: (state: DragDropState<Message>) => {
			if (dndState.invalidDrop) {
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

	function parseCmd(data: string[]): string {
		const parsed = data.map((v: string) => String.fromCharCode(parseInt(v, 16))).join('');
		return parsed.slice(8, 18) == 'BankBackup' ? 'Bank Backup' : 'Preset Backup';
	}

	function toggleDialog() {
		open = !open;
	}

	function json(data: string[]): string {
		const parsed = data.map((v: string) => String.fromCharCode(parseInt(v, 16))).join('');
		try {
			return JSON.stringify(JSON.parse(parsed.slice(6, -1)), null, '\t');
		} catch {
			return parsed;
		}
	}
</script>

<Table.Root>
	<Table.Header>
		<Table.Row>
			<Table.Head>#</Table.Head>
			<Table.Head>Manufacturer</Table.Head>
			<Table.Head>Model Id</Table.Head>
			<Table.Head>B/P</Table.Head>
			<Table.Head>Name</Table.Head>
			<Table.Head>Command</Table.Head>
			<Table.Head>Length</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each items as item, index (item.id)}
			<tr
				use:droppable={{
					container: index.toString(),
					callbacks: dragDropCallbacks
				}}
				use:draggable={{
					container: index.toString(),
					dragData: item,
					disabled: item.bankpreset.length == 1 ? true : false
				}}
				animate:flip={{ duration: 200 }}
				in:fade={{ duration: 150 }}
				out:fade={{ duration: 150 }}
				data-slot="table-row"
				class={cn('hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors')}
			>
				<Table.Cell>{index}</Table.Cell>
				<Table.Cell>{item.manufacturer}</Table.Cell>
				<Table.Cell>{item.modelId.join(' ')}</Table.Cell>
				<Table.Cell>{item.bankpreset}</Table.Cell>
				<Table.Cell>{item.name}</Table.Cell>
				<Table.Cell>{parseCmd(item.data)}</Table.Cell>
				<Table.Cell class="text-right font-mono">{formatSize(item.raw.length)}</Table.Cell>
				<Table.Cell
					><Button
						variant="outline"
						onclick={() => {
							content.raw = item.raw;
							content.json = json(item.data);
							toggleDialog();
						}}><FileJson /></Button
					></Table.Cell
				>
			</tr>
		{/each}
	</Table.Body>
</Table.Root>

<Dialog.Root bind:open>
	<Dialog.Content class="lg:max-w-[80vw]">
		<Dialog.Header>
			<Dialog.Title>Inspect SysEx Message</Dialog.Title>
		</Dialog.Header>
		<ScrollArea class="h-[80vh] font-mono">
			<div class="grid grid-cols-2">
				<div class="wrap-anywhere">
					{bytesToString(content.raw)}
				</div>
				<pre class="wrap-anywhere">{content.json}</pre>
			</div>
		</ScrollArea>
		<Dialog.Footer>
			<Button
				onclick={() => {
					downloadMessage(content.raw);
				}}>Download syx file</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
