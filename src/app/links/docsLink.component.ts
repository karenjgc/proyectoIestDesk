import { Component, Output, Input, EventEmitter, ChangeDetectorRef, OnInit, OnChanges } from '@angular/core';
import { Validators, FormBuilder, FormGroup} from '@angular/forms';
import * as $ from 'jquery';

import { Validaciones } from '../shared/classes/validaciones';
import { GoogleApi } from '../shared/classes/googleApi';

import { Iestdesk } from '../services/iestdesk.service';
import { Links } from '../services/links.service';
import { Tareas } from '../services/tareas.service';
import { ForoDiscusion } from '../services/foroDiscusion.service';
import { ActividadesClase } from '../services/actividadesClase.service';
import { Apuntes } from '../services/apuntes.service';
import { GoogleUserService } from '../services/googleUser.service';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { GoogleApiService, GoogleAuthService } from 'ng-gapi';

declare var gapi : any;
declare var google: any;
let uniqueId = 0;

@Component({
    selector: 'idesk-docsLink',
    templateUrl: './docsLink.component.html'
})

export class DocsLinkComponent implements OnInit, OnChanges {
	ida = `dialogoInformacionL${uniqueId++}`;
	idb = `dialogoAlertaL${uniqueId++}`;
    @Output() linksAdjuntos = new EventEmitter();
	
	public static readonly SESSION_STORAGE_KEY: string = "accessToken";
    public validaciones = new Validaciones();

    public link: FormGroup;
    public infoLinks = [];
    public links = [];

	public idLinks: string = '';
	public linksEdicion = [];
	public idLinksEditado: string = '';

    public cuantosLinks: number = 0;
	public cuantosEditado: number = 0;
	public eliminados: number = 0;

    public modalReference: any;
    public tmpEnlace: string = '';
    public tipo: number;

	public mensajeDialogoL: string;
	public tipoRespuestaL: number = 0;
    public rolActual: number;

    public pickerApiLoaded: boolean = false;
	public _esEdicion: number;
	public _tipoAdjunto: number;
	public enlace2: string = '';

	public mostrarMensaje: boolean = false;
	public salio: boolean = false;

    public arrArchivos = [];
	
    constructor(
        private _iestdesk: Iestdesk,
        private _googleUser: GoogleUserService,
        private _links: Links,
		private _tareas: Tareas,
        private _foroDiscusion: ForoDiscusion,
        private _actividadesClase: ActividadesClase,
		private _apuntes: Apuntes,
        private formBuilder: FormBuilder,
        private chRef: ChangeDetectorRef,
        public ngxSmartModalService: NgxSmartModalService,
        private modalService: NgbModal,
        private authService: GoogleAuthService,
        private gapiService: GoogleApiService
    ){  
	
        this.link = this.formBuilder.group({
			idLink: 0,
            titulo: ['', Validators.required],
            enlace: ['', Validators.required],
            idTipoLink: [0, Validators.required],
            idCurso: this._iestdesk.idCursoActual,
            idpersonidesk: this._iestdesk.idPerson
        });
    }

	ngOnInit(){
		this._links.rol = this._iestdesk.rolActual;
        this.rolActual = this._iestdesk.rolActual;

	}

	@Input()
    set esEdicion( edicion: number ) {
        if ( this._esEdicion != edicion ){
            this._esEdicion = edicion;
			setTimeout( () => {
				this.defineLinksEdicion();
			}, 1000);
        }
    }

	@Input()
    set tipoAdjunto( tipo: number ) {
        if ( this._tipoAdjunto != tipo ){
            this._tipoAdjunto = tipo;
        }
	}

	ngOnChanges(changes){
		
	}

    abreAlta(tipo, content) { // 2 OK
		this.tipoRespuestaL = 0;
        this.limpiaVariables();
		if( (this.infoLinks.length > 0 || this.linksEdicion.length > 0) && this._tipoAdjunto == 3){
			this.mensajeDialogoL = 'Sólo puede agregar un link';
			this.tipoRespuestaL = 2;
			this.ngxSmartModalService.getModal(this.idb).open();
			return;
		}
		
        this.tipo = tipo;
        this.link.patchValue({ idTipoLink: tipo });
        this.modalReference = this.modalService.open(content);
        if( tipo == 3) {
            (<HTMLInputElement> document.getElementById('enlace')).disabled = true;
            this.verificarInicio();
        }
    }

