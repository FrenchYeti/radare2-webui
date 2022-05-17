


export class UI {


    static comboId = 0;
    static idSwitch = 0;
    static selectId = 0;

    /**
     *
     * @param pHref
     * @param pLabel
     * @param pType
     * @constructor
     */
    static Button( pHref:string, pLabel:string, pType:string):string {
        const classes = 'mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect ';
        // classes += 'mdl-color--accent mdl-color-text--accent-contrast';
        if (pType === 'active') {
            const st = 'style="background-color:#f04040 !important"';
            return '&nbsp;<a href="' + pHref.replace(/"/g, '\'') + '" class="' + classes + '" ' + st + '>' + pLabel + '</a>';
        }
        return '&nbsp;<a href="' + pHref.replace(/"/g, '\'') + '" class="' + classes + '">' + pLabel + '</a>';
    }

    static CheckList( pGrp:string, pID:string, pLabel:string):string {
        let output:string = '<li>';
        output += '<label for="' + pGrp + '" class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">';
        output += '<input type="checkbox" id="' + pID + '" class="mdl-checkbox__input" />';
        output += '<span class="mdl-checkbox__label">' + pLabel + '</span>';
        output += '</label></li>';

        return output;
    }


    static Combo(d:any):string {
        const funName:string = 'combo' + (++UI.comboId);
        let fun:string = funName + ' = function(e) {';
        fun += ' var sel = document.getElementById("opt_' + funName + '");';
        fun += ' var opt = sel.options[sel.selectedIndex].value;';
        fun += ' switch (opt) {';
        for (const a in d) {
            fun += 'case "' + d[a].name + '": ' + d[a].js + '(' + d[a].name + ');break;';
        }
        fun += '}}';
        // TODO : CSP violation here
        eval(fun);

        let out:string = '<select id="opt_' + funName + '" onchange="' + funName + '()">';
        for (const a in d) {
            const def = (d[a].default) ? ' default' : '';
            out += '<option' + def + '>' + d[a].name + '</option>';
        }
        out += '</select>';
        return out;
    }

    /**
     * Add a switch, with a name "label", define default state by isChecked
     * callbacks are bound when un-checked.
     */
    static Switch(pDOM:any, pName:string, isChecked:boolean, pOnChange:any):void {
        const id = 'switch-' + (++UI.idSwitch);

        const label:any = document.createElement('label');
        label.className = 'mdl-switch mdl-js-switch mdl-js-ripple-effect';
        label.for = id;
        pDOM.appendChild(label);

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'mdl-switch__input';
        input.checked = isChecked;
        input.id = id;
        label.appendChild(input);

        input.addEventListener('change', (evt) => {
            (pOnChange)(pName, evt.target.checked);
        });

        var span = document.createElement('span');
        span.className = 'mdl-switch__label';
        span.innerHTML = pName;
        label.appendChild(span);

        var br = document.createElement('br');
        label.appendChild(br);
    }

    static ActionButton(pDOM:any, pAction:any, pLabel:string):void {
        const button:HTMLAnchorElement = document.createElement('a');
        button.href = '#';
        button.innerHTML = pLabel;
        button.addEventListener('click', pAction);
        pDOM.appendChild(button);

        let classes = 'mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect ';
        classes += 'mdl-color--accent mdl-color-text--accent-contrast';
        button.className = classes;
        button.style.margin = '3px';
    }

    static Select( pDOM:any, pName:string, pList:any, pDefaultOffset:number, pOnChange:any):void {
        const id:string = 'select-' + (++UI.selectId);

        const div = document.createElement('div');
        div.className = 'mdl-selectfield mdl-js-selectfield mdl-selectfield--floating-label';
        pDOM.appendChild(div);

        const select = document.createElement('select');
        select.className = 'mdl-selectfield__select';
        select.id = id;
        select.name = id;
        div.appendChild(select);

        for (let i = 0 ; i < pList.length ; i++) {
            let option:HTMLOptionElement = document.createElement('option');
            option.innerHTML = pList[i];
            option.value = pList[i];
            select.appendChild(option);
            if (i === pDefaultOffset) {
                option.selected = true;
            }
        }

        select.addEventListener('change', (vEvent:any) => {
            (pOnChange)(vEvent.target.value);
        });

        const label:any = document.createElement('label');
        label.className = 'mdl-selectfield__label';
        label.for = id;
        label.innerHTML = pName;
        div.appendChild(label);
    }

// function uiSwitch(d) {
// 	// TODO: not yet done
// 	var out = d;
// 	out += '<label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="switch-1">';
// 	out += '<input type="checkbox" id="switch-1" class="mdl-switch__input" checked />';
// 	out += '<span class="mdl-switch__label"></span>';
// 	out += '</label>';
// 	return out;
// }

    static Block(d):string {
        var classes = 'mdl-card__supporting-text mdl-shadow--2dp mdl-color-text--blue-grey-50 mdl-cell';
        var styles = 'display:inline-block;margin:5px;color:black !important;background-color:white !important';
        var out = '';
        for (var i in d.blocks) {
            var D = d.blocks[i];
            out += '<br />' + D.name + ': ';
            out += UI.Combo(D.buttons);
        }
        return out;
    }

    static RoundButton(a:string, b:string, c:string):string {
        let out:string = '';
        out += '<button onclick=' + a + ' class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect" ' + c + '>';
        out += '<i class="material-icons" style="opacity:1">' + b + '</i>';
        out += '</button>';
        return out;
    }

    /**
     * Legacy methods, extracted from main JS
     */
    static TableBegin(pCols:any, pDomId:string) {
        console.warn('Usage is deprecated: migrate to Table');
        let out:string = '';
        let id:string = pDomId || '';
        let classes = 'mdl-data-table mdl-js-data-table mdl-data-table--selectable mdl-shadow--2dp';
        out += '<table id="' + id.substr(1) + '" style="margin-left:10px" class="' + classes + '">';
        //out += '<table class="mdl-data-table mdl-js-data-table mdl-data-table--selectable">';

        out += '  <thead> <tr>';

        let type;
        for (const i in pCols) {
            let col = pCols[i];
            if (col[0] === '+') {
                col = col.substring(1);
                type = '';
            } else {
                type = ' class="mdl-data-table__cell--non-numeric"';
            }
            out += '<th' + type + '>' + col + '</th>';
        }
        out += '</tr> </thead> <tbody>';
        return out;
    }

    static TableRow( pCols:any):string {
        let type = '';
        let out = '<tr>';
        for (const i in pCols) {
            let col = pCols[i];
            if (!col) {
                continue;
            }
            if (col[0] === '+') {
                col = UI.clickableOffsets(col.substring(1));
            } else {
                type = ' class="mdl-data-table__cell--non-numeric"';
            }
            out += '<td' + type + '>' + col + '</td>';
        }
        return out + '</tr>';
    }

    static TableEnd():string {
        return '</tbody> </table>';
    }


    static E(x:string):HTMLElement {
        return document.getElementById(x);
    }

    static encode(r:string):string {
        return r.replace(/[\x26\x0A\<>'"]/g, function(r) { return '&#' + r.charCodeAt(0) + ';';});
    }

    static clickableOffsets(x:string):string {
        console.error('Using clickableOffsets(str) no longer work');
        console.trace();
        x = x.replace(/0x([a-zA-Z0-9]*)/g,
            '<a href=\'javascript:seek("0x$1")\'>0x$1</a>');
        x = x.replace(/sym\.([\.a-zA-Z0-9_]*)/g,
            '<a href=\'javascript:seek("sym.$1")\'>sym.$1</a>');
        x = x.replace(/fcn\.([\.a-zA-Z0-9_]*)/g,
            '<a href=\'javascript:seek("fcn.$1")\'>fcn.$1</a>');
        x = x.replace(/str\.([\.a-zA-Z0-9_]*)/g,
            '<a href=\'javascript:seek("str.$1")\'>str.$1</a>');
        return x;
    }
}