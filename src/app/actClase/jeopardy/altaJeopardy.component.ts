import { Component, ChangeDetectorRef, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators, FormBuilder, FormGroup} from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

import { NgbModal, NgbActiveModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

import { Iestdesk } from '../../services/iestdesk.service';
import { AltasBase } from '../../shared/classes/altasBase';
import { ActividadesClase } from '../../services/actividadesClase.service';
import { Equipos } from '../../services/equipos.service';
import { Rubricas } from '../../services/rubricas.service';

import { ModalAltaReactivoComponent } from '../../banco/modal-alta-reactivos.component';

import { NgxSmartModalService } from 'ngx-smart-modal';
import { EditorService } from '../../services/editorService.service';


@Component({
    selector: "alta-jeopardy",
    templateUrl: "./altaJeopardy.component.html"
})
export class AltaJeopardyComponent extends AltasBase implements OnInit {

    modalReference: any;
    modalOption: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false
    };
    
    @Input() public modoTemario = false;
    
    public rolActual: number = 0;
    public idActividad;
    public objectKeys = Object.keys;

    public categoriasPreguntasRespuestas = [];
    public preguntasIniciales = {};

    public coloresCategorias = [
        "verde",
        "morado",
        "amarillo",
        "azul",
        "rojo"
    ];

    public accionDialogo = 1;
    public imagenDialog = 0;
    public tituloActividad = "";
    public reactivosSeleccionados = [];
    public rutaListado;

    constructor(
        public iestdesk: Iestdesk,
        private actividadesClase: ActividadesClase,
        private equipos: Equipos,
        private rubricas: Rubricas,
        private _formBuilder: FormBuilder,
        private _chRef: ChangeDetectorRef,
        private _modalService: NgbModal,
        private router: Router,
        private route: ActivatedRoute,
        private sanitized: DomSanitizer,
        private _ngxSmartModalService:NgxSmartModalService,
        public editorService: EditorService
    ) {
        super(iestdesk,
            equipos,
            rubricas,
            _formBuilder,
            _chRef,
            _modalService,
            _ngxSmartModalService,
            router);
        
        this.idActividad = this.actividadesClase.idActividad;        
        this.rutaListado = "/actividades-clase";

        if (this.idActividad == 0) {
            this.fechaPublicacionSeleccionada = new Date();
            this.fechaCierreSeleccionada = new Date();
            this.modalidadTrabajoSeleccionada = 2;
            this.idPlantillaSolicitada = -1;
            this.agrupar();
            this.inicializarFormulario();
        } else {
            this.consultaJeopardy();
        }
    }

    ngOnInit() {
        this.iestdesk.registraAcceso(42, this.idActividad);
    }

    inicializarFormulario() {
        for(let i = 0; i < 3; i++) {
            this.agregarCategoria();
        }
    }

    consultaJeopardy() {
        let params = {
            servicio: "actividadesClase",
            accion: "IDesk_ActividadesClase_ConsultaJeopardy",
            tipoRespuesta: "json",
            idActividad: this.idActividad
        };

        this.actividadesClase.consultas(params)
        .subscribe(resp => {

            this.tituloActividad = resp[0].titulo;

            //Construye la relación de preguntas con categorías
            let categoriasPreguntas = {};
            for (let pregunta of resp) {
                if (!categoriasPreguntas.hasOwnProperty(pregunta.categoria)) {
                    categoriasPreguntas[pregunta.categoria] = [];
                }
                categoriasPreguntas[pregunta.categoria].push({
                    idReactivo: pregunta.idReactivo,
                    reactivo: pregunta.reactivo,
                    tema: pregunta.tema
                });
                this.reactivosSeleccionados.push(pregunta.idReactivo);
            }

            //Construye el objeto final para editarlo en el DOM
            for(let categoria of Object.keys(categoriasPreguntas)) {
                this.categoriasPreguntasRespuestas.push({
                    categoria: categoria,
                    preguntas: categoriasPreguntas[categoria]
                });
            }

            this.cargaElementos("", resp[0].fechaPublicacionISO, resp[0].fechaCierreISO, 2, resp[0].idPlantillaEquipos );
            this.agrupar();
        }, errors => {
            console.log(errors);
        });
    }

    validaActividad() {
        let valido = true;
        let categoriasPreguntas = [];
        let preguntas = [];
        
        validacion:
        for(let categoria of this.categoriasPreguntasRespuestas) {
            if (categoria.categoria == "") {
                valido = false;
                break validacion;
            }

            for(let pregunta of categoria.preguntas) {
                if (pregunta.idReactivo == 0) {
                    valido = false;
                    break validacion;
                }
                preguntas.push(pregunta.idReactivo);
            }

            categoriasPreguntas.push(categoria.categoria + "<:>" + preguntas.join("<$>"));

            preguntas = [];
        }

        this.limpiaVariables();
        let validacionPublicacion = this.publicacionCursos();

        if(this.tituloActividad != "" && valido){
            if (validacionPublicacion) {
                this.altaEdicionJeopardy(categoriasPreguntas.join("<|>"));
            } else {
                this.guardado = false;
                this.ngxSmartModalService.getModal('dialogJeopardy').open();
            }
        } else {
            this.guardado = false;
            this.mensajeDialog = "Debe capturar todas las categorias y preguntas del tablero.";
            this.ngxSmartModalService.getModal('dialogJeopardy').open();
        }
    }

    altaEdicionJeopardy(categoriasPreguntas) {
        let params = {
            servicio: "actividadesClase",
            accion: this.idActividad == 0 ? "IDesk_ActividadesClase_AltaJeopardy" : "IDesk_ActividadesClase_EdicionJeopardy",
            tipoRespuesta: "json",
            idActividad: this.idActividad,
            titulo: this.tituloActividad,
            categoriasPreguntas: categoriasPreguntas,
            idCurso: this.idCursosPub.join("|"),
            fechaPublicacion: this.fechaPublicacion.join("|"),
            fechaCierre: this.fechaCierre.join("|"),
            idModTrabajo: 2,
            idPlantillaEquipos: this.idPlantillaSolicitada,
            idpersonidesk: this.iestdesk.idPerson
        };
        this.actividadesClase.consultas(params)
        .subscribe(resp => {
            //console.log("Alta correcta");
            this.imagenDialog = 0;
            this.guardado = true;
            this.mensajeDialog = "Actividad de clase agregada correctamente";
            this.ngxSmartModalService.getModal('dialogoInformacion').open();
        }, errors => {
            console.log(errors);
        });
    }

    elegirPregunta(categoria, pregunta) {
        this.modalReference = this._modalService.open(ModalAltaReactivoComponent, this.modalOption);

        this.modalReference
        .result.then(result => {
            if (result) {
                if (this.categoriasPreguntasRespuestas[categoria].preguntas[pregunta].idReactivo != result.idReactivo) {
                    if (this.reactivosSeleccionados.indexOf(this.categoriasPreguntasRespuestas[categoria].preguntas[pregunta].idReactivo) != -1) {
                        this.reactivosSeleccionados.splice(this.reactivosSeleccionados.indexOf(this.categoriasPreguntasRespuestas[categoria].preguntas[pregunta].idReactivo), 1);
                    }
                    this.reactivosSeleccionados.push(result.idReactivo);
                    //console.log(this.reactivosSeleccionados);
                }
                this.categoriasPreguntasRespuestas[categoria].preguntas[pregunta] = result;
                //console.log(this.categoriasPreguntasRespuestas[categoria].preguntas[pregunta]);
            }
        });

        this.modalReference.componentInstance.parametros = {
            tipoAlta: 1,
            categoria: categoria,
            pregunta: pregunta,
            idReactivo: this.categoriasPreguntasRespuestas[categoria].preguntas[pregunta].idReactivo,
            reactivo: this.categoriasPreguntasRespuestas[categoria].preguntas[pregunta].reactivo,
            tema: this.categoriasPreguntasRespuestas[categoria].preguntas[pregunta].tema,
            reactivosSeleccionados: this.reactivosSeleccionados
        };
    }

    agregarCategoria() {
        let categorias = this.categoriasPreguntasRespuestas.length != 0 ? this.categoriasPreguntasRespuestas[0].preguntas.length : 3;
        this.categoriasPreguntasRespuestas.push({
            categoria: "",
            preguntas: []
        });
    
        for(let j = 0; j < categorias; j++) {
            this.categoriasPreguntasRespuestas[this.categoriasPreguntasRespuestas.length - 1].preguntas.push({
                idReactivo: 0,
                reactivo: "",
                tema: 0
            });
        }
    }

    agregarNivel(){
        for(let i = 0; i < this.categoriasPreguntasRespuestas.length; i++) {
            this.categoriasPreguntasRespuestas[i].preguntas.push({
                idReactivo: 0,
                reactivo: "",
                tema: 0
            });
        }
    } 

    quitarCategoria() {
        let contenido = false;
        for(let pregunta of this.categoriasPreguntasRespuestas[this.categoriasPreguntasRespuestas.length - 1].preguntas) {
            if (pregunta.idReactivo != 0) {
                contenido = true;
                break;
            }
        }
        if (contenido) {
            this.mensajeDialog = "Tiene preguntas seleccionadas, ¿Desea eliminar la categoría?";
            this.ngxSmartModalService.getModal('dialogJeopardy').open();
        } else {
            this.categoriasPreguntasRespuestas.pop();
        }
    }

    quitarNivel() {
        //TODO: Poner confirmación si hay preguntas en el nivel
        for(let i = 0; i < this.categoriasPreguntasRespuestas.length; i++){
            this.categoriasPreguntasRespuestas[i].preguntas.pop();
        }
    }

    cerrarDialogJeopardy(resp) {
        this.ngxSmartModalService.getModal('dialogJeopardy').close();
    }
}