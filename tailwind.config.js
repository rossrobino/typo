import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{html,js,svelte,ts}"],
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
	plugins: [typography],
};
