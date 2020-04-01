import { Component, ChangeDetectorRef, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Iestdesk } from '../services/iestdesk.service';
import { Vinculos } from "../services/vinculos.service";

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
    selector: 'idesk-vinculos',
    templateUrl: './vinculos.component.html'
})

export class VinculosComponent implements OnInit {
    public rolActual: number = 0;
    public vinculos = [];
    public vistaAlum = [];

    closeResult: string;
    public modalReference: any;

    public idaEliminar: number;
    public elementoEliminar: string;
    public mensaje: string;
    public tipoRespuesta: number;
    public altaVinculo = false;

    public temaActual = 0;
    
    @Input() public modoTemario;
    
    constructor(
        private _iestdesk: Iestdesk,
        private _vinculos: Vinculos,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        public ngxSmartModalService: NgxSmartModalService,
        private router: Router,
        private route: ActivatedRoute
    ){
        this.rolActual = this._iestdesk.rolActual;
        
        if ( this.rolActual == 1 ) 
            this.vinculosMaestro();
        else
            this.vinculosAlumno(0);
    }

    ngOnInit() {
        this._iestdesk.registraAcceso(22, 0);
    }

    vinculosAlumno(tipo) {
        let params = {
            servicio: "vinculos",
            accion: "IDesk_Alumno_Vinculos_Listado",
            tipoRespuesta: "json",
            idCurso: this._iestdesk.idCursoActual,
            idTema: this.temaActual
        };

        this._vinculos.consultas(params)
            .subscribe(resp => {
                if (tipo == 0){ 
                    this.vinculos = resp; 
                }else{ 
                    this.vistaAlum = resp;
                }
            },
            errors => {
                console.log(errors);
            });
    }

    vinculosMaestro() {
        let params = {
            servicio: "vinculos",
            accion: "IDesk_Maestro_Vinculos_Listado",
            tipoRespuesta: "json",
            idCurso: this._iestdesk.idCursoActual,
            idTema: this.temaActual
        };

        this._vinculos.consultas(params)
            .subscribe(resp => {
                this.vinculos = resp;
            },
            errors => {
                console.log(errors);
            });
    }

    registrarAcceso(vinculo) {
        if (this._iestdesk.rolActual != 1) {
            let params = {
                servicio: "idesk",
                accion: "IDesk_Accesos_RegistraAcceso",
                tipoRespuesta: "json",
                idCurso: this._iestdesk.idCursoActual,
                idTipoModulo: 5,
                idElemento: vinculo,
                idpersonidesk: this._iestdesk.idPerson
            };
            this._iestdesk.consultas(params)
            .subscribe(
                resp => {
                    //console.log(resp);
                }, errors => {
                    console.log(errors);
                });
        }
        
        this._iestdesk.registraAcceso(22, vinculo);
    }

    irAltaVinculo( idVinculo ) {
        this._vinculos.idVinculo = idVinculo;
        this.altaVinculo = true;
    }

    regresarListado(){
        this.altaVinculo = !this.altaVinculo;
    }

    regresarListadoActualizado(){
        this.altaVinculo = !this.altaVinculo;

        if ( this.rolActual == 1 ){
            this.vinculosMaestro();
        }else{
            this.vinculosAlumno(0);
        }
    }

    dialogoAlumno(content) {
        this.vinculosAlumno(1);
        this.chRef.detectChanges();
        this.modalReference = this.modalService.open(content);
    }

    altaCerrada(cerrado) {
        if(cerrado == 1) {
            if ( this.rolActual == 1 ){
                this.altaVinculo = !this.altaVinculo;
                this.vinculosMaestro();
            }
        }
    }

    confirmaEliminaVinculo(idVinculo, titulo) {
        this.elementoEliminar = titulo;
        this.idaEliminar = idVinculo;
        this.ngxSmartModalService.getModal('confirmarEliminacion').open();
    }

    confirmarCerrado(resp) {
        this.ngxSmartModalService.getModal('confirmarEliminacion').close();
        if ( resp != 0 ) {
            let params = {
                servicio: "vinculos",
                accion: "IDesk_Maestro_Vinculos_Elimina",
                tipoRespuesta: "json",
                idVinculo: this.idaEliminar, 
                idCurso: this._iestdesk.idCursoActual,
                idpersonidesk: this._iestdesk.idPerson
            };

            this._vinculos.consultas(params)
                .subscribe(resp => {
                    this.mensaje = resp[0].mensaje;
                    this.chRef.detectChanges();
                    this.idaEliminar = 0;
                    if ( resp[0].error == 0 )
                        this.tipoRespuesta = 1;
                    else {
                        this.tipoRespuesta = 2;
                        this.ngxSmartModalService.getModal('dialogoInformacion').open();
                    }
                    this.vinculosMaestro();
                },
                errors => {
                    console.log(errors);
                });
        }
    }

    cierraDialogoInfo(resp) {
        this.ngxSmartModalService.getModal('dialogoInformacion').close();
    }
}