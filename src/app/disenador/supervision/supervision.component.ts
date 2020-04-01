import { Component, ChangeDetectorRef, OnInit, Input } from '@angular/core';

import { Iestdesk } from '../../services/iestdesk.service';
import { DisenadorService } from '../../services/disenador.service';

import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
//import { FormBuilder } from '@angular/forms';

@Component({
	selector: 'idesk-supervision',
	templateUrl: './supervision.component.html'
})
export class SupervisionComponent implements OnInit {
	public rolActual: number;
	public fechas = [];
	public fechasSeleccionadas = [];
	public _fechasVista = {};
	public modalidadActual;

	public temas = [];
	//public objectKeys = Object.keys;
	public mensaje;
	public tipoRespuesta;
	public modalReference;

	public _idCursos: string;
	public nombreMaterias: string;
	public _tipoReporte: number;
	public fechaInicio: any;
	public fechaFin: any;

	public periodoStr: string = '';

	public reporteIndividual;
	constructor(
		private _iestdesk: Iestdesk,
		private _disenador: DisenadorService,
		private _chRef: ChangeDetectorRef,
		private _modalService: NgbModal,
		public _ngxSmartModalService: NgxSmartModalService,
	){ 
		this.rolActual = this._iestdesk.rolActual;
		this.cursoActual = this._iestdesk.cursoActual;
	}

	ngOnInit() {
		this.getPeriodo();
		//console.log('abre reportes...del mal!');
		console.clear()
		console.dir(this._disenador);
	}

	@Input()
	set cursoActual( id: string ) {
		if ( this._idCursos != id){
			this._idCursos = id;
		}
	}

	@Input()
	set tipoReporte(reporte: number){
		if(this._tipoReporte != reporte)
			this._tipoReporte = reporte;
	}

	getPeriodo(){
		this.periodoStr = this._disenador.periodo.Periodo.trim();
	}

	protected consulta(){
		this.fechaInicio = this._disenador.rangoFechas[0];
		this.fechaFin = this._disenador.rangoFechas[1];

		this.tipoRespuesta = 2;
		if(!this._tipoReporte){
			this.mensaje = 'Seleccione un tipo de reporte';
			this._ngxSmartModalService.getModal('dialogoInformacion').open();
		} else if(this._disenador.nombreMaterias == '') {
			this.mensaje = 'Seleccione al menos una materia para consultar';
			this._ngxSmartModalService.getModal('dialogoInformacion').open();
		} else {
			this.nombreMaterias = this._disenador.nombreMaterias;
			this.verInfoReporte();
		}
	}

	verInfoReporte(){
		let params = {
			servicio: "disenador",
			accion: "IDesk_Disenador_Contenido",
			tipoRespuesta: "json",
			tipo: 1,
			idCurso: this._idCursos //15256
		}
		this._disenador.consultas(params)
			.subscribe( resp => {
				console.log(resp);
				this.reporteIndividual = resp;
			},
			errors => {
				console.log(errors);
			});
	}

	cierraDialogoInfo(resp) {
		this._ngxSmartModalService.getModal("dialogoInformacion").close();
	}

	/*

	// destruye todo wuuuuu... para poder actualizar
	private limpiar(){
		this.temas = [];
		this.fechasSeleccionadas = [];
		this.fechas = [];
		for (let prop of Object.getOwnPropertyNames(this._fechasVista)) {
		  delete this._fechasVista[prop];
		}
		for (let prop of Object.getOwnPropertyNames(this.cronograma)) {
		  delete this.cronograma[prop];
		}
	}*/
}