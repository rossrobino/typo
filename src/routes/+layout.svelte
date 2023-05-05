<script lang="ts">
	import "../app.postcss";
	import { dev } from "$app/environment";
	import { inject } from "@vercel/analytics";

	inject({ mode: dev ? "development" : "production" });
</script>

<main class="p-4 selection:bg-stone-800 selection:text-stone-50"><slot /></main>
