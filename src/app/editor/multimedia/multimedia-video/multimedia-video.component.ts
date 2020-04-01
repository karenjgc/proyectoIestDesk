import { Component, OnInit } from '@angular/core';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalFormComponent } from '../../modal-form/modal-form.component';
import { EditorService } from '../../../services/editorService.service';
import { Iestdesk } from '../../../services/iestdesk.service';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-multimedia-video',
  templateUrl: './multimedia-video.component.html'
})
export class MultimediaVideoComponent implements OnInit{
  
  p: number = 1;
  collection: any[];

  videosCards: any;
  closeResult: string;
  modalReference: any;
  modalOption: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  public datosVideoCards;
  public mensajeDialog = "";
  public accionDialog;

  constructor(
    private iestdesk: Iestdesk,
    private modalService: NgbModal,
    private editorService: EditorService,
    public ngxSmartModalService: NgxSmartModalService
  ) { 
    this.obtenerDatosVideo();
  }

  ngOnInit(){
    
  }

  obtenerDatosVideo(){
      let params = {
        servicio: "editor",
        accion: "IDesk_Editor_Multimedia_Video_Consulta",
        tipoRespuesta: "json"
      };
      this.editorService.consultas(params)
      .subscribe(resp => {
          this.datosVideoCards = resp;
          this.collection = this.datosVideoCards;
          console.log(this.datosVideoCards);

          let index = 0;
          for(let dato of this.datosVideoCards){
            this.datosVideoCards[index]['etiquetasArray'] = this.editorService.asignarTags(dato.etiquetas);
            index++;
          }
      }, errors => {
          console.log(errors);
      });
  }

  openModal(videoCard = null) {
    this.modalReference = this.modalService.open(ModalFormComponent, this.modalOption);
    this.modalReference.result.then(resp => {
        if (resp != 0) {
            this.obtenerDatosVideo();
        }
    });
    this.modalReference.componentInstance.parametros = 1; //Modal de Video
    this.editorService.tags = [];

    if (videoCard) { //Cuando contenga datos.
      console.log(videoCard);
      this.modalReference.componentInstance.formMultimedia.idElemento = videoCard.idVideoMultimedia;
      this.modalReference.componentInstance.formMultimedia.url  = videoCard.url;
      this.modalReference.componentInstance.formMultimedia.titulo = videoCard.titulo;
      this.modalReference.componentInstance.formMultimedia.descripcion = videoCard.descripcion;
      this.modalReference.componentInstance.verificarLinkVideo();
      
      //Setea las etiquetas, si es que contiene
      if(videoCard.etiquetas != '0'){
        this.editorService.tags =  videoCard.etiquetasArray;
      }
    }
  }

  eliminarVideo(elemento){
      this.mensajeDialog = "¿Está seguro de que desea eliminar el video " + elemento.titulo + "?";
      this.accionDialog = elemento;
      this.ngxSmartModalService.getModal('confirmacionDialogVideo').open();
  }

  cerrarDialogConfirmacion(resp){
    console.log(resp);
    
    if (resp.respuesta == 1){
      let params = {
        servicio: "editor",
        accion: "IDesk_Editor_Multimedia_Video_Elimina",
        idVideo: resp.accion.idVideoMultimedia,
        idpersonidesk: this.iestdesk.idPerson,
        tipoRespuesta: "json"
      };
      this.editorService.consultas(params).subscribe(resp => {
        this.obtenerDatosVideo();
      }, errors => {
        console.log(errors);
      });
    }

    this.ngxSmartModalService.getModal('confirmacionDialogVideo').close();
  }
}
