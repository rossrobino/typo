export const formatMd = async (md: string) => {
	const { format } = await import("prettier/standalone");

	const mdPlugin = await import("prettier/plugins/markdown");
	const { default: estree } = await import("prettier/plugins/estree");

	const js = await import("prettier/plugins/babel");
	const ts = await import("prettier/plugins/typescript");
	const css = await import("prettier/plugins/postcss");
	const html = await import("prettier/plugins/html");

	return format(md, {
		parser: "markdown",
		plugins: [mdPlugin, estree, html, js, ts, css],
		useTabs: true,
	});
};
