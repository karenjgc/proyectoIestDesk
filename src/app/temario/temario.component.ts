import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { NgxSmartModalService } from 'ngx-smart-modal';

import { Iestdesk } from '../services/iestdesk.service';
import { Temario } from "../services/temario.service";
import { ForoDiscusion } from '../services/foroDiscusion.service';
import { Tareas } from '../services/tareas.service';
import { Apuntes } from '../services/apuntes.service';
import { Vinculos } from '../services/vinculos.service';
import { Videoconferencia } from '../services/videoconferencia.service';
import { ScrollToService } from 'ng2-scroll-to-el';
import { ContenidoWebService } from '../services/contenidoweb.service';

import { VideosService } from '../services/videos.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ActividadesClase } from '../services/actividadesClase.service';
import { AltaTemaComponent } from './altaTema.component';
import { ImagenesService } from '../services/imagenes.service';
import { PodcastService } from '../services/podcast.service';
import { EditorService } from '../services/editorService.service';
import { Cronograma } from '../services/cronograma.service';


@Component({
    selector: 'idesk-temario',
    templateUrl: './temario.component.html'
})

export class TemarioComponent{
    
    @Output() regresaEditor = new EventEmitter();
    @Input() public modoEditor;

    modalReference: any;
    modalOption: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false
    };

    public elementos = [];
    public elementosTema = {};
    public elementosTemario = {};
    public catalogoElementos = {};
    public ordenCatalogo = [];
    public ordenTemas = [];
    public elementoActual;
    public temaActual;
    public posicionActual = 0;
    public objectKeys = Object.keys;
    public mensajeDialog = "";
    public accionDialog = 0;
    public cargando = 0;
    public elementoEliminar;
    public idaEliminar;
    public mostrarOrdenTemas = false;
    public mostrarOrdenElementos = false;
    public mostrarCronograma = false;
    public idTemaEditor;
    public revisando = false;
    public ordenadoPor = false;
    public elementosCopia;
    public ordenCopia;
    public tiposActividad = {
        1: "Ruleta",
        2: "Jeopardy",
        6: "Libre",
        7: "Externa"
    };
    public idTipoCursoActual: number;

    constructor(
        private temarioService: Temario,
        public iestdeskService: Iestdesk,
        private tareasService: Tareas,
        private forosDiscService: ForoDiscusion,
        private apuntesService: Apuntes,
        private vinculosService: Vinculos,
        private actividadesClaseService: ActividadesClase,
        private contenidoWebService: ContenidoWebService,
        private podcastService: PodcastService,
        private imagenesService: ImagenesService,
        private videosService: VideosService,
        private videoconfService: Videoconferencia,
        private editorService: EditorService,
        private cronogramaService: Cronograma,
        private router: Router,
        public ngxSmartModalService: NgxSmartModalService,
        private scrollService: ScrollToService,
        private _modalService: NgbModal
    ){
        this.obtenElementosDisponibles();
        this.obtenMaterialxTema();
        this.iestdeskService.registraAcceso(6, 0);

        this.iestdeskService.obtenerActualizacion().subscribe(
            resp => {
                if (resp) {
                    this.obtenElementosDisponibles();
                    this.obtenMaterialxTema();
                }
            }
        );

        this.idTipoCursoActual = this.iestdeskService.idTipoCursoActual;
    }

    obtenElementosDisponibles() {
        let params = {
            servicio: "temario",
            accion: "IDesk_Temario_Elementos_Listado",
            tipoRespuesta: "json",
            rolActual:this.iestdeskService.rolActual
        };
        this.temarioService.consultas(params)
        .subscribe(resp => {
            this.ordenCatalogo = resp;
            for(let elemento of resp) {
                this.catalogoElementos[elemento.idTemarioElemento] = elemento;
            }
			console.log("\n    .----.   @   @\n   / .-\"-.`.  \\v/\n   | | '\\ \\ \\_/ )\n ,-\\ `-.' /.'  /\n'---`----'----'");
        }, errors => {
            console.log(errors);
        });
    }

    obtenMaterialxTema(idTema = 0, posicionar = false) {
        let params = {
            servicio: "temario",
            accion: "IDesk_Temario_MaterialxTema",
            tipoRespuesta: "json",
            idCurso: this.iestdeskService.idCursoActual,
            idpersonidesk: this.iestdeskService.idPerson,
            ordenarPor: this.ordenadoPor ? 1 : 0,
            rolActual: this.iestdeskService.rolActual
        };
        this.cargando = 1;
        this.temarioService.consultas(params)
        .subscribe(resp => {
            this.elementosTemario = {};
            this.ordenTemas = [];
            if (!this.ordenadoPor) {
                let params = {
                    servicio: "idesk",
                    accion: "IDesk_Maestro_Temario_Cursos_Listado",
                    tipoRespuesta: "json",
                    idCursos: this.iestdeskService.idCursoActual,
                    orden: 1
                };
                this.iestdeskService.consultas(params)
                .subscribe(respTemas => {
                    for(let tema of respTemas) {
                        let llave = tema.idElemento != 0 ? tema.idTipoElemento + '-' + tema.idElemento : tema.idTema;
                        if(!this.elementosTemario.hasOwnProperty(llave)) {
                            this.elementosTemario[llave] = {
                                nombreTema: tema.tema,
                                elementos: [],
                                mostrar: idTema != 0 && tema.idTema == idTema
                            };
                        }

                        if (this.ordenTemas.indexOf(llave) == -1) {
                            this.ordenTemas.push(llave);
                        }
                    }

                    for (let elemento of resp) {
                        let llave = elemento.idTema == 0 ? elemento.idTipoElemento + '-' + elemento.idElemento : elemento.idTema;
                        this.elementosTemario[llave].elementos.push(elemento);
                    }

                    for(let llave of Object.keys(this.elementosTemario)){
                        if(this.elementosTemario[llave].elementos.length == 0 ){
                            this.elementosTemario[llave].elementos.push({
                                idElemento: 0,
                                titulo: 'No se ha asignado contenido para este tema.',
                                completo: 0,
                                favorito: 1
                            });
                        }
                    }
                });
            } else {
                for (let elemento of resp) {
                    if(!this.elementosTemario.hasOwnProperty(elemento.Mes)) {
                        this.elementosTemario[elemento.Mes] = { elementos: [], mostrar: elemento.Mes == elemento.mesActual };
                    }
                    this.elementosTemario[elemento.Mes].elementos.push(elemento);
                    if (this.ordenTemas.indexOf(elemento.Mes) == -1) {
                        this.ordenTemas.push(elemento.Mes);
                    }
                }
            }

            this.elementosCopia = null;
            this.cargando = 0;
            
            if(posicionar){
                setTimeout(() => {
                    let element = document.getElementById(idTema.toString());
                    this.scrollService.scrollTo(element);
                }, 250);
            }

            //console.log('OrdenTemas', this.elementosTemario);

        }, errors => {
            console.log(errors);
        });
    }

    cambiarOrdenacion() {
        this.ordenadoPor = !this.ordenadoPor;
        this.obtenMaterialxTema();
    }

    seleccionaTema(idTema) {
        let params = {
            servicio: "temario",
            accion: "IDesk_Temario_MaterialxTema",
            tipoRespuesta: "json",
            idCurso: this.iestdeskService.idCursoActual,
            tema: idTema
        };

        this.temarioService.consultas(params)
        .subscribe(resp => {
            this.temaActual = idTema;
            this.elementos = resp;
        }, errors => {
            console.log(errors);
        });
    }

    seleccionaElemento(elemento) {
        switch(+elemento.idTipoElemento) {
            case 1:
                this.tareasService.idTarea = elemento.idElemento;
            break;

            case 2:
                this.forosDiscService.idForoDisc = elemento.idElemento;
            break;

            case 3:
                this.apuntesService.idApunte = elemento.idElemento;
            break;

            case 5:
                this.vinculosService.idVinculo = elemento.idElemento;
            break;

            case 6:
                this.actividadesClaseService.idActividad = elemento.idElemento;
                this.actividadesClaseService.actividadClase = {
                    idTipoActividad: elemento.idTipoActividad,
                    tipoActividad: this.tiposActividad[elemento.idTipoActividad]
                }
            break;

            case 7:
                this.contenidoWebService.idContenidoWeb = elemento.idElemento;
            break;

            case 8:
                this.videosService.idVideo = elemento.idElemento;
            break;

            case 9:
                this.podcastService.idPodcast = elemento.idElemento;
            break;

            case 10:
                this.imagenesService.idImagen = elemento.idElemento;
            break;

            case 11:
                this.videoconfService.idVideoconferencia = elemento.idElemento;
            break;

            case 13:
                this.editorService.idOda = elemento.idElemento;
            break;
        }
        this.elementoActual = elemento;
    }

    alternarMes(mes) {
        this.elementosTemario[mes].mostrar = !this.elementosTemario[mes].mostrar;
    }

    alternarTema(tema) {
        if (tema.indexOf('-') == -1) {
            this.elementosTemario[tema].mostrar = !this.elementosTemario[tema].mostrar;
        }
    }

    establecerElemento(tipo, elemento, numElemento) {
        if (tipo == 1 || tipo == 3) {
            this.elementoActual = null;
            this.cargando = 1;

            setTimeout( () => {
                switch(+elemento.idTipoElemento) {
                    case 1:
                        this.tareasService.idTarea = elemento.idElemento;
                    break;
        
                    case 2:
                        this.forosDiscService.idForoDisc = elemento.idElemento;
                    break;
        
                    case 3:
                        this.apuntesService.idApunte = elemento.idElemento;
                    break;
        
                    case 5:
                        this.vinculosService.idVinculo = elemento.idElemento;
                    break;

                    case 6:
                        this.actividadesClaseService.idActividad = elemento.idElemento;
                        this.actividadesClaseService.actividadClase = {
                            idTipoActividad: elemento.idTipoActividad,
                            tipoActividad: this.tiposActividad[elemento.idTipoActividad]
                        }
                    break;

                    case 7:
                        this.contenidoWebService.idContenidoWeb = elemento.idElemento;
                    break;
                    
                    case 8:
                        this.videosService.idVideo = elemento.idElemento;
                    break;

                    case 9:
                        this.podcastService.idPodcast = elemento.idElemento;
                    break;

                    case 10:
                        this.imagenesService.idImagen = elemento.idElemento;
                    break;

                    case 11:
                        this.videoconfService.idVideoconferencia = elemento.idElemento;
                    break;

                    case 13:
                        this.editorService.idOda = elemento.idElemento;
                    break;
                }
                console.log('completado', elemento.completo);
                console.log('rol', this.iestdeskService.rolActual);

                this.elementoActual = elemento;
                this.posicionActual = numElemento;
                let llave = !this.ordenadoPor ? this.elementoActual.idTema : this.elementoActual.Mes;
                this.elementosTema = llave != 0 ? this.elementosTemario[llave].elementos : [];
                this.cargando = 0;

                this.actividadesClaseService.tipoAlta = this.elementoActual.idTipoActividad == 6 ? 1 : 2;

                if (tipo == 3) {
                    this.revisando = true;
                }
            }, 20);

        } else {
            switch(+elemento.idTemarioElemento) {
                case 1:
                    this.tareasService.idTarea = 0;
                break;
    
                case 2:
                    this.forosDiscService.idForoDisc = 0;
                break;
    
                case 3:
                    this.apuntesService.idApunte = 0;
                break;
    
                case 5:
                    this.vinculosService.idVinculo = 0;
                break;

                case 6:
                    this.actividadesClaseService.idActividad = 0;
                break;

                case 7:
                    this.contenidoWebService.idContenidoWeb = 0;
                break;

                case 8:
                    this.videosService.idVideo = 0;
                break;

                case 9:
                    this.podcastService.idPodcast = 0;
                break;

                case 10:
                    this.imagenesService.idImagen = 0;
                break;
                
                case 11:
                    this.videoconfService.idVideoconferencia = 0;
                break;

                case 13:
                    this.editorService.idOda = 0;
                break;
            }

            this.elementoActual = {
                idTipoElemento: elemento.idTemarioElemento,
                tipoElemento: elemento.nombre,
                idTipoActividad: 0
            };
        }
    }

    regresarTemario(ordenTema = false) {
        if(ordenTema){
            this.mostrarOrdenTemas = false;
            this.mostrarOrdenElementos = false;
            this.mostrarCronograma = false;
            this.obtenMaterialxTema();
        }else{
            this.cargando = 0;
            //console.log('idTema', this.elementoActual.idTema);
            this.obtenMaterialxTema(this.elementoActual.idTema, true);
            this.elementoActual = null;
            this.revisando = false;
        }
    }

    irACronograma() {
        this.mostrarCronograma = true;
        //this.router.navigate(["/cronograma"]);
    }

    irOrdenTemas(){
        this.mostrarOrdenTemas = true;
    }
   
    irOrdenElementos(tema){
        this.mostrarOrdenElementos = true;
        this.idTemaEditor = tema;
        console.log('Elementos', tema);
    }
    
    elementoSiguiente(){
        let llave = !this.ordenadoPor ? this.elementoActual.idTema : this.elementoActual.Mes;
        let posicionSiguiente = this.posicionActual + 1;

        if(posicionSiguiente < this.elementosTemario[llave].elementos.length){
            let elementoSiguiente = this.elementosTemario[llave].elementos[this.posicionActual + 1];
            this.establecerElemento(1, elementoSiguiente, posicionSiguiente);
        }
    }

    elementoAnterior(){
        let llave = !this.ordenadoPor ? this.elementoActual.idTema : this.elementoActual.Mes;
        let posicionAnterior = this.posicionActual - 1;

        if(posicionAnterior >= 0){
            let elementoAnterior = this.elementosTemario[llave].elementos[this.posicionActual - 1];
            this.establecerElemento(1, elementoAnterior, posicionAnterior);
        }
    }

    cerrarDialogConfirmacion(resp) {
        if(+resp['respuesta'] == 1){
            let params = {
                servicio: this.catalogoElementos[this.elementoEliminar.idTipoElemento].servicioEliminar,
                accion: this.catalogoElementos[this.elementoEliminar.idTipoElemento].accionEliminar,
                tipoRespuesta: "json",
                idCurso: this.iestdeskService.idCursoActual,
                idpersonidesk: this.iestdeskService.idPerson,
                [this.catalogoElementos[this.elementoEliminar.idTipoElemento].idElemento]: this.elementoEliminar.idElemento
            };
            this.temarioService.consultas(params)
            .subscribe(resp => {
                this.obtenMaterialxTema();
            }, errors => {
                console.log(errors);
            });
        }
        
        this.ngxSmartModalService.getModal('confirmacionDialog').close();
    }

    confEliminar(elemento){
        this.elementoEliminar = elemento;
        this.mensajeDialog = "¿Está seguro de que desea eliminar el elemento " + this.elementoEliminar.tipoElemento + ": " + this.elementoEliminar.titulo + "?";
        this.ngxSmartModalService.getModal('confirmacionDialog').open();
    }

    formatoFecha(fecha){
        let fechaSplit = fecha.split('-');
        return fechaSplit;
    }

    calcularPorcentajeAvance(idTema) {
        let completos = this.elementosTemario[idTema].elementos.filter(elemento => elemento.completo == 1).length;
        return {
            cantidadElementos: this.elementosTemario[idTema].elementos.length,
            elementosCompletos: completos,
            porcentaje:Math.trunc((completos / this.elementosTemario[idTema].elementos.length) * 100)
        };
    }

    nuevoTema() {
        this.modalReference = this._modalService.open(AltaTemaComponent, { backdrop: 'static' });
    }

    registrarAcceso(vinculo) {
        if (this.iestdeskService.rolActual != 1) {
            let params = {
                servicio: "idesk",
                accion: "IDesk_Accesos_RegistraAcceso",
                tipoRespuesta: "json",
                idCurso: this.iestdeskService.idCursoActual,
                idTipoModulo: 5,
                idElemento: vinculo,
                idpersonidesk: this.iestdeskService.idPerson
            };
            this.iestdeskService.consultas(params)
            .subscribe(
                resp => {
                    //console.log(resp);
                }, errors => {
                    console.log(errors);
            });
        }
    }

    agregarFavoritos(elemento){
        let params = {
            servicio: "temario",
            accion: "IDesk_Alumno_RegistraFavorito",
            tipoRespuesta: "json",
            idCurso: this.iestdeskService.idCursoActual,
            idElemento: elemento.idElemento,
            idTipoElemento: elemento.idTipoElemento,
            idpersonidesk: this.iestdeskService.idPerson,
            favorito: elemento.favorito == 0 ? 0 : 1
        };
        this.temarioService.consultas(params)
        .subscribe(resp => {
            //console.log(resp);
            elemento.favorito = elemento.favorito == 0 ? 1 : 0;

            if(this.elementosCopia){
               this.filtrarFavoritos(true);
            }
           
        }, errors => {
            console.log(errors);
        });
    }

    filtrarFavoritos(recargar = false) {
        if (!this.elementosCopia || recargar) {
            let favoritos = {};
            this.ordenCopia = this.ordenTemas;
            this.ordenTemas = [];

            for(let tema of Object.keys(this.elementosTemario)) {
                for(let elemento of this.elementosTemario[tema].elementos) {
                    if (elemento.favorito == 0) {
                        if (!favoritos.hasOwnProperty(tema)) {
                            favoritos[tema] = {
                                nombreTema: elemento.tema,
                                elementos: [],
                                mostrar: true
                            };
                        }
                        favoritos[tema].elementos.push(elemento);

                        if (this.ordenTemas.indexOf(tema) == -1) {
                            this.ordenTemas.push(tema);
                        }
                    }
                }
            }
 
            if (!this.elementosCopia) {
                this.elementosCopia = this.elementosTemario;
            }
            this.elementosTemario = favoritos;
        } else {
            this.elementosTemario = this.elementosCopia;
            this.ordenTemas = this.ordenCopia;
            this.elementosCopia = null;
        }
    }

    participarForo(elemento){
        this.forosDiscService.idForoDisc = elemento.idElemento;
        this.router.navigate(['/foro-discusion/vista']);
    }

    regresarListadoEditor(){
        this.regresaEditor.emit(true);
    }
}

