import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AltasBase } from '../shared/classes/altasBase';
import { Iestdesk } from '../services/iestdesk.service';
import { FormBuilder } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Router, ActivatedRoute } from '@angular/router';
import { PodcastService } from '../services/podcast.service';
import { BancoMultimediaComponent } from '../editor/banco-multimedia/banco-multimedia.component';
import * as _moment from 'moment';
import { EditorService } from '../services/editorService.service';

@Component({
	selector: 'idesk-altaPodcast',
	templateUrl: './altaPodcast.component.html'
})
export class AltaPodcastComponent extends AltasBase implements OnInit {
	public llave = '';
	public linkValido = false;
	public idPodcast;
	public tipoAudio: boolean = false;
	public audioRuta: string = '';
	public elementoEliminar: string = 'el archivo de audio';
	public idaEliminar: number;
	public imagenDialog = 0;
	public accionDialog = 0;
	public validando = false;
	public change = false;
	public vistaAlumno;
	public mensajeAlerta;
	
	public formMultimedia = {
		titulo: "",
		descripcion: "",
		idArchivo: 0,
		url: null,
        fechaPublicacion: new Date()
	};
	
	public modalReference: any;
	public modalOption: NgbModalOptions = {
	  backdrop: 'static',
	  keyboard: false
	};

	constructor(
		public iestdesk: Iestdesk,
		private _podcastService: PodcastService,
		private _formBuilder: FormBuilder,
		private _chRef: ChangeDetectorRef,
		private _modalService: NgbModal,
		public _ngxSmartModalService: NgxSmartModalService,
		private router: Router,
		private route: ActivatedRoute,
        public editorService: EditorService
	) {
		super(iestdesk,
			null,
			null,
			_formBuilder,
			_chRef,
			_modalService,
			_ngxSmartModalService,
			router);
		this.formulario = this._formBuilder.group({
			idArchivos: ''
		});

		this.idPodcast = this._podcastService.idPodcast;

		if (this.idPodcast == 0) {
            if(this.iestdesk.rolActual != 3){
                this.fechaPublicacionSeleccionada = new Date();
                this.agrupar();
            }
		} else {
			this.consultaPodcast();
		}
	}

	ngOnInit() {
		this.iestdesk.registraAcceso(66, this.idPodcast);
		console.log('esAsignado', this.editorService.esAsignado);
	}

	consultaPodcast() {
		let params = {
			servicio: "multimedia",
			accion: "IDesk_Podcast_VistaInd",
			tipoRespuesta: "json",
			idPodcast: this.idPodcast
		};
		this._podcastService.consultas(params)
		.subscribe(resp => {			
			this.temaSeleccionado = +resp[0].idTema;
				
			this.formMultimedia = {
				titulo: resp[0].titulo,
				descripcion: resp[0].descripcion,
				idArchivo: resp[0].idAudio,
				url: resp[0].tipoAudio == 2 ? '<iframe width="100%" height="140" scrolling="no" frameborder="no" src="'+resp[0].url+'"></iframe>' : resp[0].url,
				fechaPublicacion: new Date(resp[0].fechaPublicacion.split(' ').join('T'))
			};
			this.audioRuta = !this.tipoAudio ? resp[0].url : "";
			this.tipoAudio = resp[0].tipoAudio == 2;

			this.cargaElementos( resp[0].idTema, resp[0].fechaPublicacion );
			this.agrupar();
			if (this.tipoAudio) {
				this.validaLink();
			}
		}, errors => {
			console.log(errors);
		});
	}

	agregaAudio(idAudio){
		this.formMultimedia.idArchivo = idAudio;
		this.formMultimedia.url = null;
	}

	validarFormulario() {
		let valido = true;

		for(let campos of Object.keys(this.formMultimedia)) {
			if ((this.formMultimedia[campos] == "" && campos != 'url' && campos != 'idArchivo') || (!this.tipoAudio && campos == 'idArchivo' && this.formMultimedia[campos] == 0)) {
				valido = false;
				break;
			}
		}

		if (valido && (!this.tipoAudio || this.linkValido)) {
			valido = this.publicacionCursos();

			if (valido) {
				if(this.iestdesk.rolActual == 3 ){
                    if(this.editorService.esAsignado == 1){
                        this.fechaPublicacion = [];
                        this.fechaPublicacion.push(_moment(this.formMultimedia.fechaPublicacion).format("DD/MM/YY HH:mm"));
                    }

                    this.temas = [];
                    this.temas.push(this.temaSeleccionado);
				}
				
				this.altaEdicionPodcast();
			} else {
				this.limpiaVariables();
				this.imagenDialog = 1;
				this.accionDialog = 0;
				this.guardado = false;
				this.mensajeDialog = 'Llene todos los campos de publicación a grupos seleccionados antes de continuar.';
				this.ngxSmartModalService.getModal('dialogoInformacion').open();
			}
		} else {
			this.limpiaVariables();
			this.imagenDialog = 1;
			this.accionDialog = 0;
			this.guardado = false;
			this.mensajeDialog = 'Llene todos los campos antes de continuar';
			this.tipoRespuesta = 2;
			this.ngxSmartModalService.getModal('dialogoInformacion').open();
		}
	}

