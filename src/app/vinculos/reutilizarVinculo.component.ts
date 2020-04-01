import { Component, ChangeDetectorRef, Output, Input, EventEmitter } from '@angular/core';
import * as $ from 'jquery';

import { FroalaOptions } from '../shared/iestdesk/froala';
import { Iestdesk } from '../services/iestdesk.service';
import { Vinculos } from "../services/vinculos.service";

import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
    selector: 'idesk-reutilizarVinculo',
    templateUrl: './reutilizarVinculo.component.html'
})

export class ReutilizarVinculoComponent {
    @Output() regresar = new EventEmitter();
    @Output() regresarReutilizado = new EventEmitter();

    public reutilizables = [];
    public vinculo = [];
    public vista: boolean = false;
    public busquedaTitulo;

    constructor(
        private _iestdesk: Iestdesk,
        private _vinculos: Vinculos,
        private chRef: ChangeDetectorRef,
        public ngxSmartModalService: NgxSmartModalService
    ){
        this.obtenerVinculos();
    }

    obtenerVinculos() {
        let params = {
            servicio: "vinculos",
            accion: "IDesk_Maestro_Vinculos_Reutilizar",
            tipoRespuesta: "json",
            idpersonidesk: this._iestdesk.idPerson
        };

        this._vinculos.consultas(params)
            .subscribe(resp => {
                this.reutilizables = resp;
            },
            errors => {
                console.log(errors);
            });
    }

    vistaPrevia(idVinculo){
        let params = {
            servicio: "vinculos",
            accion: "IDesk_Maestro_Vinculo_Ind",
            tipoRespuesta: "json",
            idVinculo: idVinculo, 
            idCurso: 0
        };

        this._vinculos.consultas(params)
            .subscribe(resp => {
                this.chRef.detectChanges();
                this.vinculo = resp;
                //console.log(resp);
                this.vista = true;
            },
            errors => {
                console.log(errors);
            });
    }
    
    reutilizar(vinculo) {
        //console.log(JSON.stringify(vinculo));
        this.regresarReutilizado.emit(vinculo);
    }

    regresarAlta() {
        this.regresar.emit(1);
    }
}