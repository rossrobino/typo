<script lang="ts">
	import { browser } from "$app/environment";
	import Markdoc from "@markdoc/markdoc";

	let content = "";
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

	const onInput = async () => {
		// textArea.style.height = `${textArea.scrollHeight}px`;
		save();
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
		await onInput(); // have to await to make sure focus/selection works
		textArea.focus();
		const newCarPos = carPos + s.length;
		textArea.setSelectionRange(inline ? carPos : newCarPos, newCarPos);
	};

	const getWordCount = (text: string) => {
		return text
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

<header
	class="flex flex-col-reverse justify-between bg-stone-800 p-4 sm:flex-row sm:items-center"
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
					class="fixed hidden flex-col rounded-xl bg-stone-700 p-2 transition group-hover:flex"
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
			<button class="btn" on:click={() => addContent("![alt text](src)", true)}>
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
	<h1 class="px-4 py-2 font-bold text-stone-50">
		{file?.name ? file.name : "md"}
	</h1>
</header>

<main class="grid max-h-screen grow overflow-hidden sm:grid-cols-2">
	<textarea
		class="prose prose-stone max-w-none resize-none appearance-none bg-stone-100 p-4 font-mono transition placeholder:text-stone-400 focus:outline-none"
		placeholder="# Title"
		bind:value={content}
		bind:this={textArea}
		on:input={onInput}
	/>
	<div class="prose prose-stone hidden max-w-none overflow-y-auto p-4 sm:block">
		{@html mdToHtml(content)}
	</div>
</main>

<footer class="flex flex-wrap gap-4 bg-stone-800 p-4 text-stone-50">
	<div>
		{wordCount}
		{wordCount === 1 ? "word" : "words"}
	</div>
	<div>
		{getReadingTime(wordCount)}
	</div>
</footer>

<style lang="postcss">
	.btn {
		@apply rounded-xl px-4 py-2 text-stone-50 transition hover:bg-stone-950 active:bg-stone-700;
	}
</style>
