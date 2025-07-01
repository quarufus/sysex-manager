<script lang="ts">
	import TreeNode from './TreeNode.svelte';
	import Leaf from './Leaf.svelte';
	import { Button } from '../components/ui/button/index';
	import { Label } from '../components/ui/label/index';
	import { z } from 'zod/v4';
	import ChevronDown from '$lib/icons/ChevronDown.svelte';
	import ChevronRight from '$lib/icons/ChevronRight.svelte';

	const { schema, value, path }: { schema: z.ZodType; value: any; path: string[] } = $props();
	let expanded = $state(false);

	function toggle() {
		expanded = !expanded;
	}

	const isLeaf = !['object', 'array'].includes(schema._zod.def.type);
	const pathkey = path[path.length - 1] || 'root';
</script>

{#if isLeaf}
	<div class="grid grid-cols-[200px_auto] gap-2 p-2 ml-{path.length * 10}">
		<Label class="w-64">{pathkey}</Label>
		<Leaf {schema} {value} />
	</div>
{:else}
	<div class="flex gap-2 p-2 ml-{path.length * 10} items-center">
		<Button onclick={toggle} variant="ghost">
			{#if expanded}
				<ChevronDown />
			{:else}
				<ChevronRight />
			{/if}
		</Button>{pathkey}
	</div>

	{#if expanded}
		{#if schema instanceof z.ZodObject}
			{#each Object.entries(schema._zod.def.shape) as [key, child] (key)}
				<TreeNode schema={child} value={value?.[key]} path={[...path, key]} />
			{/each}
		{:else if schema instanceof z.ZodArray}
			{#if value && Array.isArray(value)}
				{#each value as item, index (index)}
					<TreeNode {schema} value={item} path={[...path, index.toString()]} />
				{/each}
			{/if}
		{/if}
	{/if}
{/if}
