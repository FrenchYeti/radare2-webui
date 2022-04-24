/**
 * domTarget must have a "measurable" height
 * limit, when there is less than {limit}% available to scroll
 * we call the associated event
 */
export class InfiniteScrolling {

	domTarget:any = null;
	limit:any = null;
	howManyScreens:any = null;
	screenProportion:number = null;
	pauseScrollEvent:boolean = null;
	prevScroll:number = null;
	isTopMax:boolean = true;

	private ontop:any = null;
	private onbottom:any = null;


	constructor(pDOMTarget:any, pHowManyScreens:any, pLimit:any) {
		this.domTarget = pDOMTarget;
		this.limit = pLimit;
		this.howManyScreens = pHowManyScreens;
		this.screenProportion = 1.0 / this.howManyScreens;
		this.pauseScrollEvent = false;
		this.prevScroll = 0.;

		const _this:InfiniteScrolling = this;
		this.domTarget.addEventListener('scroll', function(e) {
			_this.scrollEvent_(e);
		});
	}

	setTopEvent(fct):void {
		this.ontop = fct;
	}

	setBottomEvent(fct):void {
		this.onbottom = fct;
	}

	scrollEvent_(e):void {
		const _this:InfiniteScrolling = this;
		if (this.pauseScrollEvent) {
			return;
		}

		const height = e.target.scrollHeight - e.target.offsetHeight;
		const p = e.target.scrollTop  / height;

		if (!this.isTopMax && p < this.limit && this.prevScroll > p) {
			this.pauseScrollEvent = true;
			const pos = Math.floor(((this.limit + (p - this.limit)) + this.screenProportion) * height);
			this.ontop(pos, function(isTopMax) {
				_this.pauseScrollEvent = false;
			});
		}

		if (p > (1 - this.limit) && this.prevScroll < p) {
			this.pauseScrollEvent = true;
			const pos = Math.floor((((1 - this.limit) + (p - (1 - this.limit))) - this.screenProportion) * height);
			this.onbottom(pos, function(isTopMax) {
				_this.pauseScrollEvent = false;
			});
		}

		this.prevScroll = p;
	}
}
