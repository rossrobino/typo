<script lang="ts">
	// import { browser } from "$app/environment";
	import { micromark } from "micromark";

	let content = "";
	let file: File;
	let fileHandle: FileSystemFileHandle;
	let textArea: HTMLTextAreaElement;
	// let supported = false;

	// if (browser) supported = Boolean(window.showOpenFilePicker);

	const options: FilePickerOptions = {
		types: [
			{
				description: "markdown",
				accept: {
					"markdown/md": [".md", ".mdx"],
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
		if (fileHandle) {
			const writable = await fileHandle.createWritable();
			await writable.write(content);
			await writable.close();
		}
	};

	const onInput = () => {
		textArea.style.height = `${textArea.scrollHeight}px`;
		save();
	};
</script>

<div class="mb-4 flex items-center justify-between gap-4">
	<div class="flex gap-4">
		<button class="btn" on:click={open}> Open </button>
		<button class="btn" on:click={saveAs}> Save&nbsp;As </button>
	</div>
	<h1 class="font-bold">{file?.name ? file.name : "md.robino.dev"}</h1>
</div>

<div class="grid gap-4 sm:grid-cols-2">
	<textarea
		class="prose prose-stone h-48 w-full appearance-none rounded-xl bg-stone-200 p-2 shadow transition focus:shadow-lg focus:outline-none"
		placeholder="# Title"
		bind:value={content}
		bind:this={textArea}
		on:input={onInput}
	/>
	<div class="prose prose-stone w-full p-2">{@html micromark(content)}</div>
</div>

<style lang="postcss">
	.btn {
		@apply rounded-xl bg-stone-800 px-4 py-2 text-white shadow transition hover:bg-stone-900 hover:shadow-lg active:bg-stone-950 active:shadow-none;
	}
</style>
