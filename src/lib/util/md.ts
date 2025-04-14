import { Processor } from "@robino/md";
import langCss from "@shikijs/langs/css";
import langDiff from "@shikijs/langs/diff";
import langHtml from "@shikijs/langs/html";
import langJson from "@shikijs/langs/json";
import langMd from "@shikijs/langs/md";
import langSql from "@shikijs/langs/sql";
import langTsx from "@shikijs/langs/tsx";

export const processor = new Processor({
	anchor: false,
	highlighter: {
		langs: [langCss, langHtml, langTsx, langDiff, langJson, langSql, langMd],
		langAlias: {
			js: "tsx",
			ts: "tsx",
			jsx: "tsx",
			mdx: "md",
			svelte: "html",
			astro: "html",
		},
	},
});
