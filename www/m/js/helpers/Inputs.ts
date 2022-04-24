// TODO, progressive rewriting from ui.legacy.js


export class HtmlNodeHelper {

	static MARGIN = '3px';

	static pictogramInputButton(pIconName:string, name, onclick = null):HTMLElement {
		const button:HTMLElement = document.createElement('a');
		button.className = 'mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect';
		button.style.margin = HtmlNodeHelper.MARGIN;

		const icon:HTMLElement = document.createElement('i')
		icon.className = 'material-icons';
		icon.textContent  = pIconName; // innerHTML

		button.appendChild(icon);
		button.appendChild(document.createTextNode(name));
		if (onclick !== null) button.addEventListener('click', onclick);
		return button;
	}

	static inputButton(pIconName:string, onclick = null):HTMLElement {
		const button:HTMLElement = document.createElement('a');
		button.className = 'mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect';
		button.style.margin = HtmlNodeHelper.MARGIN;
		button.textContent = pIconName;
		if (onclick !== null) button.addEventListener('click', onclick);
		return button;
	}

	static imgButton(pIconName:string, title, onclick = null):HTMLElement {
		const button:HTMLElement = document.createElement('button');
		button.className = 'mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect';
		button.style.margin = HtmlNodeHelper.MARGIN;
		button.title = title;
		const icon:HTMLElement = document.createElement('i')
		icon.className = 'material-icons';
		icon.textContent = pIconName;
		button.appendChild(icon);
		if (onclick !== null) button.addEventListener('click', onclick);
		return button;
	}

	static iconButton(pIconName:string, title, onclick:any = null):HTMLElement {
		const button:HTMLElement = document.createElement('button');
		button.className = 'mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-js-ripple-effect';
		button.style.margin = HtmlNodeHelper.MARGIN;
		button.title = title;
		const icon:HTMLElement = document.createElement('i')
		icon.className = 'material-icons md-dark';
		icon.textContent = pIconName; // innerHTML
		button.appendChild(icon);
		if (onclick !== null) button.addEventListener('click', onclick);
		return button;
	}
}

export const Inputs = {
	button: HtmlNodeHelper.inputButton,
	imgButton: HtmlNodeHelper.imgButton,
	iconButton: HtmlNodeHelper.iconButton,
	pictogramInputButton: HtmlNodeHelper.pictogramInputButton
};


