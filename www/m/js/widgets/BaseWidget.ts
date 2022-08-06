/**
 * BaseWidget is an abstract class which wrap a Widget
 * This abstraction ensure two concerns:
 *  - A Widget can be instanciated several times if we want
 *  - A Widget shouldn't be bothered by dimension change (TODO)
 */
export class BaseWidget {

	protected _rootNode: HTMLElement;
	protected _node: HTMLElement;
	protected name: string;
	protected classNames: string[];
	protected focused: boolean;
	displayed: boolean;
	protected inColor:boolean = false;


	/** Node provided by UIContext to draw content */
	get rootNode():HTMLElement { return this._rootNode; }

	/** Node provided by the Widget to draw content */
	get node():HTMLElement { return this._node; }

	/**
	 * Pass the widgetContainer instance with name of the widget
	 *
	 * @constructor
	 * */
	constructor(pName:string, ...pClassNames:string[]) {
		this.name = pName;
		this.classNames = pClassNames;
		this.classNames.push('rwidget');
		this.init();

		this.focused = false;
		this.displayed = false;
	}

	getName():string {
		return this.name;
	}
	/**
	 * Init the module used inside component, called once
	 *
	 * @method
	 * */
	init():void { }

	/** Define what should be done to render the Widget */
	drawWidget(pDestinationNode:HTMLElement, ...pDrawArgs:any[]) {
		this._node = pDestinationNode;
		this._rootNode = pDestinationNode;
		this._rootNode.focus();

		// Set state
		this.displayed = true;
		this.focused = true;

		// Clear previous content
		this._node.innerHTML = '';
		this._node.className = '';

		// Apply CSS classes
		this.classNames.forEach(className => this._rootNode.classList.add(className));

		// Insert content
		this.draw(...pDrawArgs);
	}

	/** Method to insert content to Widget.node */
	draw(...pDrawArgs:any[]) { }

	/** When focus is gained */
	gotFocus() {
		this.gotDisplay();
		this.focused = true;
	}

	/** When focus is lost */
	lostFocus() {
		this.focused = false;
	}

	/** When widget is displayed */
	gotDisplay() {
		this.displayed = true;
	}

	/** When widget is replaced */
	lostDisplay() {
		this.lostFocus();
		this.displayed = false;
	}
}
