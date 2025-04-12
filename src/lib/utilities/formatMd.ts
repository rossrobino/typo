import { format } from "prettier/standalone";
import mdPlugin from "prettier/plugins/markdown";

export const formatMd = async (md: string) =>
	format(md, {
		parser: "mdx",
		plugins: [mdPlugin],
		useTabs: true,
	});
