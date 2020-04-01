import { Component, OnInit, ChangeDetectorRef, NgModule, ElementRef } from '@angular/core';
import { Location, NgIf } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, URLSearchParams } from '@angular/http';

import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';

import { Iestdesk } from '../services/iestdesk.service';
import { Apuntes } from "../services/apuntes.service";
import { Archivos } from "../services/archivos.service";

import { NgxSmartModalService } from 'ngx-smart-modal';

import { DTTRADUCCION } from '../shared/dttraduccion';
import * as _moment from 'moment';
import 'moment/locale/es';

@Component({
    selector: 'idesk-apuntes',
    templateUrl: './apuntes.component.html'
})

export class ApuntesComponent implements OnInit {
    public rolActual: number = 0;
    public apuntes: any[];
    dataTable: any;

    public elementoEliminar: string;
    public idaEliminar: number;

    public mensaje: string;
    public tipoRespuesta: number;
	
	public nombreZip: string;
    public rutaZip: string;
    
    public eliminado: boolean = false;

    constructor(
        public _iestdesk: Iestdesk,
        private _apuntes: Apuntes,
        private chRef: ChangeDetectorRef,
        private elRef: ElementRef,
        public ngxSmartModalService: NgxSmartModalService,
        private router: Router,
        private location: Location,
		private _archivos: Archivos
    ){
        this.rolActual = this._iestdesk.rolActual;
        if (this._iestdesk.rolActual == 1) this.apuntesMaestro();
        else this.apuntesAlumno();
    }

    ngOnInit() {
        this._iestdesk.registraAcceso(3, 0);
    }

    apuntesMaestro() {
        let params = {
            servicio: "apuntes",
            accion: "IDesk_Maestro_Apuntes_Listado",
            tipoRespuesta: "json",
            idCurso: this._iestdesk.idCursoActual
        };

        this._apuntes.consultas(params)
            .subscribe(resp => {
                if (this.dataTable) {
                    this.dataTable.destroy();
                }

                this.apuntes = resp;
                this.chRef.detectChanges();

                const table: any = $('table');
                this.dataTable = table.DataTable({
                    "aaSorting": [], //Desactiva la ordenación inicial
                    "language": DTTRADUCCION,
                    "dom": '<"row table-header align-items-center"<"col new-apuntes-area"><"col text-center"f><"col"<"row"<"col-9 text-right"i><"col-3"p>>>><"clear">',
                    "pagingType": "simple",
                    /*"columnDefs": [
                        { orderable: false, targets: [0, 4] }
                    ]*/
                    "columnDefs": [
                        {
                            orderable: false,
                            targets: [0, 3, 4],
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
                        }
                    ]
                });
                const nuevaTarea: any = $('.new-apuntes-area');
                nuevaTarea.html('<a id="agregarApunte" class="white-link"><span class="fa-layers fa-fw"><i class="fas fa-circle"></i><i class="fa-inverse fas fa-plus" data-fa-transform="shrink-6" style="color:#D5853E;"></i></span> <span>Agregar Apunte</span></a>');

                this.chRef.detectChanges();
                this.elRef.nativeElement.querySelector('#agregarApunte').addEventListener('click', this.nuevoApunte.bind(this));

            },
            errors => {
                console.log(errors);
            });
    }

    apuntesAlumno(){
        let params = {
            servicio: "apuntes",
            accion: "IDesk_Alumno_Apuntes_Listado",
            tipoRespuesta: "json",
            idCurso: this._iestdesk.idCursoActual
        };

        this._apuntes.consultas(params)
            .subscribe(resp => {
                this.apuntes = resp;
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
                            targets: [0, 3, 4],
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
                        }
                    ]
                });
            },
            errors => {
                console.log(errors);
            });
    }

    gotoApunte(idApunte, nombre){
        this._apuntes.idApunte = idApunte;
        this.router.navigate(['/apuntes/vista', nombre]);
    }

    nuevoApunte(){
        this._apuntes.idApunte = 0;
        this.router.navigate(['/apuntes/nuevo']);
    }

    gotoEditar(idApunte){
        this._apuntes.apAlumno = [];
        this._apuntes.idApunte = idApunte;
        this.router.navigate(['/apuntes/nuevo']);
    }

    confEliminar(idApunte, titulo){
        this.elementoEliminar = titulo;
        this.idaEliminar = idApunte;
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
            servicio: "apuntes",
            accion: "IDesk_Maestro_Apuntes_Elimina",
            tipoRespuesta: "json",
            idApunte: this.idaEliminar, 
            idpersonidesk: this._iestdesk.idPerson
        };

        this._apuntes.consultas(params)
            .subscribe(resp => {
                this.mensaje = resp[0].mensaje;
                if(resp[0].error == 0){
                    this.tipoRespuesta = 1;
                    this._apuntes.idApunte = 0;
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

	descargar(idApunte, nombreApunte){
		console.clear();
		console.log(idApunte);
		let idArchivos = [];
		let nombreArchivos = [];
		let rutas = [];
        let llave = [];
        
        let params = {
            servicio: "apuntes",
            accion: "IDesk_Apuntes_Consulta_Archivos",
            tipoRespuesta: "json",
            idApunte: idApunte
        }

		this._apuntes.consultas(params)
			.subscribe(resp => {
				//console.log(resp.length);
				if(resp.length > 1){
					for (let i in resp){
						idArchivos.push(resp[i].idArchivo);
						nombreArchivos.push(resp[i].nombreArchivo);
						llave.push(resp[i].llave);
						rutas.push(resp[i].ruta);
					}			

                    let params = {
                        accion: "actividad",
                        idArchivos: idArchivos.join('||'),//JSON.stringify(idArchivos),
                        nombreArchivos: nombreArchivos.join('||'), //JSON.stringify(nombreArchivos),
                        llave: llave.join('||'), // JSON.stringify(llave),
                        rutas: rutas.join('||'), //JSON.stringify(rutas),
                        nombreActividad: nombreApunte,
                    };

					this._archivos.consultas(params, 'api/idesk/descargaZip.php')
						.subscribe( resp => {
							this.nombreZip = resp.zip;
							this.rutaZip = resp.ruta;
							window.open(this.rutaZip);
						}, errors => {
							console.log(errors);
						});
				} else if(resp.length == 1)
					window.open(resp[0].ruta);
				else {
					this.mensaje = 'No se encontraron archivos para descargar.';
					this.tipoRespuesta = 2;
					this.ngxSmartModalService.getModal('dialogoInformacion').open();
				}
			},
			errors => {
				console.log(errors);
			});
	}

	// no se usa
	eliminaZip(){
        console.log(this.rutaZip);
        let params = {
            accion: "eliminar",
            tipoRespuesta: "json",
            rutaZip: this.rutaZip
        };

		this._archivos.consultas(params)
			.subscribe(resp => {
				console.log(resp);
			},
			errors => {
				console.log(errors);
			});
	}
	//

    cierraDialogoInfo(resp) {
        if(this.eliminado) this.apuntesMaestro();
        this.ngxSmartModalService.getModal('dialogoInformacion').close();
       
    }
}