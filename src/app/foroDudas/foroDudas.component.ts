
import {interval as observableInterval, Observable} from 'rxjs';

import {takeWhile} from 'rxjs/operators';
import { Component, ChangeDetectorRef, ElementRef, EventEmitter, ViewChild, OnDestroy, OnInit } from '@angular/core';


import { Router, ActivatedRoute } from '@angular/router';
import { Validators, FormBuilder, FormGroup} from '@angular/forms';
import * as $ from 'jquery';

import { Iestdesk } from '../services/iestdesk.service';
import { Archivos } from '../services/archivos.service';
import { ForoDudas } from '../services/foroDudas.service';
import { FroalaOptions } from '../shared/iestdesk/froala';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'idesk-foroDudas',
    templateUrl: './foroDudas.component.html'
})

export class ForoDudasComponent implements OnInit, OnDestroy {
    public opcFroala = new FroalaOptions();
    
    public rolActual: number = 0;
    public foros: any[];
    public comentarios: any[] = [];
    public preguntas: any[];
    public comentario: FormGroup;
    public respComentario: FormGroup;
    public pregunta: FormGroup;
    public verComentarios: boolean = false;
    public foroActual: number = 0;
    public preguntaActual: number = 0;
    public nombre: string;
    public fecha: string;
    public preg: string;
    public votosPregunta: number;
    public archivosPregunta: number;
    public esRespuesta: boolean = false;

    public idComResp: number = 0;
    public idArchivos: string = '';
    public archivosPub = [];
    public archivosResp = [];
    public arcComentarios = [];
    public tipo: number;
    public ruta: string;

    closeResult: string;
    public modalReference: any;
    public adjuntaModalReference: boolean = false;
    public mensaje: string;
    public tipoRespuesta: number;

	public mostrarPreguntaComentarios: boolean = true;
    public options: Object = this.opcFroala.opcionesForo;

    public ordena: number = 0;
    public mostrarMensaje: boolean = false;
    public mostrarMensajeC: boolean = false;

    public focusSettingEventEmitter = new EventEmitter<boolean>();
    public actualiza;
    public bloquearComentario: boolean = false;
    public editando: number = 0;
    public cuantosArch: number = 0;

    public tipoValidacion: number = 0;
    public mostrarAlertaPregunta: boolean = false;

    public yaVoto;

    @ViewChild('forumArea') private myScrollContainer: ElementRef;
    @ViewChild('respuestaC') private respuesta: ElementRef;

    constructor(
        public _iestdesk: Iestdesk,
        private _archivos: Archivos,
        private _foroDudas: ForoDudas,
        private formBuilder: FormBuilder,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        public ngxSmartModalService: NgxSmartModalService,
        private router: Router,
        private route: ActivatedRoute,
        public toastNotificacion: ToastrService
    ){
        this.rolActual = this._iestdesk.rolActual;

        this.pregunta = this.formBuilder.group({
            idForoDudas: [0, Validators.required],
            preg: ['', Validators.required],
            idpersonidesk: this._iestdesk.idPerson,
            idArchivos: ''
        });

        this.comentario = this.formBuilder.group({
            idPregunta: [0, Validators.required],
            respuesta: ['', Validators.required],
            idDependeResp: [0, Validators.required],
            idpersonidesk: this._iestdesk.idPerson,
            privada: 0,
            idArchivos: ''
        });

        this.respComentario = this.formBuilder.group({
            idPregunta: [0, Validators.required],
            respuesta: ['', Validators.required],
            idDependeResp: [0, Validators.required],
            privada: [0, Validators.required],
            idpersonidesk: this._iestdesk.idPerson,
            idArchivos: ''
        });

        let params = {
            servicio: "foroDudas",
            accion: "IDesk_Foro_Dudas_Listado",
            tipoRespuesta: "json",
            idCurso: this._iestdesk.idCursoActual, 
            idpersonidesk: this._iestdesk.idPerson
        };
        
        this._foroDudas.consultas(params)
            .subscribe(resp => {
                this.foros = resp;
                this.foroActual = this.foros[0].idForoDudas;

                this.chRef.detectChanges();
                let name: string = 'boton-foro-' + this.foroActual;
                let button = <HTMLInputElement> document.getElementById(name);
                button.classList.add('foro-activo');
                this.obtienePreguntas();
            },
            errors => {
                console.log(errors);
            });
        

        this.actualiza = observableInterval(15000).pipe(takeWhile(() => true)).subscribe(() => { if(this.verComentarios) this.obtieneConversacion(); });
    }

