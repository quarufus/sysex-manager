<script lang="ts">
	import type { Message } from '$lib';
	const { message }: { message: Message } = $props();
	import { downloadMessage } from '$lib';

	let dialog!: HTMLDialogElement;

	const parsed = message.data.map((v: string) => String.fromCharCode(parseInt(v, 16))).join('');
	const preview = `${parsed.slice(6, 20)} ... ${parsed.slice(-14, -1)}`;
</script>

<tr class="border border-r-0 border-l-0 first:border-t-0 last:border-b-0">
	<td class="border-r">{message.manufacturer}</td>
	<td class="border-r border-l">{message.modelId.join(' ')}</td>
	<td class="border-r border-l">{message.raw.length}</td>
	<td class="border-l hover:bg-yellow-300">
		<button
			onclick={() => {
				dialog.showModal();
			}}>{preview}</button
		>
	</td>
</tr>

<dialog
	bind:this={dialog}
	class="mt-[5%] ml-[10%] h-[80%] w-[80%] px-4 pb-4 text-wrap"
	closedby="any"
>
	<div class="sticky top-0 border-b-2 bg-white pt-4">
		<div class="flex justify-between">
			<button
				onclick={() => {
					downloadMessage(message.raw);
				}}>Download</button
			>
			<button
				onclick={() => {
					dialog.close();
				}}>Close</button
			>
		</div>
	</div>
	<br />
	<div class="grid grid-cols-2">
		<div class="border-r pr-1 font-mono">{message.data.join(' ')}</div>
		<div class="pl-4 font-mono wrap-anywhere">
			<pre>{JSON.stringify(JSON.parse(parsed.slice(6, -1)), null, '\t')}</pre>
		</div>
	</div>
</dialog>
