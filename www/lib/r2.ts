/* radare2 Copyleft 2013-2022 pancake & frenchyeti */


export interface R2Setting {
	name:string;
	defVal:string|boolean|number;
	apply: any;
}

export interface R2Configuration {
	[settingName:string] :R2Setting
}

export interface Chunk {
	data: any;
	prev?: Chunk;
	next?: Chunk;
}
/**
 *
 * Not exported, internal use only
 *
 * @function
 */
function isFirefoxOS():boolean {
	// @ts-ignore
	if (typeof locationbar !== 'undefined' && !locationbar.visible) {
		// @ts-ignore
		if (navigator.userAgent.indexOf('Firefox') > -1 && navigator.userAgent.indexOf('Mobile') > -1) {
			// @ts-ignore
			return ('mozApps' in navigator);
		}
	}
	return false;
}

/**
 * Utility, not exported function
 *
 * @param str
 */
function toBoolean(str) {
	if (str === 'true') return true;
	else if (str === 'false') return false;
	else return undefined;
}

/**
 * Utility, not exported function
 *
 * @param str
 */
function address_canonicalize(pAddrStr:string):string {
	pAddrStr = pAddrStr.substr(2);
	while (pAddrStr.substr(0, 1) == '0') pAddrStr = pAddrStr.substr(1);
	pAddrStr = '0x' + pAddrStr;
	pAddrStr = pAddrStr.toLowerCase();
	return pAddrStr;
}


enum R2SyncMode {
	SYNC= 'sync',
	ASYNC= 'async',
	SASYNC= 'sasync',
	FAKE= 'fake',
}
export class r2 {
	static backward:boolean = false;
	static next_curoff:number = 0;
	static next_lastoff:number = 0;
	static prev_curoff:number = 0;
	static prev_lastoff:number = 0;
	static hascmd:any = false;
	static asyncMode:R2SyncMode = R2SyncMode.SYNC;

	static varMap = [];
	static argMap = [];
	static ajax_in_process:boolean = false;
	/**
	 * callback to be executed when connection fails
	 * @field
	 */
	static err:any = null;

	// @ts-ignore
	static r2_root:string = self.location.pathname.split('/').slice(0, -2).join('/');

	static root:string =  isFirefoxOS()? 'http://cloud.radare.org' : r2.r2_root;

	static project_name:string = '';
	static asm_config:any = {};
	static sections:any = {};
	static settings:any = {};
	static flags:any = {};

	static inColor:any = null;

	plugin():void {
		try {
			// @ts-ignore
			if (typeof r2plugin !== 'undefined') {
				// @ts-ignore
				r2.plugin = r2plugin;
			}else{
				throw new Error();
			}
		} catch (e) {
			console.error('r2.plugin is not available in this environment');
		}
	};


	/**
	 * Helper
	 * @param pAny {any}
	 */
	static dump(pAny:any):void {
		let x:string = '';
		for (const a in pAny) {
			x += a + '\n';
		}
		// @ts-ignore
		if (typeof alert !== 'undefined') {
			// @ts-ignore
			alert(x);
		} else {
			console.log(x);
		}
	}

	static analAll():void {
		r2.cmd('aa', function() {});
	};

	static analOp(pAddress:string, pCallback:any):void {
		r2.cmd('aoj 1 @ ' + pAddress, function(pStr:string) {
			try {
				pCallback(JSON.parse(pStr)[0]);
			} catch (e) {
				console.error(e);
				pCallback(pStr);
			}
		});
	};


	static objtostr(pObj:any):string {
		let str:string = '';
		for (const a in pObj) {
			str += a + ': ' + pObj[a] + ',\n';
		}
		return str;
	}


