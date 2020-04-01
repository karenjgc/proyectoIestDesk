import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AltasBase } from '../shared/classes/altasBase';
import { ActivatedRoute, Router } from '@angular/router';
import { Iestdesk } from '../services/iestdesk.service';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ImagenesService } from '../services/imagenes.service';
import { Archivos } from '../services/archivos.service';
import { EditorService } from '../services/editorService.service';
import * as _moment from 'moment';

@Component({
  selector: 'idesk-altaImagenes',
  templateUrl: './altaImagenes.component.html'
})
export class AltaImagenesComponent extends AltasBase implements OnInit {
    
    public imagenDialog = 0;
    public idImagen;
    public accionDialog = 0;
    public idArchivoObtenido = 0;
    public formMultimedia = {
        titulo: "",
        descripcion: "",
        idArchivo: "",
        fechaPublicacion: new Date()    
    };

    constructor(
        public iestdesk: Iestdesk,
        private _archivos: Archivos,
        private _imagenesService: ImagenesService,
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

        this.formulario = this._formBuilder.group({
            idArchivos: ''
        });

        this.idImagen = this._imagenesService.idImagen;

        if (this.idImagen == 0) {
            if(this.iestdesk.rolActual != 3){
                this.fechaPublicacionSeleccionada = new Date();
                this.agrupar();
            }
        } else {
            this.consultaImagen();
        }
    }

    ngOnInit() {
        this.iestdesk.registraAcceso(64, this.idImagen);
    }

    validarFormulario() {
        let valido = true;
        this.formMultimedia['idArchivo'] = this._archivos.idArchivos;

        for(let campos of Object.keys(this.formMultimedia)) {
            if (this.formMultimedia[campos] == "") {
                valido = false;
                break;
            }
        }

        if (valido) {
            valido = this.publicacionCursos();
            
            if (valido) {
                if(this.iestdesk.rolActual == 3){
                    if(this.editorService.esAsignado == 1){
                        this.fechaPublicacion = [];
                        this.fechaPublicacion.push(_moment(this.formMultimedia.fechaPublicacion).format("DD/MM/YY HH:mm"));
                    }
                    
                    this.temas = [];
                    this.temas.push(this.temaSeleccionado);
                }

                this.altaEdicionImagen();
            } else {
                this.limpiaVariables();
                this.imagenDialog = 1;
                this.accionDialog = 0;
                this.mensajeDialog = 'Llene todos los campos antes de continuar';
                this.guardado = false;
                this.ngxSmartModalService.getModal('dialogoInformacion').open();
            }
        } else {
            this.limpiaVariables();
            this.imagenDialog = 1;
            this.accionDialog = 0;
            this.mensajeDialog = 'Llene todos los campos antes de continuar';
            this.guardado = false;
            this.ngxSmartModalService.getModal('dialogoInformacion').open();
        }
    }

    consultaImagen() {
        let params = {
            servicio: "multimedia",
            accion: "IDesk_Imagen_VistaInd",
            tipoRespuesta: "json",
            idImagen: this.idImagen
        };
        this._imagenesService.consultas(params)
        .subscribe(resp => {
            this.temaSeleccionado = +resp[0].idTema;
            this.formMultimedia = {
                titulo: resp[0].titulo,
                descripcion: resp[0].descripcion,
                idArchivo: resp[0].idArchivo,
                fechaPublicacion: new Date(resp[0].fechaPublicacion.split(' ').join('T'))
            };
            this.editando = 1;
            this._archivos.idArchivos = resp[0].idArchivo;
            this.idArchivoObtenido = resp[0].idArchivo;
            this.cargaElementos( resp[0].idTema, resp[0].fechaPublicacion );
            this.agrupar();
            //console.log(resp);
        }, errors => {
            console.log(errors);
        });
    }

    altaEdicionImagen() {
        let params = {
            servicio: "multimedia",
            accion: this.idImagen == 0 ? "IDesk_Maestro_Imagen_Alta" : "IDesk_Maestro_Imagen_Edita",
            tipoRespuesta: "json",
            idImagen: this.idImagen,
            titulo: this.formMultimedia.titulo,
            descripcion: this.formMultimedia.descripcion,
            idArchivos: this.formMultimedia.idArchivo,
            idCursos: this.idCursosPub.join("|"), 
            idTemas: this.temas.join("|"),
            fechaPublicacion: this.fechaPublicacion.join("|"),
            idpersonidesk: this.iestdesk.idPerson
        };
        this._imagenesService.consultas(params)
        .subscribe(resp => {
            if(resp[0].error == 0){
                this.imagenDialog = 0;
                this.accionDialog = 1;
                this.mensajeDialog = 'Imagen guardada correctamente';
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
}
