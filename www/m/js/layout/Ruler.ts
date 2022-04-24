/** Ruler component for splitted layout */
export class Ruler {

	private _position: number = null;
	private listeners: any;
	private containerNode: HTMLElement;
	private rulerNode: HTMLElement;
	private moving: boolean;


	get position() {
		return this._position;
	}

	set position(value) {
		this._position = value;
		this.triggerListeners();
	}

	/**
	 *
	 * @param containerNode
	 * @param rulerNode
	 */
	constructor(pContainerNode:HTMLElement, pRulerNode:HTMLElement) {
		this.containerNode = pContainerNode;
		this.rulerNode = pRulerNode;

		this.listeners = [];
		this.moving = false;
		this.position = 0.5;

		this.init();
		this.reset();

		this.addListeners((position) => this.move(position));
	}

	/**
	 * Add events listeners on the node
	 *
	 * @method
	 * */
	init():void {
		const doDrag = (e) => {
			e.preventDefault();
			const containerBoundingBox = this.containerNode.getBoundingClientRect();
			this.position = (e.clientX - containerBoundingBox.left) / containerBoundingBox.width;
		};

		const stopDrag = () => {
			document.documentElement.removeEventListener('mousemove', doDrag, false);
			document.documentElement.removeEventListener('mouseup', stopDrag, false);
		};

		this.rulerNode.addEventListener('mousedown', (e) => {
			document.documentElement.addEventListener('mousemove', doDrag, false);
			document.documentElement.addEventListener('mouseup', stopDrag, false);
		});
	}

	/** Invoke listener with new position */
	triggerListeners() {
		this.listeners.forEach(l => l(this.position));
	}

	/**
	 * To add a listener
	 *
	 * @param pFunc {}
	 */
	addListeners(pFunc:Function):void {
		this.listeners.push(pFunc);
	}

	/** Move the ruler between [0;1] */
	move(pPosition:number):void {
		this.rulerNode.style.marginLeft = (pPosition) * 100 + '%';
	}

	/** Place the ruler in the middle (doesn't change display mode) */
	reset() {
		this.position = 0.5;
		this.move(0.5);
	}

	/**
	 * To show the element
	 */
	show() {
		this.rulerNode.style.display = 'block';
	}

	/**
	 * To hide the element
	 */
	hide() {
		this.rulerNode.style.display = 'none';
	}
}