	static ajax(pMethod:string, pUri:string, pBody:any, pOkCallback:any, pErrCallback:any = null):boolean {
		// @ts-ignore
		if (typeof (XMLHttpRequest) == 'undefined') {
			return false;
		}
		if (r2.asyncMode == R2SyncMode.FAKE) {
			if (pOkCallback) {
				pOkCallback('{}');
			}
			return true;
		}
		if (r2.asyncMode ==  R2SyncMode.SASYNC) {
			console.log('async waiting');
			if (r2.ajax_in_process) {
				setTimeout(function() {
					r2.ajax(pMethod, pUri, pBody, pOkCallback);
				}, 100);
				return false;
			}
		}

		// @ts-ignore
		let x:XMLHttpRequest = undefined;
		if (isFirefoxOS()) {
			// @ts-ignore
			x = new XMLHttpRequest({mozSystem: true});
		} else {
			// @ts-ignore
			x = new XMLHttpRequest();
		}
		if (!x) {
			return false;
		}
		r2.ajax_in_process = true;
		if (r2.asyncMode == R2SyncMode.SYNC) {
			x.open(pMethod, pUri, false);
		} else {
			x.open(pMethod, pUri, true);
		}
		x.setRequestHeader('Accept', 'text/plain');
		//x.setRequestHeader ('Accept', 'text/html');
		x.setRequestHeader('Content-Type', 'application/x-ww-form-urlencoded; charset=UTF-8');
		x.onreadystatechange = function() {
			r2.ajax_in_process = false;
			if (x.status == 200) {
				if (x.readyState < 4) {
					// wait until request is complete
					return;
				}
				if (pOkCallback) {
					pOkCallback(x.responseText);
				} else {
					console.error('missing ajax callback');
				}
			} else {
				(pErrCallback || r2.err)('connection refused');
				console.error('ajax ' + x.status);
			}
		};

		try {
			x.send(pBody);
		} catch (e) {
			if (e.name == 'NetworkError') {
				(pErrCallback || r2.err)('connection error');
			}
		}

		return true;
	}

	static assemble(pOffset:any, pOpcode:string, pCallback:any):void {
		const off = pOffset ? '@' + pOffset : '';
		r2.cmd('"pa ' + pOpcode + '"' + off, pCallback);
	};

	static disassemble(pOffset:any, pBytes:any, pCallback:any):void {
		const off = pOffset ? '@' + pOffset : '';
		const str = 'pi @b:' + pBytes + off;
		r2.cmd(str, pCallback);
	};

	static get_hexdump(pOffset:any, pLength:number, pCallback:any):void {
		r2.cmd('px ' + pLength + '@' + pOffset, pCallback);
	};

	static get_disasm(pOffset:any, pLength:number, pCallback:any):void {
		// TODO: honor offset and length
		r2.cmd('pD ' + pLength + '@' + pOffset, pCallback);
	};

	static get_disasm_before(pOffset:any, pStart:number, pCallback:any) {
		let before:string[] = [];
		r2.cmd('pdj -' + pStart + '@' + pOffset + '|', function(x) {
			before = JSON.parse(x);
		});
		// TODO (frenchyeti) : callback outside cmd(), error ?
		pCallback(before);
	};

	static get_disasm_after(pOffset:any, pEnd:number, pCallback:any) {
		let after:any = [];
		r2.cmd('pdj ' + pEnd + '@' + pOffset + '|', function(x) {
			after = JSON.parse(x);
		});
		// TODO (frenchyeti) : callback outside cmd(), error ?
		pCallback(after);
	};

	static get_disasm_before_after(pOffset:any, pStart:number, pEnd:number, pCallback:any) {
		let before:any = [];
		let after:any = [];
		r2.cmd('pdj ' + pStart + ' @' + pOffset + '|', function(x) {
			before = JSON.parse(x);
		});
		r2.cmd('pdj ' + pEnd + '@' + pOffset + '|', function(x) {
			after = JSON.parse(x);
		});
		const opcodes = before.concat(after);
		// TODO (frenchyeti) : callback outside cmd(), error ?
		pCallback(opcodes);
	};

