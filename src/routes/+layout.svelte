<script lang="ts">
	import "../app.postcss";
	import { dev } from "$app/environment";
	import { inject } from "@vercel/analytics";

	inject({ mode: dev ? "development" : "production" });
</script>

<div
	class="flex h-[100dvh] flex-col bg-gray-950 text-gray-50 selection:bg-gray-300 selection:text-gray-950"
>
	<slot />
</div>
