import { Component, ChangeDetectorRef, Output, Input, EventEmitter } from '@angular/core';
import * as $ from 'jquery';

import { FroalaOptions } from '../shared/iestdesk/froala';
import { Iestdesk } from '../services/iestdesk.service';
import { Equipos } from '../services/equipos.service';

import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
    selector: 'idesk-reutilizarEquipo',
    templateUrl: './reutilizarEquipo.component.html'
})

export class ReutilizarEquipoComponent {
    @Output() regresarReutilizado = new EventEmitter();

    public reutilizables = [];
    public idPlantillaSolicitada: number = 0;
    public nombrePlantilla: string = '';
    public busquedaTitulo;

    constructor(
        private _iestdesk: Iestdesk,
        private _equipos: Equipos,
        private chRef: ChangeDetectorRef,
        public ngxSmartModalService: NgxSmartModalService
    ){
        this.obtenerVinculos();
    }

    obtenerVinculos() {
        let params = {
            servicio: "equipos",
            accion: "IDesk_Maestro_Equipos_Reutilizar",
            tipoRespuesta: "json",
            idCurso: this._iestdesk.idCursoActual
        };

        this._equipos.consultas(params)
            .subscribe(resp => {
                this.reutilizables = resp;
            },
            errors => {
                console.log(errors);
            });
    }

    vistaPrevia(p){
		this.idPlantillaSolicitada = p.idPlantillaEquipo;
		this.nombrePlantilla = p.nombrePlantilla;
    }

    regresarAlta(e) {
		this.idPlantillaSolicitada = (e == 0) ? e : this.idPlantillaSolicitada;
        this.regresarReutilizado.emit(this.idPlantillaSolicitada);
    }
}