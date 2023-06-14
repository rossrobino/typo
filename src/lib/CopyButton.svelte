<script lang="ts">
	export let content: string;

	let className = "";
	export { className as class };

	let complete = false;

	const onClick = async () => {
		try {
			await navigator.clipboard.writeText(content);
			complete = true;
		} catch (error) {
			console.error(error);
		}
	};

	const clickOutside = (element: HTMLElement, callbackFunction: () => void) => {
		function onClick(event: MouseEvent) {
			if (!element.contains(event.target as Node)) {
				callbackFunction();
			}
		}

		document.body.addEventListener("click", onClick);

		return {
			update(newCallbackFunction: () => void) {
				callbackFunction = newCallbackFunction;
			},
			destroy() {
				document.body.removeEventListener("click", onClick);
			},
		};
	};
</script>

<button
	class={className}
	use:clickOutside={() => (complete = false)}
	on:click={onClick}
>
	{#if !complete}
		<slot>Copy</slot>
	{:else}
		<slot name="complete">Complete</slot>
	{/if}
</button>
