import { Component, ChangeDetectorRef, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators, FormBuilder, FormGroup} from '@angular/forms';

import { Iestdesk } from '../../services/iestdesk.service';
import { Equipos } from '../../services/equipos.service';
import { ActividadesClase } from '../../services/actividadesClase.service';

import { NgxSmartModalService } from 'ngx-smart-modal';

import { DateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { MomentDateTimeAdapter } from 'ng-pick-datetime-moment';
import { AltasBase } from '../../shared/classes/altasBase';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import * as _moment from 'moment';
import { EditorService } from '../../services/editorService.service';

export const MY_CUSTOM_FORMATS = {
    parseInput: 'DD/MM/YY HH:mm',
    fullPickerInput: 'DD/MM/YY HH:mm',
    datePickerInput: 'DD/MM/YY',
    timePickerInput: 'HH:mm',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
};

@Component({
    selector: 'idesk-altaActividadLibre',
    templateUrl: './altaLibre.component.html',
    providers: [
        {provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE]},
        {provide: OWL_DATE_TIME_FORMATS, useValue: MY_CUSTOM_FORMATS},
    ]
})

export class AltaActividadLibreComponent extends AltasBase implements OnInit {
    
    @Input() public modoTemario = false;
    
    public libre: FormGroup;
    public idActividad: number = 0;
    public cursoActual: number = 0;
    public modalidadEntrega = [];

    public tipoAlta: number;
    public nombreAlta: string;
    
    constructor(
        public iestdesk: Iestdesk,
        private actividades: ActividadesClase,
        private equipos: Equipos,
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
            null,
            _formBuilder,
            _chRef,
            _modalService,
            _ngxSmartModalService,        
            router);

        this.idActividad = this.actividades.idActividad;
        this.rutaListado = "/actividades-clase";

        this.formulario = this._formBuilder.group({
            idActividad: this.idActividad,
            idCurso: [this.iestdesk.rolActual == 3 ? this.iestdesk.idCursoActual : '', Validators.required],
            titulo: ['', Validators.required],
            idTemas: ['', Validators.required],
            objetivo: '',
            descripcion: ['', Validators.required],
            enlace: '',
            aspectosEvaluacion: '',
            idModEntrega: 1,
            fechaPublicacion: this.iestdesk.rolActual == 3 ? new Date() : ['', Validators.required],
            fechaCierre: this.iestdesk.rolActual == 3 ? new Date() : ['', Validators.required],
            idArchivos: '',
            idLinks: '',
            idModTrabajo: [1, Validators.required],
            idPlantillaEquipos: [0, Validators.required],
            idpersonidesk: this.iestdesk.idPerson
        });