	validaLink(){
		
		//Evalua si es un frame
		let frame = this.formMultimedia.url.match(/(?:<iframe[^>]*)(?:(?:\/>)|(?:>.*?<\/iframe>))/);
		if(frame){
		  let frameHtml = frame[0];

		  //Obtiene src de frame
		  let src = frameHtml.match(/src\s*=\s*"(.+?)"/);
		  if(src){
			let srcFrame = src[0].split('src="')[1].split('"')[0];
  
			//Evalua si es src de soundcloud
			let matchSoundcloud = srcFrame.match(/^https?:\/\/(w.soundcloud\.com|snd\.sc)\/(.*)$/);
			if(matchSoundcloud){
			   this.linkValido = true;
			   this.change = false;
			   this.llave = srcFrame;
			   console.log('Soundcloud', this.llave);
			}else{
			  this.mensajeAlerta = 'No se han encontrado coincidencias';
			  this.linkValido = false;
			  this.change = true;
			}
		  }else{
			this.mensajeAlerta = 'Es necesario que el iframe contenga el atributo src';
			this.linkValido = false;
			this.change = true;
		  }
		}else{
		  this.mensajeAlerta = 'Es necesario ingresar un iframe para realizar el registro';
		  this.linkValido = false;
		  this.change = true;
		}
	}

	altaEdicionPodcast() {
		let params = {
			servicio: "multimedia",
			accion: this.idPodcast == 0 ? "IDesk_Maestro_Podcast_Alta" : "IDesk_Maestro_Podcast_Edita",
			tipoRespuesta: "json",
			idPodcast: this.idPodcast,
			titulo: this.formMultimedia.titulo,
			descripcion: this.formMultimedia.descripcion,
			idAudio: !this.tipoAudio ? this.formMultimedia.idArchivo : 0,
			url: this.tipoAudio ? this.llave : '',
			idCursos: this.idCursosPub.join("|"), 
			idTemas: this.temas.join("|"),
			fechaPublicacion: this.fechaPublicacion.join("|"),
			idpersonidesk: this.iestdesk.idPerson
		};
		this._podcastService.consultas(params)
			.subscribe(resp => {
				this.mensajeDialog = resp[0].mensaje;
				if(resp[0].error == 0){
					this.imagenDialog = 0; //checked
					this.accionDialog = 1;
					this.guardado = true;
				} else {
					this.imagenDialog = 1; //warning
					this.accionDialog = 0;
				}
			},
			errors => {
				this.imagenDialog = 1;
				this.accionDialog = 0;
				this.guardado = false;
				this.mensajeDialog = 'Ocurrió un error. Intente más tarde.';
				this.limpiaVariables();
			});
		this.ngxSmartModalService.getModal('dialogoInformacion').open();
	}

	confEliminar(){
        this.idaEliminar = this.formMultimedia.idArchivo;
        this.ngxSmartModalService.getModal('confirmarEliminacion').open();
	}

	confirmaElimina(e){
		if(e == 1){
			this.eliminaAudio();
			this.ngxSmartModalService.getModal('confirmarEliminacion').close();
		}
	}

	eliminaAudio(){
        let params = {
            servicio: "avisos",
            accion: "IDesk_Maestro_Audio_Elimina",
            tipoRespuesta: "json",
            idAudio: this.idaEliminar,
            idpersonidesk: this.iestdesk.idPerson
        };
        this._podcastService.consultas(params)
            .subscribe(resp => {
                if(resp[0].error == 0){
					this.formMultimedia.idArchivo = 0;
					this.tipoRespuesta = 1;
					this.mensajeDialog = 'Archivo de audio borrado correctamente.';
                } else {
					this.tipoRespuesta = 2;
					this.mensajeDialog = 'Ocurrió un error al borrar el archivo de audio.';
				}
				this.ngxSmartModalService.getModal('dialogoInformacion').open();
            },
            errors => {
                console.log(errors);
            });
	}
	
	abrirBanco(){
		this.modalReference = this._modalService.open(BancoMultimediaComponent, this.modalOption);
	
		this.modalReference
		.result.then(resp => {
			if (resp) {
				this.formMultimedia = {
					titulo: resp.titulo,
					descripcion: resp.descripcion,
					idArchivo: 0,
					url: '<iframe src="' + resp.elemento +'"></iframe>',
					fechaPublicacion: new Date()
				};
				
				this.validaLink();
			}
		});
		
		this.modalReference.componentInstance.tipoElemento = 1;
		this.modalReference.componentInstance.obtenerFiltroEtiquetas(this.modalReference.componentInstance.elementos[1]);
	}

    vistaAlumnoObjeto(content){
		this.vistaAlumno = this.formMultimedia;
		this.vistaAlumno.url = this.llave;
		this.vistaAlumno.tipoAudio = this.tipoAudio ? 2 : 1;
        this.modalReference = this._modalService.open(content, { backdrop: 'static' });
    }
}