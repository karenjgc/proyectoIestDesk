import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AltasBase } from '../shared/classes/altasBase';
import { Iestdesk } from '../services/iestdesk.service';
import { Archivos } from '../services/archivos.service';
import { ImagenesService } from '../services/imagenes.service';
import { FormBuilder } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Router, ActivatedRoute, UrlHandlingStrategy } from '@angular/router';
import { EditorService } from '../services/editorService.service';
import { AdjuntarCarpetasService } from '../services/adjuntarCarpetasService.service';
import { BancoMultimediaComponent } from '../editor/banco-multimedia/banco-multimedia.component';
import * as _moment from 'moment';

@Component({
  selector: 'iestdesk-altaOda',
  templateUrl: './oda.component.html'
})
export class OdaComponent extends AltasBase{
   
  public imagenDialog = 0;
  public accionDialog = 0;
  public mensajeDialog;
  
  public modalReference: any;
  public modalOption: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  
  public modoBanco = false;
  public formularioValido = true;
  public idOda;
  public rutaFrame;
  public formMultimedia = {
    idOdaMultimedia: 0,
    titulo: "",
    descripcion: "",
    ruta:"",
    url:"",
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
    public editorService: EditorService,
    private adjuntarCarpetasService: AdjuntarCarpetasService
  ) {

    super(iestdesk,
      null,
      null,
      _formBuilder,
      _chRef,
      _modalService,
      _ngxSmartModalService,        
      router);

      this.idOda = this.editorService.idOda;

      if (this.idOda == 0) {
          this.rutaFrame = '';
          if(this.iestdesk.rolActual != 3){
              this.fechaPublicacionSeleccionada = new Date();
              this.agrupar();
          }
      } else {
          this.consultaOda();
      }
  }

  procesarCarpeta() {
    let params = {
      servicio: "editor",
      accion: "IDesk_Editor_Multimedia_Oda_ProcesarCarpeta",
      tipoRespuesta: "json",
      tipo: 2,
      nombreCarpeta: this.formMultimedia.titulo,
      url:this.formMultimedia.url
    };
    this.editorService.consultas(params, "api/idesk/idesk_test_3.php", this.adjuntarCarpetasService.getDirectorio())
    .subscribe(resp => {
        this.formularioValido = true;
        this.formMultimedia.ruta = resp.rutaHTML;
        this.guardarOda();
    }, errors => {
        console.log("Si estalló todo Oda");
    });
  }
  
  validarFormulario(){
    let valido = true;
    
    for(let multimedia of Object.keys(this.formMultimedia)){
      if(this.modoBanco){
        if((multimedia == 'descripcion' || multimedia == 'titulo') && this.formMultimedia[multimedia].trim() == ''){
          valido = false;
          break;
        }
      }else{
        if((multimedia == 'descripcion' || multimedia == 'titulo' || multimedia == 'url') && this.formMultimedia[multimedia].trim() == ''){
          valido = false;
          break;
        }
      }
    }
    
    if (valido && this.publicacionCursos()){
      if(this.iestdesk.rolActual == 3 ){
          if(this.editorService.esAsignado == 1){
              this.fechaPublicacion = [];
              this.fechaPublicacion.push(_moment(this.formMultimedia.fechaPublicacion).format("DD/MM/YY HH:mm"));
          }

          this.temas = [];
          this.temas.push(this.temaSeleccionado);
      }

      if(this.modoBanco){
         this.guardarOda();
      }else{
        if( this.idOda > 0 ){ //Edición
          //Adjunto carpeta nueva, se elimina la anterior y se procesa la nueva carpeta.
          if (valido && this.adjuntarCarpetasService.getDirectorioTemporal().length >0 ) {
            let params = {
              servicio: "editor",
              accion: "IDesk_Editor_Multimedia_Oda_EliminaCarpeta",
              nombreCarpeta: this.rutaFrame.split('/')[0],
              tipoRespuesta: "json"
            };
            this.editorService.consultas(params).subscribe(resp => {
              if (resp.status){
                this.procesarCarpeta();
              }
            }, errors => {
              console.log(errors);
            });
          }else{ // No adjunto carpeta nueva, se edita el nombre de la carpeta y se guarda oda.
            let params = {
              servicio: "editor",
              accion: "IDesk_Editor_Multimedia_Oda_EditarCarpeta",
              nombreCarpeta: this.rutaFrame.split('/')[0],
              nuevoNombre: this.formMultimedia.titulo,
              url:this.formMultimedia.url,
              tipoRespuesta: "json"
            };
            this.editorService.consultas(params)
            .subscribe(resp => {
              if (resp.status) {
                let rutaEdicion = this.rutaFrame.split('/');
                rutaEdicion.splice(0, 1);
                this.formMultimedia.ruta = rutaEdicion.join('/');
                this.guardarOda();
              }
            });
          } 
        }else{ // Alta Nuevo
          //Si adjunto carpeta se procesa y se guarda oda.
          if (valido && this.adjuntarCarpetasService.getDirectorioTemporal().length > 0) {
            this.procesarCarpeta();
          } else { // No adjunto y se manda mensaje.
              this.mensajeDialog = 'Es necesario adjuntar una carpeta antes de continuar';
              this.imagenDialog = 1;
              this.ngxSmartModalService.getModal('dialogoInformacion').open();
          }
        }
      }
    }else{
      this.mensajeDialog = 'Llene todos los campos antes de continuar';
      this.imagenDialog = 1;
      this.ngxSmartModalService.getModal('dialogoInformacion').open();
    }
  }

  guardarOda(){
    let params = {
        servicio: "multimedia",
        accion: this.idOda == 0 ? "IDesk_Maestro_Oda_Alta" : "IDesk_Maestro_Oda_Edita",
        tipoRespuesta: "json",
        idOda: this.idOda,
        titulo: this.formMultimedia.titulo,
        idOdaMultimedia: this.formMultimedia.idOdaMultimedia,
        rutaOda: this.formMultimedia.ruta,
        url:this.formMultimedia.url,
        descripcion: this.formMultimedia.descripcion,
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
            this.mensajeDialog = 'Objeto de aprendizaje guardado correctamente';
            this.guardado = true;
            this.ngxSmartModalService.getModal('dialogoInformacion').open();
        }else{
            console.log('Error:', resp[0].error);
        }
    });
  }

  consultaOda(){
    let params = {
        servicio: "multimedia",
        accion: "IDesk_Oda_VistaInd",
        tipoRespuesta: "json",
        idOda: this.idOda
    };
    this._imagenesService.consultas(params)
    .subscribe(resp => {
      this.temaSeleccionado = +resp[0].idTema;

      if(resp[0].idOdaMultimedia != 0){
          this.consultaOdaMultimedia(resp);
      }else{
        this.formMultimedia = {
          idOdaMultimedia: resp[0].idOdaMultimedia,
          titulo: resp[0].titulo,
          descripcion: resp[0].descripcion,
          ruta: resp[0].ruta,
          url: resp[0].nombreArchivo,
          fechaPublicacion: new Date(resp[0].fechaPublicacion.split(' ').join('T'))
        }

        this.rutaFrame = resp[0].titulo + "/" + resp[0].ruta;
        this.adjuntarCarpetasService.rutaVistaAlumno = resp[0].titulo + "/" + resp[0].ruta
      }

      this.modoBanco = resp[0].idOdaMultimedia !=0;
      this.formularioValido = true;
    });
  }
  
  consultaOdaMultimedia(datos){
    let params = {
        servicio: "editor",
        accion: "IDesk_Editor_Multimedia_Oda_VistaInd",
        tipoRespuesta: "json",
        idOdaMultimedia: datos[0].idOdaMultimedia
    };
    this._imagenesService.consultas(params)
    .subscribe(resp => {
        this.formMultimedia = {
          idOdaMultimedia: resp[0].idOdaMultimedia,
          titulo: datos[0].titulo,
          descripcion: datos[0].descripcion,
          ruta: resp[0].ruta,
          url: resp[0].nombreArchivo,
          fechaPublicacion: new Date(datos[0].fechaPublicacion.split(' ').join('T'))
        }

        this.rutaFrame = resp[0].titulo + "/" + resp[0].ruta;
        this.adjuntarCarpetasService.rutaVistaAlumno = resp[0].titulo + "/" + resp[0].ruta
    });
  }

  abrirBanco(){
    this.modalReference = this._modalService.open(BancoMultimediaComponent, this.modalOption);

    this.modalReference
    .result.then(resp => {
        if (resp) {
          this.formMultimedia = {
            idOdaMultimedia: resp.idElemento,
            titulo: resp.titulo,
            descripcion: resp.descripcion,
            ruta: resp.elemento,
            url:'',
            fechaPublicacion: new Date()
          };
    
          this.rutaFrame = resp.titulo + '/' + resp.elemento;
          this.adjuntarCarpetasService.rutaVistaAlumno = resp.titulo + '/' + resp.elemento;
          this.modoBanco = true;
          this.formularioValido = true;
        }
    });

    this.modalReference.componentInstance.tipoElemento = 2;
    this.modalReference.componentInstance.obtenerFiltroEtiquetas(this.modalReference.componentInstance.elementos[2]);
  }

  muestraAdjuntarCarpeta(){
    this.formMultimedia = {
      idOdaMultimedia: 0,
      titulo: '',
      descripcion: '',
      ruta: '',
      url:'',
      fechaPublicacion: new Date()
    };

    this.rutaFrame = '';
    this.adjuntarCarpetasService.rutaVistaAlumno = '';
    this.formularioValido = false;
    this.modoBanco = false;
  }

  vistaAlumnoObjeto(content){
    this.modalReference = this._modalService.open(content, { backdrop: 'static' });
  }

}
