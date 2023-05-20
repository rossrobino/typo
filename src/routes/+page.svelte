<script lang="ts">
	import type { ComponentType } from "svelte";

	import { browser } from "$app/environment";

	import Markdoc from "@markdoc/markdoc";

	import Bullet from "../lib/svg/Bullet.svelte";
	import Blockquote from "../lib/svg/Blockquote.svelte";
	import Anchor from "../lib/svg/Anchor.svelte";
	import Image from "../lib/svg/Image.svelte";
	import Table from "../lib/svg/Table.svelte";
	import View from "../lib/svg/View.svelte";
	import Edit from "../lib/svg/Edit.svelte";
	import Star from "../lib/svg/Star.svelte";
	import Code from "../lib/svg/Code.svelte";

	let content = "";
	let viewMode = false;
	let scrollY: number;
	let file: File;
	let fileHandle: FileSystemFileHandle;
	let textArea: HTMLTextAreaElement;
	let supported = false;
	if (browser) supported = Boolean(window.showOpenFilePicker);
	$: wordCount = getWordCount(content);

	interface ContentElement {
		name: string;
		text: string;
		display: "inline" | "block" | "wrap";
		icon: ComponentType | string;
		key?: string;
		subElements?: ContentElement[];
	}

	const contentElements: ContentElement[] = [
		{
			name: "heading",
			text: "parent",
			display: "block",
			icon: "H",
			subElements: [
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
					name: "heading 4",
					text: "#### ",
					display: "block",
					icon: "H4",
				},
				{
					name: "heading 5",
					text: "##### ",
					display: "block",
					icon: "H5",
				},
				{
					name: "heading 6",
					text: "###### ",
					display: "block",
					icon: "H6",
				},
			],
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

	let placeholder = "\n\n\n\n\n\n";
	contentElements.forEach((el) => {
		if (el.key) placeholder += `${el.name}: ctrl+${el.key}\n`;
		if (el.subElements) {
			el.subElements.forEach((subEl) => {
				if (subEl.key) placeholder += `${subEl.name}: ctrl+${subEl.key}\n`;
			});
		}
	});

	const options: FilePickerOptions = {
		types: [
			{
				description: "markdown",
				accept: {
					"text/markdown": [".md", ".mdx", ".mdoc", ".markdoc"],
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

	const addContent = async (el: ContentElement) => {
		const carSelEnd = textArea.selectionEnd;
		const carSelStart = textArea.selectionStart;
		if (el.display === "inline") {
			// insert at current position
			content = `${content.slice(0, carSelEnd)}${el.text}${content.slice(
				carSelEnd,
			)}`;
		} else if (el.display === "wrap") {
			if (carSelStart === carSelEnd) {
				content = `${content.slice(0, carSelEnd)}${
					el.text + el.text
				}${content.slice(carSelEnd)}`;
			} else {
				content = `${content.slice(0, carSelStart)}${el.text}${content.slice(
					carSelStart,
				)}`;
				content = `${content.slice(0, carSelEnd + el.text.length)}${
					el.text
				}${content.slice(carSelEnd + el.text.length)}`;
			}
		} else {
			const splitContent = content.split("\n");
			let characterCount = 0;
			for (let i = 0; i < splitContent.length; i++) {
				// for each line
				characterCount++; // account for removed "\n" due to .split()
				characterCount += splitContent[i].length;
				// find the line that the cursor is on
				if (characterCount > carSelEnd) {
					// add the string to the beginning of the line
					splitContent[i] = el.text + splitContent[i];
					content = splitContent.join("\n");
					break;
				}
			}
		}

		await save(); // await to make sure focus/selection works

		let startPos = 0;
		let endPos = 0;
		if (/[a-z]/i.test(el.text)) {
			// if string contains letters, highlight the first word
			for (let i = carSelEnd; i < content.length; i++) {
				if (content[i].match(/[a-z]/i)) {
					if (!startPos) {
						startPos = i;
					} else {
						endPos = i + 1;
					}
				} else if (startPos) {
					break;
				}
			}
		} else {
			// leave the cursor in place
			startPos = carSelStart + el.text.length;
			endPos = carSelEnd + el.text.length;
		}

		textArea.setSelectionRange(startPos, endPos);
		textArea.focus();
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

	const onKeyDown = ({ ctrlKey, key }: KeyboardEvent) => {
		if (ctrlKey && key) {
			let matchedEl = contentElements.find((el) => el.key === key);
			if (!matchedEl) {
				for (let i = 0; i < contentElements.length; i++) {
					const currentEl = contentElements[i];
					if (currentEl.subElements) {
						matchedEl = currentEl.subElements.find((el) => el.key === key);
						if (matchedEl) break;
					}
				}
			}
			if (matchedEl) {
				addContent(matchedEl);
			} else if (key === "o") {
				open();
			} else if (key === "e") {
				toggleView();
			}
		} else if (textArea) {
			textArea.focus();
		}
		save();
	};
</script>

<svelte:window bind:scrollY on:keydown={onKeyDown} />

{#if !viewMode}
	<header class="flex justify-between bg-slate-950 p-4">
		<nav class="flex flex-wrap">
			<div class="flex w-full items-center justify-between sm:w-fit">
				<div>
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
				</div>
				<h1 class="block px-4 py-2 font-bold sm:hidden">
					{file?.name ? file.name : "md"}
				</h1>
			</div>
			<div class="flex flex-wrap">
				{#each contentElements as el}
					{#if el.subElements}
						<div class="group">
							<button class="btn">
								{#if typeof el.icon !== "string"}
									<svelte:component this={el.icon} />
								{:else}
									{el.icon}
								{/if}
							</button>
							<div
								class="fixed hidden flex-col rounded-xl bg-slate-700 p-2 transition group-hover:flex"
							>
								{#each el.subElements as subEl}
									<button class="btn" on:click={() => addContent(subEl)}>
										{#if typeof subEl.icon !== "string"}
											<svelte:component this={subEl.icon} />
										{:else}
											{subEl.icon}
										{/if}
									</button>
								{/each}
							</div>
						</div>
					{:else}
						<button class="btn" on:click={() => addContent(el)}>
							{#if typeof el.icon !== "string"}
								<svelte:component this={el.icon} />
							{:else}
								{el.icon}
							{/if}
						</button>
					{/if}
				{/each}
			</div>
		</nav>
		<h1 class="hidden px-4 py-2 font-bold sm:block">
			{file?.name ? file.name : "md"}
		</h1>
	</header>
{/if}

<main
	class="grid max-h-screen grow overflow-hidden {viewMode
		? ''
		: 'md:grid-cols-2'}"
>
	{#if !viewMode}
		<textarea
			class="placeholder: max-w-none resize-none appearance-none bg-transparent p-4 font-mono text-sm transition placeholder:text-center placeholder:text-base placeholder:text-slate-500 focus:outline-none"
			{placeholder}
			bind:value={content}
			bind:this={textArea}
		/>
	{/if}
	<div
		class="overflow-y-auto bg-slate-50 p-4 text-slate-950 md:block"
		class:hidden={!viewMode}
	>
		<div class="prose prose-slate mx-auto">
			{@html mdToHtml(content)}
		</div>
	</div>
</main>

<footer class="flex items-center justify-between gap-4 bg-slate-950 p-4">
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
	<button class="btn" on:click={toggleView}>
		{#if viewMode}
			<Edit />
		{:else}
			<View />
		{/if}
	</button>
</footer>

<style lang="postcss">
	.btn {
		@apply rounded-xl px-4 py-2 transition hover:bg-slate-900 hover:shadow active:bg-slate-700;
	}
</style>
