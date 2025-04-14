<script lang="ts">
	import Arrow from "$lib/components/svg/Arrow.svelte";
	import { codeEval } from "$lib/util/codeEval";
	import { tick } from "svelte";

	let {
		html = "",
		currentSlide = $bindable(0),
		viewMode = $bindable(),
	}: { html: string; currentSlide: number; viewMode: boolean } = $props();

	const splitHtml = () => html.split("<hr>");

	let numberOfSlides = $derived(splitHtml().length);

	$effect(() => {
		if (currentSlide >= numberOfSlides) currentSlide = numberOfSlides - 1;
	});

	const changeSlide = async (direction: "previous" | "next") => {
		if (direction === "next" && currentSlide < numberOfSlides - 1) {
			currentSlide++;
		} else if (direction === "previous" && currentSlide) {
			currentSlide--;
		}

		await tick();
		codeEval();
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
</script>

<svelte:document onkeydown={onKeydown} />

<div class="flex h-full flex-col">
	<article class="flex grow flex-col justify-center p-8">
		{#each splitHtml() as slide, i}
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
					onclick={() => changeSlide("previous")}
				>
					<Arrow />
				</button>
				<div class="text-sm">{currentSlide + 1} / {numberOfSlides}</div>
				<button
					title="Next Slide"
					disabled={currentSlide >= numberOfSlides - 1}
					class="button button-s"
					onclick={() => changeSlide("next")}
				>
					<Arrow />
				</button>
			</div>
		</div>
	{/if}
</div>
