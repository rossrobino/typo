<script lang="ts">
	let { content }: { content: string } = $props();

	const { format } = Intl.NumberFormat();

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
		{format(content.length)} char
	</div>
	<div>
		{format(wordCount)} word
	</div>
	<div>
		{format(readingTime)} min
	</div>
</div>
