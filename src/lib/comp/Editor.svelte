<script context="module" lang="ts">
	export interface ContentElement {
		name: string;
		text: string;
		display: "inline" | "block" | "wrap";
		icon: string | ComponentType;
		key?: string;
	}
</script>

<script lang="ts">
	import type { ComponentType } from "svelte";

	export let contentElements: ContentElement[];

	export let textAreaValue = "";
	export let textAreaPlaceholder = "";
	export let textAreaClass = "";
	export let textAreaId = "";

	export let buttonClass = "";

	export let controlsClass = "";
	export let controlsId = "";

	let textArea: HTMLTextAreaElement;

	const insertText = async (
		el: ContentElement,
		carSelStart: number,
		carSelEnd: number,
	) => {
		if (el.display === "inline") {
			// insert at current position
			textAreaValue = `${textAreaValue.slice(0, carSelEnd)}${
				el.text
			}${textAreaValue.slice(carSelEnd)}`;
		} else if (el.display === "wrap") {
			textAreaValue = `${textAreaValue.slice(0, carSelStart)}${
				el.text
			}${textAreaValue.slice(carSelStart)}`;
			textAreaValue = `${textAreaValue.slice(0, carSelEnd + el.text.length)}${
				el.text
			}${textAreaValue.slice(carSelEnd + el.text.length)}`;
		} else {
			const splitContent = textAreaValue.split("\n");
			let characterCount = 0;
			for (let i = 0; i < splitContent.length; i++) {
				// for each line
				characterCount++; // account for removed "\n" due to .split()
				characterCount += splitContent[i].length;
				// find the line that the cursor is on
				if (characterCount > carSelEnd) {
					// add the string to the beginning of the line
					splitContent[i] = el.text + splitContent[i];
					textAreaValue = splitContent.join("\n");
					break;
				}
			}
		}
	};

	const setCaretPosition = async (
		el: ContentElement,
		carSelStart: number,
		carSelEnd: number,
	) => {
		let startPos = 0;
		let endPos = 0;
		if (/[a-z]/i.test(el.text)) {
			// if string contains letters, highlight the first word
			for (let i = carSelEnd; i < textAreaValue.length; i++) {
				if (textAreaValue[i].match(/[a-z]/i)) {
					if (!startPos) {
						startPos = i;
					} else {
						endPos = i + 1;
					}
				} else if (startPos) {
					break;
				}
			}
		} else {
			// leave the cursor in place
			startPos = carSelStart + el.text.length;
			endPos = carSelEnd + el.text.length;
		}

		textArea.setSelectionRange(startPos, endPos);
		textArea.focus();
	};

	const addContent = async (el: ContentElement) => {
		const carSelEnd = textArea.selectionEnd;
		const carSelStart = textArea.selectionStart;

		await insertText(el, carSelStart, carSelEnd);
		setCaretPosition(el, carSelStart, carSelEnd);
	};

	const onKeyDown = ({ ctrlKey, key }: KeyboardEvent) => {
		if (ctrlKey && key) {
			const matchedEl = contentElements.find((el) => el.key === key);
			if (matchedEl) addContent(matchedEl);
		}
	};
</script>

<textarea
	id={textAreaId}
	class={textAreaClass}
	placeholder={textAreaPlaceholder}
	on:keydown={onKeyDown}
	bind:value={textAreaValue}
	bind:this={textArea}
/>
<div id={controlsId} class={controlsClass}>
	{#each contentElements as el}
		<button class={buttonClass} on:click={() => addContent(el)}>
			{#if typeof el.icon !== "string"}
				<svelte:component this={el.icon} />
			{:else}
				{el.icon}
			{/if}
		</button>
	{/each}
</div>
