import {r2Settings} from '../core/R2Wrapper';

export class Speaker {
	static speak( pText:string, pCallBack:any){
		if (!r2Settings.getItem(r2Settings.keys.USE_TTS)) {
			return;
		}

		if (typeof SpeechSynthesisUtterance === 'undefined') {
			return;
		}

		const u:SpeechSynthesisUtterance = new SpeechSynthesisUtterance();
		u.text = pText;
		u.lang = 'en-US';

		u.onend = function() {
			if (pCallBack) {
				(pCallBack)();
			}
		};

		u.onerror = function(e) {
			if (pCallBack) {
				(pCallBack)(e);
			}
		};

		speechSynthesis.speak(u);
	}
}
