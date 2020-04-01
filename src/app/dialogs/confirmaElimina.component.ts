import { Component, ChangeDetectorRef, Output, Input, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Iestdesk } from '../services/iestdesk.service';

@Component({
    selector: 'idesk-confirmaElimina',
    templateUrl: './confirmaElimina.component.html'
})

export class ConfirmaEliminaComponent {
    @Input() queEs: string;
	@Input() mensajeOpcional: string;
    @Output() respuesta = new EventEmitter();
    public nombre: string;

    constructor(
        private _iestdesk: Iestdesk,
        private chRef: ChangeDetectorRef,
        private router: Router,
        private route: ActivatedRoute
    ){
    }

    confirmacion(resp: number) {
       this.respuesta.emit(resp);
   }
}