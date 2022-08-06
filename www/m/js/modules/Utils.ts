export class Utils {
    static hexPairToASCII(pPair:string):string {
        const chr = parseInt(pPair, 16);
        if (chr >= 33 && chr <= 126) {
            return String.fromCharCode(chr);
        }

        return '.';
    };

    static ASCIIToHexpair(ascii) {
        let hex = ascii.charCodeAt(0).toString(16);
        if (hex.length < 2) {
            hex = '0' + hex;
        }

        return hex;
    };

    static isAsciiVisible(pOffset:number):boolean {
        return (pOffset >= 33 && pOffset <= 126);
    }

    static basename(pPath) {
        return pPath.split(/[\\/]/).pop();
    }

    static int2fixedHex(nb, pLength:number):string {
        let hex:string = nb.toString(16);
        while (hex.length < pLength) {
            hex = '0' + hex;
        }
        return '0x' + hex;
    }

}