        this.cursoActual = this.iestdesk.idCursoActual;
        this.tipoAlta =  this.actividades.tipoAlta;
        this.nombreAlta =  this.tipoAlta == 1 ? 'Libre' : 'Externa';
		this.fechaCierreSeleccionada = ' ';
		//this.temaSeleccionado = ' ';
        this.idPlantillaSolicitada = ' ';
        
    }

    ngOnInit() {
        this.iestdesk.registraAcceso(this.tipoAlta == 1 ? 44 : 45, this.idActividad);
        if ( this.idActividad != 0 ) {
            this.editando = this.tipoAlta == 1 ? 8 : 10;
            let params = {
                servicio: "actividadesClase",
                accion: this.tipoAlta == 1 ? "IDesk_Actividades_Clase_Libre_Vista_Ind" : "IDesk_Actividades_Clase_Externa_Vista_Ind",
                tipoRespuesta: "json",
                idActividad: this.actividades.idActividad,
				idpersonidesk: this.iestdesk.idPerson
            };  
            this.actividades.consultas(params)
                .subscribe(resp => {  
                    this.contenidoEditor = resp[0].anabels == 1;
                    this.temaSeleccionado = +resp[0].idTema;
                    this.titulito = resp[0].titulo;
                    this.formulario.patchValue({
                        idCurso: this.iestdesk.idCursoActual,
                        titulo: resp[0].titulo,
                        idTemas: resp[0].idTema,
                        objetivo: resp[0].objetivo,
                        descripcion: resp[0].descripcion,
                        aspectosEvaluacion: resp[0].aspectosEvaluacion,
                        idModEntrega: resp[0].idModEntrega,
                        fechaPublicacion: resp[0].fechaPublicacionISO,
                        fechaCierre: resp[0].fechaCierreISO,
                        idArchivos: resp[0].idArchivos,
                        idLinks: resp[0].idLinks,
                        idModTrabajo: resp[0].idModTrabajo,
                        idPlantillaEquipos: resp[0].idPlantillaEquipos,
                        idpersonidesk: this.iestdesk.idPerson
                    });

                    if ( this.tipoAlta == 2 ) {
                        this.formulario.patchValue({ idActividad: resp[0].idActividadExterna, enlace: resp[0].enlace });
                    } else {
                        this.formulario.patchValue({ idActividad: resp[0].idActividadLibre });
                    }
					this.modificaEquipos = resp[0].modificaEquipos;

                    this.cargaElementos( resp[0].idTema, resp[0].fechaPublicacionISO, resp[0].fechaCierreISO, resp[0].idModTrabajo, resp[0].idPlantillaEquipos );

                    if(this.iestdesk.rolActual != 3){
                        this.agrupar();
                    }

                },
                errors => {
                    console.log(errors);
                });
        } else {
            this.titulito = 'Actividad ' + this.nombreAlta;
            this.limpiaVariables();
        }

		let params = {
			servicio: "tareas",
			accion: "IDesk_Maestro_ModEntrega_Listado",
			tipoRespuesta: "json"
		};

		this.actividades.consultas(params)
			.subscribe(resp => {
				this.modalidadEntrega = resp;
			},
			errors => {
				console.log(errors);
			});
    }

    regresa(cerrado: number) {
        this.formulario.reset();
        this.limpiaVariables();
        this.router.navigate(['/actividades-clase']);
    }

    limpiaVariables() {
        this.formulario.patchValue({ idActividad: 0, idpersonidesk: this.iestdesk.idPerson });
    }

    validaActividad(){
        if(this.iestdesk.rolActual == 3 && this.editorService.esAsignado == 1){
            this.modalidad = [];
            this.modalidad.push(this.formulario.value.idModTrabajo);
        }

        let valido = this.publicacionCursos();
        let enlace = true;

        if ( this.tipoAlta == 2 ) {
            enlace = this.formulario.value.enlace.trim() == '' ? false : true;
        }
        
        if ( valido ) {
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
                idModTrabajo: this.modalidad.join("|"),
                idPlantillaEquipos: this.idEquipos.join("|"),
				fechaPublicacion: this.fechaPublicacion.join('|'),
				fechaCierre: this.fechaCierre.join('|')
            });
            
            if(!this.formulario.valid || !enlace) {
                //this.limpiaVariables();
                this.mensaje = 'Llene todos los campos antes de continuar';
                this.tipoRespuesta = 2;
                this.guardado = false;
                this.ngxSmartModalService.getModal('dialogoInformacion').open();
            } else {
                this.tipoAlta == 1 ? this.altaEdicionActLibre(this.idActividad == 0 || this.vieneDeReutilizar ? 0 : 1) : this.altaEdicionActExterna(this.idActividad == 0 || this.vieneDeReutilizar ? 0 : 1);
            }
        }  else {
            //this.limpiaVariables();
			let msg = (this.mensajeDialog) ? ' (' + this.mensajeDialog + ')' : '';
            this.mensaje = 'Llene todos los campos de publicación a grupos seleccionados antes de continuar' + msg;
            this.tipoRespuesta = 2;
            this.guardado = false;
            this.ngxSmartModalService.getModal('dialogoInformacion').open();
        }
    }

    altaEdicionActLibre(accion) {
        let params = {
            servicio: "actividadesClase",
            accion: accion == 0 ? "IDesk_Maestro_Actividad_Clase_Libre_Alta" : "IDesk_Maestro_Actividad_Clase_Libre_Edita",
            tipoRespuesta: "json",
            idActividad: this.formulario.value.idActividad,
            idCurso: this.formulario.value.idCurso,
            idTemas: this.formulario.value.idTemas,
            titulo: this.formulario.value.titulo,
            objetivo: this.formulario.value.objetivo,
            descripcion: this.formulario.value.descripcion,
            aspectosEvaluacion: this.formulario.value.aspectosEvaluacion,
            idModEntrega: this.formulario.value.idModEntrega,
            fechaPublicacion: this.formulario.value.fechaPublicacion,
            fechaCierre: this.formulario.value.fechaCierre,
            idModTrabajo: this.formulario.value.idModTrabajo,
            idArchivos: this.formulario.value.idArchivos,
            idLinks: this.formulario.value.idLinks,
            idPlantillaEquipos: this.formulario.value.idPlantillaEquipos,
            idpersonidesk: this.formulario.value.idpersonidesk
        };
        //console.log('params', params);
        this.actividades.consultas(params)
            .subscribe(resp => {
                this.mensaje = resp[0].mensaje;
                if(resp[0].error == 0){
                    this.tipoRespuesta = 1;
                    this.guardado = true;
                    this.actividades.idActividad = 0;
                } else {
                    this.tipoRespuesta = 2;
                }
                
                this.ngxSmartModalService.getModal('dialogoInformacion').open();
            },
            errors => {
                console.log(errors);
            });
    }

    altaEdicionActExterna(accion) {
        let params = {
            servicio: "actividadesClase",
            accion: accion == 0 ? "IDesk_Maestro_Actividad_Clase_Externa_Alta" : "IDesk_Maestro_Actividad_Clase_Externa_Edita",
            tipoRespuesta: "json",
            idActividad: this.formulario.value.idActividad,
            idCurso: this.formulario.value.idCurso,
            idTemas: this.formulario.value.idTemas,
            titulo: this.formulario.value.titulo,
            objetivo: this.formulario.value.objetivo,
            descripcion: this.formulario.value.descripcion,
            aspectosEvaluacion: this.formulario.value.aspectosEvaluacion,
            idModEntrega: this.formulario.value.idModEntrega,
            enlace: this.formulario.value.enlace,
            fechaPublicacion: this.formulario.value.fechaPublicacion,
            fechaCierre: this.formulario.value.fechaCierre,
            idModTrabajo: this.formulario.value.idModTrabajo,
            idArchivos: this.formulario.value.idArchivos,
            idLinks: this.formulario.value.idLinks,
            idPlantillaEquipos: this.formulario.value.idPlantillaEquipos,
            idpersonidesk: this.formulario.value.idpersonidesk
        };
        console.log('params', params);
        this.actividades.consultas(params)
            .subscribe(resp => {
                this.mensaje = resp[0].mensaje;
                if(resp[0].error == 0){
                    this.tipoRespuesta = 1;
                    this.guardado = true;
                    this.actividades.idActividad = 0;
                } else {
                    this.tipoRespuesta = 2;
                }
                
                this.ngxSmartModalService.getModal('dialogoInformacion').open();
            },
            errors => {
                console.log(errors);
            });
    }

    reutilizado(actividad) {
        //console.log(actividad);
        this.vieneDeReutilizar = true;
        this.editando = this.tipoAlta == 1 ? 8 : 10;
		this.formulario.patchValue({
                        
            idCurso: this.iestdesk.idCursoActual,
            titulo: actividad.titulo,
            idTemas: actividad.idTema,
            objetivo: actividad.objetivo,
            descripcion: actividad.descripcion,
            aspectosEvaluacion: actividad.aspectosEvaluacion,
            idModEntrega: actividad.idModEntrega,
            idArchivos: actividad.idArchivos,
            idLinks: actividad.idLinks,
            idpersonidesk: this.iestdesk.idPerson
        });
        this.actividades.idActividad = this.tipoAlta == 1 ? actividad.idActividadLibre : actividad.idActividadExterna;
        if ( this.tipoAlta == 2 ) {
            this.formulario.patchValue({ idActividad: actividad.idActividadExterna, enlace: actividad.enlace });
        } else {
            this.formulario.patchValue({ idActividad: actividad.idActividadLibre });
        }
		
        this.regresarAlta();
			
    }

	getRespuesta(respuesta, n){
		switch(respuesta){
			case 'fileError':
				this.mensaje = 'Asegúrate de subir un archivo menor a 20MB.';
				this.tipoRespuesta = 2;
				this.ngxSmartModalService.getModal('dialogoInformacion').open();
			break;
			case 'fileErrorExt':
				this.mensaje = 'Uno de los archivos tiene una extensión no válida.';
				this.tipoRespuesta = 2;
				this.ngxSmartModalService.getModal('dialogoInformacion').open();
			break;
		}
    }
}