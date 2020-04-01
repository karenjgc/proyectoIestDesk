import { Component, ChangeDetectorRef, ElementRef, ViewChild, Input, OnInit } from '@angular/core';
import { Iestdesk } from '../../services/iestdesk.service';
import { DisenadorService } from '../../services/disenador.service';

import { NgxSmartModalService } from 'ngx-smart-modal';
import * as _moment from 'moment';
import 'moment/locale/es';

@Component({
    selector: 'idesk-interaccionElementoAlumno',
    templateUrl: './interaccionElementoAlumno.component.html'
})

export class ReporteInteraccionElementoAlumnoComponent implements OnInit {
    public ObjectKeys = Object.keys;
    
    public _idCurso = [];
    public arrCurso;
    public _fechas: string;
	public fechaInicio;
    public fechaFin;
    public procesoCarga: boolean = false;
    public reporte = {};
    public resumen = {};
    public resumenHeaders = ['Elemento', '% de interacción grupal', 'Total de ingresos']
    public headers = [];
    public titulos = [];

	@ViewChild('tablainteraccionAlumno') table1: ElementRef;

    constructor(
        private _iestdesk: Iestdesk,
        public _disenador: DisenadorService,
        private chRef: ChangeDetectorRef,
        private elRef: ElementRef,
        public ngxSmartModalService: NgxSmartModalService)
    {

    }

    @Input()
    set idCurso( id ) {
        if ( this._idCurso != id ){
            this._idCurso = id.join('|');
            this.arrCurso = id;
        }
    }

    @Input()
    set fechas( fecha ) {
        if ( this._fechas != fecha ) {
            this._fechas = fecha;
        }
    }

    ngOnInit() {
        //console.log('Holi!');
    }

    cargaReporte(){
        this.procesoCarga = true;
        this.reporte = { };
        this.titulos = [];

        let x: number = 0;
        for ( let id of this.arrCurso ) {
            let params = {
                servicio: "disenador",
                accion: "IDesk_Disenador_Reporte_Interaccion_Elemento_Alumno",
                tipoRespuesta: "json",
                idCurso: id,
                fechaIni: this._disenador.fechasSemana.split("|")[0],
                fechaFin: this._disenador.fechasSemana.split("|")[1]
            };

            this._iestdesk.consultas(params)
                .subscribe( resp => {
                    console.log(resp);
                    this.headers = resp[0];

                    for ( let r of resp ) {
                        if ( r.idPerson != 0 ) {
                            if ( !this.reporte.hasOwnProperty(id) ) {
                                this.reporte[id] = [];
                            }
                            this.reporte[id].push(r);
                        } else if ( x == 0 ) {
                            console.log(x)
                            for ( let y of Object.keys(r)) {
                                if ( isNaN( +y ) ) {
                                    this.titulos.push(y);
                                }
                            }

                            for ( let y of Object.keys(r)) {
                                if ( !isNaN(+y)) {
                                    this.titulos.push(y);
                                }
                            }
                        }
                    }
                    x++;
                    // NOTA: c en la consulta es para llenar el numero de filas

                    this.cargaResumen();
                },
                errors => {
                    console.log(errors);
                });
        }
    }

    cargaResumen() {
        let x: number = 0;
        for ( let id of this.arrCurso ) {
            let params = {
                servicio: "disenador",
                accion: "IDesk_Disenador_Reporte_Interaccion_Elemento_Alumno",
                tipoRespuesta: "json",
                idCurso: id,
                fechaIni: this._disenador.fechasSemana.split("|")[0],
                fechaFin: this._disenador.fechasSemana.split("|")[1]
            };

            this._iestdesk.consultas(params)
                .subscribe( resp => {
                    console.log(resp);
                    this.resumen = resp;    

                    this.procesoCarga = false;
                },
                errors => {
                    console.log(errors);
                });
        }

    }

}