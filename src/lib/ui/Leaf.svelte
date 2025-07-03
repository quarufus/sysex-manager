<script lang="ts">
	import z from 'zod/v4';
	import { type $ZodIssue } from 'zod/v4/core';
	import * as Select from '../components/ui/select/index';
	import { Input } from '../components/ui/input/index';
	import { Checkbox } from '../components/ui/checkbox/index';

	let {
		schema,
		value,
		onChange,
		validationErrors,
		path
	}: {
		schema: z.ZodType;
		value: any;
		onChange: (arg0: unknown) => void;
		validationErrors: $ZodIssue[];
		path: string[];
	} = $props();
	schema = schema;
	path = path;
	validationErrors = validationErrors;
	onChange = onChange;

	function getOptions(schema: z.ZodType) {
		if (schema instanceof z.ZodEnum) {
			return schema.options;
		}
		if (schema instanceof z.ZodUnion) {
			return schema.options.map((option) => {
				if (option instanceof z.ZodLiteral) {
					return option.value;
				}
				return option;
			});
		}
		return [];
	}

	function getErrors(validationErrors: $ZodIssue[], path: string[]) {
		return validationErrors.filter((error) => {
			const errorPath = error.path.join('');
			const fieldPath = path.join('');
			return errorPath === fieldPath;
		});
	}

	const options = getOptions(schema);

	const errorMessages = $derived(getErrors(validationErrors, path));
</script>

<div>
	{#if schema instanceof z.ZodString || schema instanceof z.ZodOptional}
		<Input
			type="text"
			bind:value
			oninput={() => {
				onChange(value);
			}}
		/>
	{:else if schema instanceof z.ZodNumber}
		<Input
			type="number"
			bind:value
			oninput={() => {
				onChange(value);
			}}
			step="0.01"
		/>
	{:else if schema instanceof z.ZodBoolean}
		<Checkbox
			checked={typeof value === 'string' || typeof value === 'number' ? false : value}
			onchange={() => {
				onChange(value);
			}}
		/>
	{:else if schema instanceof z.ZodEnum || schema._zod.def instanceof z.ZodUnion}
		<Select.Root type="single" bind:value>
			<Select.Trigger>{value}</Select.Trigger>
			<Select.Content>
				<Select.Group>
					{#each options as option, i (i)}
						<Select.Item value={JSON.stringify(option)} label={JSON.stringify(option)}>
							{option}
						</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>
	{:else}
		<div>Unsupported type: {schema._zod.def.type}</div>
	{/if}

	{#if errorMessages.length > 0}
		{#each errorMessages as message, i (i)}
			<span class="text-destructive text-xs">{message.message}</span>
		{/each}
	{/if}
</div>
