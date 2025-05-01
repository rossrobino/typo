<script lang="ts">
	import { dev } from "$app/environment";
	import Metrics from "$lib/components/Metrics.svelte";
	import PrintButton from "$lib/components/PrintButton.svelte";
	import Slides from "$lib/components/Slides.svelte";
	import * as svg from "$lib/components/svg";
	import gettingStarted from "$lib/content/getting-started.md?raw";
	import { codeEval } from "$lib/util/codeEval";
	import "../tailwind.css";
	import { inject } from "@vercel/analytics";
	import { onMount, tick } from "svelte";

	inject({ mode: dev ? "development" : "production" });

	/** raw text that the user enters into the `textarea` element */
	let content = $state("");

	let html = $state("");

	/** controls the expansion of the preview area */
	let viewMode = $state(false);

	let textArea: HTMLTextAreaElement;

	let currentSlide = $state(0);

	let file: File | null = $state(null);
	let fileHandle: FileSystemFileHandle | null;

	const fontSizes = [
		"prose-sm",
		"prose-base",
		"prose-lg",
		"prose-xl",
		"prose-2xl",
	];

	const fontFamilies = [
		"font-sans",
		"font-humanist",
		"font-serif",
		"font-old-style",
		"font-mono",
	];

	const colors = {
		medium: ["bg-gray-500", "bg-teal-500", "bg-sky-500", "bg-indigo-500"],
		dark: ["bg-gray-900", "bg-teal-950", "bg-sky-950", "bg-indigo-950"],
	};

	const viewTypes = ["document", "slideshow"] as const;

	let preferences: {
		fontSize: number;
		fontFamily: number;
		color: number;
		viewType: (typeof viewTypes)[number];
	} = $state({ fontSize: 1, fontFamily: 0, color: 0, viewType: "document" });

	const savePreferences = () =>
		localStorage.setItem("preferences", JSON.stringify(preferences));

	const options: FilePickerOptions = {
		types: [
			{
				description: "markdown",
				accept: {
					"text/markdown": [".md", ".mdx", ".mdoc", ".markdoc", ".svx"],
				},
			},
		],
		excludeAcceptAllOption: true,
	};

	const open = async () => {
		[fileHandle] = await window.showOpenFilePicker(options);
		file = await fileHandle.getFile();
		content = await file.text();
	};

	const saveAs = async () => {
		const handle = await window.showSaveFilePicker(options);
		const writable = await handle.createWritable();
		await writable.write(content);
		await writable.close();
		file = await handle.getFile();
		fileHandle = handle;
	};

	const save = async () => {
		if (fileHandle && !viewMode) {
			const writable = await fileHandle.createWritable();
			await writable.write(content);
			await writable.close();
		}
	};

	const dropFile = async (e: DragEvent) => {
		const item = e.dataTransfer?.items?.[0];
		if (item?.kind === "file") {
			e.preventDefault();
			const handle = await item.getAsFileSystemHandle();
			if (handle) {
				// since `item.kind === "file"` it will be a `FileSystemFileHandle`
				fileHandle = handle as FileSystemFileHandle;
				file = await fileHandle.getFile();
				content = await file.text();
			}
		}

		onInput();
	};

	const toggleView = () => {
		const tv = () => (viewMode = !viewMode);

		if (document.startViewTransition) document.startViewTransition(tv);
		else tv();
	};

	const changeViewType = async () => {
		if (preferences.viewType === "document") {
			preferences.viewType = "slideshow";
		} else {
			preferences.viewType = "document";
		}
		savePreferences();

		await tick();
		codeEval();
	};

	const changeProseSize = (action: "increase" | "decrease") => {
		if (action === "increase") {
			if (preferences.fontSize < fontSizes.length - 1) preferences.fontSize++;
		} else if (preferences.fontSize > 0) preferences.fontSize--;

		savePreferences();
	};

	const changeColor = () => {
		if (preferences.color < colors.medium.length - 1) {
			preferences.color++;
		} else {
			preferences.color = 0;
		}
		savePreferences();
	};

	const changeFontFamily = () => {
		if (preferences.fontFamily < fontFamilies.length - 1) {
			preferences.fontFamily++;
		} else {
			preferences.fontFamily = 0;
		}
		savePreferences();
	};

	const onKeyUp = (e: KeyboardEvent) => {
		save();

		if (e.key === "i") textArea.focus();

		if (e.key === "Escape") {
			toggleView();
		} else {
			findCurrentSlide();
		}
	};

	const fmt = async () => {
		const { formatMd } = await import("$lib/util/formatMd");

		let sel = textArea.selectionStart - content.trim().length;

		content = await formatMd(content);

		sel += content.trim().length;

		await onInput();

		textArea.setSelectionRange(sel, sel);
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if ((e.ctrlKey || e.metaKey) && e.key === "s") {
			e.preventDefault();
			fmt();
		}
	};

	const onInput = async () => {
		const { processor } = await import("$lib/util/md");
		html = processor.render(content ? content : gettingStarted.trim());

		await tick();
		codeEval();
	};

	const findCurrentSlide = () => {
		if (preferences.viewType === "slideshow" && !viewMode) {
			const s = content.slice(0, textArea.selectionStart);
			let curr = s.split("\n\n---\n").length - 1;
			if (s.startsWith("---\n")) curr++; // if first line === `---`, considered an <hr>
			currentSlide = curr;
		}
	};

	onMount(() => {
		textArea = document.querySelector("textarea")!;

		const saved = localStorage.getItem("preferences");
		if (saved) {
			preferences = JSON.parse(saved);
		} else {
			savePreferences();
		}

		onInput();

		import("drab/editor/define");
		import("drab/fullscreen/define");
		import("drab/share/define");
	});
