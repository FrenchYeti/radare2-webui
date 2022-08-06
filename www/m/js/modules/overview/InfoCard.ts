import {formatOffsets} from '../../helpers/Format';
import {Widgets} from '../../widgets/Widgets';

export class InfoCard {
	private card: any;
	private headersCmd: any[];
	private tabs: HTMLDivElement;
	private content: HTMLDivElement;

	get DOM() { return this.card; }
	get nbTabs() { return this.headersCmd.length }

	constructor(howManyPreload = 1) {
		this.headersCmd = [
			{ name: 'HDR', title: 'Headers',     format: this.formatAsKeyValue, cmd: 'i|',   grep: null,   ready: false },
			{ name: 'SYM', title: 'Symbols',     format: this.fromatAsCode,     cmd: 'isq', grep: '!imp', ready: false },
			{ name: 'IMP', title: 'Imports',     format: this.fromatAsCode,     cmd: 'isq', grep: 'imp.', ready: false },
			{ name: 'REL', title: 'Relocations', format: this.fromatAsCode,     cmd: 'ir',  grep: null,   ready: false },
			{ name: 'SEC', title: 'Sections',    format: this.fromatAsCode,     cmd: 'iSq', grep: null,   ready: false },
			{ name: 'STR', title: 'Strings',     format: this.fromatAsCode,     cmd: 'izq', grep: null,   ready: false },
			{ name: 'SDB', title: 'Sdb',         format: this.fromatAsCode,     cmd: 'k bin/cur/***', grep: null, ready: false }
		];

		this.build();

		this.preloadTabs(howManyPreload);
	}

	build() {
		this.card = document.createElement('div');
		this.card.className = 'demo-graphs mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--8-col';

		const tabContainer = document.createElement('div');
		tabContainer.className = 'mdl-tabs mdl-js-tabs';

		this.card.appendChild(tabContainer);

		this.tabs = document.createElement('div');
		this.tabs.className = 'mdl-tabs__tab-bar overview-tabs';

		this.content = document.createElement('div');

		tabContainer.appendChild(this.tabs);
		tabContainer.appendChild(this.content);

		this.createTabs(this.headersCmd, this.tabs, this.content);
	}

	createTabs(items:any, pTabsNode:HTMLDivElement, pContentNode:HTMLDivElement) {
		let first = true;
		for (let i in items)
		{
			const item = items[i];
			const tabName = 'tab-' + item.name;

			const tab:HTMLAnchorElement = document.createElement('a');
			tab.classList.add('mdl-tabs__tab');
			tab.href = '#' + tabName;
			tab.title = item.title;
			tab.innerHTML = item.name;

			const content:HTMLDivElement = document.createElement('div');
			content.classList.add('mdl-tabs__panel');
			content.id = tabName;

			if (first) {
				content.classList.add('is-active');
				tab.classList.add('is-active');
				first = false;
			}

			tab.addEventListener('click', () => this.loadTab(content, item));

			pTabsNode.appendChild(tab);
			pContentNode.appendChild(content);
		}
	}

	fixHeight(minHeight:number) {
		// First we reset height
		this.content.style.height = '0px';

		// Then we measure
		const paddings = 2 * 16;
		const cardHeight = this.card.getBoundingClientRect().height;
		const tabsHeight = this.tabs.getBoundingClientRect().height;
		const height = cardHeight - tabsHeight - paddings;
		this.content.style.height = ((height < minHeight) ? minHeight : height) + 'px';
		this.content.style.overflow = 'auto';
	}

	preloadTabs(nb:number) {
		nb = (nb > this.nbTabs) ? this.nbTabs : nb;
		for (let i = 0 ; i < nb ; i++)
			this.loadTab(this.content.children[i], this.headersCmd[i]);
	}

	loadTab(node:HTMLDivElement, item:any) {
		if (item.ready) {
			return;
		}

		let cmd = item.cmd;
		if (item.grep) {
			cmd += '~' + item.grep;
		}

		r2.cmd(cmd, (d) => { 
			node.innerHTML = '';
			node.appendChild(item.format(d));
		});

		if (item.cols > 1) {
			node.style['-webkit-column-count'] = item.cols;
			node.style['-moz-column-count'] = item.cols;
			node.style['column-count'] = item.cols;
		}

		item.ready = true;
	}

	refresh() {
		// Reset all value ready=false
		for (let i in this.headersCmd)
			this.headersCmd[i].ready = false;

		// Reload current tab
		let collection = [].slice.call(this.content.children);
		for (let j in collection)
		{
			if (collection[j].className.indexOf('is-active') > -1)
			{
				this.loadTab(collection[j], this.headersCmd[j]);
				break;
			}
		}
	}

	fromatAsCode(txt:string):HTMLPreElement {
		const pre = document.createElement('pre');
		pre.style.margin = '1.2em';
		pre.appendChild(formatOffsets(txt, Widgets.DISASSEMBLY));
		return pre;
	}

	/** Take a text input to give a HTML description list  */
	formatAsKeyValue(txt:string):HTMLElement {
		const content:HTMLElement = document.createElement('dl');
		content.classList.add('infocard');

		const lines = txt.split(/\n/g);
		for (let i in lines) {
			const line = lines[i].split(/ (.+)?/);
			if (line.length >= 2) {
				const dt = document.createElement('dt');
				dt.textContent = line[0];
				content.appendChild(dt);

				const dd = document.createElement('dd');
				dd.textContent = line[1];
				content.appendChild(dd);
			}
		}
		
		return content;
	}
}
