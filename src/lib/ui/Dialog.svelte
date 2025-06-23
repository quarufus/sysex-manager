<script lang="ts">
	import type { Snippet } from 'svelte';
	let { content, dialog = $bindable() }: { content: Snippet; dialog: HTMLDialogElement } = $props();
	content = content;
</script>

<dialog
	bind:this={dialog}
	class="border-shade bg-background text-text mx-auto mt-16 w-1/3 rounded-sm border px-3 pb-4"
>
	<div class="bg-background text-text sticky top-0 border-b-2 pt-4">
		<div class="flex justify-end">
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
