import { Apuntes } from "../services/apuntes.service";

import { Component, ChangeDetectorRef, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators, FormBuilder } from '@angular/forms';

import { Iestdesk } from '../services/iestdesk.service';

import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

import { AltasBase } from '../shared/classes/altasBase';
import { EventEmitter } from "events";
import { MomentDateTimeAdapter } from 'ng-pick-datetime-moment';
import { DateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { MY_CUSTOM_FORMATS } from '../videoconferencias/altaVideoconf.component';
import { AltaTemaComponent } from "../temario/altaTema.component";
import { BancoMultimediaComponent } from "../editor/banco-multimedia/banco-multimedia.component";
import { EditorService } from "../services/editorService.service";

import * as _moment from 'moment';

@Component({
    selector: 'idesk-altaApuntes',
    templateUrl: './altaApuntes.component.html',
    providers: [
        {provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE]},
        {provide: OWL_DATE_TIME_FORMATS, useValue: MY_CUSTOM_FORMATS},
    ]
})

export class AltaApuntesComponent extends AltasBase implements OnInit {
    @Output() estaCerrado = new EventEmitter();
    public idApunte: number;
    public ocultar: number;
    public irInicio: boolean = false;
    public apunteAlumno: any[];
    public vieneDeReutilizar: boolean = false;
    public idApunteMultimedia = 0;
    public modoBanco = false;

