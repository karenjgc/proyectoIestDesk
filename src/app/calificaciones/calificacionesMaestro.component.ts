import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';

import { Iestdesk } from '../services/iestdesk.service';
import { Calificaciones } from '../services/calificaciones.service';

import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';

@Component({
	selector: 'idesk-calificacionesMaestro',
	templateUrl: './calificacionesMaestro.component.html'
})
export class CalificacionesMaestroComponent implements OnInit {
	public objectKeys = Object.keys;
	public alumnos = { };
	public calificaciones = [];
	public archivosRevision = [];
	public comentariosMaestro: string;
	public modalReference: any;
	public filtro: number = 0;
	public parcial: number = 0;
	public idGrado: number = 0;
	public idTipoCurso: number = 0;
	@ViewChild('tablaCalificaciones') table: ElementRef;

	constructor(
		public _iestdesk: Iestdesk,
		private _calificaciones: Calificaciones,
		private chRef: ChangeDetectorRef,
		private modalService: NgbModal,
		private _ngxSmartModalService: NgxSmartModalService
	) {}

	ngOnInit() {
		this._iestdesk.registraAcceso(39,0);
		this.idGrado = this._iestdesk.idGrado;
		this.idTipoCurso = this._iestdesk.idTipoCursoActual;
		console.clear();
		this.obtenListaAlumnos();
	}

	cargaListados(tipo){
		let params = {
			servicio: 'calificaciones',
			tipoRespuesta: 'json',
			accion: 'IDesk_Maestro_Calificaciones_Consulta',
			idCurso: this._iestdesk.idCursoActual,
			filtro: tipo,
			parcial: this.parcial
		};
		
		this._calificaciones.consultas(params)
			.subscribe( resp => {
				this.calificaciones = [];
				let c: number = 1;
				let index : string;
				let registroAnterior;
				let idAlumno;

				//console.log(resp);
				for ( let i in resp ) {
					if(registroAnterior!=undefined && registroAnterior.idElemento != resp[i].idElemento)
						++c;
					if(registroAnterior!=undefined && registroAnterior.tipoElemento != resp[i].tipoElemento)
						c = 1;
					
					switch(+resp[i].tipoElemento){
						case 1:
							index = 'T '+c;
						break;
						case 2:
							index = 'F '+c;
						break;
						case 3:
							index = 'A '+c;
						break;
						case 4:
							index = 'E '+c;
						break;
						case 100:
							index = 'P';
						break;
					}
					if ( !this.calificaciones.hasOwnProperty(index)) 
						this.calificaciones[index] = { };
					
					for(let j = 0; j<Object.keys(this.alumnos).length; j++){
						if ( !this.calificaciones[index].hasOwnProperty( this.objectKeys(this.alumnos)[j] ) )
							this.calificaciones[index][this.objectKeys(this.alumnos)[j] ] = { };

						idAlumno = this.objectKeys(this.alumnos)[j];

						if(resp[i].idAlumno == idAlumno){
							this.calificaciones[index][idAlumno] = resp[i]
						} else {
							/*
							Entrega con calif: Calificación (bold)
							Entrega sin calif: - (c-transparent)
							Pendiente entrega: -- (gris)
							No entregó: 0
							*/
							if(Object.keys(this.calificaciones[index][idAlumno]).length <= 0){
								this.calificaciones[index][idAlumno] = {
									idElemento: resp[i].idElemento,
									idAlumno: idAlumno,
									titulo: resp[i].titulo,
									calificacion: (resp[i].abierta == 1) ? '--' : 0, //
									comentariosMaestro: '--'
								}
							}
							//console.log(typeof(this.calificaciones[index][idAlumno].idElementoAlumno), this.calificaciones[index][idAlumno].idElementoAlumno )
						}
					}
					registroAnterior = resp[i];
				}
			}, errors => {
				console.log(errors);
			});
	}

	private obtenListaAlumnos(){
		let params = {
			servicio: 'equipos',
			tipoRespuesta: 'json',
			accion: 'IDesk_Obtiene_IntegrantesCurso',
			idCurso: this._iestdesk.idCursoActual
		};
		this._iestdesk.consultas(params)
			.subscribe( resp => {
				for ( let i in resp ) {//for ( let a of resp ) {
					if(!this.alumnos.hasOwnProperty(resp[i].idPerson)){
						this.alumnos[resp[i].idPerson] = { idIEST: resp[i].idPerson, nombre: resp[i].nombre };
					}
				}
				this.cargaListados(0);
			}, errors => {
				console.log(errors);
			});
		
	}

	public abreRetroalimentacion(content, elemento) {
		this.consultaRevisionArch(elemento.idElementoAlumno, elemento.tipoElemento);
		this.comentariosMaestro = elemento.comentariosMaestro;
		this.modalReference = this.modalService.open(content, { backdrop: 'static' });
    }

	private consultaRevisionArch(idElementoAlumno, tipo){
		let params = {
			1: {
				servicio: "tareas",
				accion: "IDesk_Tareas_Consulta_Revision_Archivos",
				tipoRespuesta: "json",
				idTareaAlumno: idElementoAlumno
			},
			2: {
				servicio: "foroDiscusion",
				accion: "IDesk_Foro_Discusion_Consulta_Revision_Arch",
				tipoRespuesta: "json",
				idForoDiscAlumno: idElementoAlumno
			},
			3: {
				servicio: "actividadesClase",
				accion: "IDesk_Actividades_Clase_Libre_Revision_Archivos",
				tipoRespuesta: "json",
				idActividadAlumno: idElementoAlumno
			}
        };

        this._calificaciones.consultas(params[tipo])
            .subscribe(resp => {
				console.log(resp);
				
                this.archivosRevision = ( resp.length > 0 ) ? resp : [];
				this.chRef.detectChanges();
            },
            errors => {
                console.log(errors);
            });
	}

	exportarExcel() {
		this._iestdesk.registraAcceso(75,0);
		const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.table.nativeElement);
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Calificaciones');
		
		/* save to file */
		XLSX.writeFile(wb, 'Calificaciones.xlsx');
	}
}