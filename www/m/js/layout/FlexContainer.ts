/**
 * Define a container in absolute position
 * Create two area: control + body
 */
export class FlexContainer {

	classes:string;
	container:HTMLElement;
	controls:HTMLDivElement;
	body:HTMLDivElement;
	private textDialog: HTMLParagraphElement;
	private dialog: HTMLDialogElement;
	dialogHasBeenDrawn:boolean;

	constructor( pContainer:HTMLElement, classes:string) {
		this.classes = (typeof classes === 'undefined') ? '' : classes;
		this.init(pContainer);
	}

	init(pContainer:HTMLElement) {
		this.container = pContainer;
		this.container.innerHTML = '';

		this.controls = document.createElement('div');
		this.body = document.createElement('div');

		this.controls.className = 'flex flex-controls ' + this.classes;
		this.body.className = 'flex flex-body ' + this.classes;

		this.container.appendChild(this.controls);
		this.container.appendChild(this.body);
	}

	replug(pContainer:HTMLElement) {
		this.container = pContainer;
		this.container.innerHTML = '';
		this.container.appendChild(this.controls);
		this.container.appendChild(this.body);
	}

	reset() {
		this.init(this.container);
	}

	getControls():HTMLDivElement {
		return this.controls;
	}

	drawControls(callback:any) {
		this.controls.innerHTML = '';
		callback(this.controls);
	}

	getBody() {
		return this.body;
	}

	drawBody(callback:any) {
		this.body.innerHTML = '';
		callback(this.body);
	}

	pause(msg:string) {
		if (!this.dialogHasBeenDrawn) {
			this.drawEmptyDialog();
		}

		this.textDialog.innerHTML = msg;
		this.dialog.showModal();
	}

	drawEmptyDialog() {
		const _this = this;
		this.dialog = document.createElement('dialog');
		this.dialog.className = 'mdl-dialog';

		if (!this.dialog.showModal) {
			dialogPolyfill.registerDialog(this.dialog);
		}

		var content = document.createElement('div');
		content.className = 'mdl-dialog__content';
		this.dialog.appendChild(content);

		var icon = document.createElement('p');
		icon.className = 'mdl-typography--text-center';
		content.appendChild(icon);

		var iIcon = document.createElement('i');
		iIcon.className = 'material-icons';
		iIcon.style.fontSize = '54px';
		iIcon.innerHTML = 'error_outline';
		icon.appendChild(iIcon);

		this.textDialog = document.createElement('p');
		content.appendChild(this.textDialog);

		var actions = document.createElement('div');
		actions.className = 'mdl-dialog__actions';
		this.dialog.appendChild(actions);

		var saveButton = document.createElement('button');
		saveButton.className = 'mdl-button';
		saveButton.innerHTML = 'Cancel';
		saveButton.addEventListener('click', function() {
			_this.dialog.close();
		});
		actions.appendChild(saveButton);

		document.body.appendChild(this.dialog);
		componentHandler.upgradeDom();
	}

	resume() {
		this.dialog.close();
	}
}
