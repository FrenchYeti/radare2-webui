import {BaseWidget} from './BaseWidget';

import {uiContext} from '../core/UIContext';
import {Widgets} from './Widgets';
import {Inputs} from '../helpers/Inputs';
import {r2Wrapper, R2Actions} from '../core/R2Wrapper';

export class ScriptWidget extends BaseWidget {
	private toggleFoo: string;

	constructor() {
		super('Script');
	}

	init() {
		r2Wrapper.registerListener(R2Actions.SEEK, () => {
			if (this.displayed) {
				this.draw();
			}
		});
	}

	draw() {
		this.toggleFoo = '';
		this.node.appendChild(this.getPanel());
	}

	getPanel():HTMLDivElement {
		const c:HTMLDivElement = document.createElement('div');

		c.appendChild(Inputs.button('Run', () => this.runScript()));
		c.appendChild(Inputs.button('Indent', () => this.indentScript()));
		c.appendChild(Inputs.button('Output', () => this.toggleScriptOutput()));
		// c.appendChild(Inputs.button('Console', () => uiContext.navigateTo(Widgets.CONSOLE)));

		c.appendChild(document.createElement('br'));

		const textarea:HTMLTextAreaElement = document.createElement('textarea');
		textarea.id = 'script';
		textarea.rows = 20;
		textarea.className = 'pre';
		textarea.style.width = '100%';
		c.appendChild(textarea);

		c.appendChild(document.createElement('br'));

		const output:HTMLDivElement = document.createElement('div');
		output.id = 'scriptOutput';
		output.className = 'output';
		c.appendChild(output);
		
		var localScript = localStorage.getItem('script');
		if (!localScript) {
			localScript = 'r2.cmd("?V", log);';
		}
		textarea.value = localScript;

		return c;
	}

	toggleScriptOutput() {
		const o = document.getElementById('scriptOutput');
		if (o) {
			if (this.toggleFoo === '') {
				this.toggleFoo = o.innerHTML;
				o.innerHTML = '';
			} else {
				o.innerHTML = this.toggleFoo;
				this.toggleFoo = '';
			}
		}
	}

	indentScript() {
		const el:any = document.getElementById('script');
		const str = el.value;
		const indented = /* NOT DEFINED js_beautify*/ (str);
		el.value = indented;
		localStorage.script = indented;
	}

	runScript() {
		const el:any = document.getElementById('script');
		const str = el.value;
		localStorage.script = str;
		document.getElementById('scriptOutput').innerHTML = '';
		try {
			var msg = '"use strict";' +
			'function log(x) { var a = ' +
			'document.getElementById(\'scriptOutput\'); ' +
			'if (a) a.innerHTML += x + \'\\n\'; }\n';
			// CSP violation here
			eval(msg + str);
		} catch (e) {
			alert(e);
		}
	}
}
