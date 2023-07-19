<script lang="ts">
	export let content: string;
	export let title = "Copy";

	let complete = false;

	const copyText = async () => {
		try {
			await navigator.clipboard.writeText(content);
			complete = true;
			setTimeout(() => (complete = false), 800);
		} catch (error) {
			console.error(error);
		}
	};
</script>

<button class="btn" {title} on:click={copyText}>
	{#if !complete}
		<slot>Copy</slot>
	{:else}
		<slot name="complete">Complete</slot>
	{/if}
</button>
