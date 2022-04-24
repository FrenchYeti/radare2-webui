import {ChunkStatus} from './ChunkStatus';
import {NavigatorDirection} from './NavigatorDirection';
import {Chunk} from "../../../lib/r2";

export class BlockNavigator {

	providerWorker:any = null;
	curChunk:Chunk = undefined;
	gap:number = -1;
	currentOffset:number = -1;

	constructor() { }

	init() {
		if (typeof this.providerWorker === 'undefined') {
			console.log('provider worker should be defined');
			return;
		}

		this.configureWorker_();
	}

	configureWorker_() {
		const _this = this;
		this.providerWorker.onmessage = function(e) {
			if (e.data.dir === NavigatorDirection.CURRENT) {
				if (typeof _this.curChunk.data.callback !== 'undefined') {
					for (var i = 0 ; i < _this.curChunk.data.callback.length ; i++) {
						_this.curChunk.data.callback[i](e.data);
					}
				}
				_this.curChunk.data = e.data;
				_this.curChunk.data.status = ChunkStatus.COMPLETED;
			} else {
				const dir:string = (e.data.dir === NavigatorDirection.BEFORE) ? 'prev' : 'next';

				let item:any = _this.curChunk;
				while (typeof item[dir] !== 'undefined') {
					item = item[dir];
					if (item.data.offset === e.data.offset) {
						break;
					}
				}

				if (item === _this.curChunk) {
					console.log('Error, history corrupted');
					return;
				}

				if (typeof item.data.callback !== 'undefined') {
					for (let i = 0 ; i < item.data.callback.length ; i++) {
						item.data.callback[i](e.data);
					}
				}

				item.data = e.data;
				item.data.status = ChunkStatus.COMPLETED;
			}
		};
	}

	reset() {
		this.curChunk = undefined;
	}

	go(where) {
		let goNext:boolean = (where === NavigatorDirection.AFTER);
		const dir:string = (goNext) ? 'next' : 'prev';
		var howMany = this.gap;

		if (typeof this.curChunk[dir] !== 'undefined') {
			this.curChunk = this.curChunk[dir];
			this.currentOffset = this.curChunk.data.offset;
			// Should check (or not?) for negative offset
		} else {
			this.currentOffset = this.currentOffset + where * this.gap;

			const req:any = {
				dir: where,
				offset: this.currentOffset,
				status: ChunkStatus.LAUNCHED,
				callback: []
			};

			if (this.currentOffset < 0) {
				req.substract = this.currentOffset * -1;
				req.offset = 0;
				this.currentOffset = 0;
			}

			let newChunk:Chunk = {
				data: req,
				prev: (goNext) ? this.curChunk : undefined,
				next: (!goNext) ? this.curChunk : undefined
			};

			this.curChunk[dir] = newChunk;
			this.curChunk = newChunk;

			this.providerWorker.postMessage(req);
		}
	}

	get(which, callback, force) {
		let dir:string = (which === NavigatorDirection.BEFORE) ? 'prev' : 'next';
		let item:Chunk;
		if (which === NavigatorDirection.CURRENT) {
			item = this.curChunk;
		} else {
			if (typeof this.curChunk === 'undefined') {
				item = undefined;
			} else {
				item = this.curChunk[dir];
			}
		}

		// If there is a miss (when we start)
		let req:any;
		if (typeof item === 'undefined') {
			if (which === NavigatorDirection.CURRENT) {
				req = {
					dir: NavigatorDirection.CURRENT,
					offset: this.currentOffset,
					status: ChunkStatus.LAUNCHED,
					callback: []
				};
				this.curChunk = {
					data: req,
					prev: undefined,
					next: undefined
				};
				item = this.curChunk;
				this.providerWorker.postMessage(req);
			} else {
				req = {
					dir: which,
					offset: this.currentOffset + (which * this.gap),
					status: ChunkStatus.LAUNCHED,
					callback: []
				};
				this.curChunk[dir] = {
					data: req,
					prev: (which === NavigatorDirection.AFTER) ? this.curChunk : undefined,
					next: (which === NavigatorDirection.BEFORE) ? this.curChunk : undefined
				};
				item = this.curChunk[dir];
				this.providerWorker.postMessage(req);
			}
		} else if (force === true) {
			item.data.status = ChunkStatus.LAUNCHED;
			this.providerWorker.postMessage(item.data);
		}

		// We infer the data is here
		if (item.data.status !== ChunkStatus.LAUNCHED) {
			return callback(item.data);
		} else { // Data isn't here, we deffer our callback
			if (typeof item.data.callback === 'undefined') {
				item.data.callback = [];
			}
			item.data.callback.push(callback);
			return;
		}
	}

	isInside_(chunk, offset:number):boolean {
		const start:number = chunk.offset;
		const end:number = start + this.gap;
		return (start <= offset && end >= offset);
	}


}
