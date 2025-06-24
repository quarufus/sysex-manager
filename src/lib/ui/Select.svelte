<script lang="ts">
	import { Select, type WithoutChildren } from 'bits-ui';
	import { ChevronDown } from '$lib';

	type Props = WithoutChildren<Select.RootProps> & {
		placeholder?: string;
		items: { value: string; label: string; disabled?: boolean }[];
		contentProps?: WithoutChildren<Select.ContentProps>;
	};

	let { value = $bindable(), items, contentProps, placeholder, ...restProps }: Props = $props();
	items = items;
	contentProps = contentProps;
	placeholder = placeholder;
	restProps = restProps;

	const selected = $derived(items.find((item) => item.value == value)?.label);
</script>

<Select.Root bind:value={value as never} {...restProps}>
	<Select.Trigger
		class="hover:bg-text hover:text-background inline-flex items-center border-b-2"
		aria-label="Select a Port"
		>{selected ?? placeholder}
		<ChevronDown class="ml-36" /></Select.Trigger
	>
	<Select.Portal>
		<Select.Content {...contentProps} class="w-[var(--bits-select-anchor-width)]">
			<Select.Viewport class="border-shade bg-background top-2 rounded-sm border p-1">
				{#each items as { value, label, disabled } (value)}
					<Select.Item
						class="hover:bg-text hover:text-background bg-background flex w-full cursor-pointer items-center justify-between rounded-xs px-2 py-1 {selected ==
						label
							? 'bg-shade'
							: ''}"
						{value}
						{label}
						{disabled}
					>
						{#snippet children({ selected })}
							{label}
							<span class="{selected ? 'icon-[lucide--check]' : ''} ml-auto"></span>
						{/snippet}
					</Select.Item>
				{/each}
			</Select.Viewport>
		</Select.Content>
	</Select.Portal>
</Select.Root>