    cancelar() { // 3a OK
        this.limpiaVariables();
        this.cerrar();
    }

    validaLink() { // 3b OK
		this.tipoRespuestaL = 0;
        let al: any = $('#alerta-datos');
		//al.slideUp();
        let valido: boolean;
        let val: string;

        switch ( Number(this.link.value.idTipoLink) ) { 
			case 1:
				valido = this.validaciones.matchYoutubeUrl(this.link.value.enlace);
				console.log(this.validaciones.matchYoutubeUrl(this.link.value.enlace), this.link.value.idTipoLink);
				break;
			case 2:
				valido = this.validaciones.matchVimeoUrl(this.link.value.enlace);
				console.log(valido, this.link.value.idTipoLink);
				break;
            case 3:
                this.tmpEnlace = (<HTMLInputElement> document.getElementById('enlace1')).value;
                this.link.patchValue({ enlace: this.tmpEnlace });
                valido = true;
				break;
            case 4:
                this.link.patchValue({ enlace: this.validaciones.addhttp(this.link.value.enlace) });
                valido = this.validaciones.matchUrl(this.link.value.enlace);
				break;
        }
        
        if (valido && this.link.valid) {
            //console.log(this.link.value, this.link.value.idLink);
            this.link.value.idLink == 0 ? this.altaLink() : this.editaLink();
        } else {
            this.mensajeDialogoL = 'Llene todos los campos antes de continuar y revise que sean correctos.';
			this.tipoRespuestaL = 2;
			//al.slideDown();
			this.ngxSmartModalService.getModal(this.ida).open();
        }
    }

    altaLink() { // 4a OK
        let al: any = $('#alerta-datos');
        let params = {
            servicio: "links",
            accion: (this._links.rol == 1 || this._links.rol == 3) ? "IDesk_Maestro_Link_Alta" : "IDesk_Alumno_Link_Alta",
            tipoRespuesta: "json",
            idCurso: this.link.value.idCurso,
            idTipoLink: this.link.value.idTipoLink,
            enlace: this.link.value.enlace,
            nombre: this.link.value.titulo,
            idpersonidesk: this.link.value.idpersonidesk
        };
        
        this._links.consultas(params)
            .subscribe(resp => {
				this.mensajeDialogoL = resp[0].mensaje;
                if(resp[0].error == 0){
					this.tipoRespuestaL = 1;
                    this.cuantosLinks++;
                    this.links.push(resp[0].idLink);
                    this.enviaLinks();
					
                } else {
                    //al.slideDown();
					this.tipoRespuestaL = 2;
                }
				this.ngxSmartModalService.getModal(this.ida).open();
            }, errors => {
				this.tipoRespuestaL = 2;
				this.mensajeDialogoL = "Ocurrió un error al guardar el link";
				this.ngxSmartModalService.getModal(this.ida).open();
                console.log(errors);
            });
    }

    abreEdita(idTipoLink, content, linkTmp){ // 7 OK
		this.tipoRespuestaL = 0;
        this.tipo = idTipoLink;
        this.link.patchValue({ 
            idTipoLink: linkTmp.idTipoLink,
            idLink: linkTmp.idLink,
            titulo: linkTmp.nombre,
            enlace: linkTmp.link  
        });
        this.modalReference = this.modalService.open(content);
        if( idTipoLink == 3) {
            (<HTMLInputElement> document.getElementById('enlace')).disabled;
            (<HTMLInputElement> document.getElementById('enlace1')).value = linkTmp.link;
            this.verificarInicio();
        }
		this.enlace2 = linkTmp.link;
    }

