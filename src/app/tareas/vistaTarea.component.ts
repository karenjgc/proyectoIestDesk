import { Component, OnInit, Input, ChangeDetectorRef, NgModule } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as $ from 'jquery';

import { Iestdesk } from '../services/iestdesk.service';
import { Tareas } from '../services/tareas.service';
import { Rubricas } from '../services/rubricas.service';
import { Links } from '../services/links.service';
import { Archivos } from '../services/archivos.service';
import { Validaciones } from '../shared/classes/validaciones';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'idesk-vistaTarea',
    templateUrl: './vistaTarea.component.html'
})

export class VistaTareaComponent implements OnInit {
    public rolActual: number = 0;
    public tarea;
    public tarea_nombre: string;
    public verEntrega: number = 0;
	public infoRevision = [];
	public mostrarCalif: boolean = false;
	public mostrarArchivos: boolean = false;
	public archivosRevision = [];
	public modal;

	public modalReference: any;
	public titulo: string;
	public arrArchivos = [];
	public linksTareas = [];
	public idPlantillaSolicitada: number;

	public idRubricaExternaLink: number = 0;
	public idRubricaExterna: number = 0;
	public rubricaExternaLink = [];
	public rubricaExterna = [];
	public _vistaAlumno: boolean = false;
	public _vistaPrevia = [];
    public validaciones = new Validaciones();

    public _arrArchivos = [];

    constructor(
        private _iestdesk: Iestdesk,
        private _tareas: Tareas,
		private _rubricas: Rubricas,
		private _links: Links,
		private _archivos: Archivos,
        private chRef: ChangeDetectorRef,
        private router: Router,
        private route: ActivatedRoute,
		private modalService: NgbModal
    ){
    }
    
    @Input() public modoTemario;

	@Input()
    set vistaAlumno ( v: boolean ) {
        if ( this._vistaAlumno != v ) {
            this._vistaAlumno = v;
        }
    }

	@Input()
	set vistaPrevia ( x ) {
        if ( this._vistaPrevia != x ) {
            this._vistaPrevia = x;
            this.tarea = x;
			/*console.clear();
			console.log(this.tarea);*/
			if ( this.tarea.idRubricaExternaLink > 0 )
				this.verRubricaExternaLink(x.idRubricaExternaLink);
            let paramsA = {
                servicio: "archivos",
                accion: "IDesk_Archivos_Consulta",
                tipoRespuesta: "json",
                idArchivos: this.tarea.idArchivos,
                rol: 1
            };
            this._archivos.consultas(paramsA)
                .subscribe(resp => {
                    this._arrArchivos = resp;

                    let paramsL = {
                        servicio: "links",
                        accion: "IDesk_Links_Consulta",
                        tipoRespuesta: "json",
                        idLinks: this.tarea.idLinks,
                        rol: this._iestdesk.rolActual
                    };
        
                    this._links.consultas(paramsL)
                        .subscribe(resp => {
                            this.linksTareas = resp;
                            this.arrArchivos = this._arrArchivos;
                        
                            for (let i in this.linksTareas) {
                                this.arrArchivos.push({
                                    idArchivo: this.linksTareas[i].idLink,
                                    nombreArchivo: this.linksTareas[i].nombre,
                                    ruta: this.linksTareas[i].idTipoLink == 3 ? this.linksTareas[i].link.replace('view', 'preview').replace('edit', 'preview') : this.linksTareas[i].idTipoLink == 4 ? this.linksTareas[i].link : this.linksTareas[i].idTipoLink == 1 ? 'https://www.youtube.com/embed/' + this.validaciones.matchYoutubeUrl(this.linksTareas[i].link): 'https://player.vimeo.com/video/' + this.validaciones.matchVimeoUrl(this.linksTareas[i].link) ,
                                    pesoFormato: 0,
                                    idTipoArchivo: 0,
                                    extension: this.linksTareas[i].idTipoLink == 3 ? 'drive' : this.linksTareas[i].idTipoLink == 4 ? 'link' : 'video',
                                    llave: '',
                                    imgMini: 'assets/images/elements/' + ( this.linksTareas[i].idTipoLink == 3 ? 'drive.png' : this.linksTareas[i].idTipoLink == 4 ? 'link.png' : this.linksTareas[i].idTipoLink == 1 ? 'youtube.png' : 'vimeo.png' )
                                });
                            }
                        }, errors => {
                            console.log(errors);
                        });
                },
                errors => {
                    console.log(errors);
                });
        }
    }