    ngOnInit() {
        this._iestdesk.registraAcceso(5,0);
    }

    ngOnDestroy(){
        this.toastNotificacion.clear();
        this.actualiza.unsubscribe();
    }

    abreForo(idForoDudas) {
        let name: string = 'boton-foro-' + this.foroActual;
        let name1: string = 'boton-foro-' + idForoDudas;
        let button = <HTMLInputElement> document.getElementById(name);
        let newButton = <HTMLInputElement> document.getElementById(name1);
        button.classList.remove('foro-activo');
        newButton.classList.add('foro-activo');
        this.foroActual = idForoDudas;
        this.obtienePreguntas();
        this.verComentarios = false;
    }

    verPregunta(pregunta) {
        this.preguntaActual = pregunta.idPregunta;
        this.nombre = pregunta.nombre;
        this.fecha = pregunta.fecha;
        this.preg = pregunta.pregunta;
        this.votosPregunta = pregunta.votos;
        this.archivosPregunta = pregunta.archivos;
        this.yaVoto = pregunta.yaVoto;
        this.pregunta.patchValue({ preg: '' });
        this.idArchivos = '';
        this._iestdesk.registraAcceso(54, pregunta.idPregunta);
        this.obtieneConversacion();
        this.verComentarios = true;
    }

	tooglePreguntaComentarios(){
		if (this.mostrarPreguntaComentarios) {
			$("#preguntaForo").slideUp();
		} else {
			$("#preguntaForo").slideDown();
        }
        this.mostrarPreguntaComentarios = !this.mostrarPreguntaComentarios;
	}

    regresarPreguntas() {
        this.preguntaActual = 0;
        this.obtienePreguntas();
        this.verComentarios = false;
    }

    obtienePreguntas() {
        let params = {
            servicio: "foroDudas",
            accion: "IDesk_Foro_Dudas_Listado_Preguntas",
            tipoRespuesta: "json",
            idForoDudas: this.foroActual,
            idpersonidesk: this._iestdesk.idPerson
        };

        this._foroDudas.consultas(params)
            .subscribe(resp => {
                this.preguntas = resp;
                this.mostrarMensaje = !(resp.length > 0);
            },
            errors => {
                console.log(errors);
            });
    }

    obtieneConversacion(){
        //this.idArchivos = '';
        //this.archivosPub = [];
        let longitud = this.comentarios.length;
        let params = {
            servicio: "foroDudas",
            accion: "IDesk_Foro_Dudas_Respuestas",
            tipoRespuesta: "json",
            idForoDudas: this.preguntaActual, 
            idpersonidesk: this._iestdesk.idPerson, 
            esMaestro: this.rolActual
        };

        this._foroDudas.consultas(params)
            .subscribe(resp => {
                this.comentarios = resp; 
                this.mostrarMensajeC = resp.length == 0;
                this.chRef.detectChanges();
                let comentariosNuevos = resp.length - longitud;

                if (comentariosNuevos > 0 && longitud != 0){
                    let toast = this.toastNotificacion.info('Comentarios nuevos 🐬', '', {
                        disableTimeOut: true,
                        positionClass: 'toast-bottom-right'
                    });

                    toast.onTap.subscribe(() => {
                        this.scrollDown();
                    });
                }

                this.esRespuesta = false;
            },
            errors => {
                console.log(errors);
            });
    }

    obtieneConversacionDesc(){
        //this.idArchivos = '';
        //this.archivosPub = [];
        let longitud = this.comentarios.length;
        let params = {
            servicio: "foroDudas",
            accion: "IDesk_Foro_Dudas_Respuestas_Desc",
            tipoRespuesta: "json",
            idForoDudas: this.preguntaActual, 
            idpersonidesk: this._iestdesk.idPerson, 
            esMaestro: this.rolActual
        };

        this._foroDudas.consultas(params)
            .subscribe(resp => {
                this.comentarios = resp;
                this.mostrarMensajeC = resp.length == 0;
                this.chRef.detectChanges();
                let comentariosNuevos = resp.length - longitud;

                if (comentariosNuevos > 0 && longitud != 0){
                    let toast = this.toastNotificacion.info('Comentarios nuevos 🐬', '', {
                        disableTimeOut: true,
                        positionClass: 'toast-bottom-right'
                    });

                    toast.onTap.subscribe(() => {
                        this.scrollTop();
                    });
                }

                this.esRespuesta = false;
            },
            errors => {
                console.log(errors);
            });
    }

