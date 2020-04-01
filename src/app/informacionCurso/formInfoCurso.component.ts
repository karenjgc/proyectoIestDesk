import { Component, ChangeDetectorRef, Output, EventEmitter, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup} from '@angular/forms';

import { Iestdesk } from '../services/iestdesk.service';
import { Archivos } from '../services/archivos.service';
import { Links } from '../services/links.service';
import { InformacionCurso } from '../services/infoCurso.service';
import { FroalaOptions } from '../shared/iestdesk/froala';

import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'idesk-formInfoCurso',
    templateUrl: './formInfoCurso.component.html'
})
export class FormInfoCursoComponent {
    @Output() terminado = new EventEmitter();
    @ViewChild('childLink') childLink;

    public opcFroala = new FroalaOptions();
    public cursoActual: number;
    
    public idInfCurso: number = 0;
	public nombreCursoActual: string = this._iestdesk.cursoActual;
    public des: string = '';
    public idTipo: number;
    public infoCurso: FormGroup;
    public pubCursos = [];
    public temp = [];
    public idCursos: string;
    public idCursosPub = [];
    public titulo: string;
    public tituloLink: string;
	public rolActual;
	public archivoInfo = [];
	public idArchivos: string = '0';
    public idLink: string = '0';

    // Vista alumno
    public info;
    public urlVideo;
    public tipocomp;
    public ruta;
	public arrArchivos = [];
	public nombreZip: string;
	public rutaZip: string;
	//public numeroArchivos: number = 0;

    public mensaje: string;
    public mensajeDialogo: string;
    public tipoRespuesta: number;
    public res: boolean;
	public editando: number = 0;
    public modalReference: any;
    public options: Object = this.opcFroala.opcionesCompleto;
    public model: number = 1;

    constructor(
        private _iestdesk: Iestdesk,
        private _infoCurso: InformacionCurso,
        private _archivos: Archivos,
        private _links: Links,
        private formBuilder: FormBuilder,
        public ngxSmartModalService: NgxSmartModalService,
        private modalService: NgbModal,
        private chRef: ChangeDetectorRef
    ){ 
        this.rolActual = this._iestdesk.rolActual;
		if ( this._infoCurso.infoCurso ){
            this.idInfCurso = this._infoCurso.infoCurso.idInfCurso;
        }
        this.idTipo = this._infoCurso.tipo;
        
        this.verificaInfo();
        this.tituloLink = this.titulo;

        this.infoCurso = this.formBuilder.group({
            idInfCurso: this.idInfCurso,
            tipo: this._infoCurso.tipo,
            descripcion: '',
            idArchivo: '',
            idLink: '',
            idCurso: this._iestdesk.idCursoActual,
            idpersonidesk: this._iestdesk.idPerson
        });

		if ( this.des ){
            this.infoCurso.patchValue({ descripcion: this.des });
        }

		if ( this.idArchivos != '0' )
			this.infoCurso.patchValue({ idArchivo: this.idArchivos });

		if ( this.idLink != '0' ) {
			this.infoCurso.patchValue({ idLink: this.idLink });
			this._links.edicion = true;
		}  else
            this._links.edicion = false;

        this.cursoActual = this._iestdesk.idCursoActual;
        this.verificaGrupos();
    }

