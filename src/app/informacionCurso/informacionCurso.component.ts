import { Component, ChangeDetectorRef } from '@angular/core';

import { Iestdesk } from '../services/iestdesk.service';
import { Links } from '../services/links.service'
import { Archivos } from '../services/archivos.service';
import { InformacionCurso } from '../services/infoCurso.service';

import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
    selector: 'idesk-informacionCurso',
    templateUrl: './informacionCurso.component.html'
})
export class InformacionCursoComponent {
    public rolActual: number;
	public nombreCursoActual: string = this._iestdesk.cursoActual;
    public idInfCurso: number = 0;
    public tipo: number = 0;
    public titulo: string;
    public des: string;
    public idArchivo: string;
    public idLink: number = 0;
    public link: any;
    public urlVideo: string;
    public formVisible: boolean = true;
	public tieneInformacion: boolean = false;
	public ruta: string;
	public tipocomp: number;
	public numeroArchivos: number;
	public arrArchivos = [];
	public nombreZip: string;
    public rutaZip: string;
    public ruta_elemento: string;

    constructor(
        private _iestdesk: Iestdesk,
        private _infoCurso: InformacionCurso,
        private _links: Links,
        private _archivos: Archivos,
        private chRef: ChangeDetectorRef,
        public ngxSmartModalService: NgxSmartModalService
    ){ 
        this.rolActual = this._iestdesk.rolActual;
        this.tipo = this._infoCurso.tipo;

        if ( this._infoCurso.infoCurso )
            this.idInfCurso = this._infoCurso.infoCurso.idInfCurso;

        this.verificaInfo();
        if ( this.idArchivo && this.idArchivo != '0' )
            this.consultaArchivo();
        if ( this.idLink )
            this.consultaLink();

    }

    verificaInfo() {
        this.idArchivo = '0';
        this.idLink = 0;
        this._links.link = '';
		
		//console.log(this._infoCurso);
        switch (this._infoCurso.tipo) {
            case 1:
                this.titulo = 'Presentación';
				this.ruta_elemento = 'assets/images/elements/presentacion.png';
                if ( this.idInfCurso > 0 )
                    if (this._infoCurso.infoCurso.presentacion || this._infoCurso.infoCurso.idArchivoPresentacion || this._infoCurso.infoCurso.idLinkPresentacion) {
                        this.formVisible = false;
						this.tieneInformacion = true;
                        this.des = this._infoCurso.infoCurso.presentacion;
                        this.idArchivo = this._infoCurso.infoCurso.idArchivoPresentacion;
                        this.idLink = this._infoCurso.infoCurso.idLinkPresentacion;
                    }
                break;
            case 2:
                this.titulo = 'Introducción';
				this.ruta_elemento = 'assets/images/elements/introduccion.png';
                if ( this.idInfCurso > 0 )
                    if (this._infoCurso.infoCurso.introduccion || this._infoCurso.infoCurso.idArchivoIntroduccion || this._infoCurso.infoCurso.idLinkIntroduccion) {
                        this.formVisible = false;
						this.tieneInformacion = true;
                        this.des = this._infoCurso.infoCurso.introduccion;
                        this.idArchivo = this._infoCurso.infoCurso.idArchivoIntroduccion;
                        this.idLink = this._infoCurso.infoCurso.idLinkIntroduccion;
                    }
                break;
            case 3:
                this.titulo = 'Objetivos y Competencias';
                this.ruta_elemento = 'assets/images/elements/objetivos.png';
                if ( this.idInfCurso > 0 )
                    if (this._infoCurso.infoCurso.objetivos || this._infoCurso.infoCurso.idArchivoObjetivos || this._infoCurso.infoCurso.idLinkObjetivos) {
                        this.formVisible = false;
						this.tieneInformacion = true;
                        this.des = this._infoCurso.infoCurso.objetivos;
                        this.idArchivo = this._infoCurso.infoCurso.idArchivoObjetivos;
                        this.idLink = this._infoCurso.infoCurso.idLinkObjetivos;
                    }
                break;
            case 4:
                this.titulo = 'Políticas';
				this.ruta_elemento = 'assets/images/elements/politicas.png';
                if ( this.idInfCurso > 0 )
                    if (this._infoCurso.infoCurso.politicas || this._infoCurso.infoCurso.idArchivoPoliticas || this._infoCurso.infoCurso.idLinkPoliticas) {
                        this.formVisible = false;
						this.tieneInformacion = true;
                        this.des = this._infoCurso.infoCurso.politicas;
                        this.idArchivo = this._infoCurso.infoCurso.idArchivoPoliticas;
                        this.idLink = this._infoCurso.infoCurso.idLinkPoliticas;
                    }
                break;
            case 5:
                this.titulo = 'Plan de Clase';
				this.ruta_elemento = 'assets/images/elements/plan.png';
                if ( this.idInfCurso > 0 ){
                    if (this._infoCurso.infoCurso.planclase || this._infoCurso.infoCurso.planclase || this._infoCurso.infoCurso.idArchivoPlanClase) {
                        this.formVisible = false;
						this.tieneInformacion = true;
                        this.des = this._infoCurso.infoCurso.planclase;
                        this.idArchivo = this._infoCurso.infoCurso.idArchivoPlanClase;
                    }
				}
                break;
            case 6:
                this.titulo = 'Fundamentación';
				this.ruta_elemento = 'assets/images/elements/fundamentacion.png';
                if ( this.idInfCurso > 0 )
                    if (this._infoCurso.infoCurso.fundamentacion || this._infoCurso.infoCurso.idArchivoFundamentacion || this._infoCurso.infoCurso.idLinkFundamentacion) {
                        this.formVisible = false;
						this.tieneInformacion = true;
                        this.des = this._infoCurso.infoCurso.fundamentacion;
                        this.idArchivo = this._infoCurso.infoCurso.idArchivoFundamentacion;
                        this.idLink = this._infoCurso.infoCurso.idLinkFundamentacion;
                    }
                break;
            case 7:
                this.titulo = 'Metodología';
				this.ruta_elemento = 'assets/images/elements/metodologia.png';
                if ( this.idInfCurso > 0 )
                    if (this._infoCurso.infoCurso.metodologia || this._infoCurso.infoCurso.idArchivoMetodologia || this._infoCurso.infoCurso.idLinkMetodologia) {
                        this.formVisible = false;
						this.tieneInformacion = true;
                        this.des = this._infoCurso.infoCurso.metodologia;
                        this.idArchivo = this._infoCurso.infoCurso.idArchivoMetodologia;
                        this.idLink = this._infoCurso.infoCurso.idLinkMetodologia;
                    }
                break;
        }
		//console.log('verificaInfo -'+this.idArchivo+'-'+this.idLink+'-');
    }

