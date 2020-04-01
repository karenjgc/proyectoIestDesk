import { Component, ChangeDetectorRef, ElementRef, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';

import { Iestdesk } from '../services/iestdesk.service';
import { Tareas } from '../services/tareas.service';

import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { DTTRADUCCION } from '../shared/dttraduccion';

//https://medium.com/apprendre-le-web-avec-lior/angular-5-and-jquery-datatables-fd1dd2d81d99

@Component({
    selector: 'idesk-tareas',
    templateUrl: './tareas.component.html'
})

export class TareasComponent implements OnInit {
    public nombre_curso: string;
    public rolActual: number = 0;
    public tareas: any[];
    dataTable: any;

    public elementoEliminar: string;
    public idaEliminar: number;

	public modalReference: any;
    public mensaje: string;
    public tipoRespuesta: number;
    public eliminado: boolean = false;

	public idPlantillaSolicitada: number;

    constructor(
        private _iestdesk: Iestdesk,
        private _tareas: Tareas,
        private chRef: ChangeDetectorRef,
        private elRef:ElementRef,
        public ngxSmartModalService: NgxSmartModalService,
        private router: Router,
        private route: ActivatedRoute,
		private modalService: NgbModal
    ){
        this.rolActual = this._iestdesk.rolActual;
        if (this._iestdesk.rolActual == 1) this.tareasMaestro();
        else this.tareasAlumno();
        
    }

    ngOnInit() {
        this._iestdesk.registraAcceso(1, 0);
    }

    tareasMaestro() {
        let params = {
            servicio: "tareas",
            accion: "IDesk_Maestro_Tareas_Listado",
            tipoRespuesta: "json",
            idCurso: this._iestdesk.idCursoActual
        };
        this._tareas.consultas(params)
            .subscribe(resp => {
                if (this.dataTable) {
                    this.dataTable.destroy();
                }
                this.tareas = resp;
                this.chRef.detectChanges();
                
                const table: any = $('table');
                this.dataTable = table.DataTable({
                    "aaSorting": [], //Desactiva la ordenación inicial
                    "language": DTTRADUCCION,
                    "dom": '<"row table-header align-items-center"<"col new-homework-area"><"col text-center"f><"col"<"row"<"col-9 text-right"i><"col-3"p>>>><"clear">',
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
                                    console.log(date);
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
                const nuevaTarea: any = $('.new-homework-area');
                nuevaTarea.html('<a class="white-link" id="agregarTarea"><span class="fa-layers fa-fw"><i class="fas fa-circle"></i><i class="fa-inverse fas fa-plus" data-fa-transform="shrink-6" style="color:#D5853E;"></i></span> <span>Agregar Tarea</span></a>');

                this.chRef.detectChanges();
                this.elRef.nativeElement.querySelector('#agregarTarea').addEventListener('click', this.nuevaTarea.bind(this));
                
            },
            errors => {
                console.log(errors);
            });
    }

    tareasAlumno(){
        let params = {
            servicio: "tareas",
            accion: "IDesk_Alumno_Tareas_Listado",
            tipoRespuesta: "json",
            idpersonidesk: this._iestdesk.idPerson,
            idCurso: this._iestdesk.idCursoActual
        };

        this._tareas.consultas(params)
            .subscribe(resp => {
                this.tareas = resp;
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

    revisarTarea(idTarea) {
		this._tareas.idTarea = idTarea;
        this.router.navigate(['/tareas/revision']);
    }

    gotoTarea(idTarea, nombre = ''){
		/*if(this._iestdesk.rolActual == 2){
			let params = {
				servicio: "tareas",
				accion: "IDesk_Alumno_Tareas_Entregada",
				tipoRespuesta: "json",
				idTarea: idTarea,
				idpersonidesk: this._iestdesk.idPerson
			};
			this._tareas.consultas(params)
				.subscribe( resp => {
					this._tareas.tarea = ( resp.length > 0 ) ? resp[resp.length-1] : [];
				}, errors => {
					console.log(errors);
				});
			
		}*/
		this._tareas.idTarea = idTarea;
		this.router.navigate(['/tareas/vista', nombre]);
    }

    nuevaTarea(){
        this._tareas.idTarea = 0;
        this.router.navigate(['/tareas/nueva']);
    }

    editar(idTarea){
        this._tareas.idTarea = idTarea;
        this.router.navigate(['/tareas/nueva']);
    }

    confEliminar(idTarea, titulo){
        this.elementoEliminar = titulo;
        this.idaEliminar = idTarea;
        this.ngxSmartModalService.getModal('confirmarEliminacion').open();
    }

    confirmarCerrado(resp) {
        if( resp == 1 )
            this.eliminaTarea()
        else
            this.idaEliminar = 0;
        
        this.ngxSmartModalService.getModal('confirmarEliminacion').close();
    }

    eliminaTarea(){
        let params = {
            servicio: "tareas",
            accion: "IDesk_Maestro_Tareas_Elimina",
            tipoRespuesta: "json",
            idTarea: this.idaEliminar,
            idpersonidesk: this._iestdesk.idPerson
        };

        this._tareas.consultas(params)
            .subscribe(resp => {
                this.mensaje = resp[0].mensaje;
                if(resp[0].error == 0){
                    this.tipoRespuesta = 1;
                    this._tareas.idTarea = 0;
                    this.eliminado = true;
                    this.ngxSmartModalService.getModal('dialogoInformacion').open();
                    
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
        if(this.eliminado) this.tareasMaestro();
        this.ngxSmartModalService.getModal('dialogoInformacion').close();
    }

	public verEquipos(idPlantillaEquipos, content) {
		this.idPlantillaSolicitada = idPlantillaEquipos;
		this.modalReference = this.modalService.open(content, { backdrop: 'static' });
    }

}