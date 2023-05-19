<script lang="ts">
	import "../app.postcss";
	import { dev } from "$app/environment";
	import { inject } from "@vercel/analytics";

	inject({ mode: dev ? "development" : "production" });
</script>

<div
	class="flex h-[100dvh] flex-col bg-slate-900 text-slate-50 selection:bg-slate-300 selection:text-slate-950"
>
	<slot />
</div>
