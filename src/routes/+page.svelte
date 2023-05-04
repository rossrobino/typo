<script lang="ts">
	import { micromark } from "micromark";
	import { text } from "svelte/internal";

	let content = "";
	let file: File;
	let fileHandle: FileSystemFileHandle;
	let textArea: HTMLTextAreaElement;

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
		<button
			class="rounded-xl bg-stone-950 px-4 py-2 text-white"
			on:click={open}
		>
			Open
		</button>
		<button
			class="rounded-xl bg-stone-950 px-4 py-2 text-white"
			on:click={saveAs}
		>
			Save As
		</button>
	</div>
	<h1 class="font-bold">{file?.name ? file.name : "md.robino.dev"}</h1>
</div>

<div class="grid gap-4 sm:grid-cols-2">
	<textarea
		class="prose prose-stone h-48 w-full appearance-none rounded-xl bg-stone-100 p-2 focus:outline-stone-950"
		placeholder="# Title"
		bind:value={content}
		bind:this={textArea}
		on:input={onInput}
	/>
	<div class="prose prose-stone w-full p-2">{@html micromark(content)}</div>
</div>
