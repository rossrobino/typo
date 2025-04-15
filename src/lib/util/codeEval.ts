export const codeEval = () => {
	const codeblocks = document.querySelectorAll<HTMLPreElement>("pre");

	for (const block of codeblocks) {
		const input = block.firstChild;

		if (input instanceof HTMLElement) {
			const lang = getLang(input);

			if (lang === "js" || lang === "ts") {
				block.classList.add(
					"cursor-default",
					"hover:shadow-md",
					"hover:scale-[100.2%]",
					"transition",
					"active:scale-[99.8%]",
					"active:shadow-none",
					"group",
					"flex",
					"flex-col",
					"gap-2",
				);

				let code = input.textContent ?? "";

				const onClick = async (e: Event) => {
					e.stopImmediatePropagation();

					if (lang === "ts") {
						// only load if lang is ts and clicked
						const { default: tsBlankSpace } = await import("ts-blank-space");
						code = tsBlankSpace(code);
					}

					const output = block.lastChild;

					if (output && input !== output) {
						// remove the old result
						block.removeChild(output);
					} else {
						let result = "";
						let errorExists = false;

						try {
							if (code) {
								result = eval(code);

								if (typeof result === "string") result = `"${result}"`;

								if (result === undefined) result = "undefined";
							}
						} catch (error) {
							errorExists = true;

							result = String(error);
						}

						const newOutput = document.createElement("code");

						newOutput.classList.add("pt-2", "border-t", "border-gray-600");
						if (errorExists) newOutput.classList.add("text-rose-400");

						newOutput.textContent = result;

						block.appendChild(newOutput);
					}
				};

				block.removeEventListener("click", onClick);
				block.addEventListener("click", onClick);
			}
		}
	}
};

const getLang = (el: HTMLElement) => {
	for (const className of el.className.split(" ")) {
		if (className.startsWith("language-"))
			return className.substring("language-".length);
	}

	return "";
};