    verificaInfo() {
        switch ( this.idTipo ) {
            case 1:
                this.titulo = 'Presentación';
                if ( this.idInfCurso > 0 ) {
                    this.des = this._infoCurso.infoCurso.presentacion;
                    this.idArchivos = this._infoCurso.infoCurso.idArchivoPresentacion;
                    this.idLink = this._infoCurso.infoCurso.idLinkPresentacion;
                    this.editando = 4;
                }
                break;
            case 2:
                this.titulo = 'Introducción';
                if ( this.idInfCurso > 0 ) {
                    this.des = this._infoCurso.infoCurso.introduccion;
                    this.idArchivos = this._infoCurso.infoCurso.idArchivoIntroduccion;
                    this.idLink = this._infoCurso.infoCurso.idLinkIntroduccion;
                    this.editando = 4;
                }
                break;
            case 3:
                this.titulo = 'Objetivos y Competencias';
                if ( this.idInfCurso > 0 ) {
                    this.des = this._infoCurso.infoCurso.objetivos;
                    this.idArchivos = this._infoCurso.infoCurso.idArchivoObjetivos;
                    this.idLink = this._infoCurso.infoCurso.idLinkObjetivos;
                    this.editando = 4;
                }
                break;
            case 4:
                this.titulo = 'Políticas';
                if ( this.idInfCurso > 0 ) {
                    this.des = this._infoCurso.infoCurso.politicas;
                    this.idArchivos = this._infoCurso.infoCurso.idArchivoPoliticas;
                    this.idLink = this._infoCurso.infoCurso.idLinkPoliticas;
                    this.editando = 4;
                }
                break;
            case 5:
                this.titulo = 'Plan de Clase';
                if ( this.idInfCurso > 0 ) {
                    this.des = this._infoCurso.infoCurso.planclase;
                    this.idArchivos = this._infoCurso.infoCurso.idArchivoPlanClase;
                    this.editando = 4;
                }
                break;
            case 6:
                this.titulo = 'Fundamentación';
                if ( this.idInfCurso > 0 ) {
                    this.des = this._infoCurso.infoCurso.fundamentacion;
                    this.idArchivos = this._infoCurso.infoCurso.idArchivoFundamentacion;
                    this.idLink = this._infoCurso.infoCurso.idLinkFundamentacion;
                    this.editando = 4;
                }
                break;
            case 7:
                this.titulo = 'Metodología';
                if ( this.idInfCurso > 0 ) {
                    this.des = this._infoCurso.infoCurso.metodologia;
                    this.idArchivos = this._infoCurso.infoCurso.idArchivoMetodologia;
                    this.idLink = this._infoCurso.infoCurso.idLinkMetodologia;
                    this.editando = 4;
                }
                break;
        }
        if ( this.idArchivos == '' )
            this.idArchivos = '0';
        if ( this.idLink == '' ) {
            this.idLink = '0';
            this._links.edicion = false;
        }
    }

    revisa(e) {
        if(e.target.checked){ 
            this.temp.push(e.target.value);
        } else {
            let index = this.temp.indexOf(e.target.value);
            this.temp.splice(index,1);
        }
    }

    agrupar(info){
        //console.log(info);
        for(let i = 0; i < this._iestdesk.cursosLaterales.length; i++) {
            if(!this.pubCursos.find(x => x.idCurso == this._iestdesk.cursosLaterales[i].idCurso) && this._iestdesk.cursosLaterales[i].idGrado == this._iestdesk.idGrado){
                this.pubCursos.push({
                    idCurso:  this._iestdesk.cursosLaterales[i].idCurso,
                    materia:  this._iestdesk.cursosLaterales[i].materia,
                    clave:  this._iestdesk.cursosLaterales[i].clave, 
                    tieneInfo: info[info.findIndex(y => y.idCurso == this._iestdesk.cursosLaterales[i].idCurso)].tieneInfo
                });
            }
        }
        this.temp = [];
    }

    verificaGrupos() {
        let cursos = [];
        for(let i = 0; i < this._iestdesk.cursosLaterales.length; i++) {
            cursos.push(this._iestdesk.cursosLaterales[i].idCurso);
        }

        let params = {
            servicio: "infoCurso",
            accion: "IDesk_Maestro_VerificaInfoCurso",
            tipoRespuesta: "json",
            idCursos: cursos.join("|"),
            tipo: this.idTipo
        };
        this._infoCurso.consultas(params)
            .subscribe(resp => {
                this.agrupar(resp);
            },
            errors => {
                console.log(errors);
            });
			
    }

    valida() {
		this.infoCurso.value.descripcion.replace(/<img .*?>/g, "");
        this.temp.push(this.cursoActual);
        
        this.chRef.detectChanges();
        
        this.infoCurso.patchValue({ 
            idCurso: this.temp.join('|'),
            idArchivo: this.idArchivos,
            idLink: this.idLink 
        });
        
        if( this.infoCurso.value.idArchivo != '' || this.infoCurso.value.idLink != ''||  this.infoCurso.value.descripcion != '' ) { 
			this.altaEditaInfoCurso();
        } else {
            this.mensajeDialogo = 'Ingrese una descripción antes de continuar';
            this.tipoRespuesta = 2;
            this.ngxSmartModalService.getModal('dialogoInformacion').open();
        }
    }

