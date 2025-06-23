<script lang="ts">
	import { type Message } from '$lib';
	const { message, position }: { message: Message; position: number } = $props();
	import { downloadMessage } from '$lib';

	let dialog!: HTMLDialogElement;

	const parsed = message.data.map((v: string) => String.fromCharCode(parseInt(v, 16))).join('');
	const command = parsed.slice(8, 18) == 'BankBackup' ? 'Bank Backup' : 'Preset Backup'; //`${parsed.slice(6, 20)} ... ${parsed.slice(-14, -1)}`;
	let length = $state();
	if (message.raw.length / 1000 > 1) {
		length = (message.raw.length / 1000).toFixed(1).concat('k');
	} else {
		length = message.raw.length.toString();
	}
	const json = () => {
		try {
			return JSON.stringify(JSON.parse(parsed.slice(6, -1)), null, '\t');
		} catch {
			return parsed;
		}
	};
</script>

<tr class="[&>*]:border-b-shade border-l-0 font-mono first:border-t-0 nth-last-2:[&>*]:border-b-0">
	<td class="border-b px-1 pt-1 pb-0.5">{position}</td>
	<td class="border-b px-1 pt-1 pb-0.5">{message.manufacturer}</td>
	<td class="border-b px-1 pt-1 pb-0.5">{message.modelId.join(' ')}</td>
	<td class="border-b px-1 pt-1 pb-0.5">{message.bankpreset}</td>
	<td class="border-b px-1 pt-1 pb-0.5"></td>
	<td
		class="hover:bg-text hover:text-background cursor-pointer border-b px-1 pt-0.5"
		onclick={() => {
			dialog.showModal();
		}}
		>{command}
	</td>
	<td class="border-b px-1 pt-0.5 text-right">{length}</td>
</tr>

<dialog
	bind:this={dialog}
	class="bg-background text-text mt-[5%] ml-[10%] h-[80%] w-[80%] rounded-sm border px-4 pb-4 text-wrap"
	closedby="any"
>
	<div class="bg-background sticky top-0 border-b-2 pt-4">
		<div class="flex justify-between">
			<button
				class="hover:bg-text hover:text-background"
				onclick={() => {
					downloadMessage(message.raw);
				}}>Download</button
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
	<div class="grid grid-cols-2">
		<div class="border-r pr-1 font-mono">{message.data.join(' ')}</div>
		<div class="pl-4 font-mono wrap-anywhere">
			<pre>{json()}</pre>
			<!-- <pre>{parsed}</pre> -->
		</div>
	</div>
</dialog>
