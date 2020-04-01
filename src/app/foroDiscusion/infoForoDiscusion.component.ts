import { Component, OnInit, Output, Input, EventEmitter, ChangeDetectorRef } from '@angular/core';

import { Iestdesk } from '../services/iestdesk.service';
import { ForoDiscusion } from '../services/foroDiscusion.service';
//import { Equipos } from '../services/equipos.service';
import { Rubricas } from '../services/rubricas.service';
import { Archivos } from '../services/archivos.service';
import { Links } from '../services/links.service';
import { Validaciones } from '../shared/classes/validaciones';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { resolve } from 'url';

@Component({
    selector: 'idesk-infoForoDisc',
    templateUrl: './infoForoDiscusion.component.html'
})

export class InfoForoDiscComponent implements OnInit {
    @Output() datos = new EventEmitter();

    public rolActual: number = 0;
    public idForoDisc: number;
    public foroDiscusion: string;
    public infoForo;
    public idRubricaExternaLink: number = 0;
	public idRubricaExterna: number = 0;
    public archivosForo = [];
    public linksForo = [];
    public rubricaExterna = [];
	public rubricaExternaArchivo = [];
    public _vistaAlumno: boolean = false;
    public _vistaPreviaForo = [];

	public idPlantillaSolicitada: number;

    public modalReference: any;

    public validaciones = new Validaciones();

    public _archivosForo = [];

    constructor(
        private _iestdesk: Iestdesk,
        private _foroDiscusion: ForoDiscusion,
        private _rubricas: Rubricas, 
        private _archivos: Archivos,
        private _links: Links,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal

    ) {
        this.rolActual = this._iestdesk.rolActual;
        this.idForoDisc = this._foroDiscusion.idForoDisc;
    }

    @Input()
    set vistaAlumno ( v: boolean ) {
        if ( this._vistaAlumno != v ) {
            this._vistaAlumno = v;
        }
    }