	altaEditaInfoCurso() {
        let params = {
            servicio: "infoCurso",
            accion: (this.des) ? "IDesk_Maestro_InfoCurso_Edita" : "IDesk_Maestro_InfoCurso_Alta",
            tipoRespuesta: "json",
            idCursos: this.infoCurso.value.idCurso,
			idInfCurso: this.infoCurso.value.idInfCurso,
            tipo: this.infoCurso.value.tipo,
            descripcion: this.infoCurso.value.descripcion,
            idArchivo: this.infoCurso.value.idArchivo,
            idLink: this.infoCurso.value.idLink,
            idpersonidesk: this.infoCurso.value.idpersonidesk
        };
        //console.log(params);
        this._infoCurso.consultas(params)
            .subscribe(resp => {
                this.mensajeDialogo = resp[0].mensaje;
                if ( resp[0].error == 0 ) {
					this.idInfCurso = resp[0].idInfCurso;
                    this.tipoRespuesta = 1;
                    this.res = true;
                } else   {
                    this.tipoRespuesta = 2;
                    this.res = false;
                }
                this.ngxSmartModalService.getModal('dialogoInformacion').open();
                
            },
            errors => {
                console.log(errors);
            });
    }

    link(idLink) {
        this.idLink = idLink;
        //console.log(this.idLink);
    }
	
	archivos(idArchivos) {
		idArchivos = idArchivos || 0;
        this.idArchivos = idArchivos;
		//console.log(this.idArchivos);
		this.chRef.detectChanges();
    }
	
	obtenRespuesta(respuesta, n){
		// ¿pendiente revisar validaciones?
		// alert?
		switch(respuesta){
			case 'fileError':
				this.mensajeDialogo = (n == 1) ? 'Asegúrate de subir sólo un archivo y que este sea menor a 20MB.' : 'Asegúrate de subir un archivo menor a 20MB.';
				this.tipoRespuesta = 2;
				this.ngxSmartModalService.getModal('dialogoInformacion').open();
			break;
			case 'fileErrorExt':
				this.mensajeDialogo = (n == 1) ? 'El archivo tiene una extensión no válida.' : 'Uno de los archivos tiene una extensión no válida.';
				this.tipoRespuesta = 2;
				this.ngxSmartModalService.getModal('dialogoInformacion').open();
			break;
		}
	}

    vistaPrevia(content) {
		this.infoCurso.patchValue({
			idArchivo: this.idArchivos,
            idLink: this.idLink 
        });
        this.info = this.infoCurso.value;

        if(this.info.idLink != '' && this.info.idLink != 0)
            this.consultaLink(this.info.idLink);
        if(this.info.idArchivo != '' && this.info.idArchivo != 0)
            this.consultaArchivo(this.info.idArchivo);
        this.modalReference = this.modalService.open(content);
    }

    private consultaLink(idLink) {
        let params = {
            servicio: "links",
            accion: "IDesk_Links_Consulta",
            tipoRespuesta: "json",
            idLinks: idLink,
            rol: this._iestdesk.rolActual
        };

        this._links.consultas(params)
            .subscribe(resp => {
                let link = resp[0];
                this._links.link = this.link;
                let idVideo;
                if ( link.idTipoLink == 1 ) {
                    idVideo = this.matchYoutubeUrl(link.link);
                    this.urlVideo = 'https://www.youtube.com/embed/' + idVideo;
                } else if ( link.idTipoLink == 2 ) {
                    idVideo = this.matchVimeoUrl(link.link);  //idVideo = this.matchVimeoUrl(link.enlace) 
                    this.urlVideo = 'https://player.vimeo.com/video/' + idVideo;
                }
            },
            errors => {
                console.log(errors);
            });
    }

    private consultaArchivo(idArchivo) {
		let params = {
            servicio: "archivos",
            accion: "IDesk_Archivos_Consulta",
            tipoRespuesta: "json",
			idArchivos: idArchivo,
			rol: 1
        };
        this._infoCurso.consultas(params)
            .subscribe(resp => {
				this.arrArchivos = resp;
				//this.numeroArchivos = this.arrArchivos.length;
				//console.log(this.arrArchivos.length);
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

    cierraDialogoInfo(resp) {
        this.ngxSmartModalService.getModal('dialogoInformacion').close();
        if ( this.res ) {
			this.terminado.emit(this.res);
        }
    }
}