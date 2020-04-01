import { ChangeDetectorRef, Input } from '@angular/core';
import { FormBuilder, FormGroup} from '@angular/forms';

import { FroalaOptions } from '../iestdesk/froala';

import { Iestdesk } from '../../services/iestdesk.service';
import { Equipos } from '../../services/equipos.service';
import { Rubricas } from '../../services/rubricas.service';

import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

export class RevisionBase {
    public opcFroala = new FroalaOptions();
    public options: Object = this.opcFroala.opciones;

    public rolActual: number;
    public titulo: string = '';
	public fechaCierre;

	public idPlantillaEquipos: number;
	public nombreEquipo: string = '';
    public idEquipo: number = 0;
    public idRubrica: number = 0;
	public idRubricaArchivo: number = 0;
	public idRubricaLink: number = 0;
	public rubricaExternaArchivo;
    public rubricaExternaLink;
    public arrArchivos = [];
	public linksTareas = [];
	public editando: number = 0;

	public formRevision: FormGroup;
	public alumnoRevision;
    public mostrarListado: boolean = true;
    public idAlumno = 0;
    public _calificacion = 0;
	public listado = [];

    public modalReference: any;
    public mensaje: string;
    public tipoRespuesta: number;
    public guardado: boolean = false;
	
	public tipo;
	public idElemento;
	public actividad;
	public rutaListado;

	public alumnoAnterior = [];
	public alumnoSiguiente = [];
	
	public tipoAlta: number = 0;
	@Input() public modoTemario = false;

    constructor(
		private _iestdesk: Iestdesk,
		private _equipos: Equipos,
		private _rubricas: Rubricas = null,
		private formBuilder: FormBuilder,
		private chRef: ChangeDetectorRef,
		private modalService: NgbModal,
		public ngxSmartModalService: NgxSmartModalService
    ) {
        this.rolActual = this._iestdesk.rolActual;
    }

	listadoAlumnos(){
		console.log(this.idElemento);
		this.listado = [];
		let acciones = {
			1: {
				servicio: "tareas",
				accion: "IDesk_Maestro_Tareas_Revision_Listado",
				tipoRespuesta: "json",
				idCurso: this._iestdesk.idCursoActual,
				idTarea: this.idElemento
				
			},
			2: {
				servicio: "foroDiscusion",
				accion: "IDesk_Maestro_Foro_Discusion_Revision_Listado",
				tipoRespuesta: "json",
				idCurso: this._iestdesk.idCursoActual, 
				idForoDisc: this.idElemento
			},
			3: {
				servicio: "actividadesClase",
				accion: this.tipoAlta == 1 ? "IDesk_Maestro_Actividades_Clase_Libre_Revision_Listado" : "IDesk_Maestro_Actividades_Clase_Externa_Revision_Listado",
				tipoRespuesta: "json",
				idCurso: this._iestdesk.idCursoActual, 
				idActividad: this.idElemento
			}
		}
        this._iestdesk.consultas(acciones[this.tipo])
            .subscribe(resp => {
				this.listado = resp;
				this.chRef.detectChanges(); 
            },
            errors => {
                console.log(errors);
            });
	}

	revisar(alumno) {
		let index = this.listado.findIndex(a => a.idPerson == alumno.idPerson);

		if ( index == 0 ) {
			this.alumnoAnterior = [];
			this.alumnoSiguiente = this.listado[index + 1];
		} else {
			if ( this.listado[index - 1].idPerson != '' ) {
				this.alumnoAnterior = this.listado[index - 1];
			} else if ( (index - 2) >= 0 ) {
				this.alumnoAnterior = this.listado[index - 2];
			} else {
				this.alumnoAnterior = [];
			}

			if ( (index + 1) < this.listado.length ) {
				if ( this.listado[index + 1].idPerson != '' ) {
					this.alumnoSiguiente = this.listado[index + 1];
				} else if ( (index + 2) <= this.listado.length ) {
					this.alumnoSiguiente = this.listado[index + 2];
				}
			} else {
				this.alumnoSiguiente = [];
			}
		}

        this.alumnoRevision = alumno;
        this.idAlumno = alumno.idPerson;
        this.mostrarListado = false;

        this.formRevision.patchValue({ idAlumno: this.idAlumno });

        if ( this.idRubrica != 0 ) {
            this.obtieneCalificacion();
        }
    }

