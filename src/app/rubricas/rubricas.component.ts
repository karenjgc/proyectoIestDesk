import { Component, ChangeDetectorRef, ElementRef, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as $ from 'jquery';

import { Iestdesk } from '../services/iestdesk.service';
import { Rubricas } from "../services/rubricas.service";

import { NgxSmartModalService } from 'ngx-smart-modal';
import { DTTRADUCCION } from '../shared/dttraduccion';

@Component({
    selector: 'idesk-rubricas',
    templateUrl: './rubricas.component.html'
})

export class RubricasComponent implements OnInit {
    public rubricas = [];
    dataTable: any;
    public rolActual: number;

    public elementoEliminar: string;
    public idaEliminar: number;
    public eliminado: boolean = false;

    public mensaje: string;
    public tipoRespuesta: number;

    constructor(
        private _iestdesk: Iestdesk,
        private _rubricas: Rubricas,
        private chRef: ChangeDetectorRef,
        private elRef: ElementRef,
        public ngxSmartModalService: NgxSmartModalService,
        private router: Router,
        private route: ActivatedRoute
    ){
        this.listadoRubricas();
        this.rolActual = this._iestdesk.rolActual;
    }

    ngOnInit() {
        this._iestdesk.registraAcceso(37, 0);
    }

    listadoRubricas(){
        let params = {
            servicio: "rubricas",
            accion: "IDesk_Maestro_Rubricas_ListadoInicial",
            tipoRespuesta: "json",
            idpersonidesk: this._iestdesk.idPerson
        };

        this._rubricas.consultas(params)
            .subscribe(resp => {
                if (this.dataTable) {
                    this.dataTable.destroy();
                }

                this.rubricas = resp;
                this.chRef.detectChanges();

                const table: any = $('table');
                this.dataTable = table.DataTable({
                    "aaSorting": [], //Desactiva la ordenación inicial
                    "language": DTTRADUCCION,
                    "dom": '<"row table-header align-items-center"<"col new-rubrica-area"><"col text-center"f><"col"<"row"<"col-9 text-right"i><"col-3"p>>>><"clear">',
                    "pagingType": "simple",
                    "columnDefs": [
                        { orderable: false, targets: 0 }
                    ]
                });
                const nuevaTarea: any = $('.new-rubrica-area');
                nuevaTarea.html('<a id="agregarRubrica" class="white-link"><span class="fa-layers fa-fw"><i class="fas fa-circle"></i><i class="fa-inverse fas fa-plus" data-fa-transform="shrink-6" style="color:#D5853E;"></i></span> <span>Agregar Rúbrica IEST</span></a>');

                this.chRef.detectChanges();
                this.elRef.nativeElement.querySelector('#agregarRubrica').addEventListener('click', this.nuevaRubrica.bind(this));
            },
            errors => {
                console.log(errors);
            });
    }

    nuevaRubrica() {
        this._rubricas.idRubrica = 0;
        this.router.navigate(['/rubricas-iest/nueva']);
    }

    gotoRubrica(idRubrica) {
        this._rubricas.idRubrica = idRubrica;
        this.router.navigate(['/rubricas-iest/vista']);
    }

    gotoEditar(idRubrica){
        let params = {
            servicio: "rubricas",
            accion: "IDesk_Rubrica_VerificaUso",
            tipoRespuesta: "json",
            idRubrica: idRubrica
        };

        this._rubricas.consultas(params)
            .subscribe(resp => {
                if ( resp[0].usada == 1 ) {
                    this.tipoRespuesta = 2;
                    this.mensaje = 'La rúbrica ya fue usada para revisión, por lo tanto no puede ser editada';
                    this.ngxSmartModalService.getModal('dialogoInformacion').open();
                } else {
                    this._rubricas.idRubrica = idRubrica;
                    this.router.navigate(['/rubricas-iest/nueva']);
                }
            },
            errors => {
                console.log(errors);
            }); 
    }

    confEliminar(idRubrica, titulo){
        this.elementoEliminar = titulo;
        this.idaEliminar = idRubrica;
        this.ngxSmartModalService.getModal('confirmarEliminacion').open();
    }

    confirmarCerrado(resp) {
        if( resp == 1 )
            this.eliminaApunte()
        else
            this.idaEliminar = 0;
        
        this.ngxSmartModalService.getModal('confirmarEliminacion').close();
    }

    eliminaApunte(){
        let params = {
            servicio: "rubricas",
            accion: "IDesk_Maestro_Rubricas_Elimina",
            tipoRespuesta: "json",
            idRubrica: this.idaEliminar, 
            idpersonidesk: this._iestdesk.idPerson
        };

        this._rubricas.consultas(params)
            .subscribe(resp => {
                this.mensaje = resp[0].mensaje;
                if(resp[0].error == 0){
                    this.tipoRespuesta = 1;
                    this._rubricas.idRubrica = 0;
                    this.eliminado = true;
                } else {
                    this.tipoRespuesta = 2;
                }
                this.ngxSmartModalService.getModal('dialogoInformacion').open();
            },
            errors => {
                console.log(errors);
            });
    }

    cierraDialogoInfo(resp) {
        if(this.eliminado) this.listadoRubricas();
        this.ngxSmartModalService.getModal('dialogoInformacion').close();
       
    }
}