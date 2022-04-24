import {Layouts} from '../layout/Layouts';
import {Ruler} from '../layout/Ruler';

// Determine maximum widget displayable at same time
const MAX_WIDGETS = 2;

// Define margin to apply both side of the ruler
const RULER_GAP = 0.001;

/** Define the global UI context to switch between widgets */
class UIContext {
	
	private focusedWidget: any;
	private displayedWidgets: any[];
	private currentLayout: Layouts;
	private initialized: boolean;
	private contentNode: HTMLElement;
	private rulerNode: HTMLElement;
	private titleNode: HTMLElement;
	private ruler: Ruler;

	/**	Boolean to check focus on first widget */
	get isFirstWidgetFocused():boolean {
		return this.focusedWidget === this.displayedWidgets[0]; 
	}

	/** 
	 * Tells if current layout is splitted 
	 * @field
	 * */
	get isSplitted() { 
		return this.currentLayout !== Layouts.FULL; 
	}

	/**
	 * Should be only one UIContext
	 *
	 * @constructor
	 * */
	constructor() {
		this.initialized = false;
	}

	/**
	 * Bind current widget factory and UI main nodes
	 *
	 * @method
	 * */
	init(widgetFactory, contentNodeId:string, rulerNodeId:string, titleNodeId:string) {
		if (this.initialized) {
			console.error('UIContext shouldn\'t be initialized more than once.');
		}

		// References to factory and DOM
		this.initialized = true;
		this.widgetFactory = widgetFactory;
		this.contentNode = document.getElementById(contentNodeId);
		this.rulerNode = document.getElementById(rulerNodeId);
		this.titleNode = document.getElementById(titleNodeId);

		// Allocating content node with focus listeners
		for (let i = 0 ; i < MAX_WIDGETS ; i++) {
			const node = document.createElement('div');
			node.addEventListener('click', () => this.setFocusAt(i));
			this.contentNode.appendChild(node);
		}

		// Building the ruler
		this.ruler = new Ruler(this.contentNode, this.rulerNode);
		this.ruler.hide();
		this.currentLayout = Layouts.FULL;

		// Listening to ruler moves
		this.ruler.addListeners((position) => {
			this.resizeTo(position);
		});

		// Tracking widget state: focus and display (following only from Widgets, no reference)
		this.displayedWidgets = []; // order is important
		this.focusedWidget;
	}

	/**
	 * Set focus on current widget
	 * @param {any} offset 
	 */
	setFocusAt(pOffset) {
		if (~this.displayedWidgets.indexOf(pOffset)) {
			console.error('UIContext: focus offset isn\'t correct');
			return;
		}
		if (this.displayedWidgets[pOffset] === this.focusedWidget) {
			return;
		}

		const losingFocus = this.focusedWidget;
		const gainingFocus = this.displayedWidgets[pOffset];

		this.widgetFactory.get(losingFocus).lostFocus();
		this.widgetFactory.get(gainingFocus).gotFocus();

		this.focusedWidget = this.displayedWidgets[offset];

		this.drawTitle();
	}

	/**
	 * Navigate to specified widget by replacing currently focused widget
	 * @param {Widgets} widget Widget reference
	 * @param {...*} args
	 */
	navigateTo(widget, ...args) {
		const destinationNode = this.getSlot(widget);
		this.widgetFactory.get(widget).drawWidget(destinationNode, ...args);
		this.applyLayout(destinationNode);
		this.focusedWidget = widget;
		this.drawTitle();
	}

	/** Provide a slot (node) for specified widget */
	getSlot(widget) {
		let widgetIndex = this.displayedWidgets.indexOf(widget);
		if (~widgetIndex) { // We want a slot for an already displayed widget
			return this.contentNode.children[widgetIndex];
		}

		let replacedWidget;
		if (this.currentLayout === Layouts.FULL) {
			// There is already a widget
			if (typeof this.displayedWidgets.length !== 0) {
				replacedWidget = this.displayedWidgets[0];
			}
			this.displayedWidgets = [widget];
			widgetIndex = 0;
		} else if (this.displayedWidgets.length === 1) {
			// Just merged, second part is free
			this.displayedWidgets.push(widget);
			widgetIndex = 1;
		} else {
			if (this.isFirstWidgetFocused) {
				replacedWidget = this.displayedWidgets.shift();
				this.displayedWidgets.unshift(widget);
				widgetIndex = 0;
			} else {
				replacedWidget = this.displayedWidgets.pop();
				this.displayedWidgets.push(widget);
				widgetIndex = 1;
			}
		}

		// Notify previously displayed widget that it has been unplugged
		if (typeof replacedWidget !== 'undefined') {
			this.widgetFactory.get(replacedWidget).lostDisplay();
		}

		this.setFocusAt(widgetIndex);
		return this.contentNode.children[widgetIndex];
	}

	/** Draw title with displayed instances */
	drawTitle(separator = ' & ') {
		this.titleNode.innerHTML = '';
		for (let i = 0 ; i < this.displayedWidgets.length ; i++) {
			const widget = this.displayedWidgets[i];
			const isActiveOne = widget === this.focusedWidget && this.displayedWidgets.length > 1;
			const node = document.createElement(isActiveOne ? 'strong' : 'span');
			node.textContent = this.widgetFactory.get(widget).name;
			node.addEventListener('click', () => this.setFocusAt(i));

			if (i !== 0) {
				this.titleNode.appendChild(
					document.createTextNode(separator)
				);
			}

			this.titleNode.appendChild(node);
		}
	}

	/**
	 * Apply classes to render current layout
	 * @param {any} node 
	 */
	applyLayout(pNode:Element):void {
		if (this.currentLayout === Layouts.VERTICAL) {
			pNode.classList.add('vertical');
		}
	}

	/** Resize a splitted layout between [0;1]% */
	resizeTo(pPosition:number) {
		if (!this.isSplitted) {
			return;
		}

		(this.contentNode.children[0] as HTMLElement).style.width = (pPosition - RULER_GAP) * 100 + '%';
		(this.contentNode.children[1] as HTMLElement).style.width = (1 - pPosition - RULER_GAP) * 100 + '%';
	}

	/**
	 * Split current layout
	 * @param {Layouts} layout Layout to use
	 */
	split(pLayout:Layouts) {
		if (this.isSplitted) {
			return;
		}

		if (pLayout !== Layouts.VERTICAL) {
			console.error('Not supported layout.');
		}

		this.currentLayout = pLayout;
		this.ruler.show();

		for (const child of this.contentNode.children) {
			this.applyLayout(child);
		}
	}

	/**
	 * Merge current layout, we keep currently focused
	 * */
	merge() {
		if (!this.isSplitted) {
			return;
		}

		this.ruler.reset();
		this.ruler.hide();
		this.currentLayout = Layouts.FULL;

		const focusedNode:Element = this.isFirstWidgetFocused ? this.contentNode.children[0] : this.contentNode.children[1];
		const otherNode:Element = this.isFirstWidgetFocused ? this.contentNode.children[1] : this.contentNode.children[0];

		// We updates styles accordingly (we don't rewrite className for the focused one to keep eventual classes)
		otherNode.className = 'rwidget';
		focusedNode.classList.remove('vertical');
		focusedNode.classList.remove('horizontal');
		focusedNode.classList.add('full');

		// We swap first and second child if second one was the focused one
		if (focusedNode !== this.contentNode.children[0]) {
			focusedNode.parentNode.insertBefore(otherNode, focusedNode);
		}
	}
}

export const uiContext = new UIContext();
