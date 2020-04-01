import { Component, ChangeDetectorRef, ElementRef, Output, EventEmitter } from '@angular/core';

import { Iestdesk } from '../services/iestdesk.service';
import { Rubricas } from "../services/rubricas.service";

import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
    selector: 'idesk-rubricaExistente',
    templateUrl: './rubricaExistente.component.html'
})

export class RubricaExistenteComponent {
    @Output() regresarRubrica = new EventEmitter();

    public tipoRubrica = [];
    public rubricas = [];
    public idRubrica: number;
	//public nombreRubrica: string;
    public busquedaTitulo;
    public ver: boolean = false;

    constructor(
        private _iestdesk: Iestdesk,
        private _rubricas: Rubricas,
        private chRef: ChangeDetectorRef,
        public ngxSmartModalService: NgxSmartModalService
    ){
		console.clear();
        console.log("\n      _..------.._\n    .'   .-\"\"-.   '.\n    |\\   '----'   /|\n    \\ `'--------'` / \n     '._        _.'\n        `\"\"\"\"\"\"`"); //unsere schöne Donut! <3
		this.consultaRubricas(0);
    }

    consultaRubricas( tipo ) {
        let params = {
            servicio: "rubricas",
            accion: "IDesk_Rubrica_Existentes",
            tipoRespuesta: "json",
            tipo: tipo, 
            idpersonidesk: this._iestdesk.idPerson
        };

        this._rubricas.consultas(params)
            .subscribe(resp => {
                this.rubricas = resp;
            },
            errors => {
                console.log(errors);
            });
    }

    revisa(e) {
        this.ver = false;
        this.consultaRubricas(e.target.value);
    }

    vistaPrevia(idRubrica) {
		//this.nombreRubrica = nombreRubrica;
        this._rubricas.idRubrica = idRubrica;
        this.idRubrica = idRubrica
        this.ver = true;
    }

    enviaRubrica() {
		//let envio = { id: this.idRubrica, nombre: this.nombreRubrica };
		//this.regresarRubrica.emit(envio);
        this.regresarRubrica.emit(this.idRubrica);
    }
}