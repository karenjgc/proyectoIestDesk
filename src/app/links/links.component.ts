import { Component, Output, Input, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Validators, FormBuilder, FormGroup} from '@angular/forms';
import * as $ from 'jquery';

import { Validaciones } from '../shared/classes/validaciones';

import { Iestdesk } from '../services/iestdesk.service';
import { Links } from '../services/links.service';
import { Tareas } from '../services/tareas.service';
import { ForoDiscusion } from '../services/foroDiscusion.service';
import { ActividadesClase } from '../services/actividadesClase.service';
import { GoogleUserService } from '../services/googleUser.service';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { GoogleApiService, GoogleAuthService } from 'ng-gapi';

declare var gapi : any;
declare var google: any;
let uniqueId = 0;

@Component({
    selector: 'idesk-links',
    templateUrl: './links.component.html'
})

export class LinksComponent {
	id = `dialogoInformacionL${uniqueId++}`;
    @Output() linksAdjuntos = new EventEmitter();

	public static readonly SESSION_STORAGE_KEY: string = "accessToken";
    public validaciones = new Validaciones();

    public link: FormGroup;
    public infoLinks = []; //public links = [];
    public idLinks = [];

	public links: string = ''; ////public links = [];
	public linksEdicion = [];
	public idLinksEditado: string = '';

    public cuantosLinks: number = 0;
	public cuantosEditado: number = 0;
	public eliminados: number = 0;

    public modalReference: any;
    public tmpEnlace: string = '';
    public tipo: number;
	public mensaje: string;
	public mensajeDialogoL: string;
	public tipoRespuesta: number;
    public rolActual: number;

    public pickerApiLoaded: boolean = false;
	public _esEdicion: number;
	public _tipoAdjunto: number;
	public enlace2: string = '';

    constructor(
        private _iestdesk: Iestdesk,
        private _googleUser: GoogleUserService,
        private _links: Links,
        private _tareas: Tareas,
        private _foroDiscusion: ForoDiscusion,
        private _actividadesClase: ActividadesClase,
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
        this._links.rol = this._iestdesk.rolActual;
		this.rolActual = this._iestdesk.rolActual;
    }

    @Input()
    set esEdicion( edicion: number ) {
        if ( this._esEdicion != edicion ){
            this._esEdicion = edicion;
            this.defineLinksEdicion();
        }
    }

	@Input()
    set tipoAdjunto( tipo: number ) {
        if ( this._tipoAdjunto != tipo ){
            this._tipoAdjunto = tipo;
			if(this._esEdicion != 0)
				this.defineLinksEdicion();
        }
    }

	abreAlta(tipo, content) {
        this.limpiaVariables();
		if( (this.infoLinks.length > 0 || this.linksEdicion.length > 0) && this._tipoAdjunto == 3){
			this.mensajeDialogoL = 'Sólo puede agregar un link';
			this.tipoRespuesta = 2;
			this.ngxSmartModalService.getModal(this.id).open();
			return; //
		}
		
        this.tipo = tipo;
        this.link.patchValue({ idTipoLink: tipo });
        this.modalReference = this.modalService.open(content);
        if( tipo == 3) {
            //let enlace = <HTMLInputElement> document.getElementById('enlace');
            (<HTMLInputElement> document.getElementById('enlace')).disabled = true;
            this.verificarInicio();
        }
    }

    cancelar() {
        this.limpiaVariables();
        this.modalReference.close();
    }

    validaLink() {
        //let al: any = $('#alerta-datos');
        let valido: boolean;
        let val: string;

        switch ( Number(this.link.value.idTipoLink) ) { 
            case 1:
                valido = ( this.validaciones.matchYoutubeUrl(this.link.value.enlace) ) ? true : false;
                break;
            case 2: 
                valido = ( this.validaciones.matchVimeoUrl(this.link.value.enlace) ) ? true : false;
                break;
            case 3:
                this.tmpEnlace = (<HTMLInputElement> document.getElementById('enlace1')).value; //let enlace = <HTMLInputElement> document.getElementById('enlace1');
                console.log(this.tmpEnlace); //this.tmpEnlace = enlace.value;
                this.link.patchValue({ enlace: this.tmpEnlace });
                valido = true;
                break;
            case 4:
                this.link.patchValue({ enlace: this.validaciones.addhttp(this.link.value.enlace) });
                valido = this.validaciones.matchUrl(this.link.value.enlace);
                break;
        }

        if (valido) {
            if ( this.link.valid ){
                //al.slideUp();
                console.log(this.link.value);
                this.link.value.idLink == 0 ? this.altaLink() : this.editaLink();
            } else {
                this.mensajeDialogoL = 'Llene todos los campos antes de continuar.';
				this.tipoRespuesta = 2;
                //al.slideDown();
				this.ngxSmartModalService.getModal(this.id).open();
            }
        } else {
			this.tipoRespuesta = 2;
            this.mensajeDialogoL = 'Llene todos los campos antes de continuar.';
            //al.slideDown();
			this.ngxSmartModalService.getModal(this.id).open();
        }
    }