</script>

<svelte:document onkeyup={onKeyUp} onkeydown={onKeyDown} />

<div
	class={[
		"flex h-[100dvh] flex-col bg-gray-950 text-gray-50 selection:bg-gray-400/40",
		fontFamilies[preferences.fontFamily],
	]}
>
	{#if !viewMode}
		<header class="flex justify-between p-2 text-sm">
			<nav class="flex w-full items-center justify-between sm:w-fit">
				<div class="flex">
					{#if Boolean(window.showOpenFilePicker)}
						<button
							title="Open (or drag and drop)"
							class="button"
							onclick={open}
						>
							<svg.Open />
							<span class="hidden lg:inline">Open</span>
						</button>
						<button title="Save As" class="button" onclick={saveAs}>
							<svg.Save />
							<span class="hidden lg:inline">Save As</span>
						</button>
					{:else}
						<a
							href="data:text/plain,{content}"
							download="Untitled.md"
							title="Download"
							class="button"
						>
							<svg.Save />
							<span class="hidden lg:inline">Download</span>
						</a>
					{/if}
					<drab-share text={content} class="contents">
						<button data-trigger class="button">
							<span data-content>
								<svg.Copy />
							</span>
							<template data-swap>
								<svg.CopyComplete />
							</template>
							<span class="hidden lg:inline">Copy</span>
						</button>
					</drab-share>

					<drab-share text={html} class="contents">
						<button data-trigger title="Copy HTML" class="button">
							<span data-content>
								<svg.Code />
							</span>
							<template data-swap>
								<svg.CopyComplete />
							</template>
							<span class="hidden lg:inline">Copy</span>
						</button>
					</drab-share>
					<PrintButton innerHtml={html} />
					<button title="Format" onclick={fmt} class="button">
						<svg.Document />
						<span class="hidden lg:inline">Format</span>
					</button>
					<button title="View" class="button lg:hidden" onclick={toggleView}>
						<svg.View />
					</button>
				</div>
			</nav>
			<div class="hidden px-4 py-2 font-bold sm:block">
				{file?.name ? file.name : "Typo"}
			</div>
		</header>
	{/if}
	<main
		class={["grid grow overflow-hidden", !viewMode && "lg:grid-cols-2"]}
		ondrop={dropFile}
	>
		{#if !viewMode}
			<div class="flex h-full flex-col">
				<drab-editor class="contents">
					<textarea
						data-content
						class={[
							"grow resize-none appearance-none overflow-y-auto p-5 font-mono text-sm transition placeholder:text-gray-400 focus:outline-none",
							colors.dark[preferences.color],
						]}
						placeholder="# Title"
						bind:value={content}
						oninput={onInput}
					></textarea>
					<div class="flex flex-wrap p-2">
						<button
							data-trigger
							class="button"
							title="Heading"
							data-value="# "
							data-type="block"
						>
							H
						</button>
						<button
							data-trigger
							class="button"
							title="Bullet"
							data-value="- "
							data-type="block"
						>
							<svg.Bullet />
						</button>
						<button
							data-trigger
							class="button"
							title="Blockquote"
							data-value="> "
							data-type="block"
						>
							<svg.Blockquote />
						</button>
						<button
							data-trigger
							class="button italic"
							title="Italic"
							data-value="_"
							data-type="wrap"
						>
							I
						</button>
						<button
							data-trigger
							class="button"
							title="Bold"
							data-value="**"
							data-type="wrap"
						>
							B
						</button>
						<button
							data-trigger
							class="button"
							title="Anchor"
							data-value="[text](href)"
							data-type="inline"
							data-key="["
						>
							<span>
								<svg.Anchor />
							</span>
						</button>
						<button
							data-trigger
							class="button"
							title="Image"
							data-value="![alt](src)"
							data-type="inline"
							data-key="]"
						>
							<svg.Image />
						</button>
						<button
							data-trigger
							class="button"
							title="Table"
							data-value={"| th  | th  |\n| --- | --- |\n| td  | td  |\n| td  | td  |"}
							data-type="inline"
							data-key={"\\"}
						>
							<svg.Table />
						</button>
						<button
							data-trigger
							class="button"
							title="Code"
							data-value={"`"}
							data-type="wrap"
						>
							<svg.CodeBracket />
						</button>
						<button
							data-trigger
							class="button"
							title="Slide"
							data-value="---"
							data-type="inline"
						>
							<svg.Slideshow />
						</button>
					</div>
				</drab-editor>
			</div>
		{/if}
		<div
			style="view-transition-name: preview;"
			class={["flex-col lg:flex", viewMode ? "flex" : "hidden"]}
		>
			<div
				class="grow overflow-y-auto border-gray-100 bg-white dark:border-y dark:border-gray-900 dark:bg-gray-950 {viewMode
					? 'max-h-[calc(100dvh-3.25rem)]'
					: 'max-h-[calc(100dvh-6.5rem)]'}"
				class:border-y={preferences.viewType === "document" && viewMode}
				class:dark:border-none={preferences.viewType === "slideshow" &&
					viewMode}
			>
				<!-- content -->
				<div
					class={[
						"prose dark:prose-invert prose-img:rounded-lg mx-auto h-full max-w-[72ch] break-words transition-[font-size]",
						fontSizes[preferences.fontSize],
					]}
				>
					{#if preferences.viewType === "document"}
						<div class="p-8">
							{@html html}
						</div>
					{:else if preferences.viewType === "slideshow"}
						<Slides bind:viewMode bind:currentSlide {html} />
					{/if}
				</div>
			</div>
			<div
				class={[
					"group flex justify-between p-2",
					viewMode &&
						"bg-white text-gray-950 dark:bg-gray-950 dark:text-gray-50",
				]}
			>
				<!-- viewType controls -->
				<div class="flex">
					<button
						class="button group-hover:opacity-100"
						class:opacity-0={viewMode}
						onclick={() => changeViewType()}
						title="Change to {preferences.viewType === 'document'
							? 'slideshow'
							: 'document'} view"
					>
						{#if preferences.viewType === "slideshow"}
							<svg.Document />
						{:else}
							<svg.Slideshow />
						{/if}
					</button>
					<div
						class="transition group-hover:opacity-100"
						class:opacity-0={viewMode}
					>
						<Metrics {content} />
					</div>
				</div>
				<div class="flex">
					<button
						class="button group-hover:opacity-100"
						aria-label="Change Color"
						class:opacity-0={viewMode}
						onclick={changeColor}
					>
						<div
							class="h-5 w-5 rounded-full border-2 border-gray-50 {colors
								.medium[preferences.color]}"
							class:border-gray-950={viewMode}
							class:dark:border-gray-50={viewMode}
						></div>
					</button>
					<button
						title="Change Font"
						class="button group-hover:opacity-100 {fontFamilies[
							preferences.fontFamily
						]}"
						class:opacity-0={viewMode}
						onclick={changeFontFamily}
						aria-label={preferences.fontFamily ? "sans-serif" : "serif"}
					>
						F
					</button>
					<button
						title="Decrease Font Size"
						class="button group-hover:opacity-100"
						class:opacity-0={viewMode}
						disabled={preferences.fontSize < 1}
						onclick={() => changeProseSize("decrease")}
					>
						<svg.ZoomOut />
					</button>
					<button
						title="Increase Font Size"
						class="button group-hover:opacity-100"
						class:opacity-0={viewMode}
						disabled={preferences.fontSize >= fontSizes.length - 1}
						onclick={() => changeProseSize("increase")}
					>
						<svg.ZoomIn />
					</button>
					<drab-fullscreen class="contents">
						<button
							data-trigger
							aria-label="Toggle Fullscreen"
							class="button group-hover:opacity-100"
							class:opacity-0={viewMode}
						>
							<svg.Fullscreen />
						</button>
					</drab-fullscreen>
					<button
						title={viewMode ? "Edit" : "View"}
						class="button"
						onclick={toggleView}
					>
						{#if viewMode}
							<svg.Edit />
						{:else}
							<svg.View />
						{/if}
					</button>
				</div>
			</div>
		</div>
	</main>
</div>
