import {BaseWidget} from './BaseWidget';
import {Inputs} from '../helpers/Inputs';
import {Table} from '../helpers/Table';
import {r2Wrapper, R2Actions} from '../core/R2Wrapper';
import {Widgets} from '../widgets/Widgets';
import StatusBar from "../helpers/statusbar/StatusBar";

export class FunctionsWidget extends BaseWidget {
	constructor() {
		super('Functions');
	}

	init() {
		this.inColor = true; // TODO
		r2.cmd('e scr.utf8=false');

		r2Wrapper.registerListener(R2Actions.SEEK, () => {
			if (!this.displayed) {
				return;
			}
			this.draw();
		});
	}

	draw() {
		this.node.innerHTML = '';
		this.node.scrollTop = 0;
		this.node.appendChild(this.getPanel());
	}

	getPanel():HTMLDivElement {
		const c:HTMLDivElement = document.createElement('div');

		const header:HTMLDivElement = document.createElement('div');
		header.style.position = 'fixed';
		header.style.margin = '0.5em';
		c.appendChild(header);

		header.appendChild(Inputs.button('Symbols', () => {
			StatusBar.statusMessage('Analyzing symbols...');
			r2.cmd('aa', () => {
				StatusBar.statusMessage('done');
				this.draw();
			});
		}));

		header.appendChild(Inputs.button('Calls', () => {
			StatusBar.statusMessage('Analyzing calls...');
			r2.cmd('aac', () => {
				StatusBar.statusMessage('done');
				this.draw();
			});
		}));

		header.appendChild(Inputs.button('Function', () => {
			StatusBar.statusMessage('Analyzing function...');
			r2.cmd('af', () => {
				StatusBar.statusMessage('done');
				this.draw();
			});
		}));

		header.appendChild(Inputs.button('Refs', () => {
			StatusBar.statusMessage('Analyzing references...');
			r2.cmd('aar', () => {
				StatusBar.statusMessage('done');
				this.draw();
			});
		}));

		header.appendChild(Inputs.button('AutoName', () => {
			StatusBar.statusMessage('Analyzing names...');
			r2.cmd('.afna @@ fcn.*', () => {
				StatusBar.statusMessage('done');
				this.draw();
			});
		}));

		const content:HTMLDivElement = document.createElement('div');
		content.style.paddingTop = '70px';
		c.appendChild(content);

		r2.cmd('afl', function(d) {
			const table = new Table(
				['+Address', 'Name', 'Size', 'CC'],
				[false, true, false, false],
				'functionTable',
				null,
				Widgets.DISASSEMBLY);

			const lines = d.split(/\n/); //clickable offsets (d).split (/\n/);
			for (var i in lines) {
				const items = lines[i].match(/^(0x[0-9a-f]+)\s+([0-9]+)\s+([0-9]+(\s+\-&gt;\s+[0-9]+)?)\s+(.+)$/);
				if (items !== null) {
					table.addRow([items[1], items[5], items[2], items[3]]);
				}
			}
			table.insertInto(content);
		});

		return c;
	}
}