    ordenaResp(tipo){
        if ( tipo == 0 ) {
            this.obtieneConversacionDesc();
            this.ordena = 1;
        } else {
            this.obtieneConversacion();
            this.ordena = 0;
        }
    }
    
    verArchivos(idForoDudasRespuesta, content) {
        let params = {
            servicio: "foroDudas",
            accion: "IDesk_Foros_Dudas_Archivos_Listado",
            tipoRespuesta: "json",
            idForoDudasRespuesta: idForoDudasRespuesta
        };

        this._foroDudas.consultas(params)
            .subscribe(resp => {
                this.arcComentarios = resp;
                this.chRef.detectChanges();
                this.mostrarArchivo(resp[0].ruta, resp[0].extension);
                this.modalReference = this.modalService.open(content, { backdrop: 'static' });
            },
            errors => {
                console.log(errors);
            });
    }
	
	private eliminaArchivo(idArchivo){
		let archivos = [];
		let fileRef = [];
		//if ( this._iestdesk.rolActual == 1 ){
            //this._archivos.eliminaArchivosMaestro(idArchivo, this._iestdesk.idPerson)
            let params = {
                servicio: "archivos",
                accion: (this._archivos.rol == 1) ? "IDesk_Maestro_Archivo_Elimina" : "IDesk_Alumno_Archivo_Elimina",
                tipoRespuesta: "json",
                idArchivo: idArchivo,
                idpersonidesk: this._iestdesk.idPerson
            };

			this._archivos.consultas(params)
				.subscribe(resp => {
					if ( resp[0].error == 0 ){
						console.log(idArchivo);
						console.dir(this.archivosResp);
						console.log(this.idArchivos);
						archivos = this.idArchivos.split('|');
						if ( this.idComResp == 0 ){
							fileRef = this.actualizaArchivos(idArchivo, this.archivosPub);
							this.idArchivos = fileRef[0];
							this.archivosPub = fileRef[1];
						} else {
							fileRef = this.actualizaArchivos(idArchivo, this.archivosResp);
							this.idArchivos = fileRef[0];
							this.archivosResp = fileRef[1];
						}
						//this.actualizaArchivos(idArchivo);
					}
				}, errors => {
					console.log(errors);
				});
			
		//} else {
			//console.log('eliminaArchivosAlumno');
			/*this._archivos.eliminaArchivosAlumno(idArchivo, this._iestdesk.idPerson)
				.subscribe(resp => {
					if ( resp[0].error == 0 ){
						archivos = this.idArchivos.split('|');
						this.actualizaArchivos(idArchivo);
					}
				}, errors => {
					console.log(errors);
				});
			*/
		//}
	}

	private actualizaArchivos(idArchivo, archivosArray){
		let temp = [];
		let arreglo = [];
		let lista: string;

		for(let i = 0; i < archivosArray.length; i++) {
			if(archivosArray[i].idArchivo != idArchivo){
				temp.push(archivosArray[i].idArchivo);
				arreglo.push(archivosArray[i]);
			}
		}
		lista = temp.join("|");
		return [lista, arreglo];
    }

    verArchivosPreguntas(idPregunta, content){
        let params = {
            servicio: "foroDudas",
            accion: "IDesk_Foros_Dudas_Preguntas_Archivos_Listado",
            tipoRespuesta: "json",
            idPregunta: idPregunta
        };

        this._foroDudas.consultas(params)
            .subscribe(resp => {
                this.arcComentarios = resp;
                this.chRef.detectChanges();
                this.mostrarArchivo(resp[0].ruta, resp[0].extension);
                this.modalReference = this.modalService.open(content, { backdrop: 'static' });
            },
            errors => {
                console.log(errors);
            });
    }

    mostrarArchivo(ruta, extension) {
        if ( extension == 'pdf' ){
            this.tipo = 1;
            this.ruta = ruta;
        } else if ( extension == 'jpg' || extension == 'jpge' || extension == 'png' || extension == 'gif' ) {
            this.tipo = 2;
            this.ruta = ruta;
        } else {
            this.tipo = 3;
            this.ruta = 'https://view.officeapps.live.com/op/embed.aspx?src='+ ruta;
        }

        console.log(this.ruta, this.tipo, extension);
    }