	verListado(){
        this.guardado = false;
        this.mostrarListado = true;
		this._calificacion = 0;
		this.arrArchivos = [];
		this.linksTareas = [];
		this.editando = 0;
		//console.log(this.arrArchivos, this.linksTareas);
		this.listadoAlumnos();
	}

	consultaEquipo() {
        let params = {
            servicio: "equipos",
            accion: "IDesk_Equipos_ObtieneEquipoxPersona",
			tipoRespuesta: "json",
			idPlantillaEquipo: this.idPlantillaEquipos, 
			idpersonidesk: this.idAlumno
        };

		this._equipos.consultas(params)
			.subscribe(resp => {
				this.nombreEquipo = resp[0].equipo;
				this.idEquipo = resp[0].idEquipo;
				this.chRef.detectChanges();
			},
			errors => {
				console.log(errors);
			});
    }

	revisarRubrica(content) {
		// IEST o externa
        this.modalReference = this.modalService.open(content, { backdrop: 'static' });
    }

	obtenerRubricaExterna(){
		if(this.idRubricaLink != 0){
			let params = {
				servicio: "links",
				accion: "IDesk_Links_Consulta",
				tipoRespuesta: "json",
				idLinks: this.idRubricaLink,
				rol: this._iestdesk.rolActual
			}
			this._iestdesk.consultas(params)
				.subscribe(resp => {
					this.rubricaExternaLink = resp;
				}, errors => {
					console.log(errors);
				});
		} else {
			if(this.idRubricaArchivo){
				let params = {
					servicio: "archivos",
					accion: "IDesk_Archivos_Consulta",
					tipoRespuesta: "json",
					idArchivos: this.idRubricaArchivo,
					rol: this._iestdesk.rolActual
				};

				this._iestdesk.consultas(params)
					.subscribe(resp => {
						this.rubricaExternaArchivo = resp;
					}, errors => {
						console.log(errors);
					});
			}
		}
	}

	obtieneCalificacion() {
        let params = {
            servicio: "rubricas",
            accion: "IDesk_Rubrica_Calificacion",
            tipoRespuesta: "json",
            idRubrica: this.idRubrica, 
            idAlumno: this.idAlumno, 
            idElemento: this.idElemento,
            tipo: this.tipo
        };

        this._rubricas.consultas(params)
            .subscribe(resp => {
                if ( resp.length > 0 ) {
                    this._calificacion = resp[0].calificacion;
                    this.formRevision.patchValue({ calificacion: this._calificacion });
                }
            },
            errors => {
                console.log(errors);
            });
    }

	obtieneCalif(e) {
        this._calificacion = e;
        this.formRevision.patchValue({ calificacion: this._calificacion });

        this.modalReference.close();
    }

    archivos(e) {
        this.formRevision.patchValue({ idArchivos: e });
    }

	modalReabrir(content){
		this.actividad = (this.tipo == 1) ? 'tarea' : (this.tipo == 2) ? 'foro' : 'actividad';
		this.modalReference = this.modalService.open(content, { backdrop: 'static' });
	}

	obtenRespusta(e){
		if(e != 0)
			this.fechaCierre = e;
        this.modalReference.close();
	}

	getRespuesta(respuesta, n, nombreDialogo){
		switch(respuesta){
			case 'fileError':
				this.mensaje = (n == 1) ? 'Asegúrate de subir sólo un archivo y que este sea menor a 20MB.' : 'Asegúrate de subir un archivo menor a 20MB.';
				this.tipoRespuesta = 2;
				this.ngxSmartModalService.getModal(nombreDialogo).open();
			break;
			case 'fileErrorExt':
				this.mensaje = (n == 1) ? 'El archivo tiene una extensión no válida.' : 'Uno de los archivos tiene una extensión no válida.';
				this.tipoRespuesta = 2;
				this.ngxSmartModalService.getModal(nombreDialogo).open();
			break;
		}
    }

	cierraDialogoInfo(resp, nombreDialogo) {
        this.ngxSmartModalService.getModal(nombreDialogo).close();
		/* Se comentó por las flechas de avance en revisión */
		/*if( this.guardado )
            this.listadoAlumnos();*/
    }
}