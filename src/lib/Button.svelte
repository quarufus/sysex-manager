<script lang="ts">
	interface Props {
		text: string;
		callback: () => void;
	}
	const { text, callback }: Props = $props();
</script>

<button class="cursor-pointer hover:bg-yellow-300" onclick={callback}>{text}</button>
