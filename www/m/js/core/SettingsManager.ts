/**
 *
 */
import {R2Configuration} from "../../../lib/r2";

export class SettingsManager {
	private conf:R2Configuration;
	private itemKeys: any;

	get keys() { return this.itemKeys };

	constructor(pKeys:any, pBaseConf:R2Configuration) {
		this.itemKeys = pKeys;
		this.conf = pBaseConf;
	}

	/**
	 *
	 * @param pForce
	 */
	loadAll(pForce = false) {
		for (let key in this.conf) {
			const curValue = this.getItem(key);
			const defaultValue = this.getItemDefaultValue(key);
			if ((!pForce && curValue !== defaultValue) || pForce) {
				this.conf[key].apply(curValue);
			}
		}
	}

	/**
	 * To reset configurations.
	 *
	 * It remove items from localStorage
	 */
	resetAll() {
		for (let key in this.conf)
			{ // @ts-ignore
				localStorage.removeItem(key);
			}
		this.loadAll(true);
	}

	/**
	 *
	 * @param key
	 */
	getItem(pKey:string) {
		if (!this.keyExists(pKey)) throw new Error(`ConfKey ${pKey} doesn't exist!`);
		
		// @ts-ignore
		let local:any = localStorage.getItem(pKey);
		if (local !== null) {
			if (local === 'false') {
				local = false;
			} else if (local === 'true') {
				local = true;
			}
			return local;
		} else {
			return this.getItemDefaultValue(pKey);
		}
	}

	/**
	 *
	 * @param pKey
	 * @param pValue
	 */
	setItem(pKey:string, pValue:any) {
		if (!this.keyExists(pKey)) throw new Error(`ConfKey ${pKey} doesn't exist!`);
		
		// @ts-ignore
		localStorage.setItem(pKey, pValue);
		this.conf[pKey].apply(pValue);
	}

	/**
	 *
	 * @param pKey
	 */
	getItemDefaultValue(pKey:string):any {
		if (!this.keyExists(pKey)) throw new Error(`ConfKey ${pKey} doesn't exist!`);

		return this.conf[pKey].defVal;
	}

	/**
	 * Tell if the key is defined in the declared item keys
	 * */
	keyExists(pKey:string):boolean {
		return (typeof this.conf[pKey]) !== 'undefined';
	}
}
