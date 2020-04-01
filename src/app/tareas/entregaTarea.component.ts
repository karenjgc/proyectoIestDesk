import { Component, OnInit, Input, ChangeDetectorRef, EventEmitter } from '@angular/core'; //NgModule, 
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';

//import { FroalaOptions } from '../shared/iestdesk/froala';
import { Iestdesk } from '../services/iestdesk.service';
import { Tareas } from '../services/tareas.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EntregaBase } from '../shared/classes/entregaBase';

@Component({
    selector: 'idesk-entregaTarea',
    templateUrl: './entregaTarea.component.html'
})

export class EntregaTareaComponent extends EntregaBase implements OnInit {
	@Input() oportunidades: any;
	@Input() idPlantillaEquipos: number;

	public idTareaAlumno: number = 0;
	public numArchivos: number = 0;
	
    constructor(
        private iestdesk: Iestdesk,
        private _tareas: Tareas,
        private _formBuilder: FormBuilder,
        private _chRef: ChangeDetectorRef,
		private _modalService: NgbModal,
        private _ngxSmartModalService: NgxSmartModalService,
		private _router: Router)
	{
		super(iestdesk,
			_formBuilder,
			_chRef,
			_modalService,
			_ngxSmartModalService,
			_router);

		this.idElemento = this._tareas.idTarea;
		this.entrega = this._formBuilder.group({
            idElementoAlumno: this.idTareaAlumno, /*idTareaAlumno: this.idTareaAlumno,*/
            idElemento: this.idElemento, /*idTarea: this.idElemento, //this._tareas.idTarea,*/
            idpersonidesk: this.iestdesk.idPerson,
			numOport: 0,
			idEstatusTarea: this.idEstatus,
            entregaEscrita: '',
            idArchivos: '',
            idLinks: ''
        });
    }

	ngOnInit(){
		this.tipo = 1;
		this.idPlantilla = this.idPlantillaEquipos;
		
		if(this.rolActual == 2){
			let params = {
				servicio: "tareas",
				accion: "IDesk_Alumno_Tareas_Entregada",
				tipoRespuesta: "json",
				idTarea: this.idElemento, //idTarea,
				idpersonidesk: this._iestdesk.idPerson
			};
			
			//console.clear();
			this._tareas.consultas(params)
				.subscribe( resp => {
					//console.log(resp);
					if(resp.length > 0){
						this._tareas.idTareaAlumno = resp[0].idTareaAlumno;
						this._tareas.tarea = resp[0]; //resp[resp.length-1] : []; //(oportunidades de entrega - revisar)
						this.obtieneInfoEntregaTarea();
					} else {
						this._tareas.tarea = [];
					}
					this.mensajeOpcional = ( this.idPlantillaEquipos == 0) ? '¿Deseas entregar tu tarea? Si la entregas, ya no podrás editarla.' : '¿Deseas entregar la tarea del equipo? Si la entregas, tus compañeros ya no podrán editarla.';
				}, errors => {
					console.log(errors);
				});
		}
		this.verificaCierre(this.idTareaAlumno);
	}

	private obtieneInfoEntregaTarea(){
		this.idTareaAlumno = this._tareas.tarea.idTareaAlumno || 0;
		this.idEstatus = this._tareas.tarea.idEstatusTarea-1 || 0;
		
		if(this.idEstatus != 1){
			if(this._tareas.tarea.length == 0 || this._tareas.tarea.idTareaAlumno == '') {
				this.editando = 0;
			} else {
				this.editando = 1;
				this.entrega.patchValue({
					idElementoAlumno: this.idTareaAlumno,
					entregaEscrita: this._tareas.tarea.entregaEscrita
				});
				this._chRef.detectChanges();
			}
		} else {
			// ya no puede editar
			this.entregaEscrita = this._tareas.tarea.entregaEscrita;
			this.idTareaAlumno = this._tareas.idTareaAlumno;
			this.obtenArchivosEntregaTarea();
			this.titulo = this._tareas.tituloTarea;
		}

		if(this.idPlantillaEquipos > 0)
			this.obtenArchivosPorEquipo();
		this._chRef.detectChanges();
	}

	private obtenArchivosEntregaTarea(){
		if(this._tareas.tarea.idTareaAlumno){
			this.obtenArchivosEntrega(this._tareas.tarea.idTareaAlumno);
		}	
	}

	public confirmarCerrado(resp) {
		this.idEstatus = resp;
		this.entrega.patchValue({ idEstatusTarea: this.idEstatus });
		this._ngxSmartModalService.getModal('confirmarEliminacion').close();
		( this.idTareaAlumno == 0 ) ? this.entregarTarea(0) : this.editarEntregaTarea(0);
    }

	private entregarTarea(muestraAvisos){
		//console.log(this.entrega.value);
		let params = {
            servicio: "tareas",
            accion: "IDesk_Alumno_Tareas_Alta",
			tipoRespuesta: "json",
			idTarea: this.entrega.value.idElemento,
			numOport: this.entrega.value.numOport,
			idpersonidesk: this.entrega.value.idpersonidesk,
			idEstatusTarea: this.entrega.value.idEstatusTarea,
			idArchivos: this.entrega.value.idArchivos,
			idLinks: this.entrega.value.idLinks,
			entregaEscrita: this.entrega.value.entregaEscrita
        };
		console.log(params);

		this._tareas.consultas(params)
			.subscribe( resp => {
                if ( resp[0].error == 0 ) {
					this.idTareaAlumno = resp[0].idTareaAlumno;
					this._tareas.tarea.idTareaAlumno = this.idTareaAlumno;
                    this.mensaje = resp[0].mensaje;
					this.tipoRespuesta = 1;
                } else {
					this.mensaje = resp[0].error;
					this.tipoRespuesta = 2;
				}
				if(muestraAvisos != 1)
					this._ngxSmartModalService.getModal('dialogoInformacion').open();
			}, errors => {
				console.log(errors);
				this.mensaje = 'Ocurrió un error al guardar tu tarea';
				this.tipoRespuesta = 2;
				if(muestraAvisos != 1)
					this._ngxSmartModalService.getModal('dialogoInformacion').open();
			});
	}

	private editarEntregaTarea(muestraAvisos){		
		//console.log(this.entrega.value);
		let params = {
            servicio: "tareas",
            accion: "IDesk_Alumno_Tareas_Edita",
			tipoRespuesta: "json",
			idTareaAlumno: this.idTareaAlumno,
			numOport: this.entrega.value.numOport,
			idEstatusTarea: this.entrega.value.idEstatusTarea,
			idArchivos: this.entrega.value.idArchivos,
			idLinks: this.entrega.value.idLinks,
			entregaEscrita: this.entrega.value.entregaEscrita
			
		};
		
		this._tareas.consultas(params)
			.subscribe( resp => {
				if ( resp[0].error == 0 ) {
					this.idTareaAlumno = resp[0].idTareaAlumno;
                    this.mensaje = resp[0].mensaje;
					this.tipoRespuesta = 1;
                } else {
					this.mensaje = resp[0].error;
					this.tipoRespuesta = 2;
				}
				if(muestraAvisos != 1)
					this._ngxSmartModalService.getModal('dialogoInformacion').open();
			}, errors => {
				console.log(errors);
				this.mensaje = 'Ocurrió un error al guardar la tarea';
				this.tipoRespuesta = 2;
				if(muestraAvisos != 1)
					this._ngxSmartModalService.getModal('dialogoInformacion').open();
			});
	}

}