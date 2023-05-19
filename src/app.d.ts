import { type ComponentType } from "svelte";

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
	interface ContentElement {
		name: string;
		text: string;
		inline: boolean;
		icon: ComponentType | string;
		subElements?: ContentElement[];
	}
}

export {};
