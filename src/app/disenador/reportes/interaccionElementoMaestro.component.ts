import { Component, ChangeDetectorRef, ElementRef, ViewChild, Input, OnInit } from '@angular/core';
import { Iestdesk } from '../../services/iestdesk.service';
import { DisenadorService } from '../../services/disenador.service';

import { ReportesBase } from '../../shared/classes/reportesBase';

@Component({
    selector: 'idesk-interaccionElementoMaestro',
    templateUrl: './interaccionElementoMaestro.component.html'
})

export class ReporteInteraccionElementoMaestroComponent extends ReportesBase implements OnInit {
    public reporte = {};
    public headers = [];
    public titulos = [];

	@ViewChild('tablainteraccionMaestro') table1: ElementRef;

    constructor(
        private iestdesk: Iestdesk,
        public disenador: DisenadorService,
        private chRef: ChangeDetectorRef,
        private elRef: ElementRef)
    {
        super(
            iestdesk,
            disenador
        );
    }

    ngOnInit() {
        //console.log('Holi!');
    }

    cargaReporte(){
        this.reporte = { };
        this.titulos = [];
        
        if ( this._idCurso != '' ) {
            this.procesoCarga = true;
            let params = {
                servicio: "disenador",
                accion: "IDesk_Disenador_Reporte_Interaccion_Elemento_Maestro",
                tipoRespuesta: "json",
                idCurso: this._idCurso,
                fechaIni: this.fechaInicio,
                fechaFin: this.fechaFin
            };

            this.iestdesk.consultas(params)
                .subscribe( resp => {
                    this.headers = resp[0];

                    for ( let r of resp ) {
                        if ( r.idCurso != 0 ) {
                            this.reporte[r.idCurso] = r;
                        } else {
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
                    this.procesoCarga = false;
                    this.reporteCompleto = true;
                },
                errors => {
                    console.log(errors);
                });
        }
    }

}