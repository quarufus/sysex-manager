<script lang="ts">
	import { alertTitle, alertDescription, alertType, AlertType } from '../stores/alert';
	import * as AlertDialog from '../components/ui/alert-dialog/index';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';

	let open: boolean = $derived($alertTitle != '');
	const color = $derived(
		$alertType == AlertType.ERROR
			? 'text-destructive'
			: $alertType == AlertType.WARN
				? 'text-warning'
				: $alertType == AlertType.SUCCESS
					? 'text-[#00ff00]'
					: ''
	);
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Content
		class="max-h-[50vh] w-[50vw]"
		onEscapeKeydown={() => {
			alertTitle.set('');
		}}
	>
		<AlertDialog.Header class={color}>{$alertTitle}</AlertDialog.Header>
		<ScrollArea class="max-h-[30vh]">
			<div class="whitespace-pre-line">{$alertDescription}</div>
		</ScrollArea>
		<AlertDialog.Footer>
			<AlertDialog.Cancel
				onclick={() => {
					alertTitle.set('');
				}}>Ok</AlertDialog.Cancel
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