    public modalReference: any;
    public modalOption: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false
    };

    constructor(
        public iestdesk: Iestdesk,
        private _apuntes: Apuntes,
        private _formBuilder: FormBuilder,
        private _chRef: ChangeDetectorRef,
        private _modalService: NgbModal,
        public _ngxSmartModalService: NgxSmartModalService,
        private router: Router,
        private route: ActivatedRoute,
        public editorService: EditorService
    ){
        super(iestdesk,
            null,
            null,
            _formBuilder,
            _chRef,
            _modalService,
            _ngxSmartModalService,        
            router);
        this.idApunte = this._apuntes.idApunte;
        this.rutaListado = "/apuntes";
        
        this.formulario = this._formBuilder.group({
            idApunte: this.idApunte,
            idCursos: ['', Validators.required],
            titulo: ['', Validators.required],
            idTemas: ['', Validators.required],
            descripcion: '',
            fechaPublicacion: [this.iestdesk.rolActual == 3 ? new Date() : '', Validators.required],
            idArchivos: '',
			idLinks: '',
            idpersonidesk: this.iestdesk.idPerson
        });
    }

	ngOnInit(){
        this.iestdesk.registraAcceso(51, this.idApunte);
        if( this.idApunte != 0 ){
            this.editando = 3; // para el componente de archivos
            this.ocultar = 1;
            let params = {
                servicio: "apuntes",
                accion: "IDesk_Apuntes_Vista_Ind",
                tipoRespuesta: "json",
                idApunte: this.idApunte
            };

            this._apuntes.consultas(params)
                .subscribe(resp => {
                    this.contenidoEditor = resp[0].anabels == 1;
                    this.temaSeleccionado = +resp[0].idTema;
                    this.titulito = resp[0].titulo;
                    this.formulario.patchValue({ 
                        titulo: resp[0].titulo,
                        descripcion: resp[0].descripcion,
                        idCursos: resp[0].idCurso,
                        idTemas: resp[0].idTema,
                        fechaPublicacion: new Date(resp[0].fechaPublicacionISO.split(' ').join('T'))
                    });
                    
                    this.modoBanco = resp[0].idApunteMultimedia != 0;
                    this.cargaElementos( resp[0].idTema, resp[0].fechaPublicacionISO );
                    
                    if(this.iestdesk.rolActual != 3){
                        this.agrupar();
                    }

                },
                errors => {
                    console.log(errors);
                });
        } else {
            this.titulito = "Agregar apunte";
            this.ocultar = 0;
            this.limpiaVariables();
            this.temp.push(this.iestdesk.idCursoActual);
        }
	}

    validaApunte() {
        this.publicacionCursos();

        if(this.iestdesk.rolActual == 3 ){
            if(this.editorService.esAsignado == 1){
                this.fechaPublicacion = [];
                this.fechaPublicacion.push(_moment(this.formulario.value.fechaPublicacion).format("DD/MM/YY HH:mm"));
            }

            this.temas = [];
            this.temas.push(this.temaSeleccionado);
        }

        let elementos = [];

        elementos.push(this.fechaPublicacion.length, this.temas.length);

        if ( this.validaciones.verificaLongitud(this.idCursosPub.length, elementos) && (this.formulario.value.idArchivos != '' || this.formulario.value.idLinks != '')) {
            this.formulario.patchValue({ 
                idCursos: this.idCursosPub.join("|"), 
                idTemas: this.temas.join("|"),
                fechaPublicacion: this.fechaPublicacion.join("|") });
            if(!this.formulario.valid) {
                this.limpiaVariables();
                this.mensaje = 'Llene todos los campos antes de continuar';
                this.tipoRespuesta = 2;
                this.ngxSmartModalService.getModal('dialogoInformacion').open();
            } else {
                this.altaEdicionApunte(this.idApunte == 0 || this.vieneDeReutilizar ? 0 : 1);
            }
        } else {
            this.limpiaVariables();
			let msg = (this.mensajeDialog) ? ' ('+this.mensajeDialog+')' : '';
            this.mensaje = (this.formulario.value.idArchivos == '' && this.formulario.value.idLinks == '') ? 'Agregue al menos un archivo o un link antes de continuar' : 'Llene todos los campos de publicación a grupos seleccionados antes de continuar' + msg;
				
            this.tipoRespuesta = 2;
            this.ngxSmartModalService.getModal('dialogoInformacion').open();
        }
    }

    altaEdicionApunte(accion){
        let params = {
            servicio: "apuntes",
            accion: accion == 0 ? "IDesk_Maestro_Apuntes_Alta" : "IDesk_Maestro_Apuntes_Edita",
            tipoRespuesta: "json",
            idApunte: this.formulario.value.idApunte,
            idCursos: this.formulario.value.idCursos,
            titulo: this.formulario.value.titulo,
            idTemas: this.formulario.value.idTemas,
            descripcion: this.formulario.value.descripcion,
            idApunteMultimedia: this.idApunteMultimedia,
            fechaPublicacion: this.formulario.value.fechaPublicacion,
            idArchivos: this.formulario.value.idArchivos,
			idLinks: this.formulario.value.idLinks,
            idpersonidesk: this.formulario.value.idpersonidesk
        };
        this._apuntes.consultas(params)
            .subscribe(resp => {
                this.mensaje = resp[0].mensaje;
                if(resp[0].error == 0){
                    this.tipoRespuesta = 1;
                    this._apuntes.idApunte = 0;
                    this.guardado = true;
                } else {
                    this.tipoRespuesta = 2;
                }
                
                this.ngxSmartModalService.getModal('dialogoInformacion').open();
            }, errors => {
                console.log(errors);
            });
    }

    reutilizado(apunte) {
        this.formulario.patchValue({ 
            idApunte : apunte.idApunte,
            titulo : apunte.titulo,
            descripcion: apunte.descripcion });
        
        this.editando = 3;
        this._apuntes.idApunte = apunte.idApunte;
        
        this.vieneDeReutilizar = true;
        this.regresarAlta();
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
    
    muestraAdjuntarArchivos(){

    }

    abrirBanco(){
        this.modalReference = this._modalService.open(BancoMultimediaComponent, this.modalOption);
    
        this.modalReference
        .result.then(resp => {
            if (resp) {
                this.idApunte = 0;
                this.idApunteMultimedia = resp.idElemento;
                this._apuntes.idApunte = resp.idElemento;
                this.editando = 14; // para el componente de archivos
                this.ocultar = 1;

                this.formulario.patchValue({ 
                    titulo: resp.titulo,
                    descripcion: resp.descripcion,
                });

                this.modoBanco = true;
            }
        });
        
        this.modalReference.componentInstance.tipoElemento = 3;
        this.modalReference.componentInstance.obtenerFiltroEtiquetas(this.modalReference.componentInstance.elementos[3]);
    }
}