    actualizaInfo() {
        let params = {
            servicio: "infoCurso",
            accion: "IDesk_InfoCurso_Listado",
            tipoRespuesta: "json",
            idCurso: this._iestdesk.idCursoActual
        };
        this._infoCurso.consultas(params)
            .subscribe(resp => {
				//console.log(resp);
                this._infoCurso.infoCurso = resp[0];
				this.idInfCurso = resp[0].idInfCurso;
                this.verificaInfo();
            },
            errors => {
                console.log(errors);
            });
    }

    editar() { 
		this.formVisible = !this.formVisible;
    }

    respuestaForm(respuesta) {
		console.clear();
		//console.log(respuesta);

		this.actualizaInfo();
		setTimeout( () => {
			if ( this.idArchivo )
				this.consultaArchivo();
			if ( this.idLink ) {
				this.consultaLink();
			}
			this.chRef.detectChanges();
		}, 900);
    }

    consultaLink() {
        let params = {
            servicio: "links",
            accion: "IDesk_Links_Consulta",
            tipoRespuesta: "json",
            idLinks: this.idLink,
            rol: 1 // this._iestdesk.rolActual
        };

        this._links.consultas(params)
            .subscribe(resp => {
                this.link = resp[0];
                this.chRef.detectChanges();
                this._links.link = this.link;
                let idVideo;
                if ( this.link.idTipoLink == 1 ) {
                    idVideo = this.matchYoutubeUrl(this.link.link);
                    this.urlVideo = 'https://www.youtube.com/embed/' + idVideo;
                } else if ( this.link.idTipoLink == 2 ) {
                    idVideo = this.matchVimeoUrl(this.link.link);
                    this.urlVideo = 'https://player.vimeo.com/video/' + idVideo;
                }
				//'video:', idVideo, this.urlVideo);
            },
            errors => {
                console.log(errors);
            });
    }

    private consultaArchivo() {
        let params = {
            servicio: "infoCurso",
            accion: "obtenArchivoInfoCurso",
            tipoRespuesta: "json",
            idInfCurso: this.idInfCurso,
            tipo: this.tipo
        };
        this._infoCurso.consultas(params)
            .subscribe(resp => {
				//console.log(resp);
				this.arrArchivos = resp;
            },
            errors => {
                console.log(errors);
            });
    }
	
	private matchYoutubeUrl(url) {
        let p = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
        if(url.match(p)){
            return url.match(p)[1];
        }
        return false;
    }

    private matchVimeoUrl(url) {
        let p = /(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/i;
        if(url.match(p)){
            return url.match(p)[1];
        }
        return false;
    }
}