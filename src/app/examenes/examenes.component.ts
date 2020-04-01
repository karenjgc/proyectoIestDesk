import { Component, Output, ChangeDetectorRef, ElementRef, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';

import { Iestdesk } from '../services/iestdesk.service';
import { Examenes } from '../services/examenes.service';

import { NgxSmartModalService } from 'ngx-smart-modal';
import { DTTRADUCCION } from '../shared/dttraduccion';

@Component({
    selector: 'idesk-examenes',
    templateUrl: './examenes.component.html'
})

export class ExamenesComponent implements OnInit {
    public rolActual: number = 0;
    public examenes: any[];
    dataTable: any;

    public elementoEliminar: string;
    public idaEliminar: number;

    public mensaje: string;
    public tipoRespuesta: number;

    constructor(
        public _iestdesk: Iestdesk,
        private _examenes: Examenes,
        private chRef: ChangeDetectorRef,
        private elRef:ElementRef,
        public ngxSmartModalService: NgxSmartModalService,
        private router: Router,
        private route: ActivatedRoute
    ){
        this.rolActual = this._iestdesk.rolActual;
        if (this._iestdesk.rolActual == 1) this.actividadesMaestro(0);
        else this.actividadesAlumno();
        
    }

    ngOnInit() {
		this._iestdesk.registraAcceso(23, 0);
    }

    actividadesMaestro(ini) {
        let params = {
            servicio: "examenes",
            accion: "IDesk_Maestro_Examenes_Listado",
            tipoRespuesta: "json",
            idCurso: this._iestdesk.idCursoActual
        };

        this._examenes.consultas(params)
            .subscribe(resp => {
                //console.log(JSON.stringify(resp));
                this.examenes = resp;
                this.chRef.detectChanges();

                if ( ini == 0 ) {
                    const table: any = $('table');
                    this.dataTable = table.DataTable({
                        "aaSorting": [], //Desactiva la ordenación inicial
                        "language": DTTRADUCCION,
                        "dom": '<"row table-header align-items-center"<"col new-actividades-area"><"col text-center"f><"col"<"row"<"col-9 text-right"i><"col-3"p>>>><"clear">',
                        "pagingType": "simple",
                        "columnDefs": [
                            { orderable: false, targets: [0, 3] }
                        ]
                    });
                    const nuevaTarea: any = $('.new-actividades-area');
                    nuevaTarea.html('<a id="agregarActividad" class="white-link"><span class="fa-layers fa-fw"><i class="fas fa-circle"></i><i class="fa-inverse fas fa-plus" data-fa-transform="shrink-6" style="color:#D5853E;"></i></span> <span>Agregar Examen</span></a>');

                    this.chRef.detectChanges();
                    this.elRef.nativeElement.querySelector('#agregarActividad').addEventListener('click', this.nuevoExamen.bind(this));
                }
            },
            errors => {
                console.log(errors);
            });
    }

    actividadesAlumno(){
        let params = {
            servicio: "examenes",
            accion: "IDesk_Alumno_Examenes_Listado",
            tipoRespuesta: "json",
            idCurso: this._iestdesk.idCursoActual
        };

        this._examenes.consultas(params)
            .subscribe(resp => {
                this.examenes = resp;
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

    nuevoExamen(){
        this.router.navigate(['/examenes/nuevo']);
    }
}