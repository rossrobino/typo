<script lang="ts">
	import { browser, dev } from "$app/environment";
	import { Editor } from "@rossrobino/components";

	import Markdoc from "@markdoc/markdoc";

	import Bullet from "$lib/svg/Bullet.svelte";
	import Blockquote from "$lib/svg/Blockquote.svelte";
	import Anchor from "$lib/svg/Anchor.svelte";
	import Image from "$lib/svg/Image.svelte";
	import Table from "$lib/svg/Table.svelte";
	import Star from "$lib/svg/Star.svelte";
	import Code from "$lib/svg/Code.svelte";
	import View from "$lib/svg/View.svelte";
	import Edit from "$lib/svg/Edit.svelte";
	import Slides from "$lib/Slides.svelte";
	import Document from "$lib/svg/Document.svelte";
	import Slideshow from "$lib/svg/Slideshow.svelte";
	import ZoomOut from "$lib/svg/ZoomOut.svelte";
	import ZoomIn from "$lib/svg/ZoomIn.svelte";

	let content = dev
		? "# Heading 1\n\n---\n\n## Heading 2\n\nParagraph\n\n---\n\n> blockquote"
		: "";

	let viewMode = false;

	const viewTypes = ["document", "slideshow"] as const;
	let viewType: (typeof viewTypes)[number] = "document";

	let file: File;
	let fileHandle: FileSystemFileHandle;

	let supported = false;
	if (browser) supported = Boolean(window.showOpenFilePicker);

	const proseClasses = [
		"prose-sm",
		"prose-base",
		"prose-lg",
		"prose-xl",
		"prose-2xl",
	];
	let proseSize = 1;

	$: wordCount = getWordCount(content);

	const contentElements: Editor["$$prop_def"]["contentElements"] = [
		{
			name: "heading",
			text: "# ",
			display: "block",
			icon: "H",
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
			name: "asterisk",
			text: "*",
			display: "wrap",
			icon: Star,
			key: "i",
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
			icon: Code,
		},
	];

	let placeholder = "\n\n\n\n";
	contentElements.forEach((el) => {
		if (el.key) placeholder += `${el.name}: ctrl+${el.key}\n`;
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
	 * converts md to html using markdoc
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
		if (fileHandle) {
			const writable = await fileHandle.createWritable();
			await writable.write(content);
			await writable.close();
		}
	};

	const getWordCount = (s: string) => {
		return s
			.trim()
			.split(/\W+/)
			.filter((n) => n != "").length;
	};

	const getReadingTime = (wordCount: number) => {
		const wordsPerMinute = 200;
		const minutes = Math.ceil(wordCount / wordsPerMinute);
		return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
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

	const setViewType = (type: typeof viewType) => {
		const setViewType = () => {
			viewType = type;
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

	const changeSize = (action: "increase" | "decrease") => {
		if (action === "increase") {
			if (proseSize < proseClasses.length - 1) proseSize++;
		} else {
			if (proseSize > 0) proseSize--;
		}
	};
</script>

<svelte:window on:keydown={save} />

{#if !viewMode}
	<header
		class="flex justify-between bg-black p-4 {viewMode ? 'md:hidden' : ''}"
	>
		<nav class="flex flex-wrap">
			<div class="flex w-full items-center justify-between sm:w-fit">
				<div class="flex">
					{#if supported}
						<button class="btn" on:click={open}>Open</button>
						<button class="btn" on:click={saveAs}>Save&nbsp;As</button>
					{:else}
						<a
							href="data:text/plain,{content}"
							download="Untitled.md"
							class="btn"
						>
							Download
						</a>
					{/if}
					<button class="btn block md:hidden" on:click={toggleView}>
						{#if viewMode}
							<Edit />
						{:else}
							<View />
						{/if}
					</button>
				</div>
			</div>
		</nav>
		<h1 class="px-4 py-2 font-bold">
			{file?.name ? file.name : "md"}
		</h1>
	</header>
{/if}

<main class="grid grow overflow-hidden {!viewMode ? 'md:grid-cols-2' : ''}">
	{#if !viewMode}
		<div class="flex flex-col">
			<Editor
				textAreaClass="max-w-none resize-none appearance-none bg-transparent p-4 font-mono text-sm transition placeholder:text-center placeholder:text-base placeholder:text-gray-500 focus:outline-none grow overflow-y-auto max-h-[calc(100dvh-8.75rem)]"
				controlsClass="flex flex-wrap bg-black p-4"
				buttonClass="btn"
				{contentElements}
				textAreaPlaceholder={placeholder}
				bind:textAreaValue={content}
			/>
		</div>
	{/if}
	<div
		style="view-transition-name: preview;"
		class="flex-col md:flex {viewMode ? 'flex' : 'hidden'}"
	>
		<div
			class="{viewMode
				? 'max-h-[calc(100dvh-3.25rem)]'
				: 'max-h-[calc(100dvh-12rem)]'} grow overflow-y-auto bg-white text-gray-950"
		>
			<!-- content -->
			<div
				class="prose prose-gray mx-auto h-full max-w-[70ch] {proseClasses[
					proseSize
				]}"
			>
				{#if viewType === "document"}
					<div class="p-4">
						{@html mdToHtml(content)}
					</div>
				{:else if viewType === "slideshow"}
					<Slides bind:viewMode html={mdToHtml(content)} />
				{/if}
			</div>
		</div>
		<div class="flex justify-between bg-gray-300 p-2">
			<!-- viewType controls -->
			<div>
				{#each viewTypes as type}
					<button
						class="btn btn-s"
						disabled={viewType === type}
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
			<div>
				<button
					disabled={proseSize < 1}
					on:click={() => changeSize("decrease")}
					class="btn btn-s"
				>
					<ZoomOut />
				</button>
				<button
					disabled={proseSize >= proseClasses.length - 1}
					on:click={() => changeSize("increase")}
					class="btn btn-s"
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
			<div
				class="flex h-[4.25rem] items-center justify-between gap-4 bg-black p-4"
			>
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
						{getReadingTime(wordCount)}
					</div>
				</div>
			</div>
		{/if}
	</div>
</main>
