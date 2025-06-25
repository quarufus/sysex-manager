<script lang="ts">
	import { type Snippet } from 'svelte';
	const {
		content,
		actionText,
		actionCallback,
		style
	}: {
		content: Snippet;
		actionText?: string;
		actionCallback?: () => void;
		style?: string;
	} = $props();

	let dialog: HTMLDialogElement;

	export function showModal() {
		dialog.showModal();
	}

	export function close() {
		dialog.showModal();
	}
</script>

<dialog
	bind:this={dialog}
	style={style ?? ''}
	class="border-shade bg-background text-text mx-auto mt-16 w-1/3 rounded-sm border px-3 pb-4"
>
	<div class="bg-background text-text sticky top-0 border-b-2 pt-4">
		<div class="flex justify-between">
			<button class="hover:bg-text hover:text-background" onclick={actionCallback}
				>{actionText}</button
			>
			<button
				class="hover:bg-text hover:text-background"
				onclick={() => {
					dialog.close();
				}}>Close</button
			>
		</div>
	</div>
	<br />
	{@render content()}
</dialog>
