import config from "@robino/prettier";

config.plugins.push("prettier-plugin-svelte", "prettier-plugin-tailwindcss");

config.overrides = [{ files: "*.svelte", options: { parser: "svelte" } }];

export default config;
