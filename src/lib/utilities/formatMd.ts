import { format } from "prettier/standalone";
import mdPlugin from "prettier/plugins/markdown";

export const formatMd = async (md: string) => {
	const formatted = await format(md, {
		parser: "mdx",
		plugins: [mdPlugin],
		useTabs: true,
	});
	return formatted;
};
