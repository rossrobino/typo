import mdPlugin from "prettier/plugins/markdown";
import { format } from "prettier/standalone";

export const formatMd = async (md: string) =>
	format(md, { parser: "mdx", plugins: [mdPlugin], useTabs: true });
