import { Component, ChangeDetectorRef, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { Iestdesk } from '../../services/iestdesk.service';
import { ActividadesClase } from '../../services/actividadesClase.service';
import { Equipos } from '../../services/equipos.service';
import { Rubricas } from '../../services/rubricas.service';
import { RevisionBase } from '../../shared/classes/revisionBase';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
    selector: 'idesk-revisionActividadLibre',
    templateUrl: './revisionLibre.component.html'
})

export class RevisionActividadLibreComponent extends RevisionBase implements OnInit {
    public idActividadAlumno;
    public actividadEntregaEscrita;
	public tipoReabrir: number;
	public idActividadLibreOExterna: number = 0;

    constructor(
        private iestdesk: Iestdesk,
        private actividadesClase: ActividadesClase,
        private equipos: Equipos,
        private rubricas: Rubricas,
        private _chRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _modalService: NgbModal,
        private _ngxSmartModalService: NgxSmartModalService
    ){
        super(iestdesk,
			equipos,
			rubricas,
			_formBuilder,
			_chRef,
			_modalService,
			_ngxSmartModalService
		);
		console.clear();
		this.tipo = 3;
        this.tipoAlta = this.actividadesClase.tipoAlta;
        this.idElemento = 0;
		this.idActividadLibreOExterna = this.actividadesClase.idActividad;
        
        this.formRevision = this._formBuilder.group({
            idActividad: 0,
            idAlumno: ['', Validators.required],
            calificacion:  ['', [Validators.required, Validators.max(10)] ],
            comentariosMaestro: '',
			idArchivos: ''
        });
    }
	/**
		tipoAlta = 1, act. libre => tipo = 2
		tipoAlta = 2, act. externa => tipo = 3
	*/
    
    ngOnInit() {
        this.iestdesk.registraAcceso(46, this.actividadesClase.idActividad);
        let params = {
            servicio: "actividadesClase",
            accion: this.tipoAlta == 1 ? "IDesk_Actividades_Clase_Libre_Vista_Ind" : "IDesk_Actividades_Clase_Externa_Vista_Ind",
            tipoRespuesta: "json",
            idActividad: this.actividadesClase.idActividad,
			idpersonidesk: this.iestdesk.idPerson
        };
        this.actividadesClase.consultas(params)
            .subscribe(resp => {
                this.idElemento = this.tipoAlta == 1 ? resp[0].idActividadLibre : resp[0].idActividadExterna;
                this.idPlantillaEquipos = resp[0].idPlantillaEquipos;
				this.titulo = resp[0].titulo;
                this.fechaCierre = resp[0].fechaCierre;
                this._chRef.detectChanges();
                this.listadoAlumnos();
                this.formRevision.patchValue({ idActividad: this.idElemento });
				//console.log('idElemento', this.idElemento);
            },
            errors => {
                console.log(errors);
            });
    }

	infoRevisa(alumno){
        this.arrArchivos = [];
        this.idActividadAlumno = 0;
        this.formRevision.reset();
        this.formRevision.patchValue({
            idActividad: this.idElemento,
            idArchivos: ''
        });

        if ( alumno.id != '' ) {
            this.revisar(alumno);
            this.idPlantillaEquipos != 0 ? this.consultaEquipo() : this.idEquipo = 0;
            setTimeout(() => {
                this.obtieneInfoActividadEntregada();
                this.consultaRevision();
            }, 100);
        }
	}

	regresaListado() {
        this.formRevision.reset();

        this.formRevision.patchValue({
            idActividad: this.idElemento,
            idArchivos: ''
        });

		this.verListado();
    }

	obtieneInfoActividadEntregada(){
		let params = {
            servicio: "actividadesClase",
            accion: this.tipoAlta == 1 ? "IDesk_Alumno_Actividades_Clase_Libre_Entregada" : "IDesk_Alumno_Actividades_Clase_Externa_Entregada",
            tipoRespuesta: "json",
            idActividad: this.idElemento,
			idpersonidesk: this.idAlumno
        };

        this.actividadesClase.consultas(params)
            .subscribe(resp => {
				if(resp.length > 0){
					this.actividadEntregaEscrita = resp[0].entregaEscrita;
					this.idActividadAlumno = this.tipoAlta == 1 ? resp[0].idActLibreAlumno : resp[0].idActExternaAlumno;
					this.actividadesClase.idActividadAlumno = resp[0].idActLibreAlumno;
                }
                this.obtenArchivos();
                this.obtenLinks();
            },
            errors => {
                console.log(errors);
            });
    }

