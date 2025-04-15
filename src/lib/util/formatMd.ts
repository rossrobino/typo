export const formatMd = async (md: string) => {
	const [{ format }, mdPlugin, { default: estree }, js, ts, css, html] =
		await Promise.all([
			import("prettier/standalone"),
			import("prettier/plugins/markdown"),
			import("prettier/plugins/estree"),
			import("prettier/plugins/babel"),
			import("prettier/plugins/typescript"),
			import("prettier/plugins/postcss"),
			import("prettier/plugins/html"),
		]);

	return format(md, {
		parser: "markdown",
		plugins: [mdPlugin, estree, html, js, ts, css],
		useTabs: true,
	});
};