    ngOnInit(){
        if( !this._vistaAlumno ){
            this._iestdesk.registraAcceso(1, this._tareas.idTarea)
            this.obtenInformacionTarea();
        } else {
            this._iestdesk.registraAcceso(58, 0);
        }
    }

    gotoEditar() {
        this.router.navigate(['/tareas/nueva']);
    }

    gotoRevisar() {;
        this.router.navigate(['/tareas/revision']);
    }

	private obtenInformacionTarea(){
		this.rolActual = this._iestdesk.rolActual;
		let params = {
            servicio: "tareas",
            accion: "IDesk_Tareas_Vista_Ind",
            tipoRespuesta: "json",
            idTarea: this._tareas.idTarea,
			idpersonidesk: this._iestdesk.idPerson
        };

        this._tareas.consultas(params)
            .subscribe(resp => {
				//console.log(resp);
				this.tarea = resp[0];
				if ( resp[0].idRubricaExternaLink > 0 )
					this.verRubricaExternaLink(resp[0].idRubricaExternaLink);
                
                this.tarea_nombre = this.tarea.titulo;
                //this.chRef.detectChanges();
				
				this._tareas.tituloTarea = this.tarea.titulo;
				this.verEntrega = ( this.rolActual != 1 && this.tarea.idModEntrega == 1 ) ? 1 : 0;
                this.obtenArchivosTarea();
				if ( this.rolActual == 2 ) {
					this.consultaRevision();
				}
            },
            errors => {
                console.log(errors);
            });
	}

	private obtenArchivosTarea(){
		let params = {
			servicio: "tareas",
			accion: "IDesk_Tareas_Archivos",
			tipoRespuesta: "json",
			idTarea: this._tareas.idTarea
		};

		this._tareas.consultas(params)
			.subscribe( resp => {
                this._arrArchivos = resp;
                //this.chRef.detectChanges();

                let paramsLinks = {
                    servicio: "tareas",
                    accion: "IDesk_Tareas_Vista_Links",
                    tipoRespuesta: "json",
                    idTarea: this._tareas.idTarea
                };
                this._tareas.consultas(paramsLinks)
                    .subscribe( resp => {
                        //this.chRef.detectChanges();
                        this.linksTareas = resp;
                        this.arrArchivos = this._arrArchivos;
                        
                        for (let i in this.linksTareas) {
                            this.arrArchivos.push({
                                idArchivo: this.linksTareas[i].idLink,
                                nombreArchivo: this.linksTareas[i].nombre,
                                ruta: this.linksTareas[i].idTipoLink == 3 ? this.linksTareas[i].link.replace('view', 'preview').replace('edit', 'preview') : this.linksTareas[i].idTipoLink == 4 ? this.linksTareas[i].link : this.linksTareas[i].idTipoLink == 1 ? 'https://www.youtube.com/embed/' + this.validaciones.matchYoutubeUrl(this.linksTareas[i].link): 'https://player.vimeo.com/video/' + this.validaciones.matchVimeoUrl(this.linksTareas[i].link) ,
                                pesoFormato: 0,
                                idTipoArchivo: 0,
                                extension: this.linksTareas[i].idTipoLink == 3 ? 'drive' : this.linksTareas[i].idTipoLink == 4 ? 'link' : 'video',
                                llave: '',
                                imgMini: 'assets/images/elements/' + ( this.linksTareas[i].idTipoLink == 3 ? 'drive.png' : this.linksTareas[i].idTipoLink == 4 ? 'link.png' : this.linksTareas[i].idTipoLink == 1 ? 'youtube.png' : 'vimeo.png' )
                            });
                        }
        
                    }, errors => {
                        console.log(errors);
                    });

			}, errors => {
				console.log(errors);
			});

		
	}

	public verArchivos(content, modal) {
		this.modal = modal;
		this.titulo = this._tareas.tituloTarea;
		this.modalReference = this.modalService.open(content, { backdrop: 'static' });
	}

