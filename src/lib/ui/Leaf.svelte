<script lang="ts">
	import { z } from 'zod/v4';
	import * as Select from '../components/ui/select/index';
	import { Input } from '../components/ui/input/index';
	import { Checkbox } from '../components/ui/checkbox/index';

	let { schema, value }: { schema: z.ZodType; value: any } = $props();
	schema = schema;

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

	const options = getOptions(schema);
</script>

{#if schema instanceof z.ZodString || schema instanceof z.ZodOptional}
	<Input type="text" bind:value />
{:else if schema instanceof z.ZodNumber}
	<Input type="number" bind:value />
{:else if schema instanceof z.ZodBoolean}
	<Checkbox checked={typeof value === 'string' || typeof value === 'number' ? false : value} />
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
