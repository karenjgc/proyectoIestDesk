import { Component, ChangeDetectorRef, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Iestdesk } from '../services/iestdesk.service';
import { Apuntes } from '../services/apuntes.service';
import { Archivos } from '../services/archivos.service';

import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
    selector: 'idesk-vistaApunte',
    templateUrl: './vistaApunte.component.html'
})

export class VistaApunteComponent implements OnInit {
    @Input() vistaAlumno: boolean;
    @Input() public modoTemario;
    
    public rolActual: number;
    public mostrarMenu: boolean = true;
    public apunteNombre: string;
    public apunte;
    public arrArchivos = [];
    public tipo: number;
    public ruta: string;
	public numeroArchivos: number;
	public mensaje: string;
	public nombreZip: string;
	public rutaZip: string;
    public apAlumno;
    public arrLinks = [];
	public numeroLinks: number;

    constructor(
        public _iestdesk: Iestdesk,
        private _apuntes: Apuntes, 
        private chRef: ChangeDetectorRef,
        private router: Router,
        private route: ActivatedRoute,
		private _archivos: Archivos,
		public ngxSmartModalService: NgxSmartModalService,
    ){
        if (this.rolActual != 1) {

            let params = {
                servicio: "idesk",
                accion: "IDesk_Accesos_RegistraAcceso",
                tipoRespuesta: "json",
                idCurso: this._iestdesk.idCursoActual,
                idTipoModulo: 3,
                idElemento: this._apuntes.idApunte,
                idpersonidesk: this._iestdesk.idPerson
            };
            
            this._iestdesk.consultas(params).subscribe(
                resp => {
                    console.log(resp);
                },
                errors => {
                    console.log(errors);
                });
            }
    }

	ngOnInit(){
        // REGISTRO ACCESO
        if(this.vistaAlumno != true) {
            this._iestdesk.registraAcceso(3, this._apuntes.idApunte);
        } else {
            this._iestdesk.registraAcceso(56, 0);
        }

        this.rolActual = this._iestdesk.rolActual;
        this.apAlumno = this._apuntes.apAlumno;
	
		this.mostrarMenu = (this.vistaAlumno == true) ? false : true; 
			
        if ( this._apuntes.idApunte == 0 ) {
			// if vista alumno
            this.apunte = this.apAlumno;
            this.apunteNombre = this.apunte.titulo;

            let params = {
                servicio: "archivos",
                accion: "IDesk_Archivos_Consulta",
                tipoRespuesta: "json",
                idArchivos: this.apunte.idArchivos,
                rol: 1
            };
    
            this._archivos.consultas(params)
                .subscribe(resp => {
                    this.arrArchivos = resp;
                    this.numeroArchivos = this.arrArchivos.length;

                    let paramslinks = {
                        servicio: "links",
                        accion: "IDesk_Links_Consulta",
                        tipoRespuesta: "json",
                        idLinks: this.apunte.idLinks,
                        rol: 1
                    };
            
                    this._archivos.consultas(paramslinks)
                        .subscribe(resp => {
                            this.arrLinks = resp;
                            this.numeroLinks = this.arrLinks.length;
        
                            for (let i in this.arrLinks) {
                                if ( this.arrLinks[i].idTipoLink == 3 ) {
                                    this.arrArchivos.push({
                                        idArchivo: this.arrLinks[i].idLink,
                                        nombreArchivo: this.arrLinks[i].nombre,
                                        ruta: this.arrLinks[i].link.replace('view', 'preview').replace('edit', 'preview'),
                                        pesoFormato: 0,
                                        idTipoArchivo: 0,
                                        extension: 'drive',
                                        llave: '',
                                        imgMini: 'assets/images/elements/drive.png'
                                    });
                                }
                            }
                        },
                        errors => {
                            console.log(errors);
                        });
                        
                },
                errors => {
                    console.log(errors);
                });
            
        } else {
            let params = {
                servicio: "apuntes",
                accion: "IDesk_Apuntes_Vista_Ind",
                tipoRespuesta: "json",
                idApunte: this._apuntes.idApunte
            };

            this._apuntes.consultas(params)
                .subscribe(resp => {
                    this.apunte = resp[0];
                    this.apunteNombre = this.apunte.titulo;
					this.chRef.detectChanges();
                },
                errors => {
                    console.log(errors);
                });

            let paramsArchivos = {
                servicio: "apuntes",
                accion: "IDesk_Apuntes_Consulta_Archivos",
                tipoRespuesta: "json",
                idApunte: this._apuntes.idApunte
            }

            this._apuntes.consultas(paramsArchivos)
                .subscribe(resp => {
                    this.arrArchivos = resp;
                    this.numeroArchivos = this.arrArchivos.length;

                    let paramsLinks = {
                        servicio: "apuntes",
                        accion: "IDesk_Apuntes_Consulta_Links",
                        tipoRespuesta: "json",
                        idApunte: this._apuntes.idApunte
                    }
        
                    this._apuntes.consultas(paramsLinks)
                        .subscribe(resp => {
                            this.arrLinks = resp;
                            this.numeroLinks = this.arrLinks.length;
                            
                            for (let i in this.arrLinks) {
                                if ( this.arrLinks[i].idTipoLink == 3 ) {
                                    this.arrArchivos.push({
                                        idArchivo: this.arrLinks[i].idLink,
                                        nombreArchivo: this.arrLinks[i].nombre,
                                        ruta: this.arrLinks[i].link.replace('view', 'preview').replace('edit', 'preview'),
                                        pesoFormato: 0,
                                        idTipoArchivo: 0,
                                        extension: 'drive',
                                        llave: '',
                                        imgMini: 'assets/images/elements/drive.png'
                                    });
                                }
                            }
                        },
                        errors => {
                            console.log(errors);
                        });
                },
                errors => {
                    console.log(errors);
                });

            
        }
	}

    gotoEditar(){
        this._apuntes.apAlumno = [];
        this.router.navigate(['/apuntes/nuevo']);
    }
}