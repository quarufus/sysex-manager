<script lang="ts">
	import type { Message } from '$lib';
	const { message }: Message = $props();
	import { downloadMessage } from '$lib';

	let dialog;

	let preview = $state('');
	message.data
		.slice(6, 20)
		.forEach((v: string) => (preview += String.fromCharCode(parseInt(v, 16))));
	preview += '...';
	message.data
		.slice(-14, -1)
		.forEach((v: string) => (preview += String.fromCharCode(parseInt(v, 16))));
</script>

<tr class="border border-r-0 border-l-0 last:border-b-0">
	<td class="border-r">{message.manufacturer}</td>
	<td class="border-r border-l">{message.modelId.join(' ')}</td>
	<td class="border-r border-l">{message.raw.length}</td>
	<td class="border-l"><button onclick={() => dialog.showModal()}>{preview}</button></td>
</tr>

<dialog bind:this={dialog} class="mt-[10%] ml-[25%] h-1/2 w-1/2 text-wrap">
	<button onclick={downloadMessage}>Download</button>
	{message.data.join(' ')}
</dialog>
