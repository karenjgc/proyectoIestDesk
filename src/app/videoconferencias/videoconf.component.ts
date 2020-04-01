import { Component, ChangeDetectorRef, ElementRef, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';

import { Iestdesk } from '../services/iestdesk.service';
import { Videoconferencia } from "../services/videoconferencia.service";

import { NgxSmartModalService } from 'ngx-smart-modal';
import { DTTRADUCCION } from '../shared/dttraduccion';

@Component({
    selector: 'idesk-videoconferencias',
    templateUrl: './videoconf.component.html'
})

export class VideoconferenciasComponent implements OnInit {
    public rolActual: number = 0;
    public videoconferencias: any[];
    dataTable: any;

    public elementoEliminar: string;
    public idaEliminar: number;

    public mensaje: string;
    public tipoRespuesta: number;
	
    constructor(
        private _iestdesk: Iestdesk,
        private _videoconf: Videoconferencia,
        private chRef: ChangeDetectorRef,
        private elRef: ElementRef,
        public ngxSmartModalService: NgxSmartModalService,
        private router: Router,
        private route: ActivatedRoute
    ){
        this.rolActual = this._iestdesk.rolActual;
        this._videoconf.idVideoconferencia = 0;
    }

    ngOnInit() {
        this._iestdesk.registraAcceso(38, 0);
        if (this._iestdesk.rolActual == 1) this.videoconfMaestro(0);
        else this.videoconfAlumno();
    }

    videoconfMaestro(ini) {
        let params = {
            servicio: "videoconferencia",
            accion: (this._iestdesk.rolActual == 1) ? "IDesk_Maestro_Videoconferencias_Listado" : "IDesk_Alumno_Videoconferencias_Listado",
            tipoRespuesta: "json",
            idCurso: this._iestdesk.idCursoActual
        };

        this._videoconf.consultas(params)
            .subscribe(resp => {
                if (this.dataTable) {
                    this.dataTable.destroy();
                }

                this.videoconferencias = resp;
                this.chRef.detectChanges();
                
                const table: any = $('table');
                this.dataTable = table.DataTable({
                    "aaSorting": [], //Desactiva la ordenación inicial
                    "language": DTTRADUCCION,
                    "dom": '<"row table-header align-items-center"<"col new-videoconf-area"><"col text-center"f><"col"<"row"<"col-9 text-right"i><"col-3"p>>>><"clear">',
                    "pagingType": "simple",
                    "columnDefs": [
                        {
                            orderable: false,
                            targets: 0,
                        },
                        {
                            render: function(data, type) {
                                if (type == 'sort') {
                                    let date = new Date(data.split("/")[2] + '-' + data.split("/")[1] + '-' + data.split("/")[0]);
                                    let d = date.valueOf();
                                    return d;
                                }
                                return data
                            },
                            targets: [2]
                        },
                        {
                            render: function(data, type) {
                                if (type == 'sort') {
                                    let date = new Date(data.split("/")[2].match(/.{1,4}/g)[0] + '-' + data.split("/")[1] + '-' + data.split("/")[0] + ' ' + data.split(" ")[1]);
                                    let d = date.valueOf();
                                    return d;
                                }
                                return data
                            },
                            targets: [3]
                        }
                    ]
                });
                const nuevaTarea: any = $('.new-videoconf-area');
                nuevaTarea.html('<a id="agregarVideoconf" class="white-link"><span class="fa-layers fa-fw"><i class="fas fa-circle"></i><i class="fa-inverse fas fa-plus" data-fa-transform="shrink-6" style="color:#D5853E;"></i></span> <span>Agregar Videoconferencia</span></a>');

                this.chRef.detectChanges();
                this.elRef.nativeElement.querySelector('#agregarVideoconf').addEventListener('click', this.nuevaVideoconferencia.bind(this));
            },
            errors => {
                console.log(errors);
            });
    }

    videoconfAlumno(){
        let params = {
            servicio: "videoconferencia",
            accion: (this._iestdesk.rolActual == 1) ? "IDesk_Maestro_Videoconferencias_Listado" : "IDesk_Alumno_Videoconferencias_Listado",
            tipoRespuesta: "json",
            idCurso: this._iestdesk.idCursoActual
        };

        this._videoconf.consultas(params)
            .subscribe(resp => {
                this.videoconferencias = resp;
                this.chRef.detectChanges();
                const table: any = $('table');
                this.dataTable = table.DataTable({
                    "aaSorting": [], //Desactiva la ordenación inicial
                    "language": DTTRADUCCION,
                    "dom": '<"row table-header"<"col-md-6 text-left"f><"col-md-6"<"row"<"col-md-10 text-right"i><"col-md-2"p>>>><"clear">',
                    "pagingType": "simple",
                    "columnDefs": [
                        { orderable: false, targets: 0 }
                    ]
                });
            },
            errors => {
                console.log(errors);
            });
    }

    gotoVideoconferencia(idVideoconferencia, nombre){
        this._videoconf.idVideoconferencia = idVideoconferencia;
        this.router.navigate(['/videoconferencias/', nombre]);
    }

    nuevaVideoconferencia(){
        this._videoconf.idVideoconferencia = 0;
        this.router.navigate(['/videoconferencias/nueva']);
    }

    gotoEditar(idVideoconferencia){
        this._videoconf.idVideoconferencia = idVideoconferencia;
        this.router.navigate(['/videoconferencias/nueva']);
    }

    confEliminar(idVideoconferencia, titulo){
        this.elementoEliminar = titulo;
        this.idaEliminar = idVideoconferencia;
        this.ngxSmartModalService.getModal('confirmarEliminacion').open();
    }

    confirmarCerrado(resp) {
        if( resp == 1 )
            this.eliminaVideoconf()
        else
            this.idaEliminar = 0;
        
        this.ngxSmartModalService.getModal('confirmarEliminacion').close();
    }

    eliminaVideoconf(){
        let params = {
            servicio: "videoconferencia",
            accion: "IDesk_Maestro_Videoconferencias_Elimina",
            tipoRespuesta: "json",
            idVideoconferencia: this.idaEliminar, 
            idCurso: this._iestdesk.idCursoActual, 
            idpersonidesk: this._iestdesk.idPerson
        };

        this._videoconf.consultas(params)
            .subscribe(resp => {
                this.mensaje = resp[0].mensaje;
                if(resp[0].error == 0){
                    this.tipoRespuesta = 1;
                    this._videoconf.idVideoconferencia = 0;
                    this.ngxSmartModalService.getModal('dialogoInformacion').open();
                    this.videoconfMaestro(1);
                } else {
                    this.tipoRespuesta = 2;
                    this.ngxSmartModalService.getModal('dialogoInformacion').open();
                }
            },
            errors => {
                console.log(errors);
            });
    }

    cierraDialogoInfo(resp) {
        this.ngxSmartModalService.getModal('dialogoInformacion').close();
    }
}