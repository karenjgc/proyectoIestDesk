import { Component, Output, Input, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Iestdesk } from '../services/iestdesk.service';

@Component({
    selector: 'idesk-infoDialogo',
    templateUrl: './infoDialogo.component.html'
})

export class InfoDialogoComponent {
    @Input() mensaje: string;
    @Input() tipo: number;
    @Output() respuesta = new EventEmitter();
    public nombre: string;

    constructor(
        private _iestdesk: Iestdesk,
        private router: Router,
        private route: ActivatedRoute
    ){
    }

    confirmacion(resp: number) {
       this.respuesta.emit(resp);
   }
}