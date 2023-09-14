import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import typography from "@tailwindcss/typography";

export default defineConfig({
	plugins: [sveltekit()],
	css: {
		postcss: {
			plugins: [
				tailwindcss({
					content: ["./src/**/*.{html,js,svelte,ts}"],
					plugins: [typography],
					theme: {
						extend: {
							fontFamily: {
								antique: [
									"Superclarendon",
									"Bookman Old Style",
									"URW Bookman",
									"URW Bookman L",
									"Georgia Pro",
									"Georgia",
									"serif",
								],
								round: [
									"ui-rounded",
									"Hiragino Maru Gothic ProN",
									"Quicksand",
									"Comfortaa",
									"Manjari",
									"Arial Rounded MT",
									"Arial Rounded MT Bold",
									"Calibri",
									"source-sans-pro",
									"sans-serif",
								],
							},
						},
					},
				}),
				autoprefixer(),
			],
		},
	},
});
