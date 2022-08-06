export enum StatusBarMode {
    LINE= 0,
    HALF= 1,
    FULL= 2
}

export enum StatusBarTab {
    LOGS= 0,
    CONSOLE= 1
}

function addHTMLElement(pType:string, pID:string):HTMLElement{
    const doc = document.createElement(pType);
    doc.id = pID;
    doc.className = pID;
    return doc;
}

let gInstance:StatusBar = null;

export default class StatusBar {

    log:string[] = [];
    mode:StatusBarMode = StatusBarMode.LINE;
    timeout:any = null;
    tab:StatusBarTab = StatusBarTab.LOGS;

    constructor() {
        this.statusInitialize();
    }

    static getInstance(){
        if(gInstance == null){
            gInstance = new StatusBar();
        }
        return gInstance;
    }

    setStatusbarBody() {
        let statusbarEl:any;

        try {
            statusbarEl = document.getElementById('tab_terminal');
            statusbarEl.innerHTML = '';
            statusbarEl.parentNode.removeChild(statusbarEl);
        } catch (e) {}

        try {
            var logsEl = document.getElementById('tab_logs');
            logsEl.innerHTML = '';
            logsEl.parentNode.removeChild(logsEl);
        } catch (e) {}

        let docEl:HTMLDivElement = null;
        switch (this.tab) {
            case StatusBarTab.LOGS:
                const parser = new DOMParser();
                docEl = document.createElement('div');
                docEl.id = 'tab_logs';
                const msg:string = this.log.join('<br />');
                docEl.appendChild (parser.parseFromString(msg, 'text/xml').documentElement);
                const statusbarEl:HTMLElement = document.getElementById('statusbar_body');
                try {
                    statusbarEl.parentNode.insertBefore (docEl, statusbarEl);
                } catch (e ){
                    //	statusbar.appendChild(doc);
                }
                return;
            case StatusBarTab.CONSOLE:
                docEl = document.createElement('div');
                docEl.id = 'tab_terminal';
                docEl.appendChild(this._addHTMLElement('div', 'terminal'));
                docEl.appendChild(this._addHTMLElement('div', 'terminal_output'));
                var pr0mpt = this._addHTMLElement('div', 'terminal_prompt');
                pr0mpt.appendChild(this._addHTMLElement('input', 'terminal_input'));
                docEl.appendChild(pr0mpt);
                break;
        }


        if (typeof docEl !== 'undefined') {
            /* initialize terminal if needed */
            const statusbarEl = document.getElementById('statusbar');
            const terminalEl = document.getElementById('terminal');
            if (!terminalEl) {
                statusbarEl.parentNode.insertBefore (docEl, statusbarEl);
                if (this.tab === StatusBarTab.CONSOLE) {
                    this.terminal_ready();
                }
            }
        }
    }

