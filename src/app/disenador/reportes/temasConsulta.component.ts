import { Component, ChangeDetectorRef, ElementRef, ViewChild, Input, OnInit } from '@angular/core';
import { Iestdesk } from '../../services/iestdesk.service';
import { DisenadorService } from '../../services/disenador.service';

import { NgxSmartModalService } from 'ngx-smart-modal';
import * as XLSX from 'xlsx';
import * as _moment from 'moment';
import 'moment/locale/es';

@Component({
    selector: 'idesk-temasConsulta',
    templateUrl: './temasConsulta.component.html'
})

export class ConsultaTemasComponent implements OnInit {
	public ObjectKeys = Object.keys;

    public _idCurso: string;
	public fechaInicio;
    public fechaFin;
    public tipo = 0;
    public reporte = {};
    public reporteTemp = [];
	public semanas = [];
    public procesoCarga: boolean = false;
    public cargaCompleta: boolean = false;

    public columnas = ['posicion', 'materia', 'temas', 'fechaini', 'fechafin', 'duracion']

	@ViewChild('reporteTemas') table: ElementRef;

    constructor(
        private _iestdesk: Iestdesk,
        public _disenador: DisenadorService,
        public ngxSmartModalService: NgxSmartModalService
    ){

    }

    @Input()
    set idCurso( id ) {
		/* console.log(this._idCurso, id.join('|')); */
        if ( this._idCurso != id ){
            this._idCurso = id.join('|');
            console.log(this._idCurso);
        }
    }

    ngOnInit(){
        this.listadoSemanas();
    }

    private listadoSemanas() {
		this.semanas = [];

		let params = {
            servicio: "disenador",
            accion: "IDesk_Disenador_SemanasSemestre",
            tipoRespuesta: "json",
			idPeriodo: this._disenador.periodoSeleccionado
        };
		
		this._disenador.consultas(params)
            .subscribe(resp => {
				this.semanas = resp;
				this._disenador.fechasSemana = resp[0].valor;
				this._disenador.semanaSeleccionada = resp[0].texto;
			},
            errors => {
                console.log(errors);
            });
	}

    cargaReporte() {
        this.reporte = { };
        this.procesoCarga = true;

        if ( this._idCurso != '' ) {
            let params = {
                servicio: "disenador",
                accion: "IDesk_Disenador_Reporte_Consulta_Temas",
                tipoRespuesta: "json",
                idCurso: this._idCurso,
                fechaIni: this._disenador.tipoCursoSeleccionado != 2 ? this._disenador.fechasSemana.split("|")[0] : _moment(this._disenador.rangoFechas[0]).format("DD/MM/YY HH:mm"),
                fechaFin: this._disenador.tipoCursoSeleccionado != 2 ? this._disenador.fechasSemana.split("|")[1] : _moment(this._disenador.rangoFechas[1]).format("DD/MM/YY HH:mm"),
                tipoC: this.tipo
            };

            this._iestdesk.consultas(params)
                .subscribe( resp => {
                    for ( let r of resp ) {
                        if(!this.reporte.hasOwnProperty(r.idCurso)){
                            this.reporte[r.idCurso] = { datos: [], temas: [] };
                            this.reporte[r.idCurso]['datos'].push({ curso: r.nombreCurso, maestro: r.maestro, index: 0 })
                        }

                        this.reporte[r.idCurso]['temas'].push({
                            orden: r.orden,
                            idTema: r.idTema,
                            tema: r.tema,
                            fechaIni: r.fechaIni,
                            fechaFin: r.fechaFin,
                            semanas: r.semanas
                        });
                    }

                    for ( let curso of Object.keys(this.reporte) ) {
                        let index = Object.keys(this.reporte).indexOf(curso);

                        console.log(index, curso);

                        this.reporte[curso]['datos'][0].index = index + 1;
                    }

                    console.log(this.reporte);
                    this.procesoCarga = false;
                    this.cargaCompleta = true;
                },
                errors => {
                    console.log(errors);
                });
        }

        this._disenador.semanaSeleccionada = this.semanas[this.semanas.findIndex(x => x.valor == this._disenador.fechasSemana)].texto;
    }

    exportarExcel(){
		const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.table.nativeElement);
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Consulta de temas');
		
		/* save to file */
        XLSX.writeFile(wb, 'Consulta_de_temas.xlsx');
    }
}