export const codeEval = async () => {
	const codeblocks = document.querySelectorAll<HTMLPreElement>("pre");

	for (const block of codeblocks) {
		const input = block.firstChild;

		if (input instanceof HTMLElement) {
			const lang = getLang(input);
			if (lang === "js") {
				block.classList.add(
					"cursor-pointer",
					"transition",
					"active:scale-[99%]",
					"group",
					"flex",
					"flex-col",
					"gap-2",
				);

				const code = input.textContent;

				const onClick = (e: Event) => {
					e.stopImmediatePropagation();

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
	const classes = el.className.split(" ");
	for (const className of classes) {
		if (className.startsWith("language-")) {
			return className.substring("language-".length);
		}
	}
	return "";
};
