import { Component, ChangeDetectorRef, Input, OnInit } from '@angular/core';
import { AltasBase } from '../../shared/classes/altasBase';
import { Iestdesk } from '../../services/iestdesk.service';
import { ActividadesClase } from '../../services/actividadesClase.service';
import { Equipos } from '../../services/equipos.service';
import { Rubricas } from '../../services/rubricas.service';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ModalAltaReactivoComponent } from '../../banco/modal-alta-reactivos.component';
import { EditorService } from '../../services/editorService.service';

@Component({
    selector:"alta-ruleta",
    templateUrl:"./altaRuleta.component.html"
})
export class AltaRuletaComponent extends AltasBase implements OnInit {

    public modalReference: any;
    public modalOption: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false
    };
    
    public imagenDialog = 1;
    public mensajeDialog = "";
    public accionDialog = 1;
    public objectKeys = Object.keys;
    
    public idActividad = 0;
    public preguntasRespuestas = [];
    public reactivosSeleccionados = [];
    public tituloActividad = "";
    
    @Input() public modoTemario = false;
    
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
        public _ngxSmartModalService: NgxSmartModalService,
        public editorService: EditorService
    ){
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
            this.agregarReactivo();
        } else {
            this.consultaRuleta();
        }
    }

    ngOnInit() {
        this.iestdesk.registraAcceso(43, this.idActividad);
    }

    consultaRuleta() {
        let params = {
            servicio: "actividadesClase",
            accion: "IDesk_ActividadesClase_ConsultaRuleta",
            tipoRespuesta: "json",
            idActividad: this.idActividad
        };

        this.iestdesk.consultas(params)
        .subscribe(resp => {
            this.tituloActividad = resp[0].titulo;
            this.preguntasRespuestas = resp;
            for (let pregunta of this.preguntasRespuestas) {
                this.reactivosSeleccionados.push(pregunta.idReactivo);
            }
            this.agregarReactivo();
            this.cargaElementos("", resp[0].fechaPublicacionISO, resp[0].fechaCierreISO, 2, resp[0].idPlantillaEquipos );
            this.agrupar();
        }, errors => {
            console.log(errors);
        });
    }
    
    agregarReactivo(){
        this.preguntasRespuestas.push({
            idReactivo: 0,
            reactivo: "",
            tema: 0
        });
    }
    
    altaReactivo(numPregunta){
        this.modalReference = this._modalService.open(ModalAltaReactivoComponent, this.modalOption);
        
        this.modalReference
        .result.then(result => {
            if (result) {
                if (this.preguntasRespuestas[numPregunta].idReactivo != result.idReactivo) {
                    if (this.reactivosSeleccionados.indexOf(this.preguntasRespuestas[numPregunta].idReactivo) != -1) {
                        this.reactivosSeleccionados.splice(this.reactivosSeleccionados.indexOf(this.preguntasRespuestas[numPregunta].idReactivo), 1);
                    }
                    this.reactivosSeleccionados.push(result.idReactivo);
                }
                
                //Si no edición de pregunta agrega nuevo reactivo.
                if(this.preguntasRespuestas[numPregunta].idReactivo == 0){
                    this.agregarReactivo();
                }

                this.preguntasRespuestas[numPregunta] = result;
            }
        });

        this.modalReference.componentInstance.parametros = {
            tipoAlta: 2,
            pregunta: numPregunta,
            idReactivo: this.preguntasRespuestas[numPregunta].idReactivo,
            reactivo: this.preguntasRespuestas[numPregunta].reactivo,
            tema: this.preguntasRespuestas[numPregunta].tema,
            reactivosSeleccionados: this.reactivosSeleccionados
        };
    }
    
    quitarReactivo(numPregunta){
        if(this.reactivosSeleccionados.indexOf(this.preguntasRespuestas[numPregunta].idReactivo) != -1){
            this.reactivosSeleccionados.splice(this.reactivosSeleccionados.indexOf(this.preguntasRespuestas[numPregunta].idReactivo), 1);
            this.preguntasRespuestas.splice(numPregunta,1);

            /*this.mensajeDialog = "Reactivo Eliminado Correctamente";
            this.accionDialog = 1;
            this.ngxSmartModalService.getModal('dialogRuleta').open();*/
        }
    }
  
    validaActividad(){
        let valido = true;
        let reactivos = [];
        let validacionPublicacion;
        
        if(this.preguntasRespuestas.length <= 1 ){
            valido = false;
        }else{
            for(let i = 0; i < this.preguntasRespuestas.length - 1; i++){
               if( this.preguntasRespuestas[i].idReactivo == 0){
                    valido = false;
                    break;
               }

               reactivos.push(this.preguntasRespuestas[i].idReactivo);
            }
            
            validacionPublicacion = this.publicacionCursos();
        }

        if(this.tituloActividad != "" && valido){
            if (validacionPublicacion) {
                this.altaEdicionRuleta(reactivos.join("<$>"));
            } else {
                this.ngxSmartModalService.getModal('dialogoInformacion').open();
            }
        } else {
            this.imagenDialog = 1;
            this.mensajeDialog = "Debe capturar el titulo y todos los campos de reactivo para realizar registro.";
            this.guardado = false;
            this.ngxSmartModalService.getModal('dialogoInformacion').open();
        }
    }
    
    altaEdicionRuleta(preguntas){
        let params = {
            servicio: "actividadesClase",
            accion: this.idActividad == 0 ? "IDesk_ActividadesClase_AltaRuleta" : "IDesk_ActividadesClase_EdicionRuleta",
            tipoRespuesta: "json",
            idActividad: this.actividadesClase.idActividad,
            titulo: this.tituloActividad,
            preguntas: preguntas,
            idCurso: this.idCursosPub.join("|"),
            fechaPublicacion: this.fechaPublicacion.join("|"),
            fechaCierre: this.fechaCierre.join("|"),
            idModTrabajo: 2,
            idPlantillaEquipos: this.idPlantillaSolicitada,
            idpersonidesk: this.iestdesk.idPerson
        };
        this.actividadesClase.consultas(params)
        .subscribe(resp => {
            this.limpiaVariables();
            this.imagenDialog = 0;
            this.mensajeDialog = "Actividad de clase agregada correctamente";
            this.accionDialog = 2;
            this.guardado = true;
            this.ngxSmartModalService.getModal('dialogoInformacion').open();
        }, errors => {
            console.log(errors);
        });
    }
    
}

