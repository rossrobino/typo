<script lang="ts">
	import { browser } from "$app/environment";
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

	let content = "";
	let viewMode = false;
	let file: File;
	let fileHandle: FileSystemFileHandle;
	let supported = false;
	if (browser) supported = Boolean(window.showOpenFilePicker);
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

	const toggleView = () => (viewMode = !viewMode);
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
	<div class="flex-col md:flex {viewMode ? 'flex' : 'hidden'}">
		<div
			class="{viewMode
				? 'max-h-[100dvh]'
				: 'max-h-[calc(100dvh-8.75rem)]'} grow overflow-y-auto bg-gray-50 p-4 text-gray-950"
		>
			<div class="prose prose-gray mx-auto">
				{@html mdToHtml(content)}
			</div>
		</div>
		{#if !viewMode}
			<div class="flex items-center justify-between gap-4 bg-black p-4">
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
				<button class="btn" on:click={toggleView}><View /></button>
			</div>
		{:else}
			<button
				class="btn btn-s absolute bottom-4 right-5"
				on:click={toggleView}
			>
				<Edit />
			</button>
		{/if}
	</div>
</main>