	static Config(pKey:string, pValue:any, pCallback:any) {
		if (typeof pValue == 'function' || !pValue) { // get
			r2.cmd('e ' + pKey + '|', pCallback || pValue);
		} else { // set
			r2.cmd('e ' + pKey + '=' + pValue, pCallback);
		}
		return r2;
	};


	static load_mmap():void {
		r2.cmdj('iSj|', function(x) {
			if (x !== undefined && x !== null) {
				// TODO (frenchyeti) : missing JSON.parse() ?
				console.log(x);

				r2.sections = x;
			}
		});
	};

	static get_address_type(pAddress:string):string {
		const offset = parseInt(pAddress, 16);
		for (const i in r2.sections) {
			if (offset >= r2.sections[i].addr && offset < r2.sections[i].addr + r2.sections[i].size) {
				if (r2.sections[i].flags.indexOf('x') > -1) {
					return 'instruction';
				} else {
					return 'memory';
				}
			}
		}
		return '';
	};


	static load_settings() {
		r2.cmd('e asm.arch', function(x) {r2.settings['asm.arch'] = x.trim();});
		r2.cmd('e asm.bits', function(x) {r2.settings['asm.bits'] = x.trim();});
		r2.cmd('e asm.bytes', function(x) {r2.settings['asm.bytes'] = toBoolean(x.trim());});
		r2.cmd('e asm.flags', function(x) {r2.settings['asm.flags'] = toBoolean(x.trim());});
		r2.cmd('e asm.offset', function(x) {r2.settings['asm.offset'] = toBoolean(x.trim());});
		r2.cmd('e asm.lines', function(x) {r2.settings['asm.lines'] = toBoolean(x.trim());});
		r2.cmd('e asm.xrefs', function(x) {r2.settings['asm.xrefs'] = toBoolean(x.trim());});
		r2.cmd('e asm.cmtright', function(x) {r2.settings['asm.cmtright'] = toBoolean(x.trim());});
		r2.cmd('e asm.pseudo', function(x) {r2.settings['asm.pseudo'] = toBoolean(x.trim());});
		// console.log("Loading settings from r2");
		// console.log(r2.settings);
	};


	static update_flags():void {
		r2.cmd('fs *;fj|', function(x) {

			const fs = JSON.parse(x);
			if (fs !== undefined && fs !== null) {
				r2.flags = {};
				for (const f in fs) {
					let addr:string = '0x' + fs[f].offset.toString(16);
					addr = address_canonicalize(addr);
					if (addr in r2.flags) {
						const fl = r2.flags[addr];
						fl[fl.length] = { name: fs[f].name, size: fs[f].size};
						r2.flags[addr] = fl;
					} else {
						r2.flags[addr] = [{ name: fs[f].name, size: fs[f].size}];
					}
				}
			}
		});
	};

	static get_flag_address(pName:string):any {
		for (const f in r2.flags) {
			for (const v in r2.flags[f]) {
				if (pName == r2.flags[f][v].name) return f;
			}
		}
		return null;
	};

	static get_flag_names(pOffset:number):string[] {
		const names:string[] = [];
		for (const i in r2.flags[pOffset]) {
			names[names.length] = r2.flags[pOffset][i].name;
		}
		return names;
	};

	static set_flag_space(pNamespace:string, pSuccessCallback:any):void {
		r2.cmd('fs ' + pNamespace, pSuccessCallback);
	};

	static get_flags(pSuccessCallback:any):void {
		r2.cmd('fj|', function(x) {
			pSuccessCallback(x ? JSON.parse(x) : []);
		});
	};

	static get_opcodes(pOffset:string, n:string, pSuccessCallback:any):void {
		r2.cmd('pdj @' + pOffset + '!' + n + '|', function(json) {
			pSuccessCallback(JSON.parse(json));
		});
	};

	static get_bytes(pOffset:string, n:string, pSuccessCallback:any):void {
		r2.cmd('pcj @' + pOffset + '!' + n +'|', function(json) {
			pSuccessCallback(JSON.parse(json));
		});
	};


