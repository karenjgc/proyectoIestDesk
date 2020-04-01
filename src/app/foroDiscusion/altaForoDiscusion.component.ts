import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators, FormBuilder } from '@angular/forms';

import { Iestdesk } from '../services/iestdesk.service';
import { ForoDiscusion } from '../services/foroDiscusion.service';
import { Rubricas } from '../services/rubricas.service';
import { Equipos } from '../services/equipos.service';
import { AltaTemaComponent } from "../temario/altaTema.component";


import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AltasBase } from '../shared/classes/altasBase';
import { MomentDateTimeAdapter } from 'ng-pick-datetime-moment';
import { DateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { MY_CUSTOM_FORMATS } from '../videoconferencias/altaVideoconf.component';

import * as _moment from 'moment';
import { EditorService } from '../services/editorService.service';

@Component({
    selector: 'idesk-altaForoDiscusion',
    templateUrl: './altaForoDiscusion.component.html',
    providers: [
        {provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE]},
        {provide: OWL_DATE_TIME_FORMATS, useValue: MY_CUSTOM_FORMATS},
    ]
})

export class AltaForoDiscusionComponent extends AltasBase implements OnInit, OnDestroy {

	public titulito: string = '';
    public idForoDisc: number = 0;

    constructor(
        public iestdesk: Iestdesk,
        private foroDiscusion: ForoDiscusion,
        private equipos: Equipos,
        private rubricas: Rubricas,
        private _formBuilder: FormBuilder,
        private _chRef: ChangeDetectorRef,
        private _modalService: NgbModal,
        public _ngxSmartModalService: NgxSmartModalService,
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
        
        this.idForoDisc = this.foroDiscusion.idForoDisc;
        this.rutaListado = "/foro-discusion";

        this.formulario = this._formBuilder.group({
            idForoDisc: this.idForoDisc,
            idCurso: [this.iestdesk.rolActual == 3 ? this.iestdesk.idCursoActual : '', Validators.required],
            idTemas:  ['', Validators.required],
            titulo: ['', Validators.required],
            objetivo: '',
            descripcion: ['', Validators.required],
            actividadesAntes: '',
            aportacionMinima: [1, Validators.required],
			retroMinima: [1, Validators.required],
			aspectosEvaluacion: '',
			idRubrica: 0,
			idRubricaExterna: 0,
			idRubricaExternaLink: 0,
			permiteArchivos: [1, Validators.required],
			fechaPublicacion: this.iestdesk.rolActual == 3 ? new Date() : [0, Validators.required],
            fechaCierre: this.iestdesk.rolActual == 3 ? new Date() : [0, Validators.required],
			idModTrabajo: this.iestdesk.rolActual == 3 ? 1 : [1, Validators.required],
			idArchivos: '',
			idLinks: '',
			idPlantillaEquipos: this.iestdesk.rolActual == 3 ? '' : ['', Validators.required],
			idpersonidesk: this.iestdesk.idPerson
        });
		this.fechaCierreSeleccionada = ' ';
		//this.temaSeleccionado = ' ';
		//this.fechaPublicacionSeleccionada = ' ';
		this.idPlantillaSolicitada = ' ';
    }

