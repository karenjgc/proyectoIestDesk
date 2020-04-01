import { Component, OnInit } from '@angular/core';
import { Iestdesk } from '../../services/iestdesk.service';
import { DisenadorService } from '../../services/disenador.service';

import { ReportesBase } from '../../shared/classes/reportesBase';

@Component({
    selector: 'idesk-reporteIngresoCierre',
    templateUrl: './ingresoCierre.component.html'
})

export class ReporteIngresoCierreComponent extends ReportesBase implements OnInit {
    public reporte;
    public resumen1 = [];
    public resumen2 = [];
    public columnas = ['posicion', 'materia', 'idPersonMaestro', 'tema', 'totalalumnos', 'totalingreso'];
    public columnasResumen = ['elemento', 'total']

    constructor(
        private iestdesk: Iestdesk,
        public disenador: DisenadorService)
    {
        super(
            iestdesk,
            disenador
		);
    }

    ngOnInit(){

    }

    cargaResumen() {
        let params = {
            servicio: "disenador",
            accion: "IDesk_Disenador_Reporte_Ingreso_al_cierre_Resumen",
            tipoRespuesta: "json",
            idCurso: this._idCurso,
            fechaIni: this.fechaInicio,
            fechaFin: this.fechaFin
        };

        this.iestdesk.consultas(params)
            .subscribe( resp => {
                let total = 0;
                let tmpIngresos = [];
            
                for ( let item of resp ) {
                    if ( item.id == 2 ) {
                        this.resumen1.push(item);
                    } else {
                        this.resumen2.push(item);
                    }
                }

                for ( let item in this.reporte ) {
                    tmpIngresos = [];
                    tmpIngresos = this.reporte[item].totalIngresos.split('<br>');
                    for ( let ingreso of tmpIngresos ) {
                        total += +ingreso;
                    }
                }
                
                this.resumen2.push({
                    id: 3,
                    elemento: 'Total alumnos que ingresaron al cierre del tema',
                    total: total
                });

                console.log(this.resumen1, this.resumen2);
                this.procesoCarga = false;
                this.reporteCompleto = true;
            },
            errors => {
                console.log(errors);
            });
    }

    cargaReporte() {
        this.procesoCarga = true;
        let params = {
            servicio: "disenador",
            accion: "IDesk_Disenador_Reporte_Ingreso_al_cierre",
            tipoRespuesta: "json",
            idCurso: this._idCurso,
            fechaIni: this.fechaInicio,
            fechaFin: this.fechaFin
        };

        this.iestdesk.consultas(params)
            .subscribe( resp => {
                this.reporte = resp;
                
                for ( let elemento in this.reporte ) {
                    this.reporte[elemento].tema = this.reporte[elemento].tema.replace(/\|/g, "<br>");
                    this.reporte[elemento].totalIngresos = this.reporte[elemento].totalIngresos.replace(/\|/g, "<br>");
                }

                this.cargaResumen();
            },
            errors => {
                console.log(errors);
            });
    }
}