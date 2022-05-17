import {UpdateManager} from "../UpdateManager";
import {r2} from "../../../../lib/r2";

export default class Console {
    static lastConsoleOutput:string = '';

    static console_submit(pCmd:string) {
        //const term = document.getElementById('console_terminal');
        const output:HTMLElement = document.getElementById('console_output');
        const input:HTMLElement = document.getElementById('console_input');

        const widget = widgetContainer.getWidget('Console');
        const c = widgetContainer.getWidgetDOMWrapper(widget);

        if (pCmd === 'clear') {
            output.innerHTML = '';
            input.value = '';
            return;
        }
        r2.cmd(pCmd, function(res) {
            output.innerHTML += ' > ' + pCmd + '\n' + res;
            input.value = '';
            setTimeout(function() {
                window.scrollTo('console_input');
            }, 1000);
        });
    }

    static console_ready() {
        const input = document.getElementById('console_input');
        if (input === null) {
            return;
        }
        // r2.cmd('e scr.color=3');
        input.focus();
        input.onkeypress = function(e){
            if (e.keyCode === 13) {
                Console.console_submit(input.value);
            }
        }
    }

    static consoleKey(pEvent:any) {
        let inp = (document.getElementById('console_input') as HTMLInputElement);
        if (!pEvent) {
            inp.onkeypress = Console.consoleKey;
        } else {
            if (pEvent.keyCode === 13) {
                Console.runCommand(inp.value);
                inp.value = '';
            }
        }
    }

    static panelConsole() {
        const widget = widgetContainer.getWidget('Console');
        const c = widgetContainer.getWidgetDOMWrapper(widget);

        //updates.registerMethod(widget.getOffset(), panelConsole);
        UpdateManager.getInstance().registerMethod(widget.getOffset(), Console.panelConsole);

        /*
            c.innerHTML = '<br />';
            var common = 'onkeypress=\'consoleKey()\' class=\'mdl-card--expand mdl-textfield__input\' id=\'console_input\'';
            if (inColor) {
                c.style.backgroundColor = '#202020';
                var styles = 'position:fixed;padding-left:10px;top:4em;height:1.8em;color:white';
                c.innerHTML += '<input style=\'' + styles + '\' ' + common + ' />';
                //c.innerHTML += uiButton('javascript:runCommand()', 'Run');
                c.innerHTML += '<div id=\'output\' class=\'pre\' style=\'color:white !important\'><div>';
            } else {
                c.style.backgroundColor = '#f0f0f0';
                c.innerHTML += '<input style=\'color:black\' ' + common + '/>';
                c.innerHTML += uiButton('javascript:runCommand()', 'Run');
                c.innerHTML += '<div id=\'output\' class=\'pre\' style=\'color:black!important\'><div>';
            }
        */
        const html = '<br />'
            + '<div id="console_terminal" class="console_terminal">'
            + '<div id="console_output" class=console_output></div>'
            + '<div id="console_prompt" class=console_prompt>'
            + '&nbsp;&gt;&nbsp;<input name="console_input" class="console_input" id="console_input"></input>'
            + '</div>'
            + '</div><br /><br />'
        c.innerHTML = html;
        c.style.backgroundColor = '#303030';
        c.style.height = '100%';
        document.getElementById('console_output').innerHTML = Console.lastConsoleOutput;
        Console.console_ready();
    }

    static runCommand(pText:string = null) {
        if (pText == null) {
            pText = document.getElementById('input').value;
        }
        r2.cmd(pText, function(d) {
            Console.lastConsoleOutput = '\n' + d;
            document.getElementById('output').innerHTML = Console.lastConsoleOutput;
        });
    }

}