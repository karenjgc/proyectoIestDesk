import { Component, ChangeDetectorRef, ElementRef, Output, EventEmitter } from '@angular/core';

import { Iestdesk } from '../services/iestdesk.service';
import { Apuntes } from "../services/apuntes.service";

import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
    selector: 'idesk-reutilizarApunte',
    templateUrl: './reutilizarApunte.component.html'
})

export class ReutilizarApunteComponent {
    @Output() regresarReutilizado = new EventEmitter();

    public cursos = [];
    public reutilizables = [];
    public apunte;
    public archivos = [];
    public tipo: number;
    public ruta: string;
    public numeroArchivos: number;
    public busquedaTitulo;

    constructor(
        private _iestdesk: Iestdesk,
        private _apuntes: Apuntes,
        private chRef: ChangeDetectorRef,
        public ngxSmartModalService: NgxSmartModalService
    ){
        this.cursosImpartidos();
        this.consultaApuntes(0);
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

    consultaApuntes(val) {
        let params = {
            servicio: "apuntes",
            accion: "IDesk_Maestro_Apuntes_Reutilizar",
            tipoRespuesta: "json",
            idCodigo: val, 
            idCurso: this._iestdesk.idCursoActual, 
            idpersonidesk: this._iestdesk.idPerson
        };

        this._apuntes.consultas(params)
            .subscribe(resp => {
                this.reutilizables = resp;
                //console.log(resp);
            },
            errors => {
                console.log(errors);
            });
    }

    revisa(e) {
        this.consultaApuntes(e.target.value);
    }

    vistaPrevia(idApunte) {
        let params = {
            servicio: "apuntes",
            accion: "IDesk_Apuntes_Vista_Ind",
            tipoRespuesta: "json",
            idApunte: idApunte
        };

        this._apuntes.consultas(params)
            .subscribe(resp => {
                this.apunte = resp[0];
            },
            errors => {
                console.log(errors);
            });
            
            let paramsArchivos = {
                servicio: "apuntes",
                accion: "IDesk_Apuntes_Consulta_Archivos",
                tipoRespuesta: "json",
                idApunte: idApunte
            }
    
            this._apuntes.consultas(paramsArchivos)
            .subscribe(resp => {
                this.archivos = resp;
                this.numeroArchivos = this.archivos.length;
                this.chRef.detectChanges();
                //console.log(JSON.stringify(this.archivos));
               /* if(this.numeroArchivos != 0){
                    this.mostrarArchivo(this.archivos[0].ruta, this.archivos[0].extension);
                }*/
            },
            errors => {
                console.log(errors);
            });
    }

/*    mostrarArchivo(ruta, extension) {
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

        console.log(this.ruta, this.tipo, extension);
    }*/

    reutilizar(apunte) {
        this.regresarReutilizado.emit(apunte);
    }
}