    editaLink() { // 4b OK?
        let al: any = $('#alerta-datos');
		console.log(this.link.value);
        let params = {
            servicio: "links",
            accion: (this._links.rol == 1 || this._links.rol == 3) ? "IDesk_Maestro_Link_Edita" : "IDesk_Alumno_Link_Edita",
            tipoRespuesta: "json",
            idLink: this.link.value.idLink,
            idTipoLink: this.link.value.idTipoLink,
            enlace: this.link.value.enlace,
            nombre: this.link.value.titulo
        };
        
        this._links.consultas(params)
            .subscribe(resp => {
				this.mensajeDialogoL = resp[0].mensaje;
                if(resp[0].error == 0){
					this.tipoRespuestaL = 1;
					this.chRef.detectChanges();
                    this.enviaLinks();
                } else {
                    //al.slideDown();
					this.tipoRespuestaL = 2;
                }
				this.ngxSmartModalService.getModal(this.ida).open();
            }, errors => {
				this.tipoRespuestaL = 2;
				this.mensajeDialogoL = "Ocurrió un error al editar el link";
				this.ngxSmartModalService.getModal(this.ida).open();
                console.log(errors);
            });
        
    }

	public eliminaLink(idLink, tipo) { // -6 OK
	console.clear();
        this.eliminados++;
		let linksRef = [];
		let idLinksRef: string = '';
		let envio: string;
		let cuantos: number = 0;
		let arreglo = [];
		let idArreglo = [];
		linksRef = (tipo == 0) ? this.infoLinks : this.linksEdicion;
		for(let i = 0; i < linksRef.length ; i++){
			if(linksRef[i].idLink != idLink){
				arreglo.push(linksRef[i]);
				idArreglo.push(linksRef[i].idLink);
				cuantos++;
			}
		}
	
		idLinksRef = idArreglo.join('|');

		if(tipo == 0){
			this.idLinks = idLinksRef;
			this.infoLinks = arreglo;
			this.cuantosLinks = cuantos;
			this.links = idArreglo;
		} else {
			this.idLinksEditado = idLinksRef;
			this.linksEdicion = arreglo;
			this.cuantosEditado = cuantos;
		}

		if(this.idLinks == '')
			envio = this.idLinksEditado;
		else if(this.idLinksEditado == '')
			envio = this.idLinks;
		else
			envio = this.idLinks + '|' + this.idLinksEditado;
		//console.log(envio);
		this.linksAdjuntos.emit(envio);
    }

    abreLink(l, content) {
		if ( l.idTipoLink == 4 ) {
			window.open(l.link, '_blank');
		} else {
			this.arrArchivos = [];
			this.arrArchivos.push({
				idArchivo: l.idLink,
				nombreArchivo: l.nombre,
				ruta: l.idTipoLink == 3 ? l.link.replace('view', 'preview').replace('edit', 'preview') : l.idTipoLink == 4 ? l.link : l.idTipoLink == 1 ? 'https://www.youtube.com/embed/' + this.validaciones.matchYoutubeUrl(l.link): 'https://player.vimeo.com/video/' + this.validaciones.matchVimeoUrl(l.link),
				pesoFormato: 0,
				idTipoArchivo: 0,
				extension: l.idTipoLink == 3 ? 'drive' : l.idTipoLink == 4 ? 'link' : 'video',
				llave: '',
				imgMini: 'assets/images/elements/' + ( l.idTipoLink == 3 ? 'drive.png' : l.idTipoLink == 4 ? 'link.png' : l.idTipoLink == 1 ? 'youtube.png' : 'vimeo.png' )
			});

			
			this.modalReference = this.modalService.open(content);
		}
    }

    enviaLinks() { // 5 OK?
		
		let envio;
		this.idLinks = this.links.join('|');
		if(this.idLinks != ''){
            let params = {
                servicio: "links",
                accion: "IDesk_Links_Consulta",
                tipoRespuesta: "json",
                idLinks: this.idLinks,
                rol: this._iestdesk.rolActual
            };

			this._links.consultas(params)
				.subscribe(resp => {
					this.infoLinks = resp;
				}, errors => {
					console.log(errors);
				});
		}
		if(this.idLinksEditado != ''){
			let params = {
                servicio: "links",
                accion: "IDesk_Links_Consulta",
                tipoRespuesta: "json",
                idLinks: this.idLinksEditado,
                rol: this._iestdesk.rolActual
            };

			this._links.consultas(params)
				.subscribe(resp => {
					this.linksEdicion = resp;
				}, errors => {
					console.log(errors);
				});
		}

		this.limpiaVariables();
		if(this.idLinks == '')	
			envio = this.idLinksEditado;
		else if(this.idLinksEditado == '')
			envio = this.idLinks;
		else
			envio = this.idLinks + '|' + this.idLinksEditado;

		console.log(this.links, this.idLinks, this.idLinksEditado);
        this.linksAdjuntos.emit(envio);
    }

