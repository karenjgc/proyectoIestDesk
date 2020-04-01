import { Component, Output, Input, EventEmitter } from '@angular/core';

@Component({
    selector: 'confirmacion-dialogo',
    templateUrl: './confirmacionDialogo.component.html'
})

export class ConfirmacionDialogoComponent {
    @Input() tipo: number;
    @Input() mensajePrincipal: string;
    @Input() mensajeOpcional: string;
    @Input() imagen: number = 0;
    @Input() accion: any;
    @Output() respuesta = new EventEmitter();
    public tipoImagen = [
        'assets/images/elements/checked.png',
        'assets/images/elements/warning.png',
        'assets/images/elements/cancel.png',
        'assets/images/elements/question.png'
    ];

    constructor(){
        
    }

    confirmacion(resp: number, accion) {
       let objRespuesta = {
           respuesta: resp,
           accion: accion
       }
       this.respuesta.emit(objRespuesta);
   }
}