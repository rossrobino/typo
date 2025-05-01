import type { Elements } from "drab/types";

declare module "svelte/elements" {
	export interface SvelteHTMLElements
		extends Elements<HTMLAttributes<HTMLElement>> {}
}

export {};