	// Edición
	private defineLinksEdicion() {
		//console.log('edición', this._esEdicion,  '        tipoAdjunto', this._tipoAdjunto);
		let acciones = {};
        if ( this._esEdicion != 0 ) {
			switch(+this._tipoAdjunto){
				case 1:
					acciones = {
						/*1 : {
							servicio: "tareas",
							accion: "IDesk_Alumno_Tareas_Links",
							idTareaAlumno: (this._tareas.tarea == undefined) ? 0 : this._tareas.tarea.idTareaAlumno
						},*/
						2: {
							servicio: "foroDiscusion",
							//accion: this._tipoAdjunto == 1 ? "IDesk_Foro_Discusion_Vista_Ind_Links" : this._tipoAdjunto == 3 ? "IDesk_Tareas_Rubrica_Externa_Link" : "",
							accion: "IDesk_Foro_Discusion_Vista_Ind_Links",
							idForoDisc: (this._foroDiscusion == undefined) ? 0 : this._foroDiscusion.idForoDisc
						},
						5: {
							servicio: "tareas" ,
							//accion: this._tipoAdjunto == 1 ? "IDesk_Tareas_Vista_Links" : this._tipoAdjunto == 3 ? "IDesk_Tareas_Rubrica_Externa_Link",
							accion: "IDesk_Tareas_Vista_Links",
							idTarea: this._tareas.idTarea
						},                
						8: {
							servicio: "actividadesClase",
							accion: "IDesk_Actividad_Clase_Libre_Vista_Ind_Links",
							idActividad: this._actividadesClase.idActividad
						},
						/*9: {
							servicio: "actividadesClase",
							accion: "IDesk_Alumno_Actividades_Clase_Libre_Links",
							idActividadAlumno: this._actividadesClase.idActividadAlumno 
							//(this._actividadesClase.actividad == undefined) ? 0 : this._actividadesClase.actividad.idActividadAlumno
						},*/
						10: {
							servicio: "actividadesClase",
							accion: "IDesk_Actividades_Clase_Externa_Vista_Ind_Links",
							idActividad: this._actividadesClase.idActividad
						}/*,
						11: {
							servicio: "actividadesClase",
							accion: "IDesk_Alumno_Actividades_Clase_Externa_Links",
							idActividadAlumno: this._actividadesClase.idActividadAlumno 
							//(this._actividadesClase.actividad == undefined) ? 0 : this._actividadesClase.actividad.idActividadAlumno
						}*/
					};
				break;
				case 2:
					acciones = {
						1 : {
							servicio: "tareas",
							accion: "IDesk_Alumno_Tareas_Links",
							idTareaAlumno: (this._tareas.tarea == undefined) ? 0 : this._tareas.tarea.idTareaAlumno
						},
						3: {
							servicio: "apuntes", // apuntes
							accion: "IDesk_Apuntes_Consulta_Links",
							idApunte: (this._apuntes == undefined ) ? 0 : this._apuntes.idApunte
						},
						9: {
							servicio: "actividadesClase",
							accion: "IDesk_Alumno_Actividades_Clase_Libre_Links",
							idActividadAlumno: this._actividadesClase.idActividadAlumno
						},
						11: {
							servicio: "actividadesClase",
							accion: "IDesk_Alumno_Actividades_Clase_Externa_Links",
							idActividadAlumno: this._actividadesClase.idActividadAlumno
						}
					}
				break;
				case 3:
					acciones = {
						2: {
							servicio: "links", // rúbrica de foros
							accion: "IDesk_Rubrica_Externa_Link",
							idActividad: (this._foroDiscusion == undefined) ? 0 : this._foroDiscusion.idForoDisc,
							tipo: this._esEdicion
						},
						5: {
							servicio: "links", //"tareas",
							accion: "IDesk_Rubrica_Externa_Link",
							idActividad: this._tareas.idTarea,
							tipo: this._esEdicion
						}
					}
				break;
			}

            acciones[this._esEdicion]["tipoRespuesta"] = "json";
			//console.log(acciones);
            this._tareas.consultas(acciones[this._esEdicion])
                .subscribe( resp => {
                    this.obtenLinksEdicion(resp);
                }, errors => {
                    console.log(errors);
                });
        }
    }

