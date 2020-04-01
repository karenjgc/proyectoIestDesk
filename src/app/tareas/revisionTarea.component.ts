import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';

import { Iestdesk } from '../services/iestdesk.service';
import { Tareas } from '../services/tareas.service';
import { Equipos } from '../services/equipos.service';
import { Rubricas } from '../services/rubricas.service';

import { RevisionBase } from '../shared/classes/revisionBase';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
    selector: 'idesk-revisionTarea',
    templateUrl: './revisionTarea.component.html'
})
export class RevisionTareaComponent extends RevisionBase implements OnInit {
    public idTarea: number;
    public idTareaAlumno: number = 0;
	public tareaEntregaEscrita: string;
	public infoTareaAlumno = [];

    @ViewChild('tareaArea') private myScrollContainer: ElementRef;

    constructor(
        private iestdesk: Iestdesk,
        private tareas: Tareas,
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
		this.tipo = 1;
		this.idElemento = this.tareas.idTarea;

        this.formRevision = this._formBuilder.group({
            idTarea: this.idElemento,
            idAlumno: ['', Validators.required],
            calificacion:  ['', [Validators.required, Validators.max(10)] ],
            comentariosMaestro: '',
			idArchivos: ''
        });
    }

    ngOnInit() {
        this.iestdesk.registraAcceso(34, this.tareas.idTarea);
        this.listadoAlumnos();
        let params = {
            servicio: "tareas",
            accion: "IDesk_Tareas_Vista_Ind",
            tipoRespuesta: "json",
            idTarea: this.idElemento,
			idpersonidesk: this.iestdesk.idPerson
        };
        this.tareas.consultas(params)
            .subscribe(resp => {
                this.idPlantillaEquipos = resp[0].idPlantillaEquipos;
                this.idRubrica = resp[0].idRubrica;
				this.idRubricaArchivo = resp[0].idRubricaExterna;
				this.idRubricaLink = resp[0].idRubricaExternaLink;
				this.titulo = resp[0].titulo;
				this.fechaCierre = resp[0].fechaCierre;
				this.obtenerRubricaExterna();
				// numOport
            },
            errors => {
                console.log(errors);
            });
    }

	public infoRevisa(alumno){
        this.formRevision.reset();
        this.formRevision.patchValue({
            idTarea: this.idElemento,
            idArchivos: ''
        });
        this.tareaEntregaEscrita = '';
        this.idTareaAlumno = 0;
        this.tareas.idTareaAlumno = 0;

        if ( alumno.id != '' ) {
            this.revisar(alumno);
            //console.log(this.idPlantillaEquipos);
            this.idPlantillaEquipos != 0 ? this.consultaEquipo() : this.idEquipo = 0;
            this.obtieneInfoTareaEntregada();
            this.consultaRevision();
        }
	}

	regresaListado() {
        this.formRevision.reset();

        this.formRevision.patchValue({
            idTarea: this.idElemento,
            idArchivos: ''
        });
        this.tareaEntregaEscrita = '';
        this.idTareaAlumno = 0;
        this.tareas.idTareaAlumno = 0;

		this.verListado();
    }

	private obtenArchivos(){
		let acciones = {
			0 : {
				servicio: "tareas",
				accion: "IDesk_Alumno_Tareas_Archivos_Adjuntos",
				idTareaAlumno: this.idTareaAlumno
			},
			1 : {
				servicio: "tareas",
				accion: "IDesk_Alumno_Tareas_Archivos_Equipo",
				idTarea: this.tareas.idTarea,
				idpersonidesk: this.iestdesk.idPerson, 
				idPlantillaEquipos: this.idPlantillaEquipos, 
				idEquipo: this.idEquipo,
				rol: this.rolActual
			}
		}
		let accionTomada = (this.idPlantillaEquipos != 0) ? 1 : 0;
		acciones[accionTomada]["tipoRespuesta"] = "json";
		this.tareas.consultas(acciones[accionTomada])
			.subscribe(resp => {
				this.arrArchivos = resp;
				this._chRef.detectChanges();
			}, errors => {
			  console.log(errors);
			});
	}

	private obtenLinks(){
		let acciones = {
			0 : {
				servicio: "tareas",
				accion: "IDesk_Alumno_Tareas_Links",
				idTareaAlumno: this.idTareaAlumno
			},
			1 : {
				servicio: "tareas",
				accion: "IDesk_Alumno_Tareas_Links_Equipo",
				idTarea: this.tareas.idTarea,
				idpersonidesk: this.iestdesk.idPerson, 
				idPlantillaEquipos: this.idPlantillaEquipos, 
				idEquipo: this.idEquipo,
				rol: this.rolActual				
			}
		}

		acciones[(this.idPlantillaEquipos != 0) ? 1 : 0]["tipoRespuesta"] = "json";
		this.tareas.consultas(acciones[(this.idPlantillaEquipos != 0) ? 1 : 0])
			.subscribe(resp => {
				this.linksTareas = resp;
			}, errors => {
			  console.log(errors);
			});
	}

	private obtieneInfoTareaEntregada(){
		let params = {
            servicio: "tareas",
            accion: "IDesk_Alumno_Tareas_Entregada",
            tipoRespuesta: "json",
            idTarea: this.idElemento,
			idpersonidesk: this.idAlumno
        };

        this.tareas.consultas(params)
            .subscribe(resp => {
				if(resp.length > 0){
					this.tareaEntregaEscrita = resp[0].entregaEscrita;
					this.idTareaAlumno = resp[0].idTareaAlumno;
					this.tareas.idTareaAlumno = resp[0].idTareaAlumno;
				}
				this.obtenArchivos();
				this.obtenLinks();
            },
            errors => {
                console.log(errors);
            });
    }

    consultaRevision() {
        let params = {
            servicio: "tareas",
            accion: "IDesk_Tareas_Consulta_Revision",
            tipoRespuesta: "json",
            idTarea: this.idElemento,
            idAlumno: this.idAlumno
        };

        this.tareas.consultas(params)
            .subscribe(resp => {
                if ( resp.length > 0 ) {
					this.editando = 7;
                    this.formRevision.patchValue({
                        idTarea: this.idElemento,
                        idAlumno: this.idAlumno,
                        calificacion: resp[0].calificacion,
                        comentariosMaestro: resp[0].comentariosMaestro
                    });
                }
            },
            errors => {
                console.log(errors);
            });
    }

    altaRevision() {
        if ( this.formRevision.valid ) {
            let params = {
                servicio: "tareas",
                accion: "IDesk_Maestro_Tareas_Revisa",
                tipoRespuesta: "json",
                idTarea: this.formRevision.value.idTarea,
                idAlumno: this.formRevision.value.idAlumno,
                calificacion: this.formRevision.value.calificacion,
                comentariosMaestro: this.formRevision.value.comentariosMaestro || '',
                idArchivos: this.formRevision.value.idArchivos
            };
			console.log(params);
            this.tareas.consultas(params)
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