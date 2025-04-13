<script lang="ts">
	import { dev } from "$app/environment";
	import Metrics from "$lib/components/Metrics.svelte";
	import PrintButton from "$lib/components/PrintButton.svelte";
	import Slides from "$lib/components/Slides.svelte";
	import Anchor from "$lib/components/svg/Anchor.svelte";
	import Blockquote from "$lib/components/svg/Blockquote.svelte";
	import Bullet from "$lib/components/svg/Bullet.svelte";
	import Code from "$lib/components/svg/Code.svelte";
	import CodeBracket from "$lib/components/svg/CodeBracket.svelte";
	import Copy from "$lib/components/svg/Copy.svelte";
	import CopyComplete from "$lib/components/svg/CopyComplete.svelte";
	import Document from "$lib/components/svg/Document.svelte";
	import Edit from "$lib/components/svg/Edit.svelte";
	import Image from "$lib/components/svg/Image.svelte";
	import Open from "$lib/components/svg/Open.svelte";
	import Save from "$lib/components/svg/Save.svelte";
	import Slideshow from "$lib/components/svg/Slideshow.svelte";
	import Table from "$lib/components/svg/Table.svelte";
	import View from "$lib/components/svg/View.svelte";
	import ZoomIn from "$lib/components/svg/ZoomIn.svelte";
	import ZoomOut from "$lib/components/svg/ZoomOut.svelte";
	import gettingStarted from "$lib/gettingStarted.md?raw";
	import { codeEval } from "$lib/utilities/codeEval";
	import "../tailwind.css";
	import { inject } from "@vercel/analytics";
	import { processMarkdown } from "robino/util/md";
	import { afterUpdate, onMount, tick } from "svelte";

	inject({ mode: dev ? "development" : "production" });

	/** raw text that the user enters into the `textarea` element */
	let content = "";

	/** controls the expansion of the preview area */
	let viewMode = false;

	let textArea: HTMLTextAreaElement;

	let currentSlide: number;

	let file: File | null;
	let fileHandle: FileSystemFileHandle | null;

	/** `true` if the browser supports the `window.showOpenFilePicker` method */
	const supported = Boolean(window.showOpenFilePicker);

	const fontSizes = [
		"prose-sm",
		"prose-base",
		"prose-lg",
		"prose-xl",
		"prose-2xl",
	];

	const fontFamilies = [
		"font-sans",
		"font-sans-rounded",
		"font-serif",
		"font-antique",
		"font-mono",
	];

	const colors = {
		prose: ["", "prose-teal", "prose-sky", "prose-rose"],
		medium: ["bg-gray-500", "bg-teal-500", "bg-sky-500", "bg-rose-500"],
		dark: ["bg-gray-900", "bg-teal-950", "bg-sky-950", "bg-red-950"],
	};

	const viewTypes = ["document", "slideshow"] as const;

	interface Preferences {
		fontSize: number;
		fontFamily: number;
		color: number;
		viewType: (typeof viewTypes)[number];
	}

	let preferences: Preferences = {
		fontSize: 1,
		fontFamily: 0,
		color: 0,
		viewType: "document",
	};

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
	};

	const toggleView = () => {
		const toggleView = () => (viewMode = !viewMode);

		if (document.startViewTransition) {
			document.startViewTransition(() => toggleView());
		} else toggleView();
	};

	const changeViewType = (type: typeof preferences.viewType) => {
		preferences.viewType = type;
		savePreferences();
	};

	const changeProseSize = (action: "increase" | "decrease") => {
		if (action === "increase") {
			if (preferences.fontSize < fontSizes.length - 1) preferences.fontSize++;
		} else if (preferences.fontSize > 0) preferences.fontSize--;

		savePreferences();
	};

	const changeColor = () => {
		if (preferences.color < colors.prose.length - 1) {
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
		const { formatMd } = await import("$lib/utilities/formatMd");
		const sel = textArea.selectionStart;
		content = await formatMd(content);
		await tick();
		textArea.setSelectionRange(sel, sel);
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if ((e.ctrlKey || e.metaKey) && e.key === "s") {
			e.preventDefault();
			fmt();
		}
	};

	const findCurrentSlide = () => {
		if (preferences.viewType === "slideshow" && !viewMode) {
			const s = content.slice(0, textArea.selectionStart);
			let curr = s.split("\n\n---\n").length - 1;
			if (s.startsWith("---\n")) curr++; // if first line === `---`, considered an <hr>
			currentSlide = curr;
		}
	};

	onMount(async () => {
		const saved = localStorage.getItem("preferences");
		if (saved) {
			preferences = JSON.parse(saved);
		} else {
			savePreferences();
		}

		await import("drab/define");
	});

	afterUpdate(async () => {
		await tick();
		codeEval();
	});

	let html = "";

	$: {
		processMarkdown(content ? content : gettingStarted.trim()).then(
			(result) => (html = result.html),
		);
	}
</script>

<svelte:document on:keyup={onKeyUp} on:keydown={onKeyDown} />

<div
	class="selection:bg-opacity-40 flex h-[100dvh] flex-col bg-gray-950 text-gray-50 selection:bg-gray-400"
	on:drop={dropFile}
	role="main"
>
	{#if !viewMode}
		<header class="flex justify-between p-3 text-sm">
			<nav class="flex w-full items-center justify-between sm:w-fit">
				<div class="flex">
					{#if supported}
						<button
							title="Open (or drag and drop)"
							class="button"
							on:click={open}
						>
							<Open />
							<span class="hidden lg:inline">Open</span>
						</button>
						<button title="Save As" class="button" on:click={saveAs}>
							<Save />
							<span class="hidden lg:inline">Save As</span>
						</button>
					{:else}
						<a
							href="data:text/plain,{content}"
							download="Untitled.md"
							title="Download"
							class="button"
						>
							<Save />
							<span class="hidden lg:inline">Download</span>
						</a>
					{/if}
					<drab-copy value={content} class="contents">
						<button data-trigger class="button">
							<span data-content>
								<Copy />
							</span>
							<template data-swap>
								<CopyComplete />
							</template>
							<span class="hidden lg:inline">Copy</span>
						</button>
					</drab-copy>

					<drab-copy value={html} class="contents">
						<button data-trigger title="Copy HTML" class="button">
							<span data-content>
								<Code />
							</span>
							<template data-swap>
								<CopyComplete />
							</template>
							<span class="hidden lg:inline">Copy</span>
						</button>
					</drab-copy>
					<PrintButton innerHtml={html} />
					<button title="Format" on:click={fmt} class="button">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							class="h-5 w-5"
						>
							<path
								fill-rule="evenodd"
								d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z"
								clip-rule="evenodd"
							/>
							<path
								d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z"
							/>
						</svg>
						<span class="hidden lg:inline">Format</span>
					</button>
					<button title="View" class="button lg:hidden" on:click={toggleView}>
						<View />
					</button>
				</div>
			</nav>
			<div class="hidden px-4 py-2 font-bold sm:block">
				{file?.name ? file.name : "Typo"}
			</div>
		</header>
	{/if}
	<main class="grid grow overflow-hidden {viewMode ? '' : 'lg:grid-cols-2'}">
		{#if !viewMode}
			<div class="flex h-full flex-col">
				<drab-editor class="contents">
					<textarea
						bind:this={textArea}
						data-content
						class="grow resize-none appearance-none overflow-y-auto p-6 font-mono text-sm transition placeholder:text-gray-400 focus:outline-none {colors
							.dark[preferences.color]}"
						placeholder="# Title"
						bind:value={content}
					></textarea>
					<div class="flex flex-wrap p-3">
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
							<Bullet />
						</button>
						<button
							data-trigger
							class="button"
							title="Blockquote"
							data-value="> "
							data-type="block"
						>
							<Blockquote />
						</button>
						<button
							data-trigger
							class="button italic"
							title="Italic"
							data-value="*"
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
							class="button font-normal line-through"
							title="Strikethrough"
							data-value="~"
							data-type="wrap"
						>
							S
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
								<Anchor />
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
							<Image />
						</button>
						<button
							data-trigger
							class="button"
							title="Table"
							data-value={"| th  | th  |\n| --- | --- |\n| td  | td  |\n| td  | td  |"}
							data-type="inline"
							data-key={"\\"}
						>
							<Table />
						</button>
						<button
							data-trigger
							class="button"
							title="Code"
							data-value={"`"}
							data-type="wrap"
						>
							<CodeBracket />
						</button>
						<button
							data-trigger
							class="button"
							title="Slide"
							data-value="---"
							data-type="inline"
						>
							<Slideshow />
						</button>
					</div>
				</drab-editor>
			</div>
		{/if}
		<div
			style="view-transition-name: preview;"
			class="flex-col lg:flex {viewMode ? 'flex' : 'hidden'}"
		>
			<div
				class="grow overflow-y-auto border-gray-100 bg-white dark:border-y dark:border-gray-900 dark:bg-gray-950 {viewMode
					? 'max-h-[calc(100dvh-3.75rem)]'
					: 'max-h-[calc(100dvh-7.5rem)]'}"
				class:border-y={preferences.viewType === "document" && viewMode}
				class:dark:border-none={preferences.viewType === "slideshow" &&
					viewMode}
			>
				<!-- content -->
				<div
					class="prose prose-gray dark:prose-invert prose-img:rounded-lg mx-auto h-full max-w-[72ch] break-words transition-[font-size] {fontSizes[
						preferences.fontSize
					]} {colors.prose[preferences.color]} {fontFamilies[
						preferences.fontFamily
					]}"
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
				class="group flex justify-between p-3"
				class:bg-white={viewMode}
				class:text-gray-950={viewMode}
				class:dark:bg-gray-950={viewMode}
				class:dark:text-gray-50={viewMode}
			>
				<!-- viewType controls -->
				<div class="flex">
					{#each viewTypes as type}
						<button
							class="button group-hover:opacity-100"
							class:opacity-0={viewMode}
							disabled={preferences.viewType === type}
							on:click={() => changeViewType(type)}
							title={type}
						>
							{#if type === "document"}
								<Document />
							{:else if type === "slideshow"}
								<Slideshow />
							{/if}
						</button>
					{/each}
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
						on:click={changeColor}
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
						on:click={changeFontFamily}
						aria-label={preferences.fontFamily ? "sans-serif" : "serif"}
					>
						F
					</button>
					<button
						title="Decrease Font Size"
						class="button group-hover:opacity-100"
						class:opacity-0={viewMode}
						disabled={preferences.fontSize < 1}
						on:click={() => changeProseSize("decrease")}
					>
						<ZoomOut />
					</button>
					<button
						title="Increase Font Size"
						class="button group-hover:opacity-100"
						class:opacity-0={viewMode}
						disabled={preferences.fontSize >= fontSizes.length - 1}
						on:click={() => changeProseSize("increase")}
					>
						<ZoomIn />
					</button>

					<drab-fullscreen class="contents">
						<button
							data-trigger
							aria-label="Toggle Fullscreen"
							class="button group-hover:opacity-100"
							class:opacity-0={viewMode}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								class="h-5 w-5"
							>
								<path
									fill-rule="evenodd"
									d="M15 3.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V5.56l-3.97 3.97a.75.75 0 1 1-1.06-1.06l3.97-3.97h-2.69a.75.75 0 0 1-.75-.75Zm-12 0A.75.75 0 0 1 3.75 3h4.5a.75.75 0 0 1 0 1.5H5.56l3.97 3.97a.75.75 0 0 1-1.06 1.06L4.5 5.56v2.69a.75.75 0 0 1-1.5 0v-4.5Zm11.47 11.78a.75.75 0 1 1 1.06-1.06l3.97 3.97v-2.69a.75.75 0 0 1 1.5 0v4.5a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1 0-1.5h2.69l-3.97-3.97Zm-4.94-1.06a.75.75 0 0 1 0 1.06L5.56 19.5h2.69a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 1.5 0v2.69l3.97-3.97a.75.75 0 0 1 1.06 0Z"
									clip-rule="evenodd"
								/>
							</svg>
						</button>
					</drab-fullscreen>

					<!-- viewMode toggle -->
					<button
						title={viewMode ? "Edit" : "View"}
						class="button"
						on:click={toggleView}
					>
						{#if viewMode}
							<Edit />
						{:else}
							<View />
						{/if}
					</button>
				</div>
			</div>
		</div>
	</main>
</div>
