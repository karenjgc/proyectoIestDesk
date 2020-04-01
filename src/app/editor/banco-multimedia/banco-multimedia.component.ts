import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { AltasBase } from '../../shared/classes/altasBase';
import { Iestdesk } from '../../services/iestdesk.service';
import { Equipos } from '../../services/equipos.service';
import { Rubricas } from '../../services/rubricas.service';
import { FormBuilder } from '@angular/forms';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EditorService } from '../../services/editorService.service';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-banco-multimedia',
  templateUrl: './banco-multimedia.component.html'
})
export class BancoMultimediaComponent extends AltasBase implements OnInit {
  

  public opciones;
  public elemento;
  public nombreElemento;
  public tipoElemento;
  public opcionesElementos;
  public mostrarBuscador = false;

  public elementos = [
    {
      nombre:'Videos',
      catalogo: 'IDesk_Editor_Multimedia_Video_Consulta',
      idElemento: 'idVideoMultimedia',
      elemento: 'url'
    },
    {
      nombre: 'Podcasts',
      catalogo: 'IDesk_Editor_Multimedia_Podcast_Consulta',
      idElemento: 'idPodcastMultimedia',
      elemento: 'url'
    },
    {
      nombre: 'Objetos de Aprendizaje',
      catalogo: 'IDesk_Editor_Multimedia_Oda_Consulta',
      idElemento: 'idOdaMultimedia',
      elemento: 'ruta'
    },
    {
      nombre: 'Apuntes',
      catalogo: 'IDesk_Editor_Multimedia_Apuntes_Consulta',
      idElemento: 'idApunteMultimedia',
      elemento: 'idApunteMultimedia'
    }
  ];
  
  public filtroSeleccionado;
  public reactivoSeleccionado = {
    idElemento: 0,
    titulo: '',
    descripcion:'',
    ruta: ''
  };

  constructor(
    public iestdesk: Iestdesk,
    private equipos: Equipos,
    private rubricas: Rubricas,
    private _formBuilder: FormBuilder,
    private _chRef: ChangeDetectorRef,
    private _modalService: NgbModal,
    private activeModal: NgbActiveModal,
    private editorService: EditorService,
    public _ngxSmartModalService: NgxSmartModalService
  ) {
    super(iestdesk,
      equipos,
      rubricas,
      _formBuilder,
      _chRef,
      _modalService,
      null,        
      null);

   }

  ngOnInit(){
  }
   
  cerrarModal() {
    this.activeModal.close(false);
  }
  
  obtenerFiltroEtiquetas(elemento){
    this.elemento = elemento;
    this.nombreElemento = this.elemento.nombre;

    let param = {
        servicio: "editor",
        accion: 'IDesk_Editor_Asignacion_ListadoEtiquetas',
        tipoRespuesta: "json",
        idTipoElemento: this.tipoElemento + 1
    };
    this.editorService.consultas(param)
    .subscribe(resp => {
      this.opcionesElementos = resp;
        console.log('OpcionesElemento', this.opcionesElementos);
    });
  }

  obtenerElementos(){
    this.mostrarBuscador = false;
    this.reactivoSeleccionado = {
      idElemento: 0,
      titulo: '',
      descripcion:'',
      ruta: ''
    };
    
    if(this.filtroSeleccionado){
      let param = {
          servicio: "editor",
          accion: "IDesk_Editor_Asignacion_ListadoElementosEtiquetas",
          tipoRespuesta: "json",
          idTipoElemento:this.tipoElemento + 1,
          idCurso: this.filtroSeleccionado
      };
      this.editorService.consultas(param)
      .subscribe(resp => {
        this.opciones = {};

        for (let respuesta of resp) {
            if (!this.opciones.hasOwnProperty(respuesta.titulo)) {
                this.opciones[respuesta.titulo] = [];
            }
            this.opciones[respuesta.titulo].push(respuesta);
        }

        this.mostrarBuscador = true;
      });
    }else{
      this.mostrarBuscador = false;
      this.mensajeDialog = "Debe seleccionar una opción para continuar";
      this._ngxSmartModalService.getModal('confirmacionDialogBancoMultimedia').open();
    }
  }

  validarFormulario(){
    if (this.reactivoSeleccionado.idElemento != 0 && this.reactivoSeleccionado.idElemento != undefined) {
      this.activeModal.close(this.reactivoSeleccionado);
    } else {
      this.mensajeDialog = "Debe seleccionar una opción para continuar";
      this._ngxSmartModalService.getModal('confirmacionDialogBancoMultimedia').open();
    }

    console.log('TipoElemento', this.tipoElemento);
    console.log('ReactivoSeleccionado', this.reactivoSeleccionado);
  }

  search = (text$: Observable<string>) => 
    text$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        map(term => {
            let resultado = [];
            let elemento = Object.keys(this.opciones).filter( v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10);
             
            for (let reactivo of elemento) {
                resultado.push({
                    idElemento: this.opciones[reactivo][0].idElemento,
                    titulo: reactivo,
                    descripcion: this.opciones[reactivo][0].descripcion,
                    elemento: this.opciones[reactivo][0][this.elementos[this.tipoElemento].elemento]
                });
            }

            return resultado;
        })
  );

  formatter = (x) => {
    let element = document.createElement('div');

    element.innerHTML = x.titulo;

    return element.textContent;
  };
  
  cerrarDialogConfirmacion(resp){
    this._ngxSmartModalService.getModal('confirmacionDialogBancoMultimedia').close();
  }
}
