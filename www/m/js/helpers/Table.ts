import {applySeek} from '../helpers/Format';
import $ from "jquery"

/**
 * Handling DataTables with jQuery plugin
 *
 * @param {Array} cols - List of columns, add "+" at beginning to specify a clickable field (seek method)
 * @param {Array} nonum - List of booleans, set true if non-numeric
 * @param {String} id - Id (DOM) of the current table, internal usage for DataTable plugin
 */
export class Table {

	cols:string[];
	nonum:boolean[];
	clickableOffset:boolean[];
	contentEditable: boolean[];
	onChange:any;
	seekNavigation:any;
	id:string;

	private root:HTMLTableElement;
	private thead:HTMLTableSectionElement;
	private tbody:HTMLTableSectionElement;

	constructor(pColConfig:string[], pNoNumeric:boolean[], pID:string, onChange = null, seekNavigation = null) {
		this.cols = pColConfig;
		this.nonum = pNoNumeric;
		this.clickableOffset = new Array(pColConfig.length);
		this.clickableOffset.fill(false);
		this.contentEditable = new Array(pColConfig.length);
		this.contentEditable.fill(false);
		this.onChange = onChange;
		this.seekNavigation = seekNavigation;
		this.id = pID;

		this.init();
	}

	init():void {
		this.root = document.createElement('table');
		this.root.className = 'mdl-data-table mdl-data-table--selectable mdl-shadow--2dp';

		// TODO !== false
		if (this.root.id !== this.id) {
			this.root.id = this.id;
		}

		this.thead = document.createElement('thead');
		this.root.appendChild(this.thead);
		this.tbody = document.createElement('tbody');
		this.root.appendChild(this.tbody);

		const tr:HTMLTableRowElement = document.createElement('tr');
		this.thead.appendChild(tr);

		for (const c in this.cols) {
			if (this.cols[c][0] == '+') {
				this.clickableOffset[c] = true;
				this.cols[c] = this.cols[c].substr(1);
			} else if (this.cols[c][0] == '~') {
				this.contentEditable[c] = true;
			}

			const th:HTMLTableCellElement = document.createElement('th');
			th.appendChild(document.createTextNode(this.cols[c]));
			if (this.nonum[c]) {
				th.className = 'mdl-data-table__cell--non-numeric';
			}
			tr.appendChild(th);
		}
	}

	getRows():any[] {
		return Array.prototype.slice.call(this.tbody.children); // TODO : slice useless ?
	}

	addRow(cells):HTMLTableRowElement {
		const tr:HTMLTableRowElement = document.createElement('tr');
		this.tbody.appendChild(tr);

		for (let i = 0; i < cells.length; i++) {
			const td:any = document.createElement('td');
			if (this.clickableOffset[i]) {
				const a = document.createElement('a');
				a.innerHTML = cells[i];
				td.appendChild(a);
				applySeek(a, cells[i], this.seekNavigation);
			} else if (typeof cells[i] === 'object') {
				td.appendChild(cells[i]);
			} else {
				td.innerHTML = cells[i];
			}

			if (this.contentEditable[i]) {
				const _this:Table = this;
				td.initVal = td.innerHTML;
				td.contentEditable = true;
				td.busy = false;

				td.addEventListener('blur', function (evt) {
					if (evt.target.busy) {
						return;
					}
					if (evt.target.initVal === evt.target.innerHTML) {
						return;
					}
					evt.target.busy = true;
					_this.onChange(cells, evt.target.innerHTML);
					evt.target.initVal = evt.target.innerHTML;
					evt.target.busy = false;
				});

				td.addEventListener('keydown', function (evt) {
					if (evt.keyCode !== 13 || evt.target.busy) {
						return;
					}
					if (evt.target.initVal === evt.target.innerHTML) {
						return;
					}
					evt.preventDefault();
					evt.target.busy = true;
					_this.onChange(cells, evt.target.innerHTML);
					evt.target.initVal = evt.target.innerHTML;
					evt.target.busy = false;
					evt.target.blur();
				});
			}

			tr.appendChild(td);
		}
		return tr;
	}

	insertInto(pNode:HTMLElement) {
		pNode.appendChild(this.root);
		if (this.id !== null) {
			($('#' + this.id) as any).DataTable();
		}
	}
}
