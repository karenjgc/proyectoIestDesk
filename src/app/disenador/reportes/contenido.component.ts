import { Component, ChangeDetectorRef, ElementRef, ViewChild, OnInit } from '@angular/core';
import { Iestdesk } from '../../services/iestdesk.service';
import { DisenadorService } from '../../services/disenador.service';

import { NgxSmartModalService } from 'ngx-smart-modal';
import { ReportesBase } from '../../shared/classes/reportesBase';

@Component({
    selector: 'idesk-reporteContenido',
    templateUrl: './contenido.component.html'
})

export class ReporteContenidoComponent extends ReportesBase implements OnInit {
	
    public resumen = [ ];
    public detalle = { };
	@ViewChild('reporteContenido') table: ElementRef;

    constructor(
        private iestdesk: Iestdesk,
        public disenador: DisenadorService,
        private chRef: ChangeDetectorRef,
        private elRef: ElementRef,
        public ngxSmartModalService: NgxSmartModalService)
    {
        super(
            iestdesk,
            disenador
		);
    }

    ngOnInit() {    }

    cargaReporte() {
        if ( !this.procesoCarga ) {
            this.procesoCarga = true; 
            this.cargaDetalle();
            if ( this.arrCurso.length > 1 ) {
                this.cargaResumen();
            }
        }
    }

    cargaResumen() {
        this.resumen = [ ];
        this.detalle = { };

        if ( this._idCurso != '' ) {
            let params = {
                servicio: "disenador",
                accion: "IDesk_Disenador_Reporte_Contenido_Resumen",
                tipoRespuesta: "json",
                idCurso: this._idCurso,
                fechaIni: this.fechaInicio,
                fechaFin: this.fechaFin
            };

            this.iestdesk.consultas(params)
                .subscribe( resp => {
                    this.resumen = resp;
                },
                errors => {
                    console.log(errors);
                });
        }
    }

    cargaDetalle() {
        this.resumen = [ ];
        this.detalle = { };

        let params = {
            servicio: "disenador",
            accion: "IDesk_Disenador_Reporte_Contenido_Detalle",
            tipoRespuesta: "json",
            idCurso: this._idCurso,
            fechaIni: this.fechaInicio,
            fechaFin: this.fechaFin
        };

        this.iestdesk.consultas(params)
            .subscribe( resp => {
                for ( let r of resp ) {
                    if(!this.detalle.hasOwnProperty(r.idCurso)){
                        this.detalle[r.idCurso] = { datos: [], info: [] };
                        this.detalle[r.idCurso]['datos'].push({ 
                            curso: r.materia, 
                            idCurso: r.idCurso, 
                            maestro: r.maestro,
                            tema: r.tema.replace(/\|/g, "<br>"),
                            fechaini: r.fechaini.replace(/\|/g, "<br>"),
                            fechafin: r.fechafin.replace(/\|/g, "<br>")
                        });
                    }

                    this.detalle[r.idCurso]['info'].push({
                        elemento: r.elemento,
                        total: r.total
                    });
                }
                this.procesoCarga = false;
                this.reporteCompleto = true;
            },
            errors => {
                console.log(errors);
            });
    }
}
