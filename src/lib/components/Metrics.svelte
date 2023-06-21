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

<div class="flex h-[4.25rem] items-center justify-between gap-4 bg-black p-4">
	<div class="flex flex-wrap gap-4">
		<div>
			{content.length}
			{content.length === 1 ? "character" : "characters"}
		</div>
		<div>
			{wordCount}
			{wordCount === 1 ? "word" : "words"}
		</div>
		<div>
			{readingTime}
			{readingTime === 1 ? "minute" : "minutes"}
		</div>
	</div>
</div>
