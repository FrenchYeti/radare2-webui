import {r2} from "../../../lib/r2";

export class ProjectMgt{

    static saveProject():void {
        r2.cmd('Ps', function() {
            alert('Project saved');
        });
    }

    static deleteProject():void {
        alert('Project deleted');
        location.href = 'open.html';
    }

    static closeProject():void {
        alert('Project closed');
        location.href = 'open.html';
    }

}