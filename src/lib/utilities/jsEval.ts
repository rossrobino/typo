export const jsEval = async () => {
	const codeblocks = document.querySelectorAll<HTMLPreElement>("pre");

	for (const block of codeblocks) {
		const input = block.firstChild;

		if (input instanceof HTMLElement) {
			if (input.classList.contains("language-js")) {
				block.classList.add(
					"cursor-pointer",
					"transition",
					"active:bg-gray-900",
					"group",
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
							console.error(error);
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
