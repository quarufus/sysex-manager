<script lang="ts">
	import { alertTitle, alertDescription } from '../stores/alert';
	import * as AlertDialog from '../components/ui/alert-dialog/index';

	let open: boolean = $derived($alertTitle != '');
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Content
		onEscapeKeydown={() => {
			alertTitle.set('');
		}}
	>
		<AlertDialog.Header>{$alertTitle}</AlertDialog.Header>
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
