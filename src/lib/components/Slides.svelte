<script lang="ts">
	import { afterUpdate } from "svelte";

	import { codeEval } from "$lib/utilities/codeEval";

	import Arrow from "$lib/components/svg/Arrow.svelte";

	export let html = "";
	export let currentSlide = 0;
	export let viewMode: boolean;

	$: numberOfSlides = splitHtml(html).length;

	$: if (currentSlide >= numberOfSlides) currentSlide = numberOfSlides - 1;

	const splitHtml = (html: string) => {
		return html.split("<hr>");
	};

	const changeSlide = (direction: "previous" | "next") => {
		if (direction === "next" && currentSlide < numberOfSlides - 1) {
			currentSlide++;
		} else if (direction === "previous" && currentSlide) {
			currentSlide--;
		}
	};

	const onKeydown = ({ key }: KeyboardEvent) => {
		if (viewMode) {
			if (key === "ArrowRight" || key === " ") {
				changeSlide("next");
			} else if (key === "ArrowLeft") {
				changeSlide("previous");
			}
		}
	};

	afterUpdate(() => {
		codeEval();
	});
</script>

<svelte:document on:keydown={onKeydown} />

<div class="flex h-full flex-col">
	<article class="flex grow flex-col justify-center p-8">
		{#each splitHtml(html) as slide, i}
			{#if i === currentSlide}
				<section>
					{@html slide}
				</section>
			{/if}
		{/each}
	</article>
	{#if numberOfSlides > 1}
		<div
			class="sticky bottom-3 flex items-center justify-center font-sans tabular-nums"
		>
			<div
				class="flex items-center justify-center gap-2 rounded-xl bg-white/40 p-1 backdrop-blur-lg dark:bg-gray-950/40"
			>
				<button
					title="Previous Slide"
					disabled={!currentSlide}
					class="button button-s rotate-180"
					on:click={() => changeSlide("previous")}
				>
					<Arrow />
				</button>
				<div class="text-sm">{currentSlide + 1} / {numberOfSlides}</div>
				<button
					title="Next Slide"
					disabled={currentSlide >= numberOfSlides - 1}
					class="button button-s"
					on:click={() => changeSlide("next")}
				>
					<Arrow />
				</button>
			</div>
		</div>
	{/if}
</div>
