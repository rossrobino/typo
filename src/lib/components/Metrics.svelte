<script lang="ts">
	export let content: string;

	$: wordCount = getWordCount(content);
	$: readingTime = getReadingTime(wordCount);

	/**
	 * calculates the number of words in a string excluding symbols
	 * @param s - string
	 */
	const getWordCount = (s: string) => {
		return s
			.trim()
			.split(/\W+/)
			.filter((n) => n != "").length;
	};

	/**
	 * calculates the reading time based on a 200 words/minute reading time
	 * @param wordCount
	 */
	const getReadingTime = (wordCount: number) => {
		const wordsPerMinute = 200;
		const minutes = Math.ceil(wordCount / wordsPerMinute);
		return minutes;
	};
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
