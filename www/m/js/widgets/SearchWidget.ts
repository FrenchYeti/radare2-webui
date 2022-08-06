import {BaseWidget} from './BaseWidget';
import {Inputs} from '../helpers/Inputs';
import {formatOffsets} from '../helpers/Format';
import {r2Wrapper, R2Actions} from '../core/R2Wrapper';

export class SearchWidget extends BaseWidget {
	constructor() {
		super('Search');
	}

	init() {
		r2Wrapper.registerListener(R2Actions.SEEK, () => {
			if (this.displayed) {
				this.draw();
			}
		});
	}

	draw() {
		this.node.appendChild(this.getPanel());
	}

	getPanel():HTMLDivElement {
		const c:HTMLDivElement = document.createElement('div');

		const header = document.createElement('div');
		header.style.margin = '0.5em';
		c.appendChild(header);

		const form = document.createElement('input');
		form.id = 'search_input';
		form.className = 'mdl-card--expand mdl-textfield__input';
		form.style.backgroundColor = 'white';
		form.style.paddingLeft = '10px';
		form.style.top = '3.5em';
		form.style.height = '1.8em';
		form.style.color = 'white';
		form.addEventListener('keypress', (e) => this.searchKey(e.keyCode));


		header.appendChild(form);

		header.appendChild(document.createElement('br'));

		header.appendChild(Inputs.button('Hex', () => this.runSearch()));
		header.appendChild(Inputs.button('String', () => this.runSearchString()));
		header.appendChild(Inputs.button('Code', () => this.runSearchCode()));
		header.appendChild(Inputs.button('ROP', () => this.runSearchROP()));
		header.appendChild(Inputs.button('Magic', () => this.runSearchMagic()));

		var content = document.createElement('div');
		content.id = 'search_output';
		content.style.paddingTop = '50px';
		content.style.color = 'black';
		content.className = 'pre';
		c.appendChild(content);

		return c;
	}

	searchKey(keyCode) {
		const inp:HTMLInputElement = document.getElementById('search_input') as HTMLInputElement;
		if (keyCode === 13) {
			this.runSearch(inp.value);
			inp.value = '';
		}
	}

	runSearchMagic() {
		r2.cmd('/m', function (d) {
			const node = document.getElementById('search_output');
			node.appendChild(formatOffsets(d));
		});
	}

	runSearchCode(pPattern:string = null) {
		if (!pPattern) {
			pPattern = (document.getElementById('search_input') as HTMLInputElement).value;
		}
		r2.cmd('"/c ' + pPattern + '"', function (d) {
			const node = document.getElementById('search_output');
			node.appendChild(formatOffsets(d));
		});
	}

	runSearchString(pPattern:string = null) {
		if (!pPattern) {
			pPattern = (document.getElementById('search_input') as HTMLInputElement).value;
		}
		r2.cmd('/ ' + pPattern, function (d) {
			const node = document.getElementById('search_output');
			node.appendChild(formatOffsets(d));
		});
	}

	runSearchROP(pPattern:string = null) {
		if (!pPattern) {
			pPattern = (document.getElementById('search_input') as HTMLInputElement).value;
		}
		r2.cmd('"/R ' + pPattern + '"', function (d) {
			const node = document.getElementById('search_output');
			node.appendChild(formatOffsets(d));
		});
	}

	runSearch(pPattern:string = null) {
		if (!pPattern) {
			pPattern = (document.getElementById('search_input') as HTMLInputElement).value;
		}
		if (pPattern[0] === '"') {
			r2.cmd('"/ ' + pPattern + '"', function (d) {
				const node = document.getElementById('search_output');
				node.appendChild(formatOffsets(d));
			});
		} else {
			r2.cmd('"/x ' + pPattern + '"', function (d) {
				const node = document.getElementById('search_output');
				node.appendChild(formatOffsets(d));
			});
		}
	}
}
