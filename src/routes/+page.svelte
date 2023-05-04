<script lang="ts">
	import { micromark } from "micromark";
	let md = "";
</script>

<h1>markdown editor</h1>

<button class="bg-blue-500 p-2 text-white">Open</button>

<div class="grid gap-4 md:grid-cols-2">
	<div>
		<textarea class="prose w-full h-screen bg-slate-200 p-2" bind:value={md} />
	</div>
	<div>
		<div class="prose p-2">{@html micromark(md)}</div>
	</div>
</div>