    //Se puede reutilizar
    altaLink() {
        let al: any = $('#alerta-datos');
        let params = {
            servicio: "links",
            accion: (this._links.rol == 1) ? "IDesk_Maestro_Link_Alta" : "IDesk_Alumno_Link_Alta",
            tipoRespuesta: "json",
            idCurso: this.link.value.idCurso,
            idTipoLink: this.link.value.idTipoLink,
            enlace: this.link.value.enlace,
            nombre: this.link.value.titulo,
            idpersonidesk: this.link.value.idpersonidesk
        };

        this._links.consultas(params)
            .subscribe(resp => {
                if(resp[0].error == 0){
                    this.cuantosLinks++;
                    this.idLinks.push(resp[0].idLink);
                    this.enviaLinks();
                    this.mensaje = 'Link guardado correctamente';
					this.tipoRespuesta = 1;
					this.ngxSmartModalService.getModal('dialogoInformacionLinks').open();
                } else {
                    this.mensaje == resp[0].mensaje;
                    al.slideDown();
                }
            }, errors => {
                console.log(errors);
            });
    }

    abreEdita(idTipoLink, content, linkTmp){
        this.tipo = idTipoLink;
        this.link.patchValue({ 
            idTipoLink: linkTmp.idTipoLink,
            idLink: linkTmp.idLink,
            titulo: linkTmp.nombre,
            enlace: linkTmp.link  
        });
        this.modalReference = this.modalService.open(content);
        if( idTipoLink == 3) {
            let enlace = <HTMLInputElement> document.getElementById('enlace');
            enlace.disabled = true;
            let enlace1 = <HTMLInputElement> document.getElementById('enlace1');
            enlace1.value = linkTmp.link;
            this.verificarInicio();
        }
		this.enlace2 = linkTmp.link;
    }

    editaLink() {
        let al: any = $('#alerta-datos');

        let params = {
            servicio: "links",
            accion: (this._links.rol == 1) ? "IDesk_Maestro_Link_Edita" : "IDesk_Alumno_Link_Edita",
            tipoRespuesta: "json",
            idLink: this.link.value.idLink,
            idTipoLink: this.link.value.idTipoLink,
            enlace: this.link.value.enlace,
            nombre: this.link.value.titulo
        };
        
        this._links.consultas(params)
            .subscribe(resp => {
                if(resp[0].error == 0){
                    this.enviaLinks();
                    this.modalReference.close();
                } else {
                    this.mensaje == resp[0].mensaje;
                    al.slideDown();
                }
            }, errors => {
                console.log(errors);
            });
        
    } 

    eliminaLink(idLink) {
        let al: any = $('#alerta-datos');
        let pos: number;
        pos = this.idLinks.indexOf(idLink);

        if ( this.esEdicion == 1){
            let params = {
                servicio: "links",
                accion: (this._links.rol == 1) ? "IDesk_Maestro_Link_Elimina" : "IDesk_Alumno_Link_Elimina",
                tipoRespuesta: "json",
                idLink: idLink,
                idpersonidesk: this._iestdesk.idPerson
            };

            this._links.consultas(params)
                .subscribe(resp => {
                    if(resp[0].error == 0){
                        
                        this.cuantosLinks--;
                        this.idLinks.splice(pos);

                        this.enviaLinks();
                        this.modalReference.close();
                    } else {
                        this.mensaje == resp[0].mensaje;
                        al.slideDown();
                    }
                }, errors => {
                    console.log(errors);
                });
        } else {
            this.cuantosLinks--;
            this.idLinks.splice(pos);
            this.enviaLinks();
        }
    }

    abreLink(l) {
        window.open(l.link, '_blank');
    }