    ngOnInit(){
		this.iestdesk.registraAcceso(52, this.idForoDisc);
        if ( this.idForoDisc != 0 ) {
            this.editando = 2;
            let params = {
                servicio: "foroDiscusion",
                accion: "IDesk_Foro_Discusion_Vista_Ind",
                tipoRespuesta: "json",
                idForoDisc: this.foroDiscusion.idForoDisc
            };

            this.foroDiscusion.consultas(params)
                .subscribe(resp => {
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
                        actividadesAntes: resp[0].actividadesAntes,
                        aportacionMinima: resp[0].aportacionMinima,
                        retroMinima: resp[0].retroalimentacionMinima,
						aspectosEvaluacion: resp[0].aspectosEvaluacion,
						idRubrica: resp[0].idRubrica,
						idRubricaExterna: resp[0].idRubricaExterna,
						idRubricaExternaLink: resp[0].idRubricaExternaLink,
						idModTrabajo: resp[0].idModTrabajo,
						fechaPublicacion: resp[0].fechaPublicacionISO,
						fechaCierre: resp[0].fechaCierreISO,
                        idTemas: resp[0].idTema,
						idPlantillaEquipos: resp[0].idPlantillaEquipos,
						permiteArchivos: resp[0].permiteArchivos == 1 ? true : false
					});
					this.modificaEquipos = resp[0].modificaEquipos;
                    this.titulito = resp[0].titulo;

                    if( resp[0].idRubrica != 0 ) {
                        this.idRubrica = resp[0].idRubrica;
                        this.idRubricaExterna = 0;
						this.idRubricaExternaLink = 0;
                        this.obtenerInfoRubrica();
                    }
            
                    this.cargaElementos( resp[0].idTema, resp[0].fechaPublicacionISO, resp[0].fechaCierreISO, resp[0].idModTrabajo, resp[0].idPlantillaEquipos );

                    if(this.iestdesk.rolActual != 3){
                        this.agrupar();
                    }
                   
                },
                errors => {
                    console.log(errors);
                });
        } else {
            this.titulito = 'Agregar Foro de Discusión';
            this.limpiaVariables();
        }
    }

    ngOnDestroy() {
        this.foroDiscusion.idForoDisc = 0;
    }

    validaForo() {
        if(this.iestdesk.rolActual == 3 && this.editorService.esAsignado == 1){
            this.modalidad = [];
            this.modalidad.push(this.formulario.value.idModTrabajo);
        }

        let valido = this.publicacionCursos();
        
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
                fechaPublicacion: this.fechaPublicacion.join("|"),
                fechaCierre: this.fechaCierre.join("|"),
                idModTrabajo: this.modalidad.join("|"),
                idPlantillaEquipos: this.idEquipos.join("|") });

            this.formulario.patchValue({ permiteArchivos: this.formulario.value.permiteArchivos ? 1 : 0 });

            if(!this.formulario.valid) {
                this.limpiaVariables();
                this.mensaje = 'Llene todos los campos antes de continuar';
                this.tipoRespuesta = 2;
                this.ngxSmartModalService.getModal('dialogoInformacion').open();
            } else {
                this.altaEdicionForo(this.idForoDisc == 0 || this.vieneDeReutilizar ? 0 : 1);
            }
        } else {
            this.limpiaVariables();
			let msg = (this.mensajeDialog) ? ' ('+this.mensajeDialog+')' : '';
            this.mensaje = 'Llene todos los campos de publicación a grupos seleccionados antes de continuar'+msg;
            this.tipoRespuesta = 2;
            this.ngxSmartModalService.getModal('dialogoInformacion').open();
        }
        
    }

    altaEdicionForo(accion){
        //console.log(this.formulario.value); //?
        let params = {
            servicio: "foroDiscusion",
            accion: accion == 0 ? "IDesk_Maestro_Foro_Alta" : "IDesk_Maestro_Foro_Discusion_Edita",
            tipoRespuesta: "json",
            idForoDisc: this.formulario.value.idForoDisc,
            idCursos: this.formulario.value.idCurso,
            idTemas: this.formulario.value.idTemas,
            titulo: this.formulario.value.titulo,
            objetivo: this.formulario.value.objetivo,
            descripcion: this.formulario.value.descripcion,
            actividadesAntes: this.formulario.value.actividadesAntes,
            aportacionMinima: this.formulario.value.aportacionMinima,
            retroMinima: this.formulario.value.retroMinima,
            aspectosEvaluacion: this.formulario.value.aspectosEvaluacion,
            idRubrica: (this.formulario.value.idRubrica == '' || this.idRubrica == 0) ? 0 : this.formulario.value.idRubrica,
            idRubricaExterna: (this.formulario.value.idRubricaExterna == '' || this.idRubricaExterna == 0) ? 0 : this.formulario.value.idRubricaExterna,
            idRubricaExternaLink: (this.formulario.value.idRubricaExternaLink == '' || this.idRubricaExternaLink == 0) ? 0 : this.formulario.value.idRubricaExternaLink,
            permiteArchivos: this.formulario.value.permiteArchivos,
            fechaPublicacion: this.formulario.value.fechaPublicacion,
            fechaCierre: this.formulario.value.fechaCierre,
            idModTrabajo: this.formulario.value.idModTrabajo,
            idArchivos: this.formulario.value.idArchivos,
            idLinks: this.formulario.value.idLinks,
            idPlantillaEquipos: this.formulario.value.idPlantillaEquipos,
            idpersonidesk: this.formulario.value.idpersonidesk
        };
        this.foroDiscusion.consultas(params)
            .subscribe(resp => {
                this.mensaje = resp[0].mensaje;
                if(resp[0].error == 0){
                    this.tipoRespuesta = 1;
                    this.guardado = true;
                    this.foroDiscusion.idForoDisc = 0;
                } else {
                    this.tipoRespuesta = 2;
                }
                
                this.ngxSmartModalService.getModal('dialogoInformacion').open();
            },
            errors => {
                console.log(errors);
            });
    }

    reutilizado(foro) {
        this.vieneDeReutilizar = true;
        this.editando = 2;
        this.foroDiscusion.idForoDisc = foro.idForoDisc;

        this.formulario.patchValue({      
            idForoDisc: foro.idForoDisc,
            titulo: foro.titulo,
            objetivo: foro.objetivo,
            descripcion: foro.descripcion,
            actividadesAntes: foro.actividadesAntes,
            aportacionMinima: foro.aportacionMinima,
            retroMinima: foro.retroalimentacionMinima,
            aspectosEvaluacion: foro.aspectosEvaluacion,
            idRubrica: foro.idRubrica,
            idRubricaExterna: foro.idRubricaExterna,
            idRubricaExternaLink: foro.idRubricaExternaLink,
            permiteArchivos: foro.permiteArchivos
        });

		this.idRubricaExterna = foro.idRubricaExterna;
		this.idRubrica = foro.idRubrica;
        this.idRubricaExternaLink = foro.idRubricaExternaLink;

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