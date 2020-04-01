import { ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FroalaOptions } from '../iestdesk/froala';
import { Iestdesk } from '../../services/iestdesk.service';

import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

export class EntregaBase {
	public opcFroala = new FroalaOptions();
	public options: Object = this.opcFroala.opciones;
	public rolActual: number;
	public modalReference: any;
	
	public editando: number = 0;
	public idArchivos: string = '0';
	public idLinks: string = '0';
	public idEstatus = 0;
	public mensaje: string;
	public tipoRespuesta: number;
	public elementoEliminar: string = '';

	public titulo: string;
	public idPersonAlta: number;
	public arrArchivos = [];
	public arrArchivosEquipo = [];
	public linksActividad = [];
	public linksActividadEquipo = [];

	public entregaEscrita: string = '';
	public mensajeOpcional: string = '';
	public entrega: FormGroup;
	public tipo: number = 0;
	public idElemento;
	public idPlantilla;
	public tipoAlta: number = 0;
	public cerrado: number = 0;

	constructor(
		protected _iestdesk: Iestdesk,
		protected formBuilder: FormBuilder,
		protected chRef: ChangeDetectorRef,
		protected modalService: NgbModal,
		public ngxSmartModalService: NgxSmartModalService,
		protected router: Router
    ) {
		this.rolActual = this._iestdesk.rolActual;
    }

	obtenArchivosEntrega(idElementoAlumno) {
		let accionesArchivo = {
			1: {
				servicio: "tareas",
				accion: "IDesk_Alumno_Tareas_Archivos_Adjuntos",
				tipoRespuesta: "json",
				idTareaAlumno: idElementoAlumno
			},
			2: {
				servicio: "actividadesClase",
				accion: "IDesk_Alumno_Actividades_Clase_Libre_Archivos",
				tipoRespuesta: "json",
				idActividadAlumno: idElementoAlumno
			},
			3: {
				servicio: "actividadesClase",
				accion: "IDesk_Alumno_Actividades_Clase_Externa_Archivos",
				tipoRespuesta: "json",
				idActividadAlumno: idElementoAlumno
			}
		};

		this._iestdesk.consultas(accionesArchivo[this.tipo])
			.subscribe(resp => {
				//this.numArchivos = resp.length;
				if(resp.length > 0){
					this.arrArchivos = resp;
					this.idPersonAlta = resp[0].capturadoPor || 0;
				}
			}, errors => {
				console.log(errors);
			});

		let accionesLink = {
			1: {
				servicio: "tareas",
				accion: "IDesk_Alumno_Tareas_Links",
				tipoRespuesta: "json",
				idTareaAlumno: idElementoAlumno
			},
			2: {
				servicio: "actividadesClase",
				accion: "IDesk_Alumno_Actividades_Clase_Libre_Links",
				tipoRespuesta: "json",
				idActividadAlumno: idElementoAlumno
			},
			3: {
				servicio: "actividadesClase",
				accion: "IDesk_Alumno_Actividades_Clase_Externa_Links",
				tipoRespuesta: "json",
				idActividadAlumno: idElementoAlumno
			}
		};

		this._iestdesk.consultas(accionesLink[this.tipo])
			.subscribe( resp => {
				console.log(resp);
				this.linksActividad = resp;
			}, errors => {
				console.log(errors);
			});
	}

	obtenArchivosPorEquipo() {
		let accionesArchivos = {
			1: {
				servicio: "tareas",
				accion: "IDesk_Alumno_Tareas_Archivos_Equipo",
				tipoRespuesta: "json",
				idTarea: this.idElemento,
				idpersonidesk: this._iestdesk.idPerson, 
				idPlantillaEquipos: this.idPlantilla, 
				idEquipo: 0, 
				rol: this.rolActual
			},
			2: {
				servicio: "actividadesClase",
				accion: "IDesk_Alumno_Actividades_Clase_Libre_Archivos_Equipo",
				tipoRespuesta: "json",
				idActividad: this.idElemento,
				idpersonidesk: this._iestdesk.idPerson, 
				idPlantillaEquipos: this.idPlantilla, 
				idEquipo: 0, 
				rol: this.rolActual
			},
			3: {
				servicio: "actividadesClase",
				accion: "IDesk_Alumno_Actividades_Clase_Externa_Archivos_Equipo",
				tipoRespuesta: "json",
				idActividad: this.idElemento,
				idpersonidesk: this._iestdesk.idPerson, 
				idPlantillaEquipos: this.idPlantilla, 
				idEquipo: 0, 
				rol: this.rolActual
			}
		}
		this._iestdesk.consultas(accionesArchivos[this.tipo])
			.subscribe(resp => {
				console.log(resp);
				this.arrArchivosEquipo = resp;
			}, errors => {
				console.log(errors);
			});

		let accionesLinks = {
			1: {
				servicio: "tareas",
				accion: "IDesk_Alumno_Tareas_Links_Equipo",
				tipoRespuesta: "json",
				idTarea: this.idElemento,
				idpersonidesk: this._iestdesk.idPerson,
				idPlantillaEquipos: this.idPlantilla,
				idEquipo: 0, 
				rol: this.rolActual
			},
			2: {
				servicio: "actividadesClase",
				accion: "IDesk_Alumno_Actividades_Clase_Libre_Links_Equipo",
				tipoRespuesta: "json",
				idActividad: this.idElemento,
				idpersonidesk: this._iestdesk.idPerson, 
				idPlantillaEquipos: this.idPlantilla,
				idEquipo: 0, 
				rol: this.rolActual
			},
			3: {
				servicio: "actividadesClase",
				accion: "IDesk_Alumno_Actividades_Clase_Externa_Links_Equipo",
				tipoRespuesta: "json",
				idActividad: this.idElemento,
				idpersonidesk: this._iestdesk.idPerson, 
				idPlantillaEquipos: this.idPlantilla,
				idEquipo: 0, 
				rol: this.rolActual
			}
        };

		this._iestdesk.consultas(accionesLinks[this.tipo])
			.subscribe( resp => {
				console.log(resp);
				this.linksActividadEquipo = resp;
			}, errors => {
				console.log(errors);
			});
	}

