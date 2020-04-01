import { Component, OnInit } from '@angular/core';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalFormComponent } from '../../modal-form/modal-form.component';
import { EditorService } from '../../../services/editorService.service';
import { Iestdesk } from '../../../services/iestdesk.service';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-multimedia-oda',
  templateUrl: './multimedia-oda.component.html'
})
export class MultimediaOdaComponent implements OnInit {
 
  p: number = 1;
  collection: any[];

  public datosOda;
  public mensajeDialog = "";
  public accionDialog;
  public botonesOcultos = false;
  modalReference: any;
  modalOption: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  constructor(
    public iestdesk: Iestdesk,
    public modalService: NgbModal,
    public editorService: EditorService,
    public ngxSmartModalService: NgxSmartModalService
  ) { 
     this.obtenDatosOda();
  }

  ngOnInit() {
  }

  obtenDatosOda(){
      let params = {
        servicio: "editor",
        accion: "IDesk_Editor_Multimedia_Oda_Consulta",
        tipoRespuesta: "json"
      };
      this.editorService.consultas(params)
      .subscribe(resp => {
         this.datosOda = resp;
         this.collection = this.datosOda;
         
         let index = 0;
         for(let dato of this.datosOda){
           this.datosOda[index]['etiquetasArray'] = this.editorService.asignarTags(dato.etiquetas);
           index++;
         }

      }, errors => {
        console.log(errors);
      });
  }
  
  openModal(oda = null) {
    this.modalReference = this.modalService.open(ModalFormComponent, this.modalOption);
    this.modalReference.result.then(resp => {
        if (resp != 0) {
            this.obtenDatosOda();
        }
    });
    this.modalReference.componentInstance.parametros = 3; //ODA
    this.editorService.tags = [];

    if (oda) { //Cuando contenga datos.
      this.modalReference.componentInstance.formMultimedia.idElemento = oda.idOdaMultimedia;
      this.modalReference.componentInstance.formMultimedia.ruta  = oda.ruta.split("/")[0];
      this.modalReference.componentInstance.formMultimedia.titulo = oda.titulo;
      this.modalReference.componentInstance.formMultimedia.descripcion = oda.descripcion;
      this.modalReference.componentInstance.formMultimedia.url = oda.nombreArchivo;
      this.modalReference.componentInstance.rutaOda = oda.titulo + "/" + oda.ruta;

      //Setea las etiquetas, si es que contiene
      if(oda.etiquetas != '0'){
        this.editorService.tags =  oda.etiquetasArray;
      }
    }

    this.modalReference.componentInstance.formularioValido = true;
  }

  eliminarOda(elemento){
    this.mensajeDialog = "¿Está seguro de que desea eliminar el objeto de aprendizaje " + elemento.titulo + "?";
    this.accionDialog = elemento;
    this.ngxSmartModalService.getModal('confirmacionDialogOda').open();
  }

  cerrarDialogConfirmacion(resp){
    console.log(resp.accion);
    if (resp.respuesta == 1){
      let params = {
        servicio: "editor",
        accion: "IDesk_Editor_Multimedia_Oda_Elimina",
        idOda: resp.accion.idOdaMultimedia,
        idpersonidesk: this.iestdesk.idPerson,
        tipoRespuesta: "json"
      };
      this.editorService.consultas(params).subscribe(res => {
         this.eliminarCarpeta(resp.accion.titulo);
      }, errors => {
        console.log(errors);
      });
    }

    this.ngxSmartModalService.getModal('confirmacionDialogOda').close();
  }

  eliminarCarpeta(nombreCarpeta){
    let params = {
      servicio: "editor",
      accion: "IDesk_Editor_Multimedia_Oda_EliminaCarpeta",
      nombreCarpeta: nombreCarpeta,
      tipoRespuesta: "json"
    };
    this.editorService.consultas(params).subscribe(resp => {
        this.obtenDatosOda();
    }, errors => {
      console.log(errors);
    });
  }
}