	obtenArchivos(){
		let acciones = {
			0 : {
				servicio: "actividadesClase",
				accion: this.tipoAlta == 1 ? "IDesk_Alumno_Actividades_Clase_Libre_Archivos" : "IDesk_Alumno_Actividades_Clase_Externa_Archivos",
				idActividadAlumno: this.idActividadAlumno
			},
			1 : {
				servicio: "actividadesClase",
				accion: this.tipoAlta == 1 ? "IDesk_Alumno_Actividades_Clase_Libre_Archivos_Equipo" : "IDesk_Alumno_Actividades_Clase_Externa_Archivos_Equipo",
				idActividad: this.actividadesClase.idActividad,
				idpersonidesk: this.iestdesk.idPerson, 
				idPlantillaEquipos: this.idPlantillaEquipos, 
				idEquipo: this.idEquipo,
				rol: this.rolActual
			}
        }
		let accionTomada = (this.idPlantillaEquipos != 0) ? 1 : 0;
        acciones[accionTomada]["tipoRespuesta"] = "json";
		this.actividadesClase.consultas(acciones[accionTomada])
			.subscribe(resp => {
				this.arrArchivos = resp;
				this._chRef.detectChanges();
			}, errors => {
			  console.log(errors);
			});
	}

	obtenLinks(){
		let acciones = {
			0 : {
				servicio: "actividadesClase",
				accion: this.tipoAlta == 1 ? "IDesk_Alumno_Actividades_Clase_Libre_Links" : "IDesk_Alumno_Actividades_Clase_Externa_Links",
				idActividadAlumno: this.idActividadAlumno
			},
			1 : {
				servicio: "actividadesClase",
				accion: this.tipoAlta == 1 ? "IDesk_Alumno_Actividades_Clase_Libre_Links_Equipo" : "IDesk_Alumno_Actividades_Clase_Externa_Links_Equipo", 
				idActividad: this.actividadesClase.idActividad,
				idpersonidesk: this.iestdesk.idPerson, 
				idPlantillaEquipos: this.idPlantillaEquipos, 
				idEquipo: this.idEquipo,
				rol: this.rolActual				
			}
		}

		acciones[(this.idPlantillaEquipos != 0) ? 1 : 0]["tipoRespuesta"] = "json";
		this.actividadesClase.consultas(acciones[(this.idPlantillaEquipos != 0) ? 1 : 0])
			.subscribe(resp => {
				this.linksTareas = resp;
			}, errors => {
			  console.log(errors);
			});
	}

    consultaRevision() {
        let params = {
            servicio: "actividadesClase",
            accion: this.tipoAlta == 1 ? "IDesk_Actividades_Clase_Libre_Consulta_Revision" : "IDesk_Actividades_Clase_Externa_Consulta_Revision",
            tipoRespuesta: "json",
            idActividad: this.actividadesClase.idActividad, //this.idElemento,
            idpersonidesk: this.idAlumno
        };

        this.actividadesClase.consultas(params)
            .subscribe(resp => {
                if ( resp.length > 0 ) {
					this.editando = this.tipoAlta == 1 ? 12 : 13;
                    this.formRevision.patchValue({
                        idActividad: this.idElemento,
                        idAlumno: this.idAlumno,
                        calificacion: resp[0].calificacion,
                        comentariosMaestro: resp[0].comentariosMaestro
                    });
                    this.actividadesClase.idActividadAlumno = this.tipoAlta == 1 ? resp[0].idActLibreAlumno : resp[0].idActExternaAlumno;
                }
            },
            errors => {
                console.log(errors);
            });
    }

    altaRevision() {
        if ( this.formRevision.valid ) {
            let params = {
                servicio: "actividadesClase",
                accion: this.tipoAlta == 1 ? "IDesk_Maestro_Actividades_Clase_Libre_Revisa" : "IDesk_Maestro_Actividades_Clase_Externa_Revisa",
                tipoRespuesta: "json",
                idActividad: this.formRevision.value.idActividad,
                idpersonidesk: this.formRevision.value.idAlumno,
                calificacion: this.formRevision.value.calificacion,
                comentariosMaestro: this.formRevision.value.comentariosMaestro || '',
                idArchivos: this.formRevision.value.idArchivos
            };
            this.actividadesClase.consultas(params)
                .subscribe(resp => {
                    if ( resp[0].error == 0 ) {
                        this.guardado = true;
                        this.regresaListado();
                    } else {
                        this.mensaje = resp[0].mensaje;
                        this.tipoRespuesta = 2;
                        this._ngxSmartModalService.getModal('dialogoInformacionTarea').open();
                    }
                },
                errors => {
                    console.log(errors);
                });
        } else {
            this.mensaje = 'Ingrese la calificación antes de continuar. Recuerde que la máxima es 10.';
            this.tipoRespuesta = 2;
            this._ngxSmartModalService.getModal('dialogoInformacionTarea').open();
        }
    }
}