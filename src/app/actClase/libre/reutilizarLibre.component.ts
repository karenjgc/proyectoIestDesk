import { Component, ChangeDetectorRef, ElementRef, Output, EventEmitter } from '@angular/core';

import { Iestdesk } from '../../services/iestdesk.service';
import { ActividadesClase } from "../../services/actividadesClase.service";

import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
    selector: 'idesk-reutilizarActLibre',
    templateUrl: './reutilizarLibre.component.html'
})

export class ReutilizarActividadLibreComponent {
    @Output() regresarReutilizado = new EventEmitter();

    public cursos = [];
    public reutilizables = [];
    public actividad;
    public archivos = [];
    public tipo: number;
    public ruta: string;
    public numeroArchivos: number;
    public busquedaTitulo;
    public tipoAlta: number = 0;

    constructor(
        private _iestdesk: Iestdesk,
        private _actividadesClase: ActividadesClase,
        private chRef: ChangeDetectorRef,
        public ngxSmartModalService: NgxSmartModalService
    ){
        this.tipoAlta = this._actividadesClase.tipoAlta;
        this.cursosImpartidos();
        this.consultaActividades(0);
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

    consultaActividades(val) {
        let params = {
            servicio: "actividadesClase",
            accion:  this.tipoAlta == 1 ? "IDesk_Maestro_Actividades_Clase_Libre_Reutilizar" : "IDesk_Maestro_Actividades_Clase_Externa_Reutilizar",
            tipoRespuesta: "json",
            idCodigo: val, 
            idCurso: this._iestdesk.idCursoActual, 
            idpersonidesk: this._iestdesk.idPerson
        };

        this._actividadesClase.consultas(params)
            .subscribe(resp => {
                this.reutilizables = resp;
                //console.log(resp);
            },
            errors => {
                console.log(errors);
            });
    }

    revisa(e) {
        this.consultaActividades(e.target.value);
    }

    vistaPrevia(idActividad) {
        let params = {
            servicio: "actividadesClase",
            accion: this.tipoAlta == 1 ? "IDesk_Actividades_Clase_Libre_Vista_Ind" : "IDesk_Actividades_Clase_Externa_Vista_Ind",
            tipoRespuesta: "json",
            idActividad: idActividad,
			idpersonidesk: this._iestdesk.idPerson
        };

        this._actividadesClase.consultas(params)
            .subscribe(resp => {
                this.actividad = resp[0];
            },
            errors => {
                console.log(errors);
            });
    
    }

    reutilizar(actividad) {
        this.regresarReutilizado.emit(actividad);
    }
}