<script lang="ts">
	import "../app.postcss";
	import { dev } from "$app/environment";
	import { inject } from "@vercel/analytics";

	inject({ mode: dev ? "development" : "production" });
</script>

<div
	class="flex h-[100dvh] flex-col selection:bg-teal-950 selection:text-teal-50"
>
	<slot />
</div>
