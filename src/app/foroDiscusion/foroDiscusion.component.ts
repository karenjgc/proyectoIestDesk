import { Component, ChangeDetectorRef, ElementRef, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';

import { Iestdesk } from '../services/iestdesk.service';
import { ForoDiscusion } from "../services/foroDiscusion.service";
//import { Equipos } from '../services/equipos.service';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { DTTRADUCCION } from '../shared/dttraduccion';

@Component({
    selector: 'idesk-foroDiscusion',
    templateUrl: './foroDiscusion.component.html'
})

export class ForoDiscusionComponent implements OnInit {
    public rolActual: number = 0;
    public foros: any[];
    //public alumnos = [];
	public idPlantillaSolicitada: number;
    public persona: number;
    dataTable: any;
    
    closeResult: string;
    public modalReference: any;
    
    public eliminado: boolean = false;
    public elementoEliminar: string;
    public idaEliminar: number;

    public mensaje: string;
    public tipoRespuesta: number;

    constructor(
        public _iestdesk: Iestdesk,
        private _foroDiscusion: ForoDiscusion,
        //private _equipos: Equipos,
        private chRef: ChangeDetectorRef,
        private elRef:ElementRef,
        private router: Router,
        private modalService: NgbModal,
        public ngxSmartModalService: NgxSmartModalService,
        private route: ActivatedRoute
    ){
        this.rolActual = this._iestdesk.rolActual;
        this.persona = this._iestdesk.idPerson;

        if ( this.rolActual == 1 )
            this.forosMaestro();
        else
            this.forosAlumno();
        
    }

    ngOnInit(){
		this._iestdesk.registraAcceso(2, 0);
    }

    forosMaestro() {
        let params = {
            servicio: "foroDiscusion",
            accion: "IDesk_Maestro_Foro_Discusion_Listado",
            tipoRespuesta: "json",
            idCurso: this._iestdesk.idCursoActual
        };

        this._foroDiscusion.consultas(params)
            .subscribe(resp => {
                if (this.dataTable) {
                    this.dataTable.destroy();
                }
                
                this.foros = resp;
                this.chRef.detectChanges();

                const table: any = $('table');
                this.dataTable = table.DataTable({
                    "aaSorting": [], //Desactiva la ordenación inicial
                    "language": DTTRADUCCION,
                    "dom": '<"row table-header align-items-center"<"col new-forum-area"><"col text-center"f><"col"<"row"<"col-9 text-right"i><"col-3"p>>>><"clear">',
                    "pagingType": "simple",
                    "columnDefs": [
                        {
                            orderable: false,
                            targets: [0, 4, 6],
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
                                    console.log(date);
                                    let d = date.valueOf();
                                    return d;
                                }
                                return data
                            },
                            targets: [3]
                        }
                    ]
                });
                const nuevoForo: any = $('.new-forum-area');
                nuevoForo.html('<a class="white-link" id="agregarForo"><span class="fa-layers fa-fw"><i class="fas fa-circle"></i><i class="fa-inverse fas fa-plus" data-fa-transform="shrink-6" style="color:#D5853E;"></i></span> <span>Agregar Foro de Discusión</span></a>');

                this.chRef.detectChanges();
                this.elRef.nativeElement.querySelector('#agregarForo').addEventListener('click', this.nuevoForo.bind(this));
            },
            errors => {
                console.log(errors);
            });
    }

    forosAlumno() {
        let params = {
            servicio: "foroDiscusion",
            accion: "IDesk_Alumno_Foro_Discusion_Listado",
            tipoRespuesta: "json",
            idCurso: this._iestdesk.idCursoActual,
            idpersonidesk: this._iestdesk.idPerson
        };

        this._foroDiscusion.consultas(params)
            .subscribe(resp => {
                this.foros = resp;
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
                            targets: [0, 4],
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
                                    console.log(date);
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

    nuevoForo(){
        this._foroDiscusion.idForoDisc = 0;
        this.router.navigate(['/foro-discusion/nuevo']);
    }

    editar(idForoDisc) {
        this._foroDiscusion.idForoDisc = idForoDisc;
        this.router.navigate(['/foro-discusion/nuevo']);
    }

    gotoForo(idForoDisc) {
        this._foroDiscusion.idForoDisc = idForoDisc;
        this.router.navigate(['/foro-discusion/vista']);
    }

    gotoRevision(idForoDisc) {
        this._foroDiscusion.idForoDisc = idForoDisc;
        this.router.navigate(['/foro-discusion/revision']);
    }

    verEquipos(idPlantillaEquipos, content) {
        //this.rolActual == 1 ? this.equipos(idPlantillaEquipos) : this.equipoInd(idPlantillaEquipos);
		this.idPlantillaSolicitada = idPlantillaEquipos;
        this.modalReference = this.modalService.open(content, { backdrop: 'static' });
    }
	
	// vistaEquipos.component

    confEliminar(idForoDisc, titulo){
        this.elementoEliminar = titulo;
        this.idaEliminar = idForoDisc;
        this.ngxSmartModalService.getModal('confirmarEliminacion').open();
    }

    confirmarCerrado(resp) {
        this.ngxSmartModalService.getModal('confirmarEliminacion').close();
        if( resp == 1 )
            this.eliminaForo()
        else
            this.idaEliminar = 0;
        
    }

    eliminaForo(){
        let params = {
            servicio: "foroDiscusion",
            accion: "IDesk_Maestro_Foro_Discusion_Elimina",
            tipoRespuesta: "json",
            idForoDisc: this.idaEliminar, 
            idpersonidesk: this._iestdesk.idPerson
        };

        this._foroDiscusion.consultas(params)
            .subscribe(resp => {
                this.mensaje = resp[0].mensaje;
                if(resp[0].error == 0){
                    this.tipoRespuesta = 1;
                    this._foroDiscusion.idForoDisc = 0;
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
        if(this.eliminado) this.forosMaestro();
        this.ngxSmartModalService.getModal('dialogoInformacion').close();
       
    }
}