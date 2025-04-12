import typography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";
import { uico } from "uico";

export default {
	content: ["./src/**/*.{html,js,svelte,ts}"],
	plugins: [uico({ components: false, colorPalette: "oklch" }), typography],
} satisfies Config;
