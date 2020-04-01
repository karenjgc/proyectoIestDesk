import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Iestdesk } from '../services/iestdesk.service';
import { Calificaciones } from '../services/calificaciones.service';
import { Archivos } from '../services/archivos.service';
import { Tareas } from '../services/tareas.service';
import { ForoDiscusion } from '../services/foroDiscusion.service';
import { ActividadesClase } from '../services/actividadesClase.service';

import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';
import { DTTRADUCCION } from '../shared/dttraduccion';

@Component({
	selector: 'idesk-calificacionesAlumno',
	templateUrl: './calificacionesAlumno.component.html'
})
export class CalificacionesAlumnoComponent implements OnInit {
	public listadoTareas = [];
	public listadoForos = [];
	public listadoExamenes = [];
	public listadoActividades = [];
	public archivosRevision = [];
	public comentariosMaestro: string;
	public modalReference: any;
	public dataTables = { }
	public elementoActual;
	public tiposActividad = {
        1: "Ruleta",
        2: "Jeopardy",
        6: "Libre",
        7: "Externa"
    };

	constructor(
		public _iestdesk: Iestdesk,
		private _calificaciones: Calificaciones,
		private _tareas: Tareas,
		private _foroDisc: ForoDiscusion,
		private actividades: ActividadesClase,
		private chRef: ChangeDetectorRef,
		private modalService: NgbModal,
		private _ngxSmartModalService: NgxSmartModalService,
		private router: Router
	) {}

	ngOnInit() {
		this._iestdesk.registraAcceso(39,0);
		this.cargaListados();
	}

	cargaListados(){
		this.listadoTareas.length = 0;
		this.listadoForos.length = 0;
		this.listadoActividades.length = 0;
		this.listadoExamenes.length = 0;
		let params = {
			servicio: 'calificaciones',
			tipoRespuesta: 'json',
			accion: 'IDesk_Alumno_Calificaciones_Consulta',
			idpersonidesk: this._iestdesk.idPerson,
			idCurso: this._iestdesk.idCursoActual,
			filtro: 0
		};

		this._calificaciones.consultas(params)
			.subscribe( resp => {
				if(resp.length > 0){
					console.clear();
					for(let i in resp){
						switch(+resp[i].tipoElemento){
							case 1:
								this.listadoTareas.push(resp[i]);
							break;
							case 2:
								this.listadoForos.push(resp[i]);
							break;
							case 3:
								this.listadoActividades.push(resp[i]);
							break;
							case 4:
								this.listadoExamenes.push(resp[i]);
							break;
						}
					}
					this.chRef.detectChanges();
					//console.log(this.listadoActividades);
					this.creaDataTables();
				}
				
			}, errors => {
				console.log(errors);
			});
	}

	irElemento(elemento) {
		console.clear();

			switch(+elemento.tipoElemento){
				case 1:
					this._tareas.idTarea = elemento.idElemento;
					break;
				case 2:
					this._foroDisc.idForoDisc = elemento.idElemento;
					break;
				case 3:
					// act clase 
					this.actividades.tipoAlta = (elemento.idTipoActividad == 6) ? 1 : 0;
					this.actividades.idActividad = elemento.idElemento;
					this.actividades.actividadClase = {
						idTipoActividad: elemento.idTipoActividad,
						tipoActividad: this.tiposActividad[elemento.idTipoActividad]
					}
					break;
				case 4:
					// examen
					//console.log('Examen');
					break;
			}
			if(+elemento.idTipoActividad == 0 || +elemento.idTipoActividad == 6 || +elemento.idTipoActividad == 7) // pendiente
				this.elementoActual = elemento;
			else
				this.elementoActual = null;
			//console.log(this.actividades);
    }

	regresar(){
		this.cargaListados();
		this.elementoActual = null;
	}

	private creaDataTables(){
		// tareas
		const tableT: any = $('#tabla-tareas');
		this.dataTables[1] = tableT.DataTable({
			"aaSorting": [], //Desactiva la ordenación inicial
			"language": DTTRADUCCION,
			"dom": '<"row table-header align-items-center"<"col text-center"f><"col"<"row"<"col-9 text-right"i><"col-3"p>>>><"clear">',
			"pagingType": "simple",
			"columnDefs": [
				{ orderable: false, targets: [3] }
			]
		});

		// foros disc
		const tableF: any = $('#tabla-foros');
		this.dataTables[2] = tableF.DataTable({
			"aaSorting": [], //Desactiva la ordenación inicial
			"language": DTTRADUCCION,
			"dom": '<"row table-header align-items-center"<"col text-center"f><"col"<"row"<"col-9 text-right"i><"col-3"p>>>><"clear">',
			"pagingType": "simple",
			"columnDefs": [
				{ orderable: false, targets: [3] }
			]
		});

		// act. clase
		const tableA: any = $('#tabla-actividades');
		this.dataTables[3] = tableA.DataTable({
			"aaSorting": [], //Desactiva la ordenación inicial
			"language": DTTRADUCCION,
			"dom": '<"row table-header align-items-center"<"col text-center"f><"col"<"row"<"col-9 text-right"i><"col-3"p>>>><"clear">',
			"pagingType": "simple",
			"columnDefs": [
				{ orderable: false, targets: [3] }
			]
		});

		// exámenes
		const tableE: any = $('#tabla-examenes');
		this.dataTables[4] = tableE.DataTable({
			"aaSorting": [], //Desactiva la ordenación inicial
			"language": DTTRADUCCION,
			"dom": '<"row table-header align-items-center"<"col text-center"f><"col"<"row"<"col-9 text-right"i><"col-3"p>>>><"clear">',
			"pagingType": "simple",
			"columnDefs": [
				{ orderable: false, targets: [3] }
			]
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
				//console.log(resp);
				
                this.archivosRevision = ( resp.length > 0 ) ? resp : [];
				this.chRef.detectChanges();
            },
            errors => {
                console.log(errors);
            });
	}
}