import { Component, ChangeDetectorRef, Output, EventEmitter, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup} from '@angular/forms';

import { Iestdesk } from '../services/iestdesk.service';
import { Vinculos } from "../services/vinculos.service";

import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { DateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { MY_CUSTOM_FORMATS } from '../videoconferencias/altaVideoconf.component';
import { MomentDateTimeAdapter } from 'ng-pick-datetime-moment';
import { AltasBase } from '../shared/classes/altasBase';
import { Router } from '@angular/router';
import { AltaTemaComponent } from '../temario/altaTema.component';
import { EditorService } from '../services/editorService.service';

import * as _moment from 'moment';

@Component({
    selector: 'idesk-altaVinculo',
    templateUrl: './altaVinculo.component.html',
    providers: [
        { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
        { provide: OWL_DATE_TIME_FORMATS, useValue: MY_CUSTOM_FORMATS }
    ]
})

export class AltaVinculoComponent extends AltasBase implements OnInit {
    @Output() estaCerrado = new EventEmitter();

    public idVinculo: number = 0;
    public ocultar: number;
    public guardado: boolean = false;
    public btnReutilizar: boolean = true;
    public vieneDeReutilizar: boolean = false;

    public verForm: boolean = true;

    constructor(
        private iestdesk: Iestdesk,
        private vinculos: Vinculos,
        private _chRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _modalService: NgbModal,
        public _ngxSmartModalService: NgxSmartModalService,
        public router: Router,
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
       
        this.rutaListado = "/vinculos";
        this.idVinculo = this.vinculos.idVinculo;
        this.formulario = this._formBuilder.group({
            idVinculo: this.idVinculo,
            titulo: ['', Validators.required],
            descripcion: ['', Validators.required],
            link: ['', Validators.required],
            urlImagen: '',
            idCursos: ['', Validators.required],
            fechaPublicacion: [this.iestdesk.rolActual == 3 ? new Date() : '', Validators.required],
            idTemas: ['', Validators.required],
            idpersonidesk: this.iestdesk.idPerson
        });
		//this.temaSeleccionado = ' ';
        //this.fechaPublicacionSeleccionada = ' ';
        console.log('esAsignado', this.editorService.esAsignado);
    }

    ngOnInit(){
        this.iestdesk.registraAcceso(60, this.idVinculo);

        if( this.vinculos.idVinculo != 0 ){
            this.ocultar = 1;
            this.editando = 1;
            this.btnReutilizar = false;
            let params = {
                servicio: "vinculos",
                accion: "IDesk_Maestro_Vinculo_Ind",
                tipoRespuesta: "json",
                idVinculo: this.vinculos.idVinculo, 
                idCurso: this.cursoActual
            };
            this.vinculos.consultas(params)
                .subscribe(resp => {
                    this._chRef.detectChanges();
                    this.formulario.patchValue({ 
                        titulo: resp[0].titulo,
                        descripcion: resp[0].descripcion,
                        link: resp[0].vinculo,
                        urlImagen: resp[0].urlImagen,
                        idCursos: resp[0].idCurso,
                        idTemas: resp[0].idTema,
                        fechaPublicacion: new Date(resp[0].fechaPublicacionISO.split(' ').join('T'))
                    });
                    this.temaSeleccionado = +resp[0].idTema;
                    this.titulito = resp[0].titulo;
                    this.contenidoEditor = resp[0].anabels == 1;

                    this.cargaElementos( resp[0].idTema, resp[0].fechaPublicacionISO );

                    if(this.iestdesk.rolActual != 3){
                        this.agrupar();
                    }
                },
                errors => {
                    console.log(errors);
                });
        } else {
            this.ocultar = 0;
            this.limpiaVariables();
            this.temp.push(this.iestdesk.idCursoActual);
        }
    }

    reutilizado(vinculo) {
        this.formulario.patchValue({ idVinculo : vinculo.idVinculo,
            titulo : vinculo.titulo,
            descripcion: vinculo.descripcion,
            link: vinculo.vinculo,
            urlImagen: vinculo.urlImagen });

        this.vieneDeReutilizar = true;
        //this.regresarAlta(1);
        this.mostrarReutilizar = false;
        this.regresarAlta();
    }

    obtieneImagen(){
        this.bloquear = true;
        this.mensaje = 'Guardando vínculo';
        this.tipoRespuesta = 4;
        this.ngxSmartModalService.getModal('dialogoInformacion').open();

        if(this.formulario.value.link){
            this.vinculos.obtenUrlImagen(this.formulario.value.link)
                .subscribe(resp => {
                    this.formulario.value.urlImagen = resp.image;
                    this.validaVinculo();
                },
                errors => {
                    console.log(errors);
                    this.formulario.value.urlImagen = '';
                    this.validaVinculo();
                });
        } else {
            this.limpiaVariables();
            this.mensaje = 'Agregue la dirección del vínculo antes de continuar';
            this.tipoRespuesta = 2;
            this.ngxSmartModalService.getModal('dialogoInformacion').open();
            this.bloquear = false;
        }
    }

    addhttp(url) {
        if (!/^(f|ht)tps?:\/\//i.test(url)) {
            url = "http://" + url;
        }
        return url;
    }

    validaVinculo() {
        let valido = this.publicacionCursos();
        
        if( valido ) {
            if(this.iestdesk.rolActual == 3 ){
                if(this.editorService.esAsignado == 1){
                    this.fechaPublicacion = [];
                    this.fechaPublicacion.push(_moment(this.formulario.value.fechaPublicacion).format("DD/MM/YY HH:mm"));
                }

                this.temas = [];
                this.temas.push(this.temaSeleccionado);
            }

            this.formulario.patchValue({ 
                link: this.addhttp(this.formulario.value.link),
                idCursos: this.idCursosPub.join("|"),
                fechaPublicacion: this.fechaPublicacion.join("|"),
                idTemas: this.temas.join("|")
            });
            
            if(!this.formulario.valid) {
                this.limpiaVariables();
                this.mensaje = 'Agregue los datos del vínculo antes de continuar';
                this.tipoRespuesta = 2;
                this.ngxSmartModalService.getModal('dialogoInformacion').open();
                this.bloquear = false;
            } else {
                this.altaEdicionVinculo(this.idVinculo == 0 ? 0 : 1);
            }
        } else {
            this.limpiaVariables();
			let msg = (this.mensajeDialog) ? ' ('+this.mensajeDialog+')' : '';
            this.mensaje = 'Llene todos los campos de publicación a grupos seleccionados antes de continuar'+msg;
            this.tipoRespuesta = 2;
            this.ngxSmartModalService.getModal('dialogoInformacion').open();
            this.bloquear = false;
        }
        
    }

    altaEdicionVinculo(accion){
        let params = {
            servicio: "vinculos",
            accion: accion == 0 ? "IDesk_Maestro_Vinculos_Alta" : "IDesk_Maestro_Vinculos_Edita",
            tipoRespuesta: "json",
            idVinculo: this.formulario.value.idVinculo,
            idCursos: this.formulario.value.idCursos,
            titulo: this.formulario.value.titulo,
            descripcion: this.formulario.value.descripcion,
            vinculo: this.formulario.value.link,
            urlImagen: this.formulario.value.urlImagen,
            idTemas: this.formulario.value.idTemas,
            fechaPublicacion: this.formulario.value.fechaPublicacion,
            idpersonidesk: this.formulario.value.idpersonidesk
        };
        this.vinculos.consultas(params)
            .subscribe(resp => {
                this.mensaje = resp[0].mensaje;
                if(resp[0].error == 0){
                    this.tipoRespuesta = 1;
                    this.vinculos.idVinculo = 0;
                    this.guardado = true;
                    this.limpiaVariables();
                } else {
                    this.tipoRespuesta = 2;
                }

                this.bloquear = false;
                this.ngxSmartModalService.getModal('dialogoInformacion').open();

            }, errors => {
                console.log(errors);
            });
    }

    nuevoTema() {
        this.modalReference = this._modalService.open(AltaTemaComponent, { backdrop: 'static' });
        this.modalReference.result.then(resp => {
            if (resp != 0) {
                this.obtenTemas(false);
            }
        });
    }

    vistaAlumnoObjeto(content){
        this.modalReference = this._modalService.open(content, { backdrop: 'static' });
    }
}