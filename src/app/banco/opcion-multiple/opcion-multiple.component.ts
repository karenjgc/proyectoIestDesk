import { Component, Input, Output, EventEmitter } from "@angular/core";

import { FroalaOptions } from '../../shared/iestdesk/froala';
import { ActividadesClase } from "../../services/actividadesClase.service";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Iestdesk } from "../../services/iestdesk.service";
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { NgxSmartModalService } from "ngx-smart-modal";

@Component({
    selector: "opcion-multiple",
    templateUrl: "./opcion-multiple.component.html"
})
export class OpcionMultipleComponent {

    // Configuración de Froala
    opcFroala = new FroalaOptions();
    options: Object = this.opcFroala.opcionesSimple;

    public respuestas = ["", "", "", ""];
    public pregunta = "";
    public respuestaCorrecta;
    public retroPositiva = "";
    public retroNegativa = "";
    public opciones;
    public reactivoSeleccionado = {
        reactivo: "",
        idReactivo: 0,
        tema: 0
    };
    public mensajeDialog= "";
    @Input() public tipo;
    @Input() public tema;
    @Input() public parametros;
    @Output() cambioTipo = new EventEmitter();

    constructor(
        private actividadClaseService: ActividadesClase,
        private iestdesk: Iestdesk,
        private activeModal: NgbActiveModal,
        private _ngxSmartModalService: NgxSmartModalService
    ) {
        this.iestdesk.obtenerTemaActual()
        .subscribe(resp => {
            //console.log('Parametros recibidos', this.parametros);

            this.tema = this.parametros.tema != 0 ? this.parametros.tema : resp;
            //console.log("Parametros: ", this.parametros.tema);
            //console.log("Resp: ", this.parametros.tema);
            //console.log("Tema: ", this.tema);
            this.obtenerReactivosTema();
        });
    }

    validarFormulario() {
        if (this.tipo == 1) {
            if (this.reactivoSeleccionado.idReactivo != 0 && this.reactivoSeleccionado.idReactivo != undefined) {
                this.activeModal.close(this.reactivoSeleccionado);
            } else {
                this.mensajeDialog = "Debe seleccionar una pregunta para asignarla a la categoría";
                this._ngxSmartModalService.getModal('confirmacionDialogBanco').open();
            }
        } else {
            let respuestasValidas = this.respuestas.filter(respuesta => respuesta != "");

            if (respuestasValidas.length == this.respuestas.length && this.pregunta != "" && this.tema && this.respuestaCorrecta != undefined && this.retroNegativa != "" && this.retroPositiva != "") {
                this.altaReactivoOpcMultiple();
            } else {
                this.mensajeDialog = "Debe capturar todos los campos antes de guardar la pregunta";
                this._ngxSmartModalService.getModal('confirmacionDialogBanco').open();
            }
        }
    }

    altaReactivoOpcMultiple() {
        let param = {
            servicio: "banco",
            accion: "IDesk_Banco_AltaReactivo_OpcionMultiple",
            tipoRespuesta: "json",
            tema: this.tema,
            enunciado: this.pregunta,
            retroAcierto: this.retroPositiva,
            retroError: this.retroNegativa,
            respuestas: this.respuestas.join("|"),
            respuestaCorrecta: (this.respuestaCorrecta + 1),
            idpersonidesk: this.iestdesk.idPerson
        };

        this.actividadClaseService.consultas(param)
        .subscribe(resp => {
            this.mensajeDialog = "Alta correcta";
            this._ngxSmartModalService.getModal('confirmacionDialogBanco').open();

            this.tipo = 1;
            this.cambioTipo.emit(this.tipo.toString());
            this.reactivoSeleccionado = {
                reactivo: resp[resp.length - 1].reactivo,
                idReactivo: resp[resp.length - 1].idExamenOpcMultiple,
                tema: this.tema
            };
            this.construirObjeto(resp);
        }, error => {
            console.log(error);
        });
    }

    cambiarRespuesta(respuesta) {
        this.respuestaCorrecta = respuesta;
    }

    cerrarModal(){
        this.activeModal.close(false);
    }

    cerrarDialogConfirmacion(resp){
        this._ngxSmartModalService.getModal('confirmacionDialogBanco').close();
    }

    obtenerReactivosTema() {
        let param = {
            servicio: "banco",
            accion: "IDesk_Banco_ListadoReactivos_OpcMultiple",
            tipoRespuesta: "json",
            tema: this.tema,
            idpersonidesk: this.iestdesk.idPerson
        };

        this.actividadClaseService.consultas(param)
        .subscribe(resp => {
            this.construirObjeto(resp);
            if (this.parametros.reactivo != "") {
                this.reactivoSeleccionado = {
                    reactivo: this.parametros.reactivo,
                    idReactivo: this.parametros.idReactivo,
                    tema: this.parametros.tema
                };
            }
        });
    }

    construirObjeto(resp) {
        this.opciones = {};
        for (let respuesta of resp) {
            if (!this.opciones.hasOwnProperty(respuesta.reactivo)) {
                this.opciones[respuesta.reactivo] = [];
            }
            this.opciones[respuesta.reactivo].push(respuesta);
        }
    }

    alternarTipo() {
        this.tipo = 2
        this.cambioTipo.emit(this.tipo.toString());
    }
    
    search = (text$: Observable<string>) => 
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            map(term => {
                let preguntas = Object.keys(this.opciones).filter( v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10);
                let objPreguntas = [];

                for (let reactivo of preguntas) {
                    if (this.parametros.reactivosSeleccionados.indexOf(this.opciones[reactivo][0].idExamenOpcMultiple) == -1) {
                        objPreguntas.push({
                            reactivo: reactivo,
                            idReactivo: this.opciones[reactivo][0].idExamenOpcMultiple,
                            tema: this.tema
                        });
                    }
                }

                return objPreguntas;
            })
    );

    formatter = (x) => {
        let element = document.createElement('div');

        element.innerHTML = x.reactivo;

        return element.textContent;
    };
}