	links(idLinks){
		//console.log(idLinks);
		this.idLinks = idLinks;
		this.entrega.patchValue({ idLinks: this.idLinks });
    }

	archivos(idArchivos) {
		//console.log(idArchivos);
        this.idArchivos = idArchivos;
		setTimeout( () => {
			this.entrega.patchValue({ idArchivos: this.idArchivos });
		}, 1200 );
    }

	verArchivosEquipo(content){
		this.obtenArchivosPorEquipo();
		this.modalReference = this.modalService.open(content, { backdrop: 'static' });
	}

	confirmarEntrega(){
		this.ngxSmartModalService.getModal('confirmarEliminacion').open();
	}

	verificaCierre(idElementoAlumno, accion = false){
		//console.log('tipo', this.tipo, '     elemento', this.idElemento);
		let params = {
			servicio: "idesk",
			accion: "IDesk_Verifica_FechaCierre",
			tipoRespuesta: "json",
			idpersonidesk: this._iestdesk.idPerson,
			idElemento: this.idElemento,
			tipo: this.tipo
		}
		
		this._iestdesk.consultas(params)
			.subscribe(resp => {
				//console.log('cerrado', +resp[0].cerrado);
				this.cerrado = +resp[0].cerrado;
				if(accion)
					this.valida(idElementoAlumno, 0);
			}, errors => {
				console.log(errors);
			});
	}

	valida(idElementoAlumno, muestraAvisos){
		this.entrega.value.entregaEscrita = this.entrega.value.entregaEscrita.replace(/<img .*?>/g, "");
		//console.log(this.cerrado, this.formatter());
		if(this.cerrado == 0){ //if( resp[0].cerrado == 0){
			if( this.formatter() != '' ||  this.idArchivos != '0' || this.idLinks != '0') {//if( this.entrega.value.entregaEscrita != '' ||  this.idArchivos != '0' || this.idLinks != '0') {
				switch(+this.tipo){
					case 1:
						this.entrega.patchValue({
							numOport: 1,
							idElementoAlumno: idElementoAlumno
						});
					break;
					case 2:
					case 3:
						this.entrega.patchValue({ idElementoAlumno: idElementoAlumno });
					break;
				}

				this.confirmarEntrega(); //this.confirmarEntregaTarea();
			} else {
				this.limpiaVariables(idElementoAlumno);
				this.mensaje = 'No has elegido material para entregar';
				this.tipoRespuesta = 2;
				this.ngxSmartModalService.getModal('dialogoInformacion').open();
			}
		} else {
			this.limpiaVariables(idElementoAlumno);
			this.mensaje = (this.tipo == 1) ? 'La tarea se encuentra cerrada' : 'La actividad se encuentra cerrada';
			this.tipoRespuesta = 3; 
			this.ngxSmartModalService.getModal('dialogoInformacion').open();
		}
	}

	formatter = () => {
        let element = document.createElement('div');
        element.innerHTML = this.entrega.value.entregaEscrita;
        return element.textContent;
    };

	cierraDialogoInfo(resp) {
        let ruta = {
			1: '/tareas',
			2: '/actividades-clase',
			3: '/actividades-clase'
		};
		this.ngxSmartModalService.getModal('dialogoInformacion').close();
		this.chRef.detectChanges();
		if(this.tipoRespuesta == 1) // checar id status de entregas
			this.router.navigate([ruta[this.tipo]]);
	}

	limpiaVariables(idElementoAlumno) {
        this.entrega.patchValue({ 
            idElementoAlumno: idElementoAlumno, 
            idElemento: this.idElemento,
            idpersonidesk: this._iestdesk.idPerson });
    }

	getRespuesta(respuesta, n){
		switch(respuesta){
			case 'fileError':
				this.mensaje = (n == 1) ? 'Asegúrate de subir sólo un archivo y que este sea menor a 20MB.' : 'Asegúrate de subir un archivo menor a 20MB.';
				this.tipoRespuesta = 2;
				this.ngxSmartModalService.getModal('dialogoInformacion').open();
			break;
			case 'fileErrorExt':
				this.mensaje = (n == 1) ? 'El archivo tiene una extensión no válida.' : 'Uno de los archivos tiene una extensión no válida.';
				this.tipoRespuesta = 2;
				this.ngxSmartModalService.getModal('dialogoInformacion').open();
			break;
		}
    }
}