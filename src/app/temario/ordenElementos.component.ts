import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Iestdesk } from '../services/iestdesk.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
    selector: 'idesk-ordenElementos',
    templateUrl: './ordenElementos.component.html'
})

export class OrdenElementosComponent implements OnInit {
    @Input() public idTema;
    public objectKeys = Object.keys;

    public elementosObj;

    public guardado: boolean = false;
    public mensaje: string;
    public tipoRespuesta: number;
    public enMovimiento: boolean = false;
    public elementoEliminar;
    public modalReference;
    public mensajeDialog = "";

    constructor(
        public _iestdesk: Iestdesk,
        public modalService: NgbModal,
        public ngxSmartModalService: NgxSmartModalService
    ){ 
    
    }

    ngOnInit(){
        this.obtenerElementos();
    }
    
    obtenerElementos(){
        let params = {
            servicio: "temario",
            accion: "IDesk_Temario_ElementosTemaEditor",
            tipoRespuesta: "json",
            idCurso: this._iestdesk.idCursoActual,
            idTema: this.idTema
        };
        this._iestdesk.consultas(params) 
            .subscribe(resp => {
                this.elementosObj = [];

                if(resp.length > 0){
                    let index = 1;
                    for(let elemento of resp){
                        this.elementosObj.push({
                            numElemento: index,
                            elemento: elemento,
                            seleccionado: false,
                            edicion: 0
                        });
            
                        index++;
                    }
                }
            },
            errors => {
                console.log(errors);
            });
    }
    
    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.elementosObj, event.previousIndex, event.currentIndex);
        let params = {
            servicio: "temario",
            accion: 'IDesk_Temario_ActualizarOrdenElementos',
            tipoRespuesta: "json",
            idCurso: this._iestdesk.idCursoActual,
            idTema: this.idTema,
            cadenaElementos: this.elementosObj.map(e => e.elemento.idElemento).join("|")
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
}