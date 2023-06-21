<script lang="ts">
	import { browser } from "$app/environment";

	import { Editor } from "@rossrobino/components";
	import Markdoc from "@markdoc/markdoc";

	import gettingStarted from "$lib/gettingStarted.markdoc?raw";

	import Slides from "$lib/components/Slides.svelte";
	import CopyButton from "$lib/components/CopyButton.svelte";
	import Metrics from "$lib/components/Metrics.svelte";

	// svg
	import Bullet from "$lib/svg/Bullet.svelte";
	import Blockquote from "$lib/svg/Blockquote.svelte";
	import Anchor from "$lib/svg/Anchor.svelte";
	import Image from "$lib/svg/Image.svelte";
	import Table from "$lib/svg/Table.svelte";
	import Code from "$lib/svg/Code.svelte";
	import View from "$lib/svg/View.svelte";
	import Edit from "$lib/svg/Edit.svelte";
	import Document from "$lib/svg/Document.svelte";
	import Slideshow from "$lib/svg/Slideshow.svelte";
	import ZoomOut from "$lib/svg/ZoomOut.svelte";
	import ZoomIn from "$lib/svg/ZoomIn.svelte";
	import Open from "$lib/svg/Open.svelte";
	import Save from "$lib/svg/Save.svelte";
	import Copy from "$lib/svg/Copy.svelte";
	import CopyComplete from "$lib/svg/CopyComplete.svelte";
	import CodeBracket from "$lib/svg/CodeBracket.svelte";
	import New from "$lib/svg/New.svelte";

	const viewTypes = ["document", "slideshow"] as const;

	interface Saved {
		proseSize: number;
		proseColor: number;
		serif: boolean;
		viewType: (typeof viewTypes)[number];
	}

	let saved: Saved = {
		proseSize: 1,
		proseColor: 0,
		serif: false,
		viewType: "document",
	};

	export const snapshot = {
		capture: () => saved,
		restore: (value) => (saved = value),
	};

	/**
	 * raw text that the user enters into the `textarea` element
	 */
	let content = "";

	/**
	 *  controls the expansion of the preview area
	 */
	let viewMode = false;

	let file: File;
	let fileHandle: FileSystemFileHandle;

	/**
	 * `true` if the browser supports the `window.showOpenFilePicker` method
	 */
	let supported = false;
	if (browser) supported = Boolean(window.showOpenFilePicker);

	/**
	 * options for prose sizes, these classes are provided by the `@tailwindcss/typography` package
	 */
	const proseSizes = [
		"prose-sm",
		"prose-base",
		"prose-lg",
		"prose-xl",
		"prose-2xl",
	];

	const proseColors = ["prose-gray", "prose-sky", "prose-teal", "prose-rose"];
	const bgColors = ["bg-gray-500", "bg-sky-500", "bg-teal-500", "bg-rose-500"];

	/**
	 * passed in as a prop for the `Editor.svelte` controls
	 */
	const contentElements: Editor["$$prop_def"]["contentElements"] = [
		{
			name: "heading 1",
			text: "# ",
			display: "block",
			icon: "H1",
		},
		{
			name: "heading 2",
			text: "## ",
			display: "block",
			icon: "H2",
		},
		{
			name: "heading 3",
			text: "### ",
			display: "block",
			icon: "H3",
		},
		{
			name: "bullet",
			text: "- ",
			display: "block",
			icon: Bullet,
		},
		{
			name: "blockquote",
			text: "> ",
			display: "block",
			icon: Blockquote,
		},
		{
			name: "italic",
			text: "*",
			display: "wrap",
			icon: "I",
			key: "i",
		},
		{
			name: "bold",
			text: "**",
			display: "wrap",
			icon: "B",
		},
		{
			name: "anchor",
			text: "[text](href)",
			display: "inline",
			icon: Anchor,
			key: "[",
		},
		{
			name: "image",
			text: "![alt](src)",
			display: "inline",
			icon: Image,
			key: "]",
		},
		{
			name: "table",
			text: "| th | th |\n| -- | -- |\n| td | td |\n| td | td |",
			display: "inline",
			icon: Table,
			key: "\\",
		},
		{
			name: "code",
			text: "`",
			display: "wrap",
			icon: CodeBracket,
		},
		{
			name: "slide",
			text: "---",
			display: "inline",
			icon: Slideshow,
		},
	];

	let placeholder = gettingStarted;
	contentElements.forEach((el) => {
		if (el.key) placeholder += `\n- ${el.name}: \`ctrl+${el.key}\``;
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

	/**
	 * converts md to html using `Markdoc`
	 *
	 * @param md - string
	 */
	const mdToHtml = (md: string) => {
		const ast = Markdoc.parse(md);
		const mdContent = Markdoc.transform(ast);
		const html = Markdoc.renderers.html(mdContent);
		return html;
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

	const setViewType = (type: typeof saved.viewType) => {
		const setViewType = () => {
			saved.viewType = type;
		};

		// @ts-expect-error
		if (document.startViewTransition) {
			// @ts-expect-error
			document.startViewTransition(() => {
				setViewType();
			});
		} else {
			setViewType();
		}
	};

	const changeProseSize = (action: "increase" | "decrease") => {
		if (action === "increase") {
			if (saved.proseSize < proseSizes.length - 1) saved.proseSize++;
		} else {
			if (saved.proseSize > 0) saved.proseSize--;
		}
	};

	const changeProseColor = () => {
		if (saved.proseColor < proseColors.length - 1) {
			saved.proseColor++;
		} else {
			saved.proseColor = 0;
		}
	};
</script>

<svelte:document on:keydown={save} />

{#if !viewMode}
	<header
		class="flex justify-between bg-black p-4 {viewMode ? 'lg:hidden' : ''}"
	>
		<nav class="flex flex-wrap">
			<div class="flex w-full items-center justify-between sm:w-fit">
				<div class="flex">
					<a href="/" target="_blank" class="btn">
						<New />
						<span class="hidden lg:inline">New</span>
					</a>
					{#if supported}
						<button class="btn" on:click={open}>
							<Open />
							<span class="hidden lg:inline">Open</span>
						</button>
						<button class="btn" on:click={saveAs}>
							<Save />
							<span class="hidden lg:inline">Save</span>
						</button>
					{:else}
						<a
							href="data:text/plain,{content}"
							download="Untitled.md"
							class="btn"
						>
							<Save />
							<span class="hidden lg:inline">Save</span>
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
					<CopyButton content={mdToHtml(content)}>
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
					<button class="btn block lg:hidden" on:click={toggleView}>
						{#if viewMode}
							<Edit />
						{:else}
							<View />
						{/if}
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
				textAreaClass="max-w-none resize-none appearance-none bg-transparent p-4 font-mono text-sm transition placeholder:text-gray-500 focus:outline-none grow overflow-y-auto max-h-[calc(100dvh-8.75rem)]"
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
		class="flex-col lg:flex {viewMode ? 'flex' : 'hidden'}"
	>
		<div
			class="{viewMode
				? 'max-h-[calc(100dvh-3.25rem)]'
				: 'max-h-[calc(100dvh-12rem)]'} grow overflow-y-auto bg-white text-gray-950"
		>
			<!-- content -->
			<div
				class="prose mx-auto h-full max-w-[70ch] {proseSizes[
					saved.proseSize
				]} {proseColors[saved.proseColor]}"
				class:font-serif={saved.serif}
			>
				{#if saved.viewType === "document"}
					<div class="p-8">
						{@html mdToHtml(content ? content : placeholder)}
					</div>
				{:else if saved.viewType === "slideshow"}
					<Slides
						bind:viewMode
						html={mdToHtml(content ? content : placeholder)}
					/>
				{/if}
			</div>
		</div>
		<div class="flex justify-between bg-gray-50 p-2">
			<!-- viewType controls -->
			<div class="flex">
				{#each viewTypes as type}
					<button
						class="btn btn-s"
						disabled={saved.viewType === type}
						on:click={() => setViewType(type)}
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
				<button class="btn btn-s" on:click={changeProseColor}>
					<div class="h-5 w-5 rounded-full {bgColors[saved.proseColor]}" />
				</button>
				<button
					class="btn btn-s"
					class:font-serif={!saved.serif}
					on:click={() => (saved.serif = !saved.serif)}
					aria-label={saved.serif ? "sans-serif" : "serif"}
				>
					F
				</button>
				<button
					class="btn btn-s"
					disabled={saved.proseSize < 1}
					on:click={() => changeProseSize("decrease")}
				>
					<ZoomOut />
				</button>
				<button
					class="btn btn-s"
					disabled={saved.proseSize >= proseSizes.length - 1}
					on:click={() => changeProseSize("increase")}
				>
					<ZoomIn />
				</button>
				<!-- viewMode toggle -->
				<button class="btn btn-s" on:click={toggleView}>
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