    scrollDown() {
        try {
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        } catch(err) { } 
    }

    scrollTop() {
        try {
            this.myScrollContainer.nativeElement.scrollTop = 0;
        } catch(err) { } 
    }

    responder(idDependeResp, el) {
        this.limpiaRespComentario();
        
        let name = 'comentario-' + idDependeResp; 
        const com: any = $('#' + name);
        const div: any = $('#div-reply');
        console.log(idDependeResp + ' ' + name);
        div.slideUp();
        div.insertAfter(com);
        div.show('slow');

        this.idComResp = idDependeResp;
    }

    cancelar() {
        const div: any = $('#div-reply');
        div.slideUp();
        this.idComResp = 0;
    }

    revisa(e) {
        if(e.target.checked){
            this.respComentario.patchValue({ privada: 1 });
        } else {
            this.respComentario.patchValue({ privada: 0 });
        }
    }

    formatter = () => {
        let element = document.createElement('div');
        switch ( this.tipoValidacion ) {
            case 1:
                element.innerHTML = this.pregunta.value.preg;
                break;
            case 2:
                element.innerHTML = this.comentario.value.respuesta;
                break;
            case 3:
                element.innerHTML = this.respComentario.value.respuesta;
                break;
        }
        return element.textContent.trim();
    };

    validaPregunta() {
        this.tipoValidacion = 1;
        this.mostrarAlertaPregunta = false;
        this.pregunta.patchValue({ idForoDudas: this.foroActual });
        this.pregunta.patchValue({ idArchivos: this.idArchivos });
        if(this.pregunta.valid && this.formatter() != '') {
            this.altaPregunta();
        } else {
            this.mostrarAlertaPregunta = true;
        }
    }
    
    validaComentario(idDependeResp) {
        this.bloquearComentario = true;
        if ( idDependeResp == 0 ) {
            this.tipoValidacion = 2;
            this.comentario.patchValue({ idPregunta: this.preguntaActual });
            this.comentario.patchValue({ idDependeResp: idDependeResp });
            this.comentario.patchValue({ idArchivos: this.idArchivos });
            if(this.comentario.valid && this.formatter() != '' ) {
                this.altaComentario();
            } else {
                this.mensaje = 'Escriba su comentario antes de continuar';
                this.tipoRespuesta = 2;
                this.ngxSmartModalService.getModal('dialogoInformacion').open();
            }
        } else {
            this.tipoValidacion = 3;
            this.respComentario.patchValue({ idPregunta: this.preguntaActual });
            this.respComentario.patchValue({ idDependeResp: this.idComResp });
            this.respComentario.patchValue({ idArchivos: this.idArchivos });
            if(this.respComentario.valid && this.formatter() != '') {
                this.esRespuesta = true;
                this.altaRespuesta();
            } else {
                this.mensaje = 'Escriba su comentario antes de continuar';
                this.tipoRespuesta = 2;
                this.ngxSmartModalService.getModal('dialogoInformacion').open();
            }
                
        }
        this.bloquearComentario = false;
    }

    altaComentario() {        
        if ( this.rolActual == 1 )
            this.altaComentarioMaestro(this.comentario.value);
        else 
            this.altaComentarioAlumno(this.comentario.value);
    }

    altaRespuesta() {
        if ( this.rolActual == 1 )
            this.altaComentarioMaestro(this.respComentario.value);
        else 
            this.altaComentarioAlumno(this.respComentario.value);
    }

    altaPregunta() {
        if ( this.rolActual == 1 )
            this.altaPreguntaMaestro(this.pregunta.value);
        else   
            this.altaPreguntaAlumno(this.pregunta.value);
    }

    altaComentarioMaestro(comentario) {
        let params = {
            servicio: "foroDudas",
            accion: "IDesk_Maestro_Foros_Duda_Comentario",
            tipoRespuesta: "json",
            idPregunta: comentario.idPregunta,
            respuesta: comentario.respuesta.replace(/<img .*?>/g, ""),
            idDependeResp: comentario.idDependeResp,
            privada: comentario.privada,
            idpersonidesk: comentario.idpersonidesk,
            idArchivos: comentario.idArchivos
        };

        this._foroDudas.consultas(params)
            .subscribe(resp => {
                if(resp[0].error == 0){
                    this.obtieneConversacion();
                    this.limpiaComentario();
                    this.limpiaRespComentario();
                } 
            },
            errors => {
                console.log(errors);
            });
    }

