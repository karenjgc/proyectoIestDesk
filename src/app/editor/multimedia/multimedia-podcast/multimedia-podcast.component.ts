import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ModalFormComponent } from '../../modal-form/modal-form.component';
import { EditorService } from '../../../services/editorService.service';
import { Iestdesk } from '../../../services/iestdesk.service';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-multimedia-podcast',
  templateUrl: './multimedia-podcast.component.html'
})
export class MultimediaPodcastComponent implements OnInit {
  
  p: number = 1;
  collection: any[];

  public datosPodcast;
  public mensajeDialog = "";
  public accionDialog;
  modalReference: any;
  modalOption: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  
  constructor(
    private modalService: NgbModal,
    private iestdesk: Iestdesk,
    private editorService: EditorService,
    public ngxSmartModalService: NgxSmartModalService
  ) { 
     this.obtenDatosPodcast();
  }

  ngOnInit() {
  }
  
  obtenDatosPodcast(){
      let params = {
        servicio: "editor",
        accion: "IDesk_Editor_Multimedia_Podcast_Consulta",
        tipoRespuesta: "json"
      };
      this.editorService.consultas(params).subscribe(resp => {
        this.datosPodcast = resp;
        this.collection = this.datosPodcast;

        let index = 0;
        for(let dato of this.datosPodcast){
          this.datosPodcast[index]['etiquetasArray'] = this.editorService.asignarTags(dato.etiquetas);
          index++;
        }
      }, errors => {
        console.log(errors);
      });
  }

  openModal(podcast = null) {
      this.modalReference = this.modalService.open(ModalFormComponent, this.modalOption);
      this.modalReference.result.then(resp => {
          if (resp != 0) {
              this.obtenDatosPodcast();
          }
      });
      this.modalReference.componentInstance.parametros = 2; //Podcast
      this.editorService.tags = [];

      if (podcast) { //Cuando contenga datos.
        console.log(podcast);
        this.modalReference.componentInstance.formMultimedia.idElemento = podcast.idPodcastMultimedia;
        this.modalReference.componentInstance.formMultimedia.url = '<iframe width="100%" height="140" scrolling="no" frameborder="no" src="'+podcast.url+'"></iframe>';
        this.modalReference.componentInstance.formMultimedia.titulo = podcast.titulo;
        this.modalReference.componentInstance.formMultimedia.descripcion = podcast.descripcion;
        this.modalReference.componentInstance.validaLinkPodcast();

        //Setea las etiquetas, si es que contiene
        if(podcast.etiquetas != '0'){
          this.editorService.tags =  podcast.etiquetasArray;
        }
      }
  }
  
  eliminarPodcast(elemento){
      this.mensajeDialog = "¿Está seguro de que desea eliminar el podcast " + elemento.titulo + "?";
      this.accionDialog = elemento;
      this.ngxSmartModalService.getModal('confirmacionDialogPodcast').open();
  }

  cerrarDialogConfirmacion(resp){
    if (resp.respuesta == 1){
      let params = {
        servicio: "editor",
        accion: "IDesk_Editor_Multimedia_Podcast_Elimina",
        idPodcast: resp.accion.idPodcastMultimedia,
        idpersonidesk: this.iestdesk.idPerson,
        tipoRespuesta: "json"
      };
      this.editorService.consultas(params).subscribe(resp => {
        this.obtenDatosPodcast();
      }, errors => {
        console.log(errors);
      });
    }

    this.ngxSmartModalService.getModal('confirmacionDialogPodcast').close();
  }
}