    @Input()
    set vistaPreviaForo ( x ) {
        if ( this._vistaPreviaForo != x ) {
            this._vistaPreviaForo = x;
            this.infoForo = x;
			console.dir(this.infoForo);
			if ( this.infoForo.idRubricaExternaLink > 0 )
				this.rubricaExternaLink(this.infoForo.idRubricaExternaLink);
            let params = {
                servicio: "archivos",
                accion: "IDesk_Archivos_Consulta",
                tipoRespuesta: "json",
                idArchivos: this.infoForo.idArchivos,
                rol: 1
            };
            this._archivos.consultas(params)
                .subscribe(resp => {
                    this._archivosForo = resp;
                    
                    let paramsL = {
                        servicio: "links",
                        accion: "IDesk_Links_Consulta",
                        tipoRespuesta: "json",
                        idLinks: this.infoForo.idLinks,
                        rol: this._iestdesk.rolActual
                    };
        
                    this._links.consultas(paramsL)
                        .subscribe(resp => {
                            this.linksForo = resp;
                            //this.chRef.detectChanges();
        
                            this.archivosForo = this._archivosForo;
                            for (let i in this.linksForo) {
                                this.archivosForo.push({
                                    idArchivo: this.linksForo[i].idLink,
                                    nombreArchivo: this.linksForo[i].nombre,
                                    ruta: this.linksForo[i].idTipoLink == 3 ? this.linksForo[i].link.replace('view', 'preview').replace('edit', 'preview') : this.linksForo[i].idTipoLink == 4 ? this.linksForo[i].link : this.linksForo[i].idTipoLink == 1 ? 'https://www.youtube.com/embed/' + this.validaciones.matchYoutubeUrl(this.linksForo[i].link): 'https://player.vimeo.com/video/' + this.validaciones.matchVimeoUrl(this.linksForo[i].link) ,
                                    pesoFormato: 0,
                                    idTipoArchivo: 0,
                                    extension: this.linksForo[i].idTipoLink == 3 ? 'drive' : this.linksForo[i].idTipoLink == 4 ? 'link' : 'video',
                                    llave: '',
                                    imgMini: 'assets/images/elements/' + ( this.linksForo[i].idTipoLink == 3 ? 'drive.png' : this.linksForo[i].idTipoLink == 4 ? 'link.png' : this.linksForo[i].idTipoLink == 1 ? 'youtube.png' : 'vimeo.png' )
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
        //console.log(this._vistaPreviaForo, this._vistaAlumno)
        if( !this._vistaAlumno ){
            this.informacionForo();
            this.foroArchivos();
        } else {
            this._iestdesk.registraAcceso(57, 0);
        }
    }

    informacionForo() {
        let tmp = [];
        let params = {
            servicio: "foroDiscusion",
            accion: "IDesk_Foro_Discusion_Vista_Ind",
            tipoRespuesta: "json",
            idForoDisc: this._foroDiscusion.idForoDisc
        };

        this._foroDiscusion.consultas(params)
            .subscribe(resp => {
                if ( resp[0].idRubricaExternaLink > 0 ) this.rubricaExternaLink(resp[0].idRubricaExternaLink);
                this.infoForo = resp[0];
                this.foroDiscusion = resp[0].titulo;
                tmp.push({ titulo: this.foroDiscusion, permiteArchivos: resp[0].permiteArchivos, cerrado: resp[0].cerrado, idPlantillaEquipos: resp[0].idPlantillaEquipos })
               // console.log(tmp, resp[0].permiteArchivos)
                this.datos.emit(tmp);

            },
            errors => {
                console.log(errors);
            });
    }

    foroArchivos() {
        let paramsArchivos = {
            servicio: "foroDiscusion",
            accion: "IDesk_Foro_Discusion_Vista_Ind_Archivos",
            tipoRespuesta: "json",
            idForoDisc: this._foroDiscusion.idForoDisc
        };

        this._foroDiscusion.consultas(paramsArchivos)
            .subscribe(resp => {
                this._archivosForo = resp;
                //this.chRef.detectChanges();
                this.foroLinks();
            },
            errors => {
                console.log(errors);
            });
    }

    foroLinks() {
        let paramsLinks = {
            servicio: "foroDiscusion",
            accion: "IDesk_Foro_Discusion_Vista_Ind_Links",
            tipoRespuesta: "json",
            idForoDisc: this._foroDiscusion.idForoDisc
        };

        this._foroDiscusion.consultas(paramsLinks)
            .subscribe(resp => {
                this.linksForo = resp;
                //this.chRef.detectChanges();

                this.archivosForo = this._archivosForo;
                for (let i in this.linksForo) {
                    this.archivosForo.push({
                        idArchivo: this.linksForo[i].idLink,
                        nombreArchivo: this.linksForo[i].nombre,
                        ruta: this.linksForo[i].idTipoLink == 3 ? this.linksForo[i].link.replace('view', 'preview').replace('edit', 'preview') : this.linksForo[i].idTipoLink == 4 ? this.linksForo[i].link : this.linksForo[i].idTipoLink == 1 ? 'https://www.youtube.com/embed/' + this.validaciones.matchYoutubeUrl(this.linksForo[i].link): 'https://player.vimeo.com/video/' + this.validaciones.matchVimeoUrl(this.linksForo[i].link) ,
                        pesoFormato: 0,
                        idTipoArchivo: 0,
                        extension: this.linksForo[i].idTipoLink == 3 ? 'drive' : this.linksForo[i].idTipoLink == 4 ? 'link' : 'video',
                        llave: '',
                        imgMini: 'assets/images/elements/' + ( this.linksForo[i].idTipoLink == 3 ? 'drive.png' : this.linksForo[i].idTipoLink == 4 ? 'link.png' : this.linksForo[i].idTipoLink == 1 ? 'youtube.png' : 'vimeo.png' )
                    });
                }
            },
            errors => {
                console.log(errors);
            });
    }

    verRubrica(content, idRubrica) {
        this._rubricas.idRubrica = idRubrica;
        this.modalReference = this.modalService.open(content, { backdrop: 'static' });
    }

	public verRubricaExt(content, idRubricaExterna){
		this.idRubricaExterna = idRubricaExterna;

		let params = {
            servicio: "archivos",
            accion: "IDesk_Archivos_Consulta",
			tipoRespuesta: "json",
			idArchivos: idRubricaExterna,
			rol: 1
        };

		this._archivos.consultas(params)
			.subscribe(resp => {
                if ( resolve.length > 0 ) {
                    this.rubricaExternaArchivo = resp;
                }
            }, errors => {
                console.log(errors);
            });
		this.modalReference = this.modalService.open(content, { backdrop: 'static' });
	}

    verEquipos(idPlantillaEquipos, content) {
        //this.rolActual == 1 ? this.equipos(idPlantillaEquipos) : this.equipoInd(idPlantillaEquipos);
		this.idPlantillaSolicitada = idPlantillaEquipos;

        this.modalReference = this.modalService.open(content, { backdrop: 'static' });
    }

    verArchivos(content) {
        this.modalReference = this.modalService.open(content);
    }

    rubricaExternaLink(idLink) {
        let params = {
            servicio: "links",
            accion: "IDesk_Links_Consulta",
            tipoRespuesta: "json",
            idLinks: idLink,
            rol: this._iestdesk.rolActual
        };

        this._links.consultas(params)
            .subscribe(resp => {
				//console.log(resp);
                this.rubricaExterna = resp;

                for (let i in this.rubricaExternaLink) {
                    this.rubricaExternaArchivo.push({
                        idArchivo: this.rubricaExterna[i].idLink,
                        nombreArchivo: this.rubricaExterna[i].nombre,
                        ruta: this.rubricaExterna[i].idTipoLink == 3 ? this.rubricaExterna[i].link.replace('view', 'preview').replace('edit', 'preview') : this.rubricaExterna[i].idTipoLink == 4 ? this.rubricaExterna[i].link : this.rubricaExterna[i].idTipoLink == 1 ? 'https://www.youtube.com/embed/' + this.validaciones.matchYoutubeUrl(this.rubricaExterna[i].link): 'https://player.vimeo.com/video/' + this.validaciones.matchVimeoUrl(this.rubricaExterna[i].link) ,
                        pesoFormato: 0,
                        idTipoArchivo: 0,
                        extension: this.rubricaExterna[i].idTipoLink == 3 ? 'drive' : this.rubricaExterna[i].idTipoLink == 4 ? 'link' : 'video',
                        llave: '',
                        imgMini: 'assets/images/elements/' + ( this.rubricaExterna[i].idTipoLink == 3 ? 'drive.png' : this.rubricaExterna[i].idTipoLink == 4 ? 'link.png' : this.rubricaExterna[i].idTipoLink == 1 ? 'youtube.png' : 'vimeo.png' )
                    });
                }
            }, errors => {
                console.log(errors);
            });
    }
}