	static store_asm_config():void {
		const config = {};
		r2.cmd('e', function(x) {
			const confStr = x.split('\n');
			for (const prop in confStr) {
				const fields = confStr[prop].split(' ');
				if (fields.length == 3) {
					// TODO: Dont know why byt e~asm. is not working so filtering here
					if (fields[0].trim().indexOf('asm.') == 0) config[fields[0].trim()] = fields[2].trim();
				}
			}
			r2.asm_config = config;
		});
	};

	static restore_asm_config():void {
		let cmd:string = '';
		for (const prop in r2.asm_config) {
			cmd += 'e ' + prop + '=' + r2.asm_config[prop] + ';';
		}
		r2.cmd(cmd, function() {});
	};

	static get_info(pSuccessCallback:any):void {
		r2.cmd('ij|', function(json) {
			pSuccessCallback(JSON.parse(json));
		});
	};

	static bin_relocs(pSuccessCallback:any):void {
		r2.cmd('irj|', function(json) {
			pSuccessCallback(JSON.parse(json));
		});
	};

	static bin_imports(pSuccessCallback:any):void {
		r2.cmd('iij|', function(json) {
			pSuccessCallback(JSON.parse(json));
		});
	};

	static bin_symbols(pSuccessCallback:any):void {
		r2.cmd('isj|', function(json) {
			pSuccessCallback(JSON.parse(json));
		});
	};

	static bin_sections(pSuccessCallback:any):void {
		r2.cmd('iSj|', function(json) {
			pSuccessCallback(JSON.parse(json));
		});
	};

	static cmds(pCommand:string[], pSuccessCallback:any):void {
		if (pCommand.length == 0) return;
		let cmd:string = pCommand[0];
		pCommand = pCommand.splice(1);
		function lala() {
			if (cmd === undefined || pCommand.length == 0) {
				return;
			}
			cmd = pCommand[0];
			pCommand = pCommand.splice(1);
			r2.cmd(cmd, lala);
			if (pSuccessCallback) {
				pSuccessCallback();
			}
			return;
		}
		r2.cmd(cmd, lala);
	};

	static _internal_cmd(pCommand:string, pSuccessCallback:any, pErrCallback:any):any {
		// TODO (frenchyeti) : move it outside, make it common
		// @ts-ignore
		if (typeof (r2cmd) != 'undefined') {
			// @ts-ignore
			r2.hascmd = r2cmd;
		}
		if (r2.hascmd) {
			// TODO (pancake): use setTimeout for async?
			// TODO (frenchyeti) : move it outside, make it common
			// @ts-ignore
			if (typeof (r2plugin) != 'undefined') {
				// duktape
				// @ts-ignore
				return pSuccessCallback(r2cmd(pCommand));
			} else {
				// node
				return r2.hascmd(pCommand, pSuccessCallback);
			}
		} else {
			r2.ajax('GET', r2.root + '/cmd/' + encodeURI(pCommand), '', function(x) {
				if (pSuccessCallback) {
					pSuccessCallback(x);
				}
			}, pErrCallback);
		}
	}

	static cmd(pCommand:string, pSuccessCallback:any = ()=>{}, pErrCallback:any = null):void {
		if (Array.isArray(pCommand)) {
			let res:any = [];
			let idx:number = 0;
			asyncLoop(pCommand.length, function(vLoop) {
				r2._internal_cmd(pCommand[idx], function(vResult) {
					idx = vLoop.iteration();
					res[idx] = vResult.replace(/\n$/, '');
					idx++;
					vLoop.next();
				}, pErrCallback);
			}, function() {
				// all iterations done
				pSuccessCallback(res);
			});
		} else {
			r2._internal_cmd(pCommand, pSuccessCallback, pErrCallback);
		}
	};