    altaComentarioAlumno(comentario) {
        let params = {
            servicio: "foroDudas",
            accion: "IDesk_Alumno_Foros_Duda_Comentario",
            tipoRespuesta: "json",
            idPregunta: comentario.idPregunta,
            respuesta: comentario.respuesta.replace(/<img .*?>/g, ""),
            idDependeResp: comentario.idDependeResp,
            idpersonidesk: comentario.idpersonidesk,
            idArchivos: comentario.idArchivos
        };

        this._foroDudas.consultas(params)
            .subscribe(resp => {
                if(resp[0].error == 0){
                    this.obtieneConversacion();
                    this.limpiaComentario();
                    this.limpiaRespComentario();
                } 
            },
            errors => {
                console.log(errors);
            });
    }

    altaPreguntaMaestro(pregunta) {
        let params = {
            servicio: "foroDudas",
            accion: "IDesk_Maestro_Foros_Duda_Pregunta",
            tipoRespuesta: "json",
            idForoDudas: pregunta.idForoDudas,
            pregunta: pregunta.preg.replace(/<img .*?>/g, ""),
            idpersonidesk: pregunta.idpersonidesk,
            idArchivos: pregunta.idArchivos
        };

        this._foroDudas.consultas(params)
            .subscribe(resp => {
                if(resp[0].error == 0){
                    this.obtienePreguntas();
                    this.limpiaPregunta();
                    this.modalReference.close();
                } 
            },
            errors => {
                console.log(errors);
            });
    }

    altaPreguntaAlumno(pregunta) {
        let params = {
            servicio: "foroDudas",
            accion: "IDesk_Alumno_Foros_Duda_Pregunta",
            tipoRespuesta: "json",
            idForoDudas: pregunta.idForoDudas,
            pregunta: pregunta.preg.replace(/<img .*?>/g, ""),
            idpersonidesk: pregunta.idpersonidesk,
            idArchivos: pregunta.idArchivos
        };

        this._foroDudas.consultas(params)
            .subscribe(resp => {
                if(resp[0].error == 0){
                    this.obtienePreguntas();
                    this.limpiaPregunta();
                    this.modalReference.close();
                } 
            },
            errors => {
                console.log(errors);
            });
    }
    
    votar(idForoDudasRespuesta) {
        let params = {
            servicio: "foroDudas",
            accion: "IDesk_Foro_Dudas_Votos",
            tipoRespuesta: "json",
            idForoDudasRespuesta: idForoDudasRespuesta, 
            idpersonidesk: this._iestdesk.idPerson, 
            esMaestro: this.rolActual
        };

        this._foroDudas.consultas(params)
            .subscribe(resp => {
                if(resp[0].error == 0){
                    let votos = resp[0].votos;
                    let index = this.comentarios.findIndex(comentarios => comentarios.idForoDudasRespuesta == idForoDudasRespuesta);
                    this.comentarios[index].yaVoto = 1;
                    this.comentarios[index].votos = votos;
                } else {
                    this.mensaje = resp[0].mensaje;
                    this.tipoRespuesta = 2;
                    this.ngxSmartModalService.getModal('dialogoInformacion').open();
                }
            },
            errors => {
                console.log(errors);
            });
    }
    
    votarPregunta(idPregunta, pregunta = null) {
        let params = {
            servicio: "foroDudas",
            accion: "IDesk_Foro_Dudas_Preguntas_Votos",
            tipoRespuesta: "json",
            idPregunta: idPregunta, 
            idpersonidesk: this._iestdesk.idPerson, 
            esMaestro: this.rolActual
        };
        this._foroDudas.consultas(params)
            .subscribe(resp => {
                if(resp[0].error == 0){
                    let votos = resp[0].votos;
                    this.votosPregunta = votos;
                    if(pregunta){
                        pregunta.votos = votos;
                        pregunta.yaVoto = 1;
                    }
                    this.yaVoto = 1;
                } else {
                    this.mensaje = resp[0].mensaje;
                    this.tipoRespuesta = 2;
                    this.ngxSmartModalService.getModal('dialogoInformacion').open();
                }
            },
            errors => {
                console.log(errors);
            });
        
    }

