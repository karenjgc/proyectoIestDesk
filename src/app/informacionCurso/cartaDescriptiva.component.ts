import { Component, ChangeDetectorRef } from '@angular/core';

import { Iestdesk } from '../services/iestdesk.service';
import { InformacionCurso } from '../services/infoCurso.service';

import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
    selector: 'idesk-cartaDescriptiva',
    templateUrl: './cartaDescriptiva.component.html'
})
export class CartaDescriptivaComponent {
    public rolActual: number;
    public carta = [];
    public mostrar: boolean = false;
    public mensaje: string;

    constructor(
        private _iestdesk: Iestdesk,
        private _infoCurso: InformacionCurso,
        private chRef: ChangeDetectorRef,
        public ngxSmartModalService: NgxSmartModalService
    ){ 
        this.rolActual = this._iestdesk.rolActual;
        
        
        let params = {
            servicio: "infoCurso",
            accion: "IDesk_Carta_Descriptiva",
            tipoRespuesta: "json",
            idCurso: this._iestdesk.idCursoActual
        };
        this._infoCurso.consultas(params)
            .subscribe(resp => {
                if( resp[0].carta == 1 ){
                    this.carta = resp[0];
                    this.mostrar = true;
                } else {
                    this.mensaje = 'Carta Descriptiva no disponible';
                    this.mostrar = false;
                }
            },
            errors => {
                console.log(errors);
            });
    }
}