	static cmdj(pCommand:string, pSuccessCallback:any):void {
		r2.cmd(pCommand, function(x) {
			try {
				pSuccessCallback(JSON.parse(x));
			} catch (e) {
				pSuccessCallback(null);
			}
		});
	};

	// TODO (frenchyeti) : purpose ?
	static alive(pSuccessCallback:any) {
		r2.cmd('b', function(o) {
			let ret:boolean = false;
			if (o && o.length() > 0) {
				ret = true;
			}
			if (pSuccessCallback) {
				pSuccessCallback(o);
			}
		});
	};

	static getTextLogger(pObject:any) {
		if (typeof (pObject) != 'object') {
			pObject = {};
		}
		pObject.last = 0;
		pObject.events = {};
		pObject.interval = null;
		r2.cmd('Tl', function(x) {
			pObject.last = +x;
		});
		pObject.load = function(cb) {
			r2.cmd('"Tj ' + (pObject.last + 1) + '"', function(ret) {
				if (cb) {
					cb(JSON.parse(ret));
				}
			});
		};
		pObject.clear = function(cb) {
			// XXX: fix l-N
			r2.cmd('T-', cb); //+obj.last, cb);
		};
		pObject.send = function(msg, cb) {
			r2.cmd('"T ' + msg + '"', cb);
		};
		pObject.refresh = function(cb) {
			pObject.load(function(ret) {
				//obj.last = 0;
				for (let i = 0; i < ret.length; i++) {
					const message = ret[i];
					pObject.events['message']({
						'id': message[0],
						'text': message[1]
					});
					if (message[0] > pObject.last) {
						pObject.last = message[0];
					}
				}
				if (cb) {
					cb();
				}
			});
		};
		pObject.autorefresh = function(n) {
			if (!n) {
				if (pObject.interval) {
					pObject.interval.stop();
				}
				return;
			}
			function to() {
				pObject.refresh(function() {
					//obj.clear ();
				});
				// @ts-ignore
				if (r2ui.selected_panel === 'Logs') {
					setTimeout(to, n * 1000);
				} else {
					console.log('Not in logs :(');
				}
				return true;
			}
			pObject.interval = setTimeout(to, n * 1000);
		};
		pObject.on = function(ev, cb) {
			pObject.events[ev] = cb;
			return pObject;
		};
		return pObject;
	};


	static haveDisasm(x):boolean {
		if (x[0] == 'p' && x[1] == 'd') return true;
		if (x.indexOf(';pd') != -1) return true;
		return false;
	}

