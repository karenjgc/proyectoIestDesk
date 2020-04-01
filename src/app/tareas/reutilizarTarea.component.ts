import { Component, ChangeDetectorRef, ElementRef, Output, EventEmitter } from '@angular/core';

import { Iestdesk } from '../services/iestdesk.service';
import { Tareas } from '../services/tareas.service';

import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
    selector: 'idesk-reutilizarTarea',
    templateUrl: './reutilizarTarea.component.html'
})

export class ReutilizarTareaComponent {
    @Output() regresarReutilizado = new EventEmitter();

    public cursos = [];
    public reutilizables = [];
    public tarea;
    public archivos = [];
    public tipo: number;
    public ruta: string;
	public numeroArchivos: number;
    public busquedaTitulo;

    constructor(
        private _iestdesk: Iestdesk,
        private _tareas: Tareas,
        private chRef: ChangeDetectorRef,
        public ngxSmartModalService: NgxSmartModalService
    ){
        this.cursosImpartidos();
        this.consultaTareas(0);
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
                console.log(resp);
            },
            errors => {
                console.log(errors);
            });
    }

    consultaTareas(val) {
        let params = {
            servicio: "tareas",
            accion: "IDesk_Maestro_Tareas_Reutilizar",
            tipoRespuesta: "json",
            idCodigo: val,
            idCurso: this._iestdesk.idCursoActual,
            idpersonidesk: this._iestdesk.idPerson
        };

        this._tareas.consultas(params)
            .subscribe(resp => {
                this.reutilizables = resp;
                console.log(resp);
            },
            errors => {
                console.log(errors);
            });
    }

    revisa(e) {
        this.consultaTareas(e.target.value);
    }

    vistaPrevia(idTarea) {
        let params = {
            servicio: "tareas",
            accion: "IDesk_Tareas_Vista_Ind",
            tipoRespuesta: "json",
            idTarea: idTarea,
			idpersonidesk: this._iestdesk.idPerson
        };

        this._tareas.consultas(params)
            .subscribe(resp => {
                this.tarea = resp[0];
				console.log(this.tarea);
            },
            errors => {
                console.log(errors);
            });
    }

    mostrarArchivo(ruta, extension) {
        if ( extension == 'pdf' ){
            this.tipo = 1;
            this.ruta = ruta;
        } else if ( extension == 'jpg' || extension == 'jpge' || extension == 'png' || extension == 'gif' ) {
            this.tipo = 2;
            this.ruta = ruta;
        } else {
            this.tipo = 3;
            this.ruta = 'https://view.officeapps.live.com/op/embed.aspx?src='+ ruta;
        }

       // console.log(this.ruta, this.tipo, extension);
    }

    reutilizar(apunte) {
        this.regresarReutilizado.emit(apunte);
    }
}