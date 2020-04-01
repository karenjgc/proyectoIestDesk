import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { AltasBase } from '../shared/classes/altasBase';
import { Iestdesk } from '../services/iestdesk.service';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Router, ActivatedRoute } from '@angular/router';
import { ContenidoWebService } from '../services/contenidoweb.service';
import { FroalaOptions } from '../shared/iestdesk/froala';
import { EditorService } from '../services/editorService.service';
import * as _moment from 'moment';

@Component({
    templateUrl: "./altaContenidoWeb.component.html",
    selector: "idesk-AltaContenidoWeb"
})
export class AltaContenidoWebComponent extends AltasBase implements OnInit {

    // Configuración de Froala
    opcFroala = new FroalaOptions();
    optionsTexto: Object;

    public idContenidoWeb;
    public vistaAlumno;
    public formMultimedia = {
        titulo: "",
        contenido: "",
        linkHtml: "",
        tipoTexto: 0,
        fechaPublicacion: new Date()
    };
    public imagenDialog = 0;
    public accionDialog = 0;
    public tipoTexto;
    
    constructor(
        public iestdesk: Iestdesk,
        private _contenidowebService: ContenidoWebService,
        private _formBuilder: FormBuilder,
        private _chRef: ChangeDetectorRef,
        private _modalService: NgbModal,
        public _ngxSmartModalService: NgxSmartModalService,
        private router: Router,
        private route: ActivatedRoute,
        public editorService: EditorService
    ) {
        super(iestdesk,
            null,
            null,
            _formBuilder,
            _chRef,
            _modalService,
            _ngxSmartModalService,        
            router);
        
        this.optionsTexto = this.iestdesk.rolActual == 3 ? this.opcFroala.opcionesTexto : this.opcFroala.opciones;
        //this.optionsTexto = this.opcFroala.opcionesTexto;

        this.formMultimedia.tipoTexto = this.iestdesk.rolActual == 3 ? 0 : 1;
        //this.formMultimedia.tipoTexto = 0;

        this.tipoTexto = this.formMultimedia.tipoTexto == 1;
        this.idContenidoWeb = this._contenidowebService.idContenidoWeb;

        if (this.idContenidoWeb == 0) {
            if(this.iestdesk.rolActual != 3){
                this.fechaPublicacionSeleccionada = new Date();
                this.agrupar();
            }
        } else {
            this.consultaContenidoWeb();
        }
    }

    ngOnInit() {
        this.iestdesk.registraAcceso(62, this.idContenidoWeb);
    }

    validarFormulario() {
        let valido = true;
         
        for(let campos of Object.keys(this.formMultimedia)) {
            if(this.tipoTexto){
                if ((campos == 'titulo' || campos == 'contenido') && this.formMultimedia[campos].trim() == "") {
                    valido = false;
                    break;
                }
            }else{
                if ((campos == 'titulo' || campos == 'linkHtml') && this.formMultimedia[campos].trim() == "") {
                    valido = false;
                    break;
                }
            }
        }
        
        console.log(this.formMultimedia);

        if (valido) {
            valido = this.publicacionCursos();

            if (valido) {
                // Si es editor y es temario asignado, fechaPublicacion en alta base es igual a fecha seleccionada.
                if(this.iestdesk.rolActual == 3 ){
                    if(this.editorService.esAsignado == 1){
                        this.fechaPublicacion = [];
                        this.fechaPublicacion.push(_moment(this.formMultimedia.fechaPublicacion).format("DD/MM/YY HH:mm"));
                    }

                    this.temas = [];
                    this.temas.push(this.temaSeleccionado);
                }
                
                this.altaEdicionContenidoWeb();
            } else {
                this.limpiaVariables();
                this.mensajeDialog = 'Llene todos los campos de publicación a grupos seleccionados antes de continuar';
                this.imagenDialog = 1;
                this.tipoRespuesta = 2;
                this.guardado = false;
                this.ngxSmartModalService.getModal('dialogoInformacion').open();
            }
        } else {
            this.limpiaVariables();
            this.mensajeDialog = 'Llene todos los campos antes de continuar';
            this.imagenDialog = 1;
            this.tipoRespuesta = 2;
            this.guardado = false;
            this.ngxSmartModalService.getModal('dialogoInformacion').open();
        }
    }

    consultaContenidoWeb() {
        let params = {
            servicio: "multimedia",
            accion: "IDesk_Contenido_Web_VistaInd",
            tipoRespuesta: "json",
            idContenidoWeb: this.idContenidoWeb
        };
        this._contenidowebService.consultas(params)
        .subscribe(resp => {
            this.temaSeleccionado = +resp[0].idTema;
            this.formMultimedia = {
                titulo: resp[0].titulo,
                contenido: resp[0].contenido,
                linkHtml: resp[0].linkHtml,
                tipoTexto: resp[0].tipoTexto,
                fechaPublicacion: new Date(resp[0].fechaPublicacion.split(' ').join('T'))
            };
            this.tipoTexto = this.formMultimedia.tipoTexto == 1;
            this.cargaElementos( resp[0].idTema, resp[0].fechaPublicacion );
            this.agrupar();
        }, errors => {
            console.log(errors);
        });
    }

    altaEdicionContenidoWeb() {
        let params = {
            servicio: "multimedia",
            accion: this.idContenidoWeb == 0 ? "IDesk_Maestro_ContenidoWeb_Alta" : "IDesk_Maestro_ContenidoWeb_Edita",
            tipoRespuesta: "json",
            idContenidoWeb: this.idContenidoWeb,
            titulo: this.formMultimedia.titulo,
            contenido: this.formMultimedia.contenido,
            linkHtml: this.formMultimedia.linkHtml,
            tipoTexto: this.tipoTexto ? 1 : 0,
            idCursos: this.idCursosPub.join("|"), 
            idTemas: this.temas.join("|"),
            fechaPublicacion: this.fechaPublicacion.join("|"),
            idpersonidesk: this.iestdesk.idPerson
        };
        this._contenidowebService.consultas(params)
        .subscribe(resp => {
            if(resp[0].error == 0){
                this.imagenDialog = 0;
                this.accionDialog = 1;
                this.mensajeDialog = 'Texto guardado correctamente';
                this.guardado = true;
                this.ngxSmartModalService.getModal('dialogoInformacion').open();
            }else{
                console.log('Error:', resp[0].error);
            }
        });
    }
    
    vistaAlumnoObjeto(content){
        this.modalReference = this._modalService.open(content, { backdrop: 'static' });
    }

    limpiarContenido(){
        this.formMultimedia.contenido = "";
        this.formMultimedia.linkHtml = "";
    }
}