	static filter_asm( pStr:string, display:string):string {
		let curoff:number = r2.backward ? r2.prev_curoff : r2.next_curoff;
		let lastoff:number = r2.backward ? r2.prev_lastoff : r2.next_lastoff;
		let lines:string[] = pStr.split(/\n/g);

		r2.cmd('s', function(x) {
			curoff = x;
		});

		for (let i:number = lines.length - 1; i > 0; i--) {
			const a:RegExpMatchArray = lines[i].match(/0x([a-fA-F0-9]+)/);
			if (a && a.length > 0) {
				//lastoff = a[0].replace(/:/g, '');
				lastoff = parseInt(a[0].replace(/:/g, ''),16);
				break;
			}
		}
		if (display == 'afl') {
			//hasmore (false);
			let z:string = '';
			for (let i = 0; i < lines.length; i++) {
				const row:string[] = lines[i].replace(/\ +/g, ' ').split(/ /g);
				z += row[0] + '  ' + row[3] + '\n';
			}
			pStr = z;
		} else if (display[0] == 'f') {
			//hasmore (false);
			if (display[1] == 's') {
				let z:string = '';
				for (let i:number = 0; i < lines.length; i++) {
					const row = lines[i].replace(/\ +/g, ' ').split(/ /g);
					const mark = row[1] == '*' ? '*' : ' ';
					const space = row[2] ? row[2] : row[1];
					if (!space) continue;
					z += row[0] + ' ' + mark + ' <a href="javascript:runcmd(\'fs ' +
						space + '\')">' + space + '</a>\n';
				}
				pStr = z;
			} else {
			}
		} else if (display[0] == 'i') {
			//hasmore (false);
			if (display[1]) {
				let z:string = '';
				for (let i:number = 0; i < lines.length; i++) {
					const elems:string[] = lines[i].split(/ /g);
					let name:string = '';
					let addr:string = '';
					for (let j:number = 0; j < elems.length; j++) {
						const kv:string[] = elems[j].split(/=/);
						if (kv[0] == 'addr') {
							addr = kv[1];
						}
						if (kv[0] == 'name') {
							name = kv[1];
						}
						if (kv[0] == 'string') {
							name = kv[1];
						}
					}
					z += addr + '  ' + name + '\n';
				}
				pStr = z;
			}
		} //else hasmore (true);

		if (r2.haveDisasm(display)) {
			//	x = x.replace(/function:/g, '<span style=color:green>function:</span>');
			/*
					x = x.replace(/;(\s+)/g, ';');
					x = x.replace(/;(.*)/g, '// <span style=\'color:#209020\'>$1</span>');
					x = x.replace(/(bl|goto|call)/g, '<b style=\'color:green\'>call</b>');
					x = x.replace(/(jmp|bne|beq|js|jnz|jae|jge|jbe|jg|je|jl|jz|jb|ja|jne)/g, '<b style=\'color:green\'>$1</b>');
					x = x.replace(/(dword|qword|word|byte|movzx|movsxd|cmovz|mov\ |lea\ )/g, '<b style=\'color:#1070d0\'>$1</b>');
					x = x.replace(/(hlt|leave|iretd|retn|ret)/g, '<b style=\'color:red\'>$1</b>');
					x = x.replace(/(add|sbb|sub|mul|div|shl|shr|and|not|xor|inc|dec|sar|sal)/g, '<b style=\'color:#d06010\'>$1</b>');
					x = x.replace(/(push|pop)/g, '<b style=\'color:#40a010\'>$1</b>');
					x = x.replace(/(test|cmp)/g, '<b style=\'color:#c04080\'>$1</b>');
					x = x.replace(/(outsd|out|string|invalid|int |int3|trap|main|in)/g, '<b style=\'color:red\'>$1</b>');
					x = x.replace(/nop/g, '<b style=\'color:blue\'>nop</b>');
			*/
			pStr = pStr.replace(/(reloc|class|method|var|sym|fcn|str|imp|loc)\.([^:<(\\\/ \|\])\->]+)/g, '<a href=\'javascript:r2ui.seek("$1.$2")\'>$1.$2</a>');
		}
		pStr = pStr.replace(/0x([a-zA-Z0-9]+)/g, '<a href=\'javascript:r2ui.seek("0x$1")\'>0x$1</a>');
		// registers
		if (r2.backward) {
			r2.prev_curoff = curoff;
			r2.prev_lastoff = lastoff;
		} else {
			r2.next_curoff = curoff;
			r2.next_lastoff = lastoff;
			if (!r2.prev_curoff) {
				r2.prev_curoff = r2.next_curoff;
			}
		}
		return pStr;
	};


	static disableUtf8(){
		r2.cmd('e scr.utf8=false');
	}

};


// async helper
function asyncLoop(iterations:number, func:any, callback:any) {
	let index:number = 0;
	let done:boolean = false;
	const loop:any = {
		next: function() {
			if (done) {
				return;
			}

			if (index < iterations) {
				index++;
				func(loop);

			} else {
				done = true;
				callback();
			}
		},

		iteration: function() {
			return index - 1;
		},

		break: function() {
			done = true;
			callback();
		}
	};
	loop.next();
	return loop;
}

if (typeof (module) !== 'undefined') {
	module.exports = function(r) {
		if (typeof (r) == 'function') {
			r2.hascmd = r;
		} else {
			r2.hascmd = r.cmd;
		}
		return r2;
	};
}

