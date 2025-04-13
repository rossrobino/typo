<script lang="ts">
	let { content }: { content: string } = $props();

	let wordCount = $derived(
		content
			.trim()
			.split(/\W+/)
			.filter((n) => n !== "").length,
	);

	let readingTime = $derived.by(() => {
		const wordsPerMinute = 200;
		const minutes = Math.ceil(wordCount / wordsPerMinute);
		return minutes;
	});
</script>

<div
	class="ml-4 hidden h-full flex-wrap items-center gap-2 text-sm tabular-nums sm:flex"
>
	<div>
		{content.length} char
	</div>
	<div>
		{wordCount} word
	</div>
	<div>
		{readingTime} min
	</div>
</div>
