import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';

import { Iestdesk } from '../../services/iestdesk.service';
import { ActividadesClase } from '../../services/actividadesClase.service'
import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EntregaBase } from '../../shared/classes/entregaBase';

@Component({
    selector: 'idesk-entregaLibre',
    templateUrl: './entregaLibre.component.html'
})

export class EntregaActividadLibreComponent extends EntregaBase implements OnInit {
	@Input() idPlantillaEquipos: number;

    public idActividadAlumno: number = 0;
	public numArchivos: number = 0;
	
    constructor(
        private iestdesk: Iestdesk,
        private _actividadesClase: ActividadesClase,
        private _formBuilder: FormBuilder,
        private _chRef: ChangeDetectorRef,
		private _modalService: NgbModal,
        public _ngxSmartModalService: NgxSmartModalService,
		private _router: Router)
        //private route: ActivatedRoute)
    {
		super(iestdesk,
			_formBuilder,
			_chRef,
			_modalService,
			_ngxSmartModalService,
			_router);

		this.idElemento = this._actividadesClase.idActividad;

		//console.log(this._actividadesClase);
		//console.log('\nelemento', this.idElemento);
        this.entrega = this._formBuilder.group({
            idElementoAlumno: this.idActividadAlumno, //idActividadAlumno: this.idActividadAlumno,
            idElemento: this.idElemento, //idActividad: this.idElemento,
            idpersonidesk: this.iestdesk.idPerson,
			numOport: 0,
			idEstatusActividad: this.idEstatus,
            entregaEscrita: '',
            idArchivos: '',
            idLinks: ''
		});
		this.tipoAlta = this._actividadesClase.tipoAlta;
    }

    ngOnInit() {
		this.tipo = this.tipoAlta == 1 ? 2 : 3;
		this.idPlantilla = this.idPlantillaEquipos;
		
		//console.dir(this._actividadesClase);
		if(this.rolActual == 2){
			let params = {
				servicio: "actividadesClase",
				accion: this.tipoAlta == 1 ? "IDesk_Alumno_Actividades_Clase_Libre_Entregada" : "IDesk_Alumno_Actividades_Clase_Externa_Entregada",
				tipoRespuesta: "json",
				idActividad: this._actividadesClase.idActividadLibreOExterna,//idActividad: this.idElemento,
				idpersonidesk: this.iestdesk.idPerson
			};
			this._actividadesClase.consultas(params)
				.subscribe( resp => {
					console.log(resp);
					if( resp.length > 0 ){
						this._actividadesClase.idActividadAlumno = this.tipoAlta == 1 ? resp[0].idActLibreAlumno : resp[0].idActExternaAlumno;
						this._actividadesClase.actividad = resp[resp.length-1];
						this.obtieneInfoEntregaActividad();
					}
					this.mensajeOpcional = ( this.idPlantillaEquipos == 0) ? '¿Deseas entregar tu actividad? Si la entregas, ya no podrás editarla.' : '¿Deseas entregar la actividad del equipo? Si la entregas, tus compañeros ya no podrán editarla.';
				}, errors => {
					console.log(errors);
				});
			
		}
		this.verificaCierre(this._actividadesClase.idActividadAlumno);

    }

    obtieneInfoEntregaActividad() {
        this.idActividadAlumno = (this.tipoAlta == 1 ? this._actividadesClase.actividad.idActLibreAlumno : this._actividadesClase.actividad.idActExternaAlumno ) || 0;
		this.idEstatus = this._actividadesClase.actividad.idEstatusActividad-1 || 0;

		if(this.idEstatus != 1){
			if(this._actividadesClase.actividad.length == 0 || this.idActividadAlumno == 0) {
				this.editando = 0;
			} else {
				this.editando = this.tipoAlta == 1 ? 9 : 11;
				this.entrega.patchValue({ 
					idElementoAlumno: this.idActividadAlumno,
					entregaEscrita: this._actividadesClase.actividad.entregaEscrita });
				this._chRef.detectChanges();
			}
		} else {
			this.entregaEscrita = this._actividadesClase.actividad.entregaEscrita;
			this.idActividadAlumno = this.idActividadAlumno;
			this.obtenArchivosEntregaActividad();
			this.titulo = this._actividadesClase.tituloActividad;
		}

		if(this.idPlantillaEquipos > 0)
			this.obtenArchivosPorEquipo();
		this._chRef.detectChanges();
    }

	private entregarActividad(muestraAvisos){
		//console.log(this.entrega.value);
		let params = {
            servicio: "actividadesClase",
            accion: this.tipoAlta == 1 ? "IDesk_Alumno_Actividades_Clase_Libre_Alta" : "IDesk_Alumno_Actividades_Clase_Externa_Alta",
			tipoRespuesta: "json",
			idActividad: this.entrega.value.idElemento,
			idpersonidesk: this.entrega.value.idpersonidesk,
			entregado: this.entrega.value.idEstatusActividad,
			idArchivos: this.entrega.value.idArchivos,
			idLinks: this.entrega.value.idLinks,
			entregaEscrita: this.entrega.value.entregaEscrita
        };

		this._actividadesClase.consultas(params)
			.subscribe( resp => {
                if ( resp[0].error == 0 ) {
					console.log(resp);
					this.idActividadAlumno = resp[0].idActividadAlumno;
					//this._actividadesClase.actividad.idActividadAlumno = this.idActividadAlumno;
					this._actividadesClase.idActividadAlumno  = this.idActividadAlumno
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
				this.mensaje = 'Ocurrió un error al guardar tu actividad';
				this.tipoRespuesta = 2;
				if(muestraAvisos != 1)
					this._ngxSmartModalService.getModal('dialogoInformacion').open();
			});
	}

	private editarEntregaActividad(muestraAvisos){		
		//console.log(this.entrega.value);
		let params = {
            servicio: "actividadesClase",
            accion: this.tipoAlta == 1 ? "IDesk_Alumno_Actividades_Clase_Libre_Edita" : "IDesk_Alumno_Actividades_Clase_Externa_Edita",
			tipoRespuesta: "json",
			idActividadAlumno: this.idActividadAlumno,
			entregado: this.entrega.value.idEstatusActividad,
			idArchivos: this.entrega.value.idArchivos,
			idLinks: this.entrega.value.idLinks,
			entregaEscrita: this.entrega.value.entregaEscrita
			
		};
		
		this._actividadesClase.consultas(params)
			.subscribe( resp => {
				if ( resp[0].error == 0 ) {
					this.idActividadAlumno = resp[0].idActLibreAlumno;
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
				this.mensaje = 'Ocurrió un error al guardar la actividad';
				this.tipoRespuesta = 2;
				if(muestraAvisos != 1)
					this._ngxSmartModalService.getModal('dialogoInformacion').open();
			});
	}
	
	obtenArchivosEntregaActividad() {
		//console.log(this.idActividadAlumno, this._actividadesClase.actividad.idActLibreAlumno, this.idEstatus);
		if(this._actividadesClase.actividad.idActLibreAlumno || this._actividadesClase.actividad.idActExternaAlumno){
			let v = this._actividadesClase.actividad.idActLibreAlumno || this._actividadesClase.actividad.idActExternaAlumno;
			this.obtenArchivosEntrega(v);
		}
	}

	public confirmarCerrado(resp) {
		this.idEstatus = resp;
		this.entrega.patchValue({ idEstatusActividad: this.idEstatus });
		this._ngxSmartModalService.getModal('confirmarEliminacion').close();
		( this.idActividadAlumno == 0 ) ? this.entregarActividad(0) : this.editarEntregaActividad(0);
    }
}