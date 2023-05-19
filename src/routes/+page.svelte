<script lang="ts">
	import { browser } from "$app/environment";

	import Markdoc from "@markdoc/markdoc";

	import Bullet from "../lib/svg/Bullet.svelte";
	import Blockquote from "../lib/svg/Blockquote.svelte";
	import Anchor from "../lib/svg/Anchor.svelte";
	import Image from "../lib/svg/Image.svelte";
	import Table from "../lib/svg/Table.svelte";
	import View from "../lib/svg/View.svelte";
	import Edit from "../lib/svg/Edit.svelte";

	let content = "";
	let viewMode = false;
	let scrollY: number;
	let file: File;
	let fileHandle: FileSystemFileHandle;
	let textArea: HTMLTextAreaElement;
	let supported = false;
	if (browser) supported = Boolean(window.showOpenFilePicker);
	$: wordCount = getWordCount(content);

	const contentElements: ContentElement[] = [
		{
			name: "heading",
			text: "parent",
			inline: false,
			icon: "H",
			subElements: [
				{
					name: "heading 1",
					text: "# ",
					inline: false,
					icon: "H1",
				},
				{
					name: "heading 2",
					text: "## ",
					inline: false,
					icon: "H2",
				},
				{
					name: "heading 3",
					text: "### ",
					inline: false,
					icon: "H3",
				},
				{
					name: "heading 4",
					text: "#### ",
					inline: false,
					icon: "H4",
				},
			],
		},
		{
			name: "bullet",
			text: "- ",
			inline: false,
			icon: Bullet,
		},
		{
			name: "blockquote",
			text: "> ",
			inline: false,
			icon: Blockquote,
		},
		{
			name: "bold",
			text: "**",
			inline: false,
			icon: "B",
		},
		{
			name: "anchor",
			text: "[text](href)",
			inline: true,
			icon: Anchor,
		},
		{
			name: "image",
			text: "![alt](src)",
			inline: true,
			icon: Image,
		},
		{
			name: "table",
			text: "| th | th |\n| -- | -- |\n| td | td |\n| td | td |",
			inline: true,
			icon: Table,
		},
	];

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
		const carPos = textArea.selectionEnd;
		if (el.inline) {
			// insert at current position
			content = `${content.slice(0, carPos)}${el.text}${content.slice(carPos)}`;
		} else {
			const splitContent = content.split("\n");
			let characterCount = 0;
			for (let i = 0; i < splitContent.length; i++) {
				// for each line
				characterCount++; // account for removed "\n" due to .split()
				characterCount += splitContent[i].length;
				// find the line that the cursor is on
				if (characterCount > carPos) {
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
			for (let i = carPos; i < content.length; i++) {
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
			startPos = carPos + el.text.length;
			endPos = carPos + el.text.length;
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
</script>

<svelte:window bind:scrollY />

{#if !viewMode}
	<header
		class="flex flex-col-reverse justify-between bg-slate-950 p-4 sm:flex-row sm:items-center"
	>
		<nav class="flex flex-wrap">
			{#if supported}
				<button class="btn" on:click={open}>Open</button>
				<button class="btn" on:click={saveAs}>Save&nbsp;As</button>
			{:else}
				<a href="data:text/plain,{content}" download="Untitled.md" class="btn">
					Download
				</a>
			{/if}
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
		<h1 class="px-4 py-2 font-bold">
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
			class="max-w-none resize-none appearance-none bg-transparent p-4 font-mono transition placeholder:text-slate-400 focus:outline-none"
			placeholder="# Title"
			bind:value={content}
			bind:this={textArea}
			on:input={save}
		/>
	{/if}
	<div
		class="prose prose-slate max-w-none overflow-y-auto bg-slate-50 p-4 text-slate-950 md:block"
		class:hidden={!viewMode}
	>
		{@html mdToHtml(content)}
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
	<button class="btn" on:click={() => (viewMode = !viewMode)}>
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
