<script lang="ts">
	import { Dialog, type Message } from '$lib';
	const { message, position }: { message: Message; position: number } = $props();
	import { downloadMessage } from '$lib';

	let dialog: Dialog;

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

<Dialog
	bind:this={dialog}
	actionText="Download"
	actionCallback={() => {
		downloadMessage(message.raw);
	}}
	style="width: 80%; height: 85%"
>
	{#snippet content()}
		<div class="grid grid-cols-2">
			<div class="border-shade border-r pr-4 text-justify font-mono">{message.data.join(' ')}</div>
			<div class="pl-4 font-mono wrap-anywhere">
				<pre>{json()}</pre>
			</div>
		</div>
	{/snippet}
</Dialog>