	private obtenLinksEdicion(resp){ // 8
		this.linksEdicion = resp;
		let temp = [];
		let envio = '';

		this.cuantosEditado = this.linksEdicion.length;
								
		for(let i = 0; i < this.linksEdicion.length; i++) {
			temp.push(this.linksEdicion[i].idLink);
		}

		this.idLinksEditado = temp.join("|");
		this.idLinks = this.links.join('|');
		
		if(this.idLinks == '')
			envio = this.idLinksEditado;
		else if(this.idLinksEditado == '')
			envio = this.idLinks;
		else
			envio = this.idLinks + '|' + this.idLinksEditado;
		
		this.linksAdjuntos.emit(envio);
		
		console.log(envio);
	}

	public cierraDialogoInfo(resp, id) {
		this.ngxSmartModalService.getModal(id).close();
		if(this.tipoRespuestaL == 1)
			this.cerrar();
	}

	limpiaVariables() {
        this.link.reset();
		this.enlace2 = '';
        this.link.patchValue({ 
            idLink: 0,
            idCurso: this._iestdesk.idCursoActual,
            idpersonidesk: this._iestdesk.idPerson });
    }

	public cerrar(){
		this.modalReference.close();
	}

    // Google API
    verificarInicio() {
		if ( !this.salio ) {
			if ( this.isLoggedIn() ) {
				this.inicializarDrive();
			}
			else {
				this.signIn();
			}
		} else {
			this.signIn();
		}
    }
	
    inicializarDrive() {
        this.gapiService.onLoad().subscribe();
        this.authService.getAuth().subscribe((auth) => {
            if( !auth.isSignedIn.get() )
                this.signIn();
        });
        this.gapiService.onLoad().subscribe(()=> {
            gapi.load('picker', {'callback': this.onPickerApiLoad.bind(this)} );
        });
    }

    isLoggedIn(): boolean {
        return this._googleUser.isUserSignedIn();
    }

    signIn() {
		this._googleUser.signIn();
		this.salio = false;
    }

    onPickerApiLoad() {
        this.pickerApiLoaded = true;
        this.ver();
    }

    ver() {
        const picker = new google.picker.PickerBuilder().
            addView(google.picker.ViewId.DOCS).
            setOAuthToken(this._googleUser.getToken()).
            //setDeveloperKey('AIzaSyA_w5T6HhlhH6RouNvDyQx4XVN75THA--Q').
            setCallback(this.pickerCallback).
            build();
        picker.setVisible(true);
    }

    pickerCallback(data) {
		let enlace = <HTMLInputElement> document.getElementById('enlace');
        let enlace1 = <HTMLInputElement> document.getElementById('enlace1');
        var url = '';

        if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
			var doc = data[google.picker.Response.DOCUMENTS][0];
			url = doc[google.picker.Document.URL];
			this.tmpEnlace = url;
			console.log('You picked: ' + url, this.tmpEnlace);
        } else {
			if(this.esEdicion != 0){
				url = (<HTMLInputElement>document.getElementById('enlace2')).value || '';
			}
		}
		enlace.value = url;
		enlace1.value = url;
    }

    parchaLinkDrive(url) {
        this.link.patchValue({ enlace: url });
        console.log(JSON.stringify(this.link.value));
    }

	public signOut(): void {
		this.authService.getAuth().subscribe((auth) => {
			try {
				//console.log('se sale');
				this.mostrarSalida();
				gapi.auth2.getAuthInstance().disconnect();
				//auth.signOut(); esto ya no funciona!
			} catch (e) {
				console.error(e);
			}
			//return sessionStorage.removeItem(DocsLinkComponent.SESSION_STORAGE_KEY)
		});
	}

	public mostrarSalida() {
		this.mostrarMensaje = true;
		this.salio = true;
		setTimeout(() => {
			this.mostrarMensaje = false;
		}, 1300);
	}
}