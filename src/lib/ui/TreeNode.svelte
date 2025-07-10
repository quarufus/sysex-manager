<script lang="ts">
	import TreeNode from './TreeNode.svelte';
	import Leaf from './Leaf.svelte';
	import { Button } from '../components/ui/button/index';
	import { Label } from '../components/ui/label/index';
	import { z } from 'zod/v4';
	import { type $ZodIssue } from 'zod/v4/core';
	import ChevronDown from '$lib/icons/ChevronDown.svelte';
	import ChevronRight from '$lib/icons/ChevronRight.svelte';

	const {
		schema,
		value,
		path,
		updateData,
		validationErrors
	}: {
		schema: z.ZodType;
		value: any;
		path: string[];
		updateData: (path: string[], value: any) => void;
		validationErrors: $ZodIssue[];
	} = $props();
	let expanded: boolean = $state(path.length < 1);

	function toggle() {
		expanded = !expanded;
	}

	function hasError(): boolean {
		let bool = false;
		validationErrors.forEach((err) => {
			const errorPath = err.path.join('');
			const nodePath = path.join('');
			if (errorPath.includes(nodePath)) bool = true;
		});
		return bool;
	}

	const isLeaf = !['object', 'array'].includes(schema._zod.def.type);
	const pathkey = path[path.length - 1] || 'Preset';
</script>

{#if isLeaf}
	<div class="grid grid-cols-[200px_auto] gap-2 p-2 ml-{(path.length - 1) * 10 + 3}">
		<Label>{pathkey}</Label>
		<Leaf
			{schema}
			{value}
			onChange={(newValue) => {
				updateData(path, newValue);
			}}
			{validationErrors}
			{path}
		/>
	</div>
{:else}
	{#if path.length > 0}
		<div
			class="flex gap-2 p-2 ml-{(path.length - 1) * 10} items-center {hasError()
				? 'text-destructive'
				: 'lol'}"
		>
			<Button onclick={toggle} variant="ghost" class={hasError() ? 'text-destructive' : 'lol'}>
				{#if expanded}
					<ChevronDown />
				{:else}
					<ChevronRight />
				{/if}
			</Button>{pathkey}
		</div>
	{/if}

	{#if expanded}
		{#if schema instanceof z.ZodObject}
			{#each Object.entries(schema._zod.def.shape) as [key, child] (key)}
				<TreeNode
					schema={child}
					value={value?.[key]}
					path={[...path, key]}
					{updateData}
					{validationErrors}
				/>
			{/each}
		{:else if schema instanceof z.ZodArray}
			{#if value && Array.isArray(value)}
				{#each value as item, index (index)}
					<TreeNode
						{schema}
						value={item}
						path={[...path, index.toString()]}
						{updateData}
						{validationErrors}
					/>
				{/each}
			{/if}
		{/if}
	{/if}
{/if}
