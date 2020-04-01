import { Component, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';

import { Iestdesk } from '../../services/iestdesk.service';
import { InformacionCurso } from "../../services/infoCurso.service";

import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
    selector: 'idesk-reutilizarBibliografia',
    templateUrl: './reutilizarBibliografia.component.html'
})

export class ReutilizarBibliografiaComponent {
    @Output() regresar = new EventEmitter();
    @Output() regresarReutilizado = new EventEmitter();

    public cursos = [];
    public reutilizables = [];
    public bibliografia = [];
    public vista: boolean = false;
    public mostrar: boolean = false;
    public busquedaTitulo;

    constructor(
        private _iestdesk: Iestdesk,
        private _infoCurso: InformacionCurso,
        private chRef: ChangeDetectorRef,
        public ngxSmartModalService: NgxSmartModalService
    ){
        this.cursosImpartidos();
        this.obtenerBibliografia(0);
    }

    cursosImpartidos() {
        let params = {
            servicio: "idesk",
            accion: "IDesk_Maestro_CursosImpartidos",
            tipoRespuesta: "json",
            idCurso: this._iestdesk.idCursoActual,
            idpersonidesk: this._iestdesk.idPerson
        };

        this._iestdesk.consultas(params)
            .subscribe(resp => {
                this.cursos = resp;
                //console.log(resp);
            },
            errors => {
                console.log(errors);
            });
    }

    revisa(e) {
        this.obtenerBibliografia(e.target.value);
        this.mostrar = false;
    }

    obtenerBibliografia(val) {
        let params = {
            servicio: "infoCurso",
            accion: "IDesk_Maestro_Bibliografia_Reutilizar",
            tipoRespuesta: "json",
            idCodigo: val,
            idCurso: this._iestdesk.idCursoActual,
            idpersonidesk: this._iestdesk.idPerson
        };
        this._infoCurso.consultas(params)
            .subscribe(resp => {
                this.reutilizables = resp;
            },
            errors => {
                console.log(errors);
            });
    }

    vistaPrevia(bibliografia){
        //console.log(bibliografia);
        this.bibliografia = bibliografia;
        this.mostrar = true;
    }
    
    reutilizar(bibliografia) {
        //console.log(JSON.stringify(bibliografia));
        this.regresarReutilizado.emit(bibliografia);
    }

    regresarAlta() {
        this.regresar.emit(1);
    }
}