    private _addHTMLElement(pType:string, pID:string):HTMLElement{
        const doc = document.createElement(pType);
        doc.id = pID;
        doc.className = pID;
        return doc;
    }
    statusMessage(x:string, t:any = null):void {
        const statusbar = document.getElementById('statusbar');
        if (x) {
            this.log.push(x);
        }
        if (this.mode === StatusBarMode.LINE) {
            statusbar.innerHTML = x;
            if (this.timeout !== null) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }
            if (typeof t !== 'undefined') {
                const _this = this;
                this.timeout = setTimeout(function() {
                    _this.statusMessage('&nbsp;');
                }, t * 1000);
            }
        } else {
            this.setStatusbarBody();
        }
    }

    statusToggle() {
        const statusbarEl:HTMLElement = document.getElementById('statusbar');
        const containerEl:HTMLElement = document.getElementById('container');

        if (this.mode === StatusBarMode.HALF) {
            this.tab = StatusBarTab.LOGS;
            this.mode = StatusBarMode.LINE;
            statusbarEl.innerHTML = '&nbsp;';
            try {
                (statusbarEl.parentNode as HTMLElement).classList.remove('half');
                (statusbarEl.parentNode as HTMLElement).classList.remove('full');
                containerEl.classList.remove('sbIsHalf');
                containerEl.classList.remove('sbIsFull');
            } catch (e) {
            }
            this.setStatusbarBody();
        } else {
            this.mode = StatusBarMode.HALF;
            try {
                (statusbarEl.parentNode as HTMLElement).classList.remove('full');
                containerEl.classList.remove('sbIsFull');
            } catch (e) {
            }
            (statusbarEl.parentNode as HTMLElement).classList.add('half');
            containerEl.classList.add('sbIsHalf');
            //setStatusbarBody();
        }
    }

    statusNext() {
        var statusbar = document.getElementById('statusbar');
        var container = document.getElementById('container');
        const statusbarEl:HTMLElement = document.getElementById('statusbar');
        const containerEl:HTMLElement = document.getElementById('container');
        let mode:any = null;

        switch (this.mode) {
            case StatusBarMode.LINE:
                mode = StatusBarMode.HALF;
                try {
                    (statusbarEl.parentNode as HTMLElement).classList.remove('full');
                    container.classList.remove('sbIsFull');
                } catch (e) {
                }
                (statusbarEl.parentNode as HTMLElement).classList.add('half');
                container.classList.add('sbIsHalf');
                break;
            case StatusBarMode.HALF:
                mode = StatusBarMode.FULL;
                (statusbarEl.parentNode as HTMLElement).classList.add('full');
                container.classList.add('sbIsFull');
                /* do not clear the terminal */
                return;
                break;
            case StatusBarMode.FULL:
                mode = StatusBarMode.LINE;
                let statusTab:any = StatusBarTab.LOGS;
                statusbar.innerHTML = '';
                try {
                    //var statusbar = document.getElementById('statusbar');
                    //var container = document.getElementById('container');
                    (statusbarEl.parentNode as HTMLElement).classList.remove('half');
                    (statusbarEl.parentNode as HTMLElement).classList.remove('full');
                    container.classList.remove('sbIsHalf');
                    container.classList.remove('sbIsFull');
                } catch (e) {
                }
                break;
        }
        this.setStatusbarBody();
    }

    statusConsole() {
        let statusbarEl:HTMLElement = document.getElementById('statusbar');
        const container = document.getElementById('container');
        if (this.tab === StatusBarTab.CONSOLE) {
            if (this.mode !== StatusBarMode.LINE) {
                this.statusToggle();
                this.mode = StatusBarMode.LINE;
                return;
            }
            this.tab = StatusBarTab.CONSOLE;
        }
        if (this.mode === StatusBarMode.HALF) {
            /* do something here */
            this.mode = StatusBarMode.LINE;
        } else if (this.mode === StatusBarMode.LINE) {
            this.tab = StatusBarTab.CONSOLE;
            this.mode = StatusBarMode.HALF;
            try {
                (statusbarEl.parentNode as any).classList.remove('full');
                container.classList.remove('sbIsFull');
            } catch (e) {
            }
            try {
                (statusbarEl.parentNode as any).classList.add('half');
                container.classList.add('sbIsHalf');
            } catch (e) {
            }
        }
        if (this.tab === StatusBarTab.CONSOLE) {
            this.tab = StatusBarTab.LOGS;
        } else {
            this.tab = StatusBarTab.CONSOLE;
        }
        this.setStatusbarBody();
    }

    statusFullscreen() {
        let statusbarEl:HTMLElement = document.getElementById('statusbar');
        let containerEl:HTMLElement = document.getElementById('container');
        if (this.mode === StatusBarMode.FULL) {
            this.mode = StatusBarMode.HALF;
            try {
                (statusbarEl.parentNode as any).classList.remove('full');
                containerEl.classList.remove('sbIsFull');
            } catch (e) {
            }
            (statusbarEl.parentNode as any).classList.add('half');
            containerEl.classList.add('sbIsHalf');
        } else {
            this.mode = StatusBarMode.FULL;
            try {
                (statusbarEl.parentNode as any).classList.remove('half');
                containerEl.classList.remove('sbIsHalf');
            } catch (e) {
                /* do nothing */
            }
            (statusbarEl.parentNode as any).classList.add('full');
            containerEl.classList.add('sbIsFull');
        }
    }


    addButton(label:string, callback:string):HTMLAnchorElement {
        const a:HTMLAnchorElement = document.createElement('a');
        a.href = 'javascript:'+callback+'()';
        a.innerHTML = label;
        return a;
    }

    initializeStatusbarTitle() {
        return;
        const title:any = document.getElementById('statusbar_title');
        const div:HTMLDivElement = document.createElement('div');
        title.class = 'statusbar_title';
        title.id = 'statusbar_title';
        div.className = 'statusbar_title';
        div.style.textAlign = 'right';
        div.appendChild (this.addButton ('v ', 'statusToggle'));
        div.appendChild (this.addButton ('^ ', 'statusFullscreen'));
        div.appendChild (this.addButton ('$ ', 'statusConsole'));
        div.appendChild (this.addButton ('> ', 'statusBarAtRight'));
        title.parentNode.replaceChild (div, title);
        // title.parentNode.insertBefore (div, title);
    }

    statusInitialize() {
        this.initializeStatusbarTitle();
        const statusbarEl = document.getElementById('statusbar');
        statusbarEl.innerHTML = '';
        statusbarEl.parentNode.addEventListener('click', () =>{
            if (this.mode === StatusBarMode.LINE) {
                this.tab = StatusBarTab.CONSOLE;
                this.statusToggle();
            }
        });
        this.statusMessage('Loading webui...', 2);
    }


    /* --- terminal.js --- */
    submit(cmd:string) {
        let outputEl:HTMLElement = document.getElementById('terminal_output');
        let inputEl:HTMLInputElement = document.getElementById('terminal_input') as HTMLInputElement;
        if (!inputEl || !outputEl) {
            console.error('No terminal_{input|output} found');
            return;
        }
        if (cmd === 'clear') {
            outputEl.innerHTML = '';
            inputEl.value = '';
            return;
        }
        r2.cmd(cmd, (res) => {
            res += '\n';
            outputEl.innerHTML += ' > '
                + cmd + '\n' + res;
            inputEl.value = '';
            const bar = document.getElementById('statusbar_scroll');
            bar.scrollTop = bar.scrollHeight;
        });
    }

    terminal_ready() {
        // r2.cmd('e scr.color=true');
        const inputEl:HTMLInputElement = document.getElementById('terminal_input') as HTMLInputElement;
        if (!inputEl) {
            console.error('Cannot find terminal_input');
            return;
        }
        inputEl.focus();
        inputEl.onkeypress = (e)=>{
            if (e.keyCode === 13) {
                this.submit(inputEl.value);
            }
        }
    }

    /* --- terminal.js --- */

}