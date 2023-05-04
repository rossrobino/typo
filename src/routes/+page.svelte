<script lang="ts">
	import { micromark } from "micromark";

	let content = "";
	let file: File;
	let fileHandle: FileSystemFileHandle;

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
		} else {
			saveAs();
		}
	};
</script>

<div class="mb-4 flex items-center justify-between gap-4">
	<div class="flex gap-4">
		<button class="bg-blue-500 p-2 text-white" on:click={open}>Open</button>
		<button class="bg-blue-500 p-2 text-white" on:click={save}>Save</button>
		<button class="bg-blue-500 p-2 text-white" on:click={saveAs}>Save As</button
		>
	</div>
	<h1>{file?.name ? file.name : "md.robino.dev"}</h1>
</div>

<div class="grid gap-4 sm:grid-cols-2">
	<textarea
		class="prose h-full min-h-[100dvh] w-full bg-blue-50 p-2"
		placeholder="# Title"
		bind:value={content}
	/>
	<div class="prose min-h-[100dvh] p-2">{@html micromark(content)}</div>
</div>
