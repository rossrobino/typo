<script lang="ts">
	import "../app.postcss";

	import { dev, browser } from "$app/environment";
	import { afterUpdate, onMount, tick } from "svelte";

	import { Editor } from "@rossrobino/components";
	import { inject } from "@vercel/analytics";

	import gettingStarted from "$lib/gettingStarted.md?raw";

	import Slides from "$lib/components/Slides.svelte";
	import CopyButton from "$lib/components/CopyButton.svelte";
	import Metrics from "$lib/components/Metrics.svelte";

	import { jsEval } from "$lib/utilities/jsEval";
	import { mdToHtml } from "$lib/utilities/mdToHtml";

	// svg
	import Bullet from "$lib/components/svg/Bullet.svelte";
	import Blockquote from "$lib/components/svg/Blockquote.svelte";
	import Anchor from "$lib/components/svg/Anchor.svelte";
	import Image from "$lib/components/svg/Image.svelte";
	import Table from "$lib/components/svg/Table.svelte";
	import Code from "$lib/components/svg/Code.svelte";
	import View from "$lib/components/svg/View.svelte";
	import Edit from "$lib/components/svg/Edit.svelte";
	import Document from "$lib/components/svg/Document.svelte";
	import Slideshow from "$lib/components/svg/Slideshow.svelte";
	import ZoomOut from "$lib/components/svg/ZoomOut.svelte";
	import ZoomIn from "$lib/components/svg/ZoomIn.svelte";
	import Open from "$lib/components/svg/Open.svelte";
	import Save from "$lib/components/svg/Save.svelte";
	import Copy from "$lib/components/svg/Copy.svelte";
	import CopyComplete from "$lib/components/svg/CopyComplete.svelte";
	import CodeBracket from "$lib/components/svg/CodeBracket.svelte";
	import New from "$lib/components/svg/New.svelte";

	inject({ mode: dev ? "development" : "production" });

	/** raw text that the user enters into the `textarea` element */
	let content = "";

	/** controls the expansion of the preview area */
	let viewMode = false;

	let file: File;
	let fileHandle: FileSystemFileHandle;

	/** `true` if the browser supports the `window.showOpenFilePicker` method */
	let supported = false;
	if (browser) supported = Boolean(window.showOpenFilePicker);

	const fontSizes = [
		"prose-sm",
		"prose-base",
		"prose-lg",
		"prose-xl",
		"prose-2xl",
	];

	const fontFamilies = [
		"font-sans",
		"font-round",
		"font-serif",
		"font-antique",
	];

	const colors = {
		prose: ["prose-gray", "prose-teal", "prose-sky", "prose-rose"],
		medium: ["bg-gray-500", "bg-teal-500", "bg-sky-500", "bg-rose-500"],
		dark: ["bg-gray-900", "bg-teal-900", "bg-sky-900", "bg-gray-900"],
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

	const savePreferences = () => {
		localStorage.setItem("preferences", JSON.stringify(preferences));
	};

	/** passed in as a prop for the `Editor.svelte` controls */
	const contentElements: Editor["$$prop_def"]["contentElements"] = [
		{
			name: "Heading",
			text: "# ",
			display: "block",
			icon: "H",
		},
		{
			name: "Bullet",
			text: "- ",
			display: "block",
			icon: Bullet,
		},
		{
			name: "Blockquote",
			text: "> ",
			display: "block",
			icon: Blockquote,
		},
		{
			name: "Italic",
			text: "*",
			display: "wrap",
			icon: "I",
			class: "italic",
		},
		{
			name: "Bold",
			text: "**",
			display: "wrap",
			icon: "B",
		},
		{
			name: "Strikethrough",
			text: "~",
			display: "wrap",
			icon: "S",
			class: "line-through font-normal",
		},
		{
			name: "Anchor",
			text: "[text](href)",
			display: "inline",
			icon: Anchor,
			key: "[",
		},
		{
			name: "Image",
			text: "![alt](src)",
			display: "inline",
			icon: Image,
			key: "]",
		},
		{
			name: "Table",
			text: "| th | th |\n| -- | -- |\n| td | td |\n| td | td |",
			display: "inline",
			icon: Table,
			key: "\\",
		},
		{
			name: "Code",
			text: "`",
			display: "wrap",
			icon: CodeBracket,
		},
		{
			name: "Slide",
			text: "---",
			display: "inline",
			icon: Slideshow,
		},
	];

	let placeholder = gettingStarted;
	contentElements.forEach((el) => {
		if (el.key) placeholder += `\n- ${el.name}: \`CTRL\`+\`${el.key}\``;
	});

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
		toggleView();
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

	const toggleView = () => {
		const toggleView = () => {
			viewMode = !viewMode;
		};

		// @ts-expect-error
		if (document.startViewTransition) {
			// @ts-expect-error
			document.startViewTransition(() => {
				toggleView();
			});
		} else {
			toggleView();
		}
	};

	const changeViewType = (type: typeof preferences.viewType) => {
		preferences.viewType = type;
		savePreferences();
	};

	const changeProseSize = (action: "increase" | "decrease") => {
		if (action === "increase") {
			if (preferences.fontSize < fontSizes.length - 1) preferences.fontSize++;
		} else {
			if (preferences.fontSize > 0) preferences.fontSize--;
		}
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

	const onKeyDown = (e: KeyboardEvent) => {
		save();
		if (e.key === "Escape") toggleView();
	};

	onMount(() => {
		const saved = localStorage.getItem("preferences");
		if (saved) {
			preferences = JSON.parse(saved);
		} else {
			savePreferences();
		}
	});

	afterUpdate(async () => {
		await tick();
		jsEval();
	});
</script>

<svelte:document on:keydown={onKeyDown} />

<div
	class="flex h-[100dvh] flex-col text-gray-50 selection:bg-gray-400 selection:bg-opacity-40 {colors
		.dark[preferences.color]}"
>
	{#if !viewMode}
		<header class="flex justify-between bg-black p-4">
			<nav class="flex flex-wrap">
				<div class="flex w-full items-center justify-between sm:w-fit">
					<div class="flex">
						<a href="/" title="New" target="_blank" class="btn">
							<New />
							<span class="hidden lg:inline">New</span>
						</a>
						{#if supported}
							<button title="Open" class="btn" on:click={open}>
								<Open />
								<span class="hidden lg:inline">Open</span>
							</button>
							<button title="Save As" class="btn" on:click={saveAs}>
								<Save />
								<span class="hidden lg:inline">Save As</span>
							</button>
						{:else}
							<a
								href="data:text/plain,{content}"
								download="Untitled.md"
								title="Download"
								class="btn"
							>
								<Save />
								<span class="hidden lg:inline">Download</span>
							</a>
						{/if}
						<CopyButton {content}>
							<Copy />
							<span class="hidden lg:inline">Copy</span>
							<span
								class="flex items-center justify-center gap-1"
								slot="complete"
							>
								<CopyComplete />
								<span class="hidden lg:inline">Copy</span>
							</span>
						</CopyButton>
						<CopyButton title="Copy HTML" content={mdToHtml(content)}>
							<Code />
							<span class="hidden lg:inline">Copy HTML</span>
							<span
								class="flex items-center justify-center gap-1"
								slot="complete"
							>
								<CopyComplete />
								<span class="hidden lg:inline">Copy HTML</span>
							</span>
						</CopyButton>
						<button title="View" class="btn lg:hidden" on:click={toggleView}>
							<View />
						</button>
					</div>
				</div>
			</nav>
			<div class="px-4 py-2 font-bold">
				{file?.name ? file.name : "md"}
			</div>
		</header>
	{/if}
	<main class="grid grow overflow-hidden {!viewMode ? 'lg:grid-cols-2' : ''}">
		{#if !viewMode}
			<div class="flex flex-col">
				<Editor
					textAreaClass="max-w-none resize-none appearance-none bg-transparent p-4 font-mono text-sm transition placeholder:text-gray-300 focus:outline-none grow overflow-y-auto max-h-[calc(100dvh-8.75rem)]"
					controlsClass="flex flex-wrap bg-black p-4"
					buttonClass="btn"
					{contentElements}
					textAreaPlaceholder="# Title"
					bind:textAreaValue={content}
				/>
			</div>
		{/if}
		<div
			style="view-transition-name: preview;"
			class="flex-col bg-white lg:flex {viewMode ? 'flex' : 'hidden'}"
		>
			<div
				class="{viewMode
					? 'max-h-[calc(100dvh-3.25rem)]'
					: 'max-h-[calc(100dvh-12rem)]'} grow overflow-y-auto text-gray-950"
			>
				<!-- content -->
				<div
					class="prose mx-auto h-full max-w-[72ch] prose-pre:bg-gray-900 {fontSizes[
						preferences.fontSize
					]} {colors.prose[preferences.color]} {fontFamilies[
						preferences.fontFamily
					]}"
					role="document"
				>
					{#if preferences.viewType === "document"}
						<div class="p-8">
							{@html mdToHtml(content ? content : placeholder)}
						</div>
					{:else if preferences.viewType === "slideshow"}
						<Slides
							bind:viewMode
							html={mdToHtml(content ? content : placeholder)}
						/>
					{/if}
				</div>
			</div>
			<div
				class="group flex justify-between bg-gray-50 p-2"
				class:bg-transparent={preferences.viewType === "slideshow"}
			>
				<!-- viewType controls -->
				<div class="flex">
					{#each viewTypes as type}
						<button
							class="btn btn-s group-hover:flex"
							class:hidden={viewMode}
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
				</div>
				<div class="flex">
					<button
						title="Change Color"
						class="btn btn-s group-hover:flex"
						class:hidden={viewMode}
						on:click={changeColor}
					>
						<div
							class="h-5 w-5 rounded-full {colors.medium[preferences.color]}"
						/>
					</button>
					<button
						title="Change Font"
						class="btn btn-s group-hover:flex {fontFamilies[
							preferences.fontFamily
						]}"
						class:hidden={viewMode}
						on:click={changeFontFamily}
						aria-label={preferences.fontFamily ? "sans-serif" : "serif"}
					>
						F
					</button>
					<button
						title="Decrease Font Size"
						class="btn btn-s group-hover:flex"
						class:hidden={viewMode}
						disabled={preferences.fontSize < 1}
						on:click={() => changeProseSize("decrease")}
					>
						<ZoomOut />
					</button>
					<button
						title="Increase Font Size"
						class="btn btn-s group-hover:flex"
						class:hidden={viewMode}
						disabled={preferences.fontSize >= fontSizes.length - 1}
						on:click={() => changeProseSize("increase")}
					>
						<ZoomIn />
					</button>
					<!-- viewMode toggle -->
					<button
						title={viewMode ? "Edit" : "View"}
						class="btn btn-s"
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
			{#if !viewMode}
				<Metrics {content} />
			{/if}
		</div>
	</main>
</div>