	public verRubricaExt(content, idRubricaExterna){
		this.idRubricaExterna = idRubricaExterna;

		let params = {
            servicio: "archivos",
            accion: "IDesk_Archivos_Consulta",
			tipoRespuesta: "json",
			idArchivos: this.idRubricaExterna,
			rol: 1
        };

		this._archivos.consultas(params)
			.subscribe(resp => {
                if ( resp.length > 0 ) {
                    this.rubricaExterna = resp;
                }
            }, errors => {
                console.log(errors);
            });
		this.modalReference = this.modalService.open(content, { backdrop: 'static' });
	}

	public verRubrica(content, idRubrica) {
		this._rubricas.idRubrica = idRubrica;
		this.modalReference = this.modalService.open(content, { backdrop: 'static' });
	}

	public verEquipos(idPlantillaEquipos, content) {
		this.idPlantillaSolicitada = idPlantillaEquipos;
		this.modalReference = this.modalService.open(content, { backdrop: 'static' });
    }

	public verRubricaExternaLink(idLink) { 
		let params = {
            servicio: "links",
            accion: "IDesk_Links_Consulta",
			tipoRespuesta: "json",
			idLinks: idLink,
			rol: 1
        };

		this._tareas.consultas(params)
            .subscribe(resp => {
                this.rubricaExternaLink = resp;

                for (let i in this.rubricaExternaLink) {
                    this.rubricaExterna.push({
                        idArchivo: this.rubricaExternaLink[i].idLink,
                        nombreArchivo: this.rubricaExternaLink[i].nombre,
                        ruta: this.rubricaExternaLink[i].idTipoLink == 3 ? this.rubricaExternaLink[i].link.replace('view', 'preview').replace('edit', 'preview') : this.rubricaExternaLink[i].idTipoLink == 4 ? this.rubricaExternaLink[i].link : this.rubricaExternaLink[i].idTipoLink == 1 ? 'https://www.youtube.com/embed/' + this.validaciones.matchYoutubeUrl(this.rubricaExternaLink[i].link): 'https://player.vimeo.com/video/' + this.validaciones.matchVimeoUrl(this.rubricaExternaLink[i].link) ,
                        pesoFormato: 0,
                        idTipoArchivo: 0,
                        extension: this.rubricaExternaLink[i].idTipoLink == 3 ? 'drive' : this.rubricaExternaLink[i].idTipoLink == 4 ? 'link' : 'video',
                        llave: '',
                        imgMini: 'assets/images/elements/' + ( this.rubricaExternaLink[i].idTipoLink == 3 ? 'drive.png' : this.rubricaExternaLink[i].idTipoLink == 4 ? 'link.png' : this.rubricaExternaLink[i].idTipoLink == 1 ? 'youtube.png' : 'vimeo.png' )
                    });
                }
            }, errors => {
                console.log(errors);
            });
    }

	public consultaRevision(){
		let params = {
            servicio: "tareas",
            accion: "IDesk_Tareas_Consulta_Revision",
            tipoRespuesta: "json",
            idTarea: this._tareas.idTarea, 
            idAlumno: this._iestdesk.idPerson
        };

        this._tareas.consultas(params)
            .subscribe(resp => {
                if ( resp.length > 0 ) { //&& resp[0].calificacion != null) {
                    this.infoRevision = resp[0];
                    this.mostrarCalif = true;
                    this.consultaRevisionArch(resp[0].idTareaAlumno);
                } else {
                    this.mostrarCalif = false;
                }
            },
            errors => {
                console.log(errors);
            });
	}

	private consultaRevisionArch(idTareaAlumno){
		let params = {
            servicio: "tareas",
            accion: "IDesk_Tareas_Consulta_Revision_Archivos",
            tipoRespuesta: "json",
            idTareaAlumno: idTareaAlumno 
        };

        this._tareas.consultas(params)
            .subscribe(resp => {
				console.log(resp);
                if ( resp.length > 0 ) {
                    this.archivosRevision = resp;
                    this.mostrarArchivos = true;
                } else {
                    this.mostrarArchivos = false;
                }
            },
            errors => {
                console.log(errors);
            });
	}
}