<script lang="ts">
	import { afterUpdate } from "svelte";

	import { jsEval } from "$lib/utilities/jsEval";

	import Arrow from "$lib/components/svg/Arrow.svelte";

	export let html = "";
	export let currentSlide = 0;
	export let viewMode: Boolean;

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
		jsEval();
	});
</script>

<svelte:document on:keydown={onKeydown} />

<div class="flex h-full flex-col p-8">
	<article class="flex grow flex-col justify-center">
		{#each splitHtml(html) as slide, i}
			{#if i === currentSlide}
				<section>
					{@html slide}
				</section>
			{/if}
		{/each}
	</article>
	<div class="sticky bottom-2 flex items-center justify-center tabular-nums">
		<div
			class="flex items-center justify-center gap-2 rounded-xl p-1 backdrop-blur-xl"
		>
			<button
				title="Previous Slide"
				disabled={!currentSlide}
				class="btn btn-s rotate-180"
				on:click={() => changeSlide("previous")}
			>
				<Arrow />
			</button>
			<div class="text-sm">{currentSlide + 1} / {numberOfSlides}</div>
			<button
				title="Next Slide"
				disabled={currentSlide >= numberOfSlides - 1}
				class="btn btn-s"
				on:click={() => changeSlide("next")}
			>
				<Arrow />
			</button>
		</div>
	</div>
</div>
