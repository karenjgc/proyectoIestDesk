import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

import { DatepickerOptions } from '../shared/classes/datepicker';

import { Iestdesk } from '../services/iestdesk.service';
import { Tareas } from '../services/tareas.service';
import { Rubricas } from '../services/rubricas.service';
import { Equipos } from '../services/equipos.service';
import { AltasBase } from '../shared/classes/altasBase';
import { AltaTemaComponent } from "../temario/altaTema.component";

import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { DateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { MomentDateTimeAdapter } from 'ng-pick-datetime-moment';
import { MY_CUSTOM_FORMATS } from '../videoconferencias/altaVideoconf.component';
// https://stackblitz.com/github/DanielYKPan/owl-examples/tree/date-time-picker?file=src%2Fapp%2Fcustom-format%2Fcustom-format.component.ts
// https://danielykpan.github.io/date-time-picker/#locale-formats

import * as _moment from 'moment';
import { EditorService } from '../services/editorService.service';

@Component({
    selector: 'idesk-altaTareas',
    templateUrl: './altaTareas.component.html',
    providers: [
        { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
        { provide: OWL_DATE_TIME_FORMATS, useValue: MY_CUSTOM_FORMATS },
    ]
})

export class AltaTareasComponent extends AltasBase implements OnInit {
    public titulito: string = '';

    public idTarea: number = 0;
	public modalidadEntrega: any[];

    constructor(
        public iestdesk: Iestdesk,
        private tareas: Tareas,
        private equipos: Equipos,
		private rubricas: Rubricas,
        private _formBuilder: FormBuilder,
        private _chRef: ChangeDetectorRef,
        public _ngxSmartModalService: NgxSmartModalService,
        private _modalService: NgbModal,
        private router: Router,
        private route: ActivatedRoute,
        public editorService: EditorService
    ){
		super(iestdesk,
            equipos,
            rubricas,
            _formBuilder,
            _chRef,
            _modalService,
            _ngxSmartModalService,        
            router);
            
        this.rubricas.idRubrica = 0;
            
        this.idTarea = this.tareas.idTarea;
		this.rutaListado = "/tareas";
		
		this.formulario = this._formBuilder.group({
            idTarea: this.idTarea,
            idCurso: [this.iestdesk.rolActual == 3 ? this.iestdesk.idCursoActual : '', Validators.required],
			idTemas: ['', Validators.required],
            titulo: ['', Validators.required],
            objetivo: '',
            descripcion: ['', Validators.required],
            idModEntrega: [1, Validators.required],
            oportunidades: 1,
            aspectosEvaluacion: '',
            idRubrica: 0,
			idRubricaExterna: 0,
			idRubricaExternaLink: 0,
            fechaPublicacion: this.iestdesk.rolActual == 3 ? new Date() : [0, Validators.required],
            fechaCierre: this.iestdesk.rolActual == 3 ? new Date() : [0, Validators.required],
            idModTrabajo: [1, Validators.required],
            idPlantillaEquipos: [0, Validators.required],
            idArchivos: '',
            idLinks: '',
            idpersonidesk: this.iestdesk.idPerson,
			modalidadEntrega: '',
			modalidadTrabajo: '',
			tema: ''
        });
		this.fechaCierreSeleccionada = ' ';
        this.idPlantillaSolicitada = ' ';
    }

    ngOnInit() {
        this.iestdesk.registraAcceso(33, this.idTarea);
        if ( this.idTarea != 0 ) {
			this.editando = 5;
            let params = {
                servicio: "tareas",
                accion: "IDesk_Tareas_Vista_Ind",
                tipoRespuesta: "json",
                idTarea: this.tareas.idTarea,
				idpersonidesk: this.iestdesk.idPerson
            };
            this.tareas.consultas(params)
                .subscribe(resp => {
					if(resp.length > 0){
                        this.contenidoEditor = resp[0].anabels == 1;
                        this.temaSeleccionado = +resp[0].idTema;
						this.idRubrica = resp[0].idRubrica;
						this.idRubricaExterna = resp[0].idRubricaExterna;
						this.idRubricaExternaLink = resp[0].idRubricaExternaLink;

						this.formulario.patchValue({ 
                            idCurso: this.iestdesk.idCursoActual,
							titulo: resp[0].titulo,
							objetivo: resp[0].objetivo,
							descripcion: resp[0].descripcion,
							idModEntrega: resp[0].idModEntrega,
							oportunidades: resp[0].oportunidades,
							aspectosEvaluacion: resp[0].aspectosEvaluacion,
							idRubrica: resp[0].idRubrica,
							idRubricaExterna: resp[0].idRubricaExterna,
							idRubricaExternaLink: resp[0].idRubricaExternaLink,
							idModTrabajo: resp[0].idModTrabajo,
							fechaPublicacion: resp[0].fechaPublicacionISO,
							fechaCierre: resp[0].fechaCierreISO,
							idTemas: resp[0].idTema,
							idPlantillaEquipos: resp[0].idPlantillaEquipos,
							idTarea: this.idTarea,
                        });
                        this.modificaEquipos = resp[0].modificaEquipos;
						this.titulito = resp[0].titulo;

						this.cargaElementos( resp[0].idTema, resp[0].fechaPublicacionISO, resp[0].fechaCierreISO, resp[0].idModTrabajo, resp[0].idPlantillaEquipos );

						if(resp[0].idRubrica != 0){
							this.idRubrica = resp[0].idRubrica;
							this.idRubricaExterna = 0;
							this.idRubricaExternaLink = 0;
							this.obtenerInfoRubrica();
						}
                        
                        if(this.iestdesk.rolActual != 3){
                            this.agrupar();
                        }

						//console.log('\n'+this.modificaEquipos, this.titulito+'\n');
					} else {
						//console.log('Ocurrió un error la cargar la información', '\n', resp)
						this.titulito = 'Agregar Tarea';
						this.limpiaVariables();
					}
                },
                errors => {
                    console.log(errors);
                });
        } else {
            this.titulito = 'Agregar Tarea';
            this.limpiaVariables();
        }

		if (!this.tareas.modEntrega) {
            let params = {
                servicio: "tareas",
                accion: "IDesk_Maestro_ModEntrega_Listado",
                tipoRespuesta: "json"
            };
            this.tareas.consultas(params)
				.subscribe(resp => {
					this.modalidadEntrega = resp;
					this.tareas.modEntrega = resp;
				},
				errors => {
					console.log(errors);
				});
        } else {
			this.modalidadEntrega = this.tareas.modEntrega;
		}
    }

    validaTarea(){
        if(this.iestdesk.rolActual == 3 && this.editorService.esAsignado == 1){
            this.modalidad = [];
            this.modalidad.push(this.formulario.value.idModTrabajo);
        }

		let valido = this.publicacionCursos();

        if(valido){
            if(this.iestdesk.rolActual == 3 ){
                if(this.editorService.esAsignado == 1){
                    this.fechaPublicacion = [];
                    this.fechaPublicacion.push(_moment(this.formulario.value.fechaPublicacion).format("DD/MM/YY HH:mm"));

                    this.fechaCierre = [];
                    this.fechaCierre.push(_moment(this.formulario.value.fechaCierre).format("DD/MM/YY HH:mm"));

                    this.modalidad = [];
                    this.modalidad.push(this.formulario.value.idModTrabajo);
                }

                this.temas = [];
                this.temas.push(this.temaSeleccionado);
            }

            this.formulario.patchValue({ 
                idCurso: this.idCursosPub.join("|"),
                idTemas: this.temas.join("|"),
                fechaPublicacion: this.fechaPublicacion.join("|"),
                fechaCierre: this.fechaCierre.join("|"),
                idModTrabajo: this.modalidad.join("|"),
                idPlantillaEquipos: this.idEquipos.join("|"),
            });
            

            if(!this.formulario.valid) {
                //this.limpiaVariables();
                this.mensaje = 'Llene todos los campos antes de continuar';
                this.tipoRespuesta = 2;
                this.ngxSmartModalService.getModal('dialogoInformacion').open();
            } else {
				this.altaEdicionTarea( (this.idTarea == 0) ? 0 : 1 ); //( this.idTarea == 0 ) ? this.altaTarea() : this.editaTarea(); // ver reutilizar
			}
        } else {
            //this.limpiaVariables();
			let msg = (this.mensajeDialog) ? ' ('+this.mensajeDialog+')' : '';
            this.mensaje = 'Llene todos los campos de publicación a grupos seleccionados antes de continuar'+msg;
            this.tipoRespuesta = 2;
            this.ngxSmartModalService.getModal('dialogoInformacion').open();
        }
    }

    altaEdicionTarea(accion){
        let params = {
            servicio: "tareas",
            accion: (accion == 0) ? "IDesk_Maestro_Tareas_Alta" : "IDesk_Maestro_Tareas_Edita",
            tipoRespuesta: "json",
			idTarea: this.formulario.value.idTarea,
            idCursos: this.formulario.value.idCurso,
            titulo: this.formulario.value.titulo,
            objetivo: this.formulario.value.objetivo,
            descripcion: this.formulario.value.descripcion,
            idModEntrega: this.formulario.value.idModEntrega,
            oportunidades: 1, //this.formulario.value.oportunidades, // Por el momento, no se van a manejar las oportunidades de entrega
            aspectosEvaluacion: this.formulario.value.aspectosEvaluacion,
            idRubrica: (this.formulario.value.idRubrica == '' || this.idRubrica == 0) ? 0 : this.formulario.value.idRubrica,
            idRubricaExterna: (this.formulario.value.idRubricaExterna == '' || this.idRubricaExterna == 0) ? 0 : this.formulario.value.idRubricaExterna,
            idRubricaExternaLink: (this.formulario.value.idRubricaExternaLink == '' || this.idRubricaExternaLink == 0) ? 0 : this.formulario.value.idRubricaExternaLink,
            fechaPublicacion: this.formulario.value.fechaPublicacion,
            fechaCierre: this.formulario.value.fechaCierre,
            idTemas: this.formulario.value.idTemas,
            idModTrabajo: this.formulario.value.idModTrabajo,
            idArchivos: this.formulario.value.idArchivos,
            idLinks: this.formulario.value.idLinks,
            idPlantillaEquipos: this.formulario.value.idPlantillaEquipos,
            idpersonidesk: this.formulario.value.idpersonidesk
        };
        this.tareas.consultas(params)
            .subscribe(resp => {
				this.mensaje = resp[0].mensaje;
                this.tipoRespuesta = resp[0].error == 0 ? 1 : 2;
                this.guardado = true;
                this.ngxSmartModalService.getModal('dialogoInformacion').open();
            },
            errors => {
				this.limpiaVariables();
                console.log(errors);
            });
    }

	vistaPreviaTarea(content){
		let modEntrega = this.modalidadEntrega.find( y => y.idModEntrega == this.formulario.value.idModEntrega);
		let modTrabajo = this.modalidadTrabajo.find( x => x.idModTrabajo == this.modalidadTrabajoSeleccionada);
		let tema = this.temasCursos[this.cursoActual].find( z => z.idTema == this.temaSeleccionado);
		this.formulario.patchValue({ modalidadTrabajo: (modTrabajo != undefined) ? modTrabajo.modalidadTrabajo : '' });
		this.formulario.patchValue({ modalidadEntrega: (modEntrega != undefined) ? modEntrega.modalidadEntrega : '' });
		this.formulario.patchValue({ tema: (tema != undefined) ? tema.tema : '' });
		
		this.vistaPrevia(content);
	}

    reutilizado(tarea) {
        this.vieneDeReutilizar = true;
		this.editando = 5;
		this.tareas.idTarea = tarea.idTarea;
		this.formulario.patchValue({      
            aspectosEvaluacion: tarea.aspectosEvaluacion,
            descripcion: tarea.descripcion,
			//fechaCierre: tarea.fechaCierre,
			//fechaPublicacion: tarea.fechaPublicacion,
			idArchivos: tarea.idArchivos,
			idLinks: tarea.idLinks,
			idModEntrega: tarea.idModEntrega,
			idModTrabajo: tarea.idModTrabajo,
            //idPlantillaEquipos: tarea.idPlantillaEquipos,
            idRubrica: tarea.idRubrica,
            idRubricaExterna: tarea.idRubricaExterna,
            idRubricaExternaLink: tarea.idRubricaExternaLink,
            idTarea: tarea.idTarea,
			idTemas: tarea.idTema,
			modalidadEntrega: tarea.modalidadEntrega,
			modalidadTrabajo: tarea.modalidadTrabajo,
            objetivo: tarea.objetivo,
			oportunidades: 1,
			tema: tarea.tema,
            titulo: tarea.titulo,

        });
		this.idRubricaExterna = tarea.idRubricaExterna;
		this.idRubrica = tarea.idRubrica;
		this.idRubricaExternaLink = tarea.idRubricaExternaLink;
		
        this.regresarAlta();
		if(this.idRubrica != 0)
			this.obtenerInfoRubrica();
			
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
    
    nuevoTema() {
        this.modalReference = this._modalService.open(AltaTemaComponent, { backdrop: 'static' });
        this.modalReference.result.then(resp => {
            if (resp != 0) {
                this.obtenTemas(false);
            }
        });
    }

}