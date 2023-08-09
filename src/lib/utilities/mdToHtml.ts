import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";

marked.use(
	markedHighlight({
		langPrefix: "hljs language-",
		highlight(code, lang) {
			const language = hljs.getLanguage(lang) ? lang : "plaintext";
			return hljs.highlight(code, { language }).value;
		},
	}),
);

/**
 * converts md to html
 *
 * @param md - string
 */
export const mdToHtml = (md: string) => {
	return marked.parse(md);
};
