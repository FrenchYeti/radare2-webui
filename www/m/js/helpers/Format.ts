import {r2Wrapper} from '../core/R2Wrapper';
import {BaseWidget} from "../widgets/BaseWidget";

const offsetRegex:RegExp = new RegExp(/(0x[a-zA-Z0-9]+|(?:sym|fcn|str)\.[\.a-zA-Z0-9_]+)/, "g");

/** Takes a block and makes all offsets clickables */
export function formatOffsets(pStr:string,  navigateTo = null):HTMLSpanElement {
	const chunks:string[] = pStr.split(offsetRegex);
	const node:HTMLSpanElement = document.createElement('span');

	for (const chunk of chunks) {
		node.appendChild(formatOffset(chunk, navigateTo));
	}

	return node;
}

/** Read the value and format if it's exactly an offset */
export function formatOffset(pStr:string, navigateTo = null):HTMLAnchorElement|HTMLSpanElement {
	let chunkNode:HTMLAnchorElement|HTMLSpanElement;
	if (offsetRegex.test(pStr)) {
		chunkNode = document.createElement('a');
		chunkNode.innerHTML = pStr;
		applySeek(chunkNode as HTMLAnchorElement, pStr, navigateTo);
	} else {
		chunkNode = document.createElement('span');
		chunkNode.innerHTML = pStr;
	}

	return chunkNode;
}

/** Consider node's content as seekable, apply events to trigger seek event */
export function applySeek(pNode:HTMLAnchorElement, pDest:string = null, navigateTo:BaseWidget = null) {
	pDest = pDest || pNode.textContent;
	pNode.addEventListener('click', () => r2Wrapper.seek(pDest, navigateTo));
	pNode.title = 'Seek ' + pDest;
	pNode.href = '#' + pDest;
}
