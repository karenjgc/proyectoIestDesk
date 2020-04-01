import { Component, OnInit } from '@angular/core';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalFormComponent } from '../../modal-form/modal-form.component';
import { EditorService } from '../../../services/editorService.service';
import { Iestdesk } from '../../../services/iestdesk.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Apuntes } from '../../../services/apuntes.service';

@Component({
  selector: 'app-multimedia-apuntes',
  templateUrl: './multimedia-apuntes.component.html'
})
export class MultimediaApuntesComponent implements OnInit {
  
  p: number = 1;
  collection: any[];

  public datosApuntes;
  public mensajeDialog = "";
  public accionDialog;
  modalReference: any;
  modalOption: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  constructor(
    private iestdesk: Iestdesk,
    private modalService: NgbModal,
    private editorService: EditorService,
    private apuntesService: Apuntes,
    public ngxSmartModalService: NgxSmartModalService
  ) { 
    this.obtenDatosApuntes();
  }

  ngOnInit() {
  }
  
  obtenDatosApuntes(){
      let params = {
        servicio: "editor",
        accion: "IDesk_Editor_Multimedia_Apuntes_Consulta",
        tipoRespuesta: "json"
      };
      this.editorService.consultas(params)
      .subscribe(resp => {
        this.datosApuntes = resp;
        this.collection = this.datosApuntes;

        let index = 0;
        for(let dato of this.datosApuntes){
          this.datosApuntes[index]['etiquetasArray'] = this.editorService.asignarTags(dato.etiquetas);
          index++;
        }
      }, errors => {
        console.log(errors);
      });
  }

  openModal(apunte = null) {
    this.modalReference = this.modalService.open(ModalFormComponent, this.modalOption);
    this.modalReference.result.then(resp => {
        if (resp != 0) {
            this.obtenDatosApuntes();
        }
    });
    this.modalReference.componentInstance.parametros = 4; //Modal de Apuntes
    this.editorService.tags = [];

    if (apunte) { //Cuando contenga datos.
      this.modalReference.componentInstance.formMultimedia.idElemento = apunte.idApunteMultimedia;
      this.modalReference.componentInstance.formMultimedia.titulo = apunte.titulo;
      this.modalReference.componentInstance.formMultimedia.descripcion = apunte.descripcion;
      this.apuntesService.idApunte = apunte.idApunteMultimedia;

      //Setea las etiquetas, si es que contiene
      if(apunte.etiquetas != '0'){
        this.editorService.tags =  apunte.etiquetasArray;
      }
    } else {
      this.apuntesService.idApunte = 0;
    }

    this.modalReference.componentInstance.formularioValido = true;
  }

  eliminarApunte(elemento){
    this.mensajeDialog = "¿Está seguro de que desea eliminar el apunte " + elemento.titulo + "?";
    this.accionDialog = elemento;
    this.ngxSmartModalService.getModal('confirmacionDialogApuntes').open();
  }

  cerrarDialogConfirmacion(resp){
    if (resp.respuesta == 1){
      let params = {
        servicio: "editor",
        accion: "IDesk_Editor_Multimedia_Apuntes_Elimina",
        idApunte: resp.accion.idApunteMultimedia,
        idpersonidesk: this.iestdesk.idPerson,
        tipoRespuesta: "json"
      };
      this.editorService.consultas(params).subscribe(resp => {
         this.obtenDatosApuntes();
      }, errors => {
        console.log(errors);
      });
    }

    this.ngxSmartModalService.getModal('confirmacionDialogApuntes').close();
  }
}
