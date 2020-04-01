import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AltasBase } from '../shared/classes/altasBase';
import { Iestdesk } from '../services/iestdesk.service';
import { FormBuilder } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Router, ActivatedRoute } from '@angular/router';
import { VideosService } from '../services/videos.service';
import { BancoMultimediaComponent } from '../editor/banco-multimedia/banco-multimedia.component';
import { EditorService } from '../services/editorService.service';
import * as _moment from 'moment';

@Component({
  selector: 'idesk-altaVideos',
  templateUrl: './altaVideos.component.html'
})
export class AltaVideosComponent extends AltasBase implements OnInit {
  public idVideo;
  public llave;
  public videoValido = false;
  public change = false;
  public modoBanco = false;
  public formMultimedia = {
    titulo: "",
    descripcion: "",
    url: "",
    fechaPublicacion: new Date()
  };
  
  public modalReference: any;
  public modalOption: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  constructor(
    public iestdesk: Iestdesk,
    private _videosService: VideosService,
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

      this.idVideo = this._videosService.idVideo;

      if (this.idVideo == 0) {
            if(this.iestdesk.rolActual != 3){
                this.fechaPublicacionSeleccionada = new Date();
                this.agrupar();
            }
      } else {
          this.consultaVideo();
      }
   }

   ngOnInit() {   
    this.iestdesk.registraAcceso(68, this.idVideo);
   }

  verificarLink() {
    this.change = true;
    if (this.llave = this.validaciones.matchYoutubeUrl(this.formMultimedia.url)) {
        this.llave = 'https://www.youtube.com/embed/' + this.llave;
        this.videoValido = true;
    } else {
        if ( this.llave = this.validaciones.matchVimeoUrl(this.formMultimedia.url) ) {
            this.llave = 'https://player.vimeo.com/video/' + this.llave;
            this.videoValido = true;
        } else {
            this.videoValido = false;
        }
    }
  }

  validarFormulario() {
    let valido = true;

    for(let campos of Object.keys(this.formMultimedia)) {
        if (this.formMultimedia[campos] == "") {
            valido = false;
            break;
        }
    }

    if (valido && this.videoValido) {
        valido = this.publicacionCursos();

        if (valido) {
            if(this.iestdesk.rolActual == 3 ){
                if(this.editorService.esAsignado == 1){
                    this.fechaPublicacion = [];
                    this.fechaPublicacion.push(_moment(this.formMultimedia.fechaPublicacion).format("DD/MM/YY HH:mm"));
                }

                this.temas = [];
                this.temas.push(this.temaSeleccionado);
            }

            this.altaEdicionVideo();
        } else {
            this.limpiaVariables();
            this.mensaje = 'Llene todos los campos de publicación a grupos seleccionados antes de continuar';
            this.tipoRespuesta = 2;
            this.ngxSmartModalService.getModal('dialogoInformacion').open();
        }
    } else {
        this.limpiaVariables();
        this.mensaje = 'Llene todos los campos antes de continuar';
        this.tipoRespuesta = 2;
        this.ngxSmartModalService.getModal('dialogoInformacion').open();
    }
  }

  consultaVideo() {
    let params = {
        servicio: "multimedia",
        accion: "IDesk_Video_VistaInd",
        tipoRespuesta: "json",
        idVideo: this.idVideo
    };
    this._videosService.consultas(params)
    .subscribe(resp => {
        this.temaSeleccionado = +resp[0].idTema;
        this.formMultimedia = {
            titulo: resp[0].titulo,
            descripcion: resp[0].descripcion,
            url: resp[0].url,
            fechaPublicacion: new Date(resp[0].fechaPublicacion.split(' ').join('T'))
        };
        this.cargaElementos( resp[0].idTema, resp[0].fechaPublicacion );
        this.agrupar();
        this.verificarLink();
    }, errors => {
        console.log(errors);
    });
  }

  altaEdicionVideo() {
    let params = {
        servicio: "multimedia",
        accion: this.idVideo == 0 ? "IDesk_Maestro_Video_Alta" : "IDesk_Maestro_Video_Edita",
        tipoRespuesta: "json",
        idVideo: this.idVideo,
        titulo: this.formMultimedia.titulo,
        url: this.llave,
        descripcion: this.formMultimedia.descripcion,
        idCursos: this.idCursosPub.join("|"), 
        idTemas: this.temas.join("|"),
        fechaPublicacion: this.fechaPublicacion.join("|"),
        idpersonidesk: this.iestdesk.idPerson
    };
    console.log(params);
    this._videosService.consultas(params)
    .subscribe(resp => {
        this.llave = '';
        this.limpiaVariables();
        this.mensaje = 'Vídeo registrado correctamente.';
        this.tipoRespuesta = 1;
        this.guardado = true;
        this.ngxSmartModalService.getModal('dialogoInformacion').open();
    });
  }

  abrirBanco(){
    this.modalReference = this._modalService.open(BancoMultimediaComponent, this.modalOption);

    this.modalReference
    .result.then(resp => {
        if (resp) {
            this.formMultimedia = {
                titulo: resp.titulo,
                descripcion: resp.descripcion,
                url: resp.elemento,
                fechaPublicacion: new Date()
            };
            
            this.llave = resp.elemento;
            this.verificarLink();
            this.modoBanco = true;
            this.videoValido = true;
        }
    });

    this.modalReference.componentInstance.tipoElemento = 0;
    this.modalReference.componentInstance.obtenerFiltroEtiquetas(this.modalReference.componentInstance.elementos[0]);
  }

  vistaAlumnoObjeto(content){
    this.modalReference = this._modalService.open(content, { backdrop: 'static' });
  }
}
