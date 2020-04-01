import { Component, ChangeDetectorRef, ElementRef, Output, EventEmitter } from '@angular/core';
import { Iestdesk } from '../services/iestdesk.service';
import { Temario } from "../services/temario.service";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AltaTemaComponent } from './altaTema.component';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { Alert } from 'selenium-webdriver';

@Component({
    selector: 'idesk-ordenTemas',
    templateUrl: './ordenTemas.component.html'
})

export class OrdenTemasComponent {
    @Output() idTema = new EventEmitter();

    public objectKeys = Object.keys;
    public temas;
    
    public cargando;
    public guardado: boolean = false;
    public mensaje: string;
    public tipoRespuesta: number;
    public enMovimiento: boolean = false;
    public elementoEliminar;
    public modalReference;
    public mensajeDialog = "";
    public mostrarWarning = true;

    constructor(
        private _iestdesk: Iestdesk,
        private _temario: Temario,
        public modalService: NgbModal,
        private chRef: ChangeDetectorRef,
        private elRef: ElementRef,
        public ngxSmartModalService: NgxSmartModalService,
    ){ 
        this.obtenTemas();

        this._iestdesk.obtenerActualizacion().subscribe(
            resp => {
                console.log(resp);
                if (resp) {
                    this.obtenTemas();
                }
            }
        );
    }
    
    obtenTemas() {
        let params = {
            servicio: "idesk",
            accion: "IDesk_Maestro_Temario_Cursos_Listado",
            tipoRespuesta: "json",
            idCursos: this._iestdesk.idCursoActual,
            orden: 1
        };
        this.cargando = true;
        this._iestdesk.consultas(params) 
            .subscribe(resp => {
                console.log('temas', resp);
                this.temas = [];

                for(let tema of resp){
                    this.temas.push({
                        tema: tema,
                        seleccionado: false,
                        edicion: 0,
                        cantidadElementos: tema.cantidadElementos
                    });
                }

                this.cargando = false;
                
            },
            errors => {
                console.log(errors);
            });
    }

    editaTema(tema){
        this._iestdesk.tema = tema;
        this.modalReference = this.modalService.open(AltaTemaComponent, { backdrop: 'static' }).result
        .then(resp => {
            console.log(resp);
        });
    }

    eliminaTema(tema){
        this.elementoEliminar = tema;
        this.mensajeDialog = "¿Está seguro de que desea eliminar el tema " + tema.tema + "?";
        this.ngxSmartModalService.getModal('confirmacionDialogOrden').open();
    }

    cerrarDialogConfirmacion(resp) {
        if(+resp['respuesta'] == 1){
            let params = {
                servicio: "temario",
                accion: 'IDesk_Temario_Elimina_Tema',
                tipoRespuesta: "json",
                tema: this.elementoEliminar.idTema,
                idpersonidesk: this._iestdesk.idPerson
            };
            this._iestdesk.consultas(params) 
            .subscribe(resp => {
                if(+resp[0].error == 0){
                    
                    this.obtenTemas();

                }else{
                    console.log('Error:', resp[0].error);
                }
            },
            errors => {
                console.log(errors);
            });
        }  

        this.ngxSmartModalService.getModal('confirmacionDialogOrden').close();

    }

    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.temas, event.previousIndex, event.currentIndex);
        let params = {
            servicio: "temario",
            accion: 'IDesk_Temario_ActualizaOrdenTemas',
            tipoRespuesta: "json",
            idCurso: this._iestdesk.idCursoActual,
            cadenaTemas:  this.temas.map(e => e.tema.idTema).join("|")
        };
        this.enMovimiento = true;
        this._iestdesk.consultas(params) 
        .subscribe(resp => {
            if(+resp[0].error == 0){
                this.enMovimiento = false;
            }else{
                console.log('Error:', resp[0].error);
            }
        },
        errors => {
            console.log(errors);
        });
    }

    cerrarWarning(alert: Alert){
        this.mostrarWarning = !this.mostrarWarning;
    }
}