import { Component, OnInit, ChangeDetectorRef, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';

import { Iestdesk } from '../services/iestdesk.service';
import { ActividadesClase } from '../services/actividadesClase.service';

import { DTTRADUCCION } from '../shared/dttraduccion';

import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
    selector: 'idesk-actividadesClase',
    templateUrl: './actividadesClase.component.html'
})

export class ActividadesClaseComponent implements OnInit{
    public rolActual: number = 0;
    public actClase: any[];
    dataTable: any;

    public elementoEliminar: string;
    public idaEliminar: number;
    public idTipoActividad: number;

    public mensaje: string;
    public tipoRespuesta: number;
    public rutasActividades = {
        1: "/actividades-clase/nueva/ruleta",
        2: "/actividades-clase/nueva/jeopardy",
        6: "/actividades-clase/nueva/libre",
        7: "/actividades-clase/nueva/libre"
    };

    constructor(
        public _iestdesk: Iestdesk,
        private _actividadesClase: ActividadesClase,
        private chRef: ChangeDetectorRef,
        private elRef:ElementRef,
        public ngxSmartModalService: NgxSmartModalService,
        private router: Router,
        private route: ActivatedRoute
    ){
        this.rolActual = this._iestdesk.rolActual;
        //console.log(this.rolActual);
        if (this._iestdesk.rolActual == 1) this.actividadesMaestro();
        else this.actividadesAlumno();
        
    }

    ngOnInit() {
        this._iestdesk.registraAcceso(4, 0);
    }

    actividadesMaestro() {
        let params = {
            servicio: "actividadesClase",
            accion: "IDesk_Maestro_Actividades_Clase_Listado",
            tipoRespuesta: "json",
            idCurso: this._iestdesk.idCursoActual
        };

        this._actividadesClase.consultas(params)
            .subscribe(resp => {
                if (this.dataTable) {
                    this.dataTable.destroy();
                }
                
                this.actClase = resp;
                this.chRef.detectChanges();
                
                const table: any = $('table');
                this.dataTable = table.DataTable({
                    "aaSorting": [], //Desactiva la ordenación inicial
                    "language": DTTRADUCCION,
                    "dom": '<"row table-header align-items-center"<"col new-actividades-area"><"col text-center"f><"col"<"row"<"col-9 text-right"i><"col-3"p>>>><"clear">',
                    "pagingType": "simple",
                    "columnDefs": [
                        {
                            orderable: false,
                            targets: [0, 4, 5],
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
                const nuevaTarea: any = $('.new-actividades-area');
                nuevaTarea.html('<a id="agregarActividad" class="white-link"><span class="fa-layers fa-fw"><i class="fas fa-circle"></i><i class="fa-inverse fas fa-plus" data-fa-transform="shrink-6" style="color:#D5853E;"></i></span> <span>Agregar Actividad de Clase</span></a>');

                this.chRef.detectChanges();
                this.elRef.nativeElement.querySelector('#agregarActividad').addEventListener('click', this.nuevaActividad.bind(this));
            },
            errors => {
                console.log(errors);
            });
    }

    actividadesAlumno(){
        let params = {
            servicio: "actividadesClase",
            accion: "IDesk_Alumno_Actividades_Clase_Listado",
            tipoRespuesta: "json",
            idCurso: this._iestdesk.idCursoActual,
            idpersonidesk: this._iestdesk.idPerson
        };

        this._actividadesClase.consultas(params)
            .subscribe(resp => {
                this.actClase = resp;
                this.chRef.detectChanges();
                const table: any = $('table');
                this.dataTable = table.DataTable({
                    "aaSorting": [], //Desactiva la ordenación inicial
                    "language": DTTRADUCCION,
                    "dom": '<"row table-header"<"col-md-6 text-left"f><"col-md-6"<"row"<"col-md-10 text-right"i><"col-md-2"p>>>><"clear">',
                    "pagingType": "simple",
                    "columnDefs": [
                        {
                            orderable: false,
                            targets: [0],
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
            },
            errors => {
                console.log(errors);
            });
    }

    nuevaActividad(){
        this._actividadesClase.idActividad = 0;
        this.router.navigate(['/actividades-clase/nueva']);
    }

    gotoEditar(idActividad, idTipoActividad){        
        this._actividadesClase.tipoAlta = idTipoActividad == 6 ? 1 : idTipoActividad == 7 ? 2 : 0; 
        this._actividadesClase.idActividad = idActividad;
        this.router.navigate([this.rutasActividades[idTipoActividad]]);
    }

    confEliminar(idActividad, idTipoActividad, titulo){
        this.elementoEliminar = titulo;
        this.idaEliminar = idActividad;
        this.idTipoActividad = idTipoActividad;
        this.ngxSmartModalService.getModal('confirmarEliminacion').open();
    }

    confirmarCerrado(resp) {
        if( resp == 1 )
            this.eliminaActividad()
        else {
            this.idaEliminar = 0;
            this.idTipoActividad = 0;
        }
        
        this.ngxSmartModalService.getModal('confirmarEliminacion').close();
    }

    eliminaActividad(){
        let params = {
            servicio: "actividadesClase",
            accion: "IDesk_Maestro_Actividades_Clase_Elimina",
            tipoRespuesta: "json",
            idActividadClase: this.idaEliminar,
            idpersonidesk: this._iestdesk.idPerson
        };

        this._actividadesClase.consultas(params)
            .subscribe(resp => {
                this.mensaje = resp[0].mensaje;
                if(resp[0].error == 0){
                    this.tipoRespuesta = 1;
                    this._actividadesClase.idActividad = 0;
                    this.actividadesMaestro();
                } else {
                    this.tipoRespuesta = 2;
                }
                this.ngxSmartModalService.getModal('dialogoInformacion').open();
            },
            errors => {
                console.log(errors);
            });
    }
    
    mostrarActividad(act, rolActual) {
        //console.log(act);

        if( act.idTipoActividad == 6 || act.idTipoActividad == 7 ) {
            this._actividadesClase.tipoAlta = act.idTipoActividad == 6 ? 1 : act.idTipoActividad == 7 ? 2 : 0; 
            this._actividadesClase.idActividad = act.idActividadClase; // IDesk_Actividades_Clase.idActividadClase
            this.router.navigate(['/actividades-clase/vista/libre']);
        } else {
            this._actividadesClase.actividadClase = act;
            if(rolActual == 1){
                this.router.navigate(['/actividades-clase/maestro-actividad']);
            }else{
                this.router.navigate(['/actividades-clase/alumno-actividad']);
            }
        }
    }

    revisarActividad(idActividadClase, idTipoActividad){
        this._actividadesClase.tipoAlta = idTipoActividad == 6 ? 1 : idTipoActividad == 7 ? 2 : 0; 
        this._actividadesClase.idActividad = idActividadClase;
        this.router.navigate(['/actividades-clase/libre/revision']);
    }

    cierraDialogoInfo(resp) {
        this.ngxSmartModalService.getModal('dialogoInformacion').close();
    }
}