    enviaLinks() {
        this.modalReference.close();
		let envio;
		this.links = this.idLinks.join('|');

		if(this.links != ''){
            let params = {
                servicio: "links",
                accion: "IDesk_Links_Consulta",
                tipoRespuesta: "json",
                idLinks: this.links,
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
		envio = (this.links == '') ? this.idLinksEditado : this.links + '|' + this.idLinksEditado;
        this.linksAdjuntos.emit(envio);
    }

    limpiaVariables() {
        this.link.reset();
		this.enlace2 = '';
        this.link.patchValue({ 
            idLink: 0,
            idCurso: this._iestdesk.idCursoActual,
            idpersonidesk: this._iestdesk.idPerson });
    }

    // Google API
    verificarInicio() {
        if ( this.isLoggedIn() ) {
            this.inicializarDrive();
        }
        else {
            //alert(this.isLoggedIn());
            this.signIn();
            this.inicializarDrive();
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
        console.log(this._googleUser.isUserSignedIn());
        return this._googleUser.isUserSignedIn();
    }

    signIn() {
        this._googleUser.signIn();
    }

    onPickerApiLoad() {
        this.pickerApiLoaded = true;
        console.log(this._googleUser.getToken());
        this.ver();
    }

    ver() {
        console.log(this._googleUser.getToken());
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
				auth.signOut();
				console.log('se sale');
			} catch (e) {
				console.error(e);
			}
			//return sessionStorage.removeItem(DocsLinkComponent.SESSION_STORAGE_KEY)
		});
	}
	// Edición
	private defineLinksEdicion() {
		//alert(this._esEdicion+' '+this._tipoAdjunto);
        if ( this._esEdicion != 0 ) {
            //PENDIENTES CASO 3 Y 4
            let acciones = {
                1 : {
                    servicio: "tareas",
                    accion: "IDesk_Alumno_Tareas_Links",
                    idTareaAlumno: (this._tareas.tarea == undefined) ? 0 : this._tareas.tarea.idTareaAlumno
                },
                2 : {
                    servicio: "foroDiscusion",
                    accion: "IDesk_Foro_Discusion_Vista_Ind_Links",
                    idForoDisc: this._foroDiscusion.idForoDisc
                },
                5: {
                    servicio: "tareas",
                    accion: "IDesk_Tareas_Vista_Links",
                    idTarea: this._tareas.idTarea
                },
                8: {
                    servicio: "actividadesClase",
                    accion: "IDesk_Actividad_Clase_Libre_Vista_Ind_Links",
                    idActividad: this._actividadesClase.idActividad
                },
                9: {
                    servicio: "actividadesClase",
                    accion: "IDesk_Alumno_Actividades_Clase_Libre_Links",
                    idActividadAlumno: (this._actividadesClase.actividad == undefined) ? 0 : this._actividadesClase.actividad.idActividadAlumno
                },
                10: {
                    servicio: "actividadesClase",
                    accion: "IDesk_Actividades_Clase_Externa_Vista_Ind_Links",
                    idActividad: this._actividadesClase.idActividad
                },
                11: {
                    servicio: "actividadesClase",
                    accion: "IDesk_Alumno_Actividades_Clase_Externa_Links",
                    idActividadAlumno: (this._actividadesClase.actividad == undefined) ? 0 : this._actividadesClase.actividad.idActividadAlumno
                }
            };

            acciones[this._esEdicion]["tipoRespuesta"] = "json";

            this._tareas.consultas(acciones[this._esEdicion])
                .subscribe( resp => {
                    this.obtenLinksEdicion(resp);
                }, errors => {
                    console.log(errors);
                });
            
        }
    }

	private obtenLinksEdicion(resp){
		this.linksEdicion = resp;
		let temp = [];
		let envio = '';

		this.cuantosEditado = this.linksEdicion.length;
								
		for(let i = 0; i < this.linksEdicion.length; i++) {
			temp.push(this.linksEdicion[i].idLink);
		}
		//console.clear()
		console.dir(this.idLinks);
		console.dir(this.linksEdicion);
		this.idLinksEditado = temp.join("|");
		this.links = this.idLinks.join('|');
		
		if(this.links == '')
			envio = this.idLinksEditado;
		else if(this.idLinksEditado == '')
			envio = this.links;
		else
			envio = this.links + '|' + this.idLinksEditado;
		
		//envio = (this.links == '') ? this.idLinksEditado : this.links + '|' + this.idLinksEditado;
		this.linksAdjuntos.emit(envio);
		
		console.log(envio);
	}

	public cierraDialogoInfo(resp) {
		this.ngxSmartModalService.getModal(this.id).close(); //this.ngxSmartModalService.getModal('dialogoInformacionLinks').close();
		if(this.tipoRespuesta == 1)
			this.cerrar();
	}

	public cerrar(){
		this.modalReference.close();
	}
}