    adjuntarArchivo(content) {
        this.editando = this.idComResp == 0  ? ( this.archivosPub.length > 0 ? 15 : 0 ) : ( this.archivosResp.length > 0 ? 15 : 0 );
        this.cuantosArch = this.idComResp == 0  ? this.archivosPub.length : this.archivosResp.length;
        //console.log(this.editando, this.cuantosArch);
        this.modalReference = this.modalService.open(content, { backdrop: 'static' });
		this.adjuntaModalReference = true;
    }
    
    archivos(idArchivos) {
        this.idArchivos = idArchivos;
		setTimeout( () => {
            this.chRef.detectChanges();
            
            let params = {
                servicio: "archivos",
                accion: "IDesk_Archivos_Consulta",
                tipoRespuesta: "json",
                idArchivos: this.idArchivos,
                rol: this.rolActual
            };
    
            this._archivos.consultas(params)
				.subscribe(resp => {
					if ( this.idComResp == 0 )
						this.archivosPub = resp;
					else 
						this.archivosResp = resp;
					this.mensaje = 'Archivos subidos correctamente.';
					this.tipoRespuesta = 1;
				},
				errors => {
					console.log(errors);
					this.mensaje = 'Ocurrió un error al subir los archivos.';
					this.tipoRespuesta = 2;
				});

				if(this.adjuntaModalReference){
                    //    this.modalReference.close();
                    //    this.ngxSmartModalService.getModal('dialogoInformacion').open();
                    this.adjuntaModalReference = false;
				}
		}, 1000 );
       
    }

    abrirDialogo(content) {
        this.limpiaPregunta();
        this.modalReference = this.modalService.open(content, { backdrop: 'static' });
    }

    open(content) {
        this.modalReference = this.modalService.open(content, { backdrop: 'static' });
        this.modalReference.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
    }

    private getDismissReason(reason: any): string {
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return  `with: ${reason}`;
        }
    }

    cierraDialogoInfo(resp) {
        this.ngxSmartModalService.getModal('dialogoInformacion').close();
    }

    cancelaComentario() {
        this.limpiaRespComentario();
    }

    cancelaPregunta(){
        this.limpiaPregunta();
        this.modalReference.close();
    }

	public cierraDialogoPublicarArchivos(){
		this.modalReference.close();
	}

    limpiaComentario(){
        this.idArchivos = '';
        this.archivosPub = [];
        this.comentario.reset();
        this.comentario.patchValue({ idDependeResp: 0 });
        this.comentario.patchValue({ idpersonidesk: this._iestdesk.idPerson });
        this.comentario.patchValue({ privada: 0 });
        this.comentario.patchValue({ idArchivos: '' });
    }

    limpiaRespComentario(){
        this.idArchivos = '';
        this.archivosResp = [];
        this.respComentario.reset();
        this.respComentario.patchValue({ idDependeResp: 0 });
        this.respComentario.patchValue({ idpersonidesk: this._iestdesk.idPerson });
        this.respComentario.patchValue({ privada: 0 });
        this.respComentario.patchValue({ idArchivos: '' });

        const div: any = $('#div-reply');
        div.slideUp();
        this.idComResp = 0;
    }

	getRespuesta(respuesta, n){
		//console.log(this.adjuntaModalReference, respuesta, n);
		switch(respuesta){
			case 'fileError':
				this.mensaje = (n == 1) ? 'Asegúrate de subir sólo un archivo y que este sea menor a 20MB.' : 'Asegúrate de subir un archivo menor a 20MB.';
				this.tipoRespuesta = 2;
				//this.ngxSmartModalService.getModal('dialogoInformacion').open();
			break;
			case 'fileErrorExt':
				this.mensaje = (n == 1) ? 'El archivo tiene una extensión no válida.' : 'Uno de los archivos tiene una extensión no válida.';
				this.tipoRespuesta = 2;
				//this.ngxSmartModalService.getModal('dialogoInformacion').open();
			break;
		}
		if(this.adjuntaModalReference){
			this.modalReference.close();
			this.ngxSmartModalService.getModal('dialogoInformacion').open();
			this.adjuntaModalReference = false;
		}
    }

    limpiaPregunta() {
        this.idArchivos = '';
        this.archivosPub = [];
        this.pregunta.reset();
        this.pregunta.patchValue({ idpersonidesk: this._iestdesk.idPerson });
        this.pregunta.patchValue({ idArchivos: '' });
        
    }
}