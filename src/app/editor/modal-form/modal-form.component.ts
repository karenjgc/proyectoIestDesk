import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FroalaOptions } from '../../shared/iestdesk/froala';
import { Validaciones } from '../../shared/classes/validaciones';
import { PodcastService } from '../../services/podcast.service';
import { AdjuntarCarpetasService } from '../../services/adjuntarCarpetasService.service';
import { EditorService } from '../../services/editorService.service';
import { Iestdesk } from '../../services/iestdesk.service';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-modal-form',
  templateUrl: './modal-form.component.html'
})
export class ModalFormComponent {
  // Configuración de Froala
  opcFroala = new FroalaOptions();
  options: Object = this.opcFroala.opciones;

  @Input() parametros;
  public validaciones = new Validaciones();

  public formMultimedia = {
    idElemento: 0,
    titulo: "",
    descripcion: "",
    url: "",
    ruta:"",
    idArchivos:""
  };
  
  public esCaptura = true;
  public videoValido = false;
  public change = false;
  public llave;
  public formularioValido = false;
  public validandoPodcast = false;
  public podcastValido = false;
  public guardadoExitoso = 0;
  public progresoCarga = false;
  public archivosError;
  public accionesMultimedia;
  public rutaOda;
  public editando = 14;
  public mensajeArchivo;
  public mostrarBotones = true;
  public tags = [];
  public cursosTags = [];
  public imagenDialog;
  public mensajeDialog;
  public accionDialog;
  public mensajeAlerta;

  constructor(
    private iestdesk: Iestdesk,
    private activeModal:NgbActiveModal,
    private editorService: EditorService,
    private adjuntarCarpetasService:AdjuntarCarpetasService,
    private podcastService: PodcastService,
    public ngxSmartModalService: NgxSmartModalService,
  ) {
     this.obtenerAccionesMultimedia();
     this.obtenerMaterias();
  }
  
  obtenerAccionesMultimedia(){
    let params = {
      servicio: "editor",
      accion: "IDesk_Editor_Multimedia_Acciones",
      tipoRespuesta: "json"
    };
    this.editorService.consultas(params).subscribe(resp => {
      this.accionesMultimedia = resp;
    }, errors => {
      console.log("Si estalló todo");
    });
  }
  
  obtenerMaterias(){
     let params = {
        servicio: "editor",
        accion: "IDesk_Editor_Asignacion_ConsultaMoldes",
        tipoRespuesta: "json"
      };
      this.editorService.consultas(params)
      .subscribe(resp => {
          for(let materia of resp){
            this.tags.push({
              display: materia.materia + " - " + materia.plan,
              tipo:1,
              value:materia.idCurso
            });
          }
          console.log(this.tags);
      }, errors => {
        console.log(errors);
      });
  }

  verificarLinkVideo() {
    if (this.llave = this.validaciones.matchYoutubeUrl(this.formMultimedia.url)) {
        this.llave = 'https://www.youtube.com/embed/' + this.llave;
        this.videoValido = true;
        this.change = false;
    } else {
        if ( this.llave = this.validaciones.matchVimeoUrl(this.formMultimedia.url) ) {
            this.llave = 'https://player.vimeo.com/video/' + this.llave;
            this.videoValido = true;
            this.change = false;
        } else {
            this.videoValido = false;
            this.change = true;
            this.mensajeAlerta = 'No se han encontrado coincidencias';
        }
    }
  }

  validaLinkPodcast(){
      this.validandoPodcast = true;

      //Evalua si es un frame
      let frame = this.formMultimedia.url.match(/(?:<iframe[^>]*)(?:(?:\/>)|(?:>.*?<\/iframe>))/);
      if(frame){
        let frameHtml = frame[0];
        
        //Obtiene src de frame
        let src = frameHtml.match(/src\s*=\s*"(.+?)"/);
        if(src){
          let srcFrame = src[0].split('src="')[1].split('"')[0];

          //Evalua si es src de soundcloud
          let matchSoundcloud = srcFrame.match(/^https?:\/\/(w.soundcloud\.com|snd\.sc)\/(.*)$/);
          if(matchSoundcloud){
             this.podcastValido = true;
             this.change = false;
             this.llave = srcFrame;
             console.log('Soundcloud', this.llave);
          }else{
            this.mensajeAlerta = 'No se han encontrado coincidencias';
            this.podcastValido = false;
            this.change = true;
          }
        }else{
          this.mensajeAlerta = 'Es necesario que el iframe contenga el atributo src';
          this.podcastValido = false;
          this.change = true;
        }
      }else{
        this.mensajeAlerta = 'Es necesario ingresar un iframe para realizar el registro';
        this.podcastValido = false;
        this.change = true;
      }

      this.validandoPodcast = false;
	}

  validaElemento(){
    let valido = true;
    for(let multimedia of Object.keys(this.formMultimedia)){
      if((multimedia == 'descripcion' || multimedia == 'titulo') && this.formMultimedia[multimedia].trim() == ''){
         this.mensajeDialog = 'Es necesario capturar todos los datos para realizar el registro.';
         this.imagenDialog = 1;
         this.ngxSmartModalService.getModal('dialogoInformacion').open();
         valido = false;
         break;
      }
    }

    if (valido && this.formMultimedia.ruta && this.adjuntarCarpetasService.getDirectorioTemporal().length > 0) {
      let params = {
        servicio: "editor",
        accion: "IDesk_Editor_Multimedia_Oda_EliminaCarpeta",
        nombreCarpeta: this.rutaOda.split('/')[0],
        tipoRespuesta: "json"
      };
      this.editorService.consultas(params).subscribe(resp => {
        if (resp.status){
          this.procesarCarpeta();
        }
      }, errors => {
        console.log(errors);
      });
    } else {
      switch(this.parametros){
        case 1: //Videos
          this.formularioValido = valido && this.videoValido;
        break;
        case 2: //Podcast
          this.formularioValido = valido && this.podcastValido;
        break;
        case 3: //Oda
          //Valida nombre de archivo principal
          if(this.formMultimedia.url.trim() != "" && this.editorService.getTags().length > 0){
            if (this.adjuntarCarpetasService.getDirectorioTemporal().length > 0) {
              // Alta Original
              this.procesarCarpeta();
            } else {
              // Editar sin cambiar carpeta
              if(valido){
                  let params = {
                    servicio: "editor",
                    accion: "IDesk_Editor_Multimedia_Oda_EditarCarpeta",
                    tipoRespuesta: "json",
                    nombreCarpeta: this.rutaOda.split('/')[0],
                    nuevoNombre: this.adjuntarCarpetasService.eliminaAcentos(this.formMultimedia.titulo),
                    url: this.formMultimedia.url
                  };
                  this.editorService.consultas(params)
                  .subscribe(resp => {
                    if (resp.status) {
                      let rutaEdicion = this.rutaOda.split('/');
                      rutaEdicion.splice(0, 1);
                      this.formMultimedia.ruta = rutaEdicion.join('/');
                      this.guardarElemento();
                    }
                  });
              }else{
                this.formularioValido = false;
                this.mensajeDialog = 'Es necesario capturar todos los datos para realizar el registro.';
                this.imagenDialog = 1;
                this.ngxSmartModalService.getModal('dialogoInformacion').open();
              }
            }
          }else{
            this.formularioValido = false;
            this.mensajeDialog = 'Es necesario capturar el nombre del archivo principal y una etiqueta como mínimo para realizar el registro.';
            this.imagenDialog = 1;
            this.ngxSmartModalService.getModal('dialogoInformacion').open();
          }
        break;
        case 4: //Apuntes
          this.formularioValido = valido && this.formMultimedia.idArchivos != '';
        break;
      }

      if(this.formularioValido && this.parametros != 3){
        if( this.editorService.getTags().length > 0){
          this.guardarElemento();
        }else{
          this.mensajeDialog = 'Es necesario capturar como mínimo una etiqueta para realizar el registro.';
          this.imagenDialog = 1;
          this.ngxSmartModalService.getModal('dialogoInformacion').open();
        }
      } else {
          this.formularioValido = false;
          this.change = true;
          if( this.parametros != 3 ){
            this.mensajeDialog = 'Es necesario capturar todos los datos para realizar el registro.';
            this.imagenDialog = 1;
            this.ngxSmartModalService.getModal('dialogoInformacion').open();
          }
      }
    }
  }

  guardarElemento(){
      this.esCaptura = false;
      this.progresoCarga = true;
      
      for(let curso of this.editorService.getTags()){
          this.cursosTags.push(curso.value);
      }
      
      let params = {
        servicio: "editor",
        accion: this.formMultimedia.idElemento == 0 ? this.accionesMultimedia[this.parametros - 1].consultaAlta : this.accionesMultimedia[this.parametros - 1].consultaEdicion,
        tipoRespuesta: "json",
        idElemento: this.formMultimedia.idElemento,
        titulo: this.parametros == 3 ? this.adjuntarCarpetasService.eliminaAcentos(this.formMultimedia.titulo) : this.formMultimedia.titulo,
        descripcion: this.formMultimedia.descripcion,
        url: this.parametros == 2 ? this.llave : this.adjuntarCarpetasService.eliminaAcentos(this.formMultimedia.url),
        rutaAlta: this.formMultimedia.ruta,
        etiquetas: this.cursosTags.join('|'),
        idArchivos : this.formMultimedia.idArchivos,
        idpersonidesk: this.iestdesk.idPerson
      };
      this.editorService.consultas(params).subscribe(resp => {
        this.progresoCarga = false;
        this.guardadoExitoso = 1;
      }, errors => {
        this.guardadoExitoso = 3;
        console.log(errors);
      });
  }

  procesarCarpeta() {
    this.esCaptura = false;
    this.progresoCarga = true;
    
    let params = {
      servicio: "editor",
      accion: "IDesk_Editor_Multimedia_Oda_ProcesarCarpeta",
      tipoRespuesta: "json",
      tipo: 2,
      nombreCarpeta: this.adjuntarCarpetasService.eliminaAcentos(this.formMultimedia.titulo).trim(),
      url: this.adjuntarCarpetasService.eliminaAcentos(this.formMultimedia.url).trim()
    };
    this.editorService.consultas(params, "api/idesk/idesk_test_3.php", this.adjuntarCarpetasService.getDirectorio())
    .subscribe(resp => {
        if(resp.status && resp.rutaHTML != ''){
          this.formularioValido = true;
          this.formMultimedia.ruta = resp.rutaHTML;
          this.guardarElemento();
        }else{
          this.progresoCarga = false;
          this.guardadoExitoso = 3;
        }
    }, errors => {
        this.progresoCarga = false;
        this.guardadoExitoso = 3;
    });
  }

  closeModal(){
    this.esCaptura = false;
    this.activeModal.close(this.guardadoExitoso);
  }

  getRespuesta(respuesta, n){
		switch(respuesta){
			case 'fileError':
				this.mensajeArchivo = (n == 1) ? 'Asegúrate de subir sólo un archivo y que este sea menor a 20MB.' : 'Asegúrate de subir un archivo menor a 20MB.';
			break;
			case 'fileErrorExt':
				this.mensajeArchivo = (n == 1) ? 'El archivo tiene una extensión no válida.' : 'Uno de los archivos tiene una extensión no válida.';
			break;
		}
  }

  archivos(idArchivos) {
    this.formMultimedia.idArchivos = idArchivos;
  }

  ocultarBotones(event:any){
     this.mostrarBotones = !(event.nextId == "muestraOda");
  }

  cierraDialogoInfo($event){
      this.ngxSmartModalService.getModal('dialogoInformacion').close();
  }
}
