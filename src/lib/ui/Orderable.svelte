<script lang="ts">
	import { cn } from '$lib/utils';
	import { draggable, droppable, type DragDropState } from '@thisux/sveltednd';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { type Message } from '$lib/types';
	import * as Table from '$lib/components/ui/table/index';

	let { items = $bindable() }: { items: Message[] } = $props();

	function handleDrop(state: DragDropState<Message>) {
		const { draggedItem, targetContainer } = state;
		const dragIndex = items.findIndex((item: Message) => item.id === draggedItem.id);
		const dropIndex = parseInt(targetContainer ?? '0');

		if (dragIndex !== -1 && !isNaN(dropIndex)) {
			const [item] = items.splice(dragIndex, 1);
			items.splice(dropIndex, 0, item);
		}
	}

	function formatSize(size: number): string {
		if (size / 1000 > 1) {
			return (size / 1000).toFixed(1).concat('k');
		} else {
			return size.toString();
		}
	}

	function parseCmd(data: string[]): string {
		const parsed = data.map((v: string) => String.fromCharCode(parseInt(v, 16))).join('');
		return parsed.slice(8, 18) == 'BankBackup' ? 'Bank Backup' : 'Preset Backup';
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
				use:droppable={{ container: index.toString(), callbacks: { onDrop: handleDrop } }}
				use:draggable={{ container: index.toString(), dragData: item }}
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
			</tr>
		{/each}
	</Table.Body>
</Table.Root>
