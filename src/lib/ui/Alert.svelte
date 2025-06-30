<script lang="ts">
	import { alertTitle, alertDescription, alertType, AlertType } from '../stores/alert';
	import * as AlertDialog from '../components/ui/alert-dialog/index';

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
		onEscapeKeydown={() => {
			alertTitle.set('');
		}}
	>
		<AlertDialog.Header class={color}>{$alertTitle}</AlertDialog.Header>
		{$alertDescription}
		<AlertDialog.Footer>
			<AlertDialog.Cancel
				onclick={() => {
					alertTitle.set('');
				}}>Ok</AlertDialog.Cancel
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
