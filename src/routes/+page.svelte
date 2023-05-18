<script lang="ts">
	import { browser } from "$app/environment";
	import Markdoc from "@markdoc/markdoc";

	let content = "";
	let viewMode = false;
	let scrollY: number;
	let file: File;
	let fileHandle: FileSystemFileHandle;
	let textArea: HTMLTextAreaElement;
	let supported = false;
	if (browser) supported = Boolean(window.showOpenFilePicker);

	$: wordCount = getWordCount(content);

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

	const addContent = async (s: string, inline: boolean) => {
		const carPos = textArea.selectionEnd;
		if (inline) {
			// insert at current position
			content = `${content.slice(0, carPos)}${s}${content.slice(carPos)}`;
		} else {
			const splitContent = content.split("\n");
			let characterCount = 0;
			for (let i = 0; i < splitContent.length; i++) {
				characterCount++; // account for removed "\n" due to .split()
				characterCount += splitContent[i].length;
				// find the line that the cursor is on
				if (characterCount > carPos - 1) {
					// add the string to the beginning of the line
					splitContent[i] = s + splitContent[i];
					content = splitContent.join("\n");
					break;
				}
			}
		}
		await save(); // have to await to make sure focus/selection works
		
		let startPos: number;
		let endPos: number;

		if (/[a-z]/i.test(s)) {
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
			startPos = carPos + s.length;
			endPos = carPos + s.length;
		}

		textArea.focus();
		textArea.setSelectionRange(startPos, endPos);
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
		class="flex flex-col-reverse justify-between p-4 sm:flex-row sm:items-center bg-slate-950"
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
				<div class="group">
					<button class="btn">H</button>
					<div
						class="fixed hidden flex-col rounded-xl bg-slate-700 p-2 transition group-hover:flex"
					>
						<button class="btn" on:click={() => addContent("# ", false)}>
							H1
						</button>
						<button class="btn" on:click={() => addContent("## ", false)}>
							H2
						</button>
						<button class="btn" on:click={() => addContent("### ", false)}>
							H3
						</button>
						<button class="btn" on:click={() => addContent("#### ", false)}>
							H4
						</button>
					</div>
				</div>
				<button class="btn" on:click={() => addContent("- ", false)}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="h-5 w-5"
					>
						<title>bullet</title>
						<path
							fill-rule="evenodd"
							d="M6 4.75A.75.75 0 016.75 4h10.5a.75.75 0 010 1.5H6.75A.75.75 0 016 4.75zM6 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75A.75.75 0 016 10zm0 5.25a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zM1.99 4.75a1 1 0 011-1H3a1 1 0 011 1v.01a1 1 0 01-1 1h-.01a1 1 0 01-1-1v-.01zM1.99 15.25a1 1 0 011-1H3a1 1 0 011 1v.01a1 1 0 01-1 1h-.01a1 1 0 01-1-1v-.01zM1.99 10a1 1 0 011-1H3a1 1 0 011 1v.01a1 1 0 01-1 1h-.01a1 1 0 01-1-1V10z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
				<button class="btn" on:click={() => addContent("> ", false)}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="h-5 w-5"
					>
						<title>blockquote</title>
						<path
							fill-rule="evenodd"
							d="M10 3c-4.31 0-8 3.033-8 7 0 2.024.978 3.825 2.499 5.085a3.478 3.478 0 01-.522 1.756.75.75 0 00.584 1.143 5.976 5.976 0 003.936-1.108c.487.082.99.124 1.503.124 4.31 0 8-3.033 8-7s-3.69-7-8-7zm0 8a1 1 0 100-2 1 1 0 000 2zm-2-1a1 1 0 11-2 0 1 1 0 012 0zm5 1a1 1 0 100-2 1 1 0 000 2z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
				<button class="btn" on:click={() => addContent("[text](href)", true)}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="h-5 w-5"
					>
						<title>anchor</title>
						<path
							d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z"
						/>
						<path
							d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z"
						/>
					</svg>
				</button>
				<button class="btn" on:click={() => addContent("![alt](src)", true)}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="h-5 w-5"
					>
						<title>image</title>
						<path
							fill-rule="evenodd"
							d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
				<button
					class="btn"
					on:click={() =>
						addContent(
							"| th | th |\n| -- | -- |\n| td | td |\n| td | td |",
							true,
						)}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="h-5 w-5"
					>
						<title>table</title>
						<path
							fill-rule="evenodd"
							d="M.99 5.24A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25l.01 9.5A2.25 2.25 0 0116.76 17H3.26A2.267 2.267 0 011 14.74l-.01-9.5zm8.26 9.52v-.625a.75.75 0 00-.75-.75H3.25a.75.75 0 00-.75.75v.615c0 .414.336.75.75.75h5.373a.75.75 0 00.627-.74zm1.5 0a.75.75 0 00.627.74h5.373a.75.75 0 00.75-.75v-.615a.75.75 0 00-.75-.75H11.5a.75.75 0 00-.75.75v.625zm6.75-3.63v-.625a.75.75 0 00-.75-.75H11.5a.75.75 0 00-.75.75v.625c0 .414.336.75.75.75h5.25a.75.75 0 00.75-.75zm-8.25 0v-.625a.75.75 0 00-.75-.75H3.25a.75.75 0 00-.75.75v.625c0 .414.336.75.75.75H8.5a.75.75 0 00.75-.75zM17.5 7.5v-.625a.75.75 0 00-.75-.75H11.5a.75.75 0 00-.75.75V7.5c0 .414.336.75.75.75h5.25a.75.75 0 00.75-.75zm-8.25 0v-.625a.75.75 0 00-.75-.75H3.25a.75.75 0 00-.75.75V7.5c0 .414.336.75.75.75H8.5a.75.75 0 00.75-.75z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			</div>
		</nav>
		<h1 class="px-4 py-2 font-bold">
			{file?.name ? file.name : "md"}
		</h1>
	</header>
{/if}

<main 
	class="grid max-h-screen grow overflow-hidden {viewMode ? "" : "sm:grid-cols-2"}"
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
		class="prose prose-slate max-w-none overflow-y-auto bg-slate-100 p-4 text-slate-950 sm:block"
		class:hidden={!viewMode}
	>
		{@html mdToHtml(content)}
	</div>
</main>

<footer class="flex justify-between items-center gap-4 p-4 bg-slate-950">
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
	<button class="btn" on:click={() => viewMode = !viewMode}>
		{#if viewMode}
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
				<title>edit</title>
				<path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
			</svg>
		{:else}
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
				<title>view</title>
				<path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
				<path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
			</svg>
		{/if}
	</button>
</footer>

<style lang="postcss">
	.btn {
		@apply rounded-xl px-4 py-2 transition hover:bg-slate-900 hover:shadow active:bg-slate-700;
	}
</style>
