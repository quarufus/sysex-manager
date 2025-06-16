<script lang="ts">
	import type { Message } from '$lib';
	const { message }: { message: Message } = $props();
	import { downloadMessage } from '$lib';
	import { Button } from '$lib';

	let dialog!: HTMLDialogElement;

	let preview = $state('');
	message.data
		.slice(6, 20)
		.forEach((v: string) => (preview += String.fromCharCode(parseInt(v, 16))));
	preview += '...';
	message.data
		.slice(-14, -1)
		.forEach((v: string) => (preview += String.fromCharCode(parseInt(v, 16))));
</script>

<tr class="border border-r-0 border-l-0 first:border-t-0 last:border-b-0">
	<td class="border-r">{message.manufacturer}</td>
	<td class="border-r border-l">{message.modelId.join(' ')}</td>
	<td class="border-r border-l">{message.raw.length}</td>
	<td class="border-l hover:bg-yellow-300"
		><Button
			callback={() => {
				dialog.showModal();
			}}
			text={preview}
		/></td
	>
</tr>

<dialog bind:this={dialog} class="mt-[10%] ml-[25%] h-1/2 w-1/2 px-4 pb-4 text-wrap" closedby="any">
	<div class="sticky top-0 border-b-2 bg-white pt-4">
		<div class="flex justify-between">
			<Button
				text="Download"
				callback={() => {
					downloadMessage(message.raw);
				}}
			/>
			<Button
				text="Close"
				callback={() => {
					dialog.close();
				}}
			/>
		</div>
	</div>
	<br />
	<div class="font-mono">{message.data.join(' ')}</div>
</dialog>
