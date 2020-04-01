import { Component, ChangeDetectorRef, ElementRef, ViewChild, OnInit, Input, OnDestroy } from '@angular/core';
import { Validators, FormBuilder, FormGroup} from '@angular/forms';
import { interval as observableInterval, Observable } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

import * as $ from 'jquery';

import { Iestdesk } from '../services/iestdesk.service';
import { Archivos } from '../services/archivos.service';
import { ForoDiscusion } from '../services/foroDiscusion.service';
import { FroalaOptions } from '../shared/iestdesk/froala';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService, ToastContainerModule, ToastContainerDirective, ActiveToast } from 'ngx-toastr';
//import { AdjuntarArchivosComponent } from '../archivos/adjuntarArchivos.component';

@Component({
    selector: 'idesk-comentariosForoDisc',
    templateUrl: './comentariosForoDiscusion.component.html'
})

export class ComentariosForoDiscComponent implements OnInit, OnDestroy {
    public opcFroala = new FroalaOptions();
    public options: Object = this.opcFroala.opcionesForo;
    
    public rolActual: number = 0;
    public idForoDisc: number;
    public comentario: FormGroup;
    public respComentario: FormGroup;
    public idComResp: number = 0;
    public idArchivos: string = '';
    public archivosPub = [];
    public archivosResp = [];
    public arcComentarios = [];
    public tipo: number;
    public ruta: string;
    public comentarios = [];
    
    public equipos;
    public idEquipos = [];    
    public idEquipoActual: number = 0;

    public _permiteArchivos: number;
    public _cerrado: number;
    public _idPlantillaEquipos;
    public _revision: number;
    public _alumno: number;

    closeResult: string;
    public modalReference: any;
    
    public mensaje: string;
    public tipoRespuesta: number;
	
	protected nombreZip: string;
    protected rutaZip: string;
    
    public ordena: number = 0;
    public actualiza;

    public bloquearComentario: boolean = false;
    public editando: number = 0;
    public cuantosArch: number = 0;
    public idPersonAlta: number = 0;
    
    public tipoValidacion: number = 0;

    @ViewChild('forumArea') private myScrollContainer: ElementRef;
    @ViewChild(ToastContainerDirective) toastContainer: ToastContainerDirective;
	//@ViewChild(AdjuntarArchivosComponent) chArchivo: AdjuntarArchivosComponent;

    constructor(
        private _iestdesk: Iestdesk,
        private _archivos: Archivos,
        private _foroDiscusion: ForoDiscusion,
        private formBuilder: FormBuilder,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private ngxSmartModalService: NgxSmartModalService,
        public toastNotificacion: ToastrService
    ){
        this.rolActual = this._iestdesk.rolActual;
        this.idForoDisc = this._foroDiscusion.idForoDisc;

        this.comentario = this.formBuilder.group({
            idForoDisc: [0, Validators.required],
            idEquipo: [0, Validators.required],
            respuesta: ['', Validators.required],
            idDependeResp: [0, Validators.required],
            idpersonidesk: this._iestdesk.idPerson,
            privada: 0,
            idArchivos: ''
        });

        this.respComentario = this.formBuilder.group({
            idForoDisc: [0, Validators.required],
            idEquipo: [0, Validators.required],
            respuesta: ['', Validators.required],
            idDependeResp: [0, Validators.required],
            privada: [0, Validators.required],
            idpersonidesk: this._iestdesk.idPerson,
            idArchivos: ''
        });

        this.actualiza = observableInterval(15000).pipe(takeWhile(() => true)).subscribe(() => this.defineOrden(this.idEquipoActual));
    }

    @Input() 
    set permiteArchivos ( pa:number ) {
        if ( this._permiteArchivos != pa ) {
            this._permiteArchivos = pa;
        }
    }

    @Input() 
    set cerrado ( c:number ) {
        if ( this._cerrado != c ) {
            this._cerrado = c;
        }
    }

    @Input() 
    set idPlantillaEquipos ( pe:number ) {
        if ( this._idPlantillaEquipos != pe ) {
            this._idPlantillaEquipos = pe;
            if ( this._idPlantillaEquipos != 0 )
                this.consultaEquipos();
        }
    }

    @Input() 
    set revision ( r:number ) {
        if ( this._revision != r ) {
            this._revision = r;
        }
    }

    @Input() 
    set alumno ( a:number ) {
        if ( this._alumno != a ) {
            this._alumno = a;
        }
    }

    ngOnInit(){
        this.toastNotificacion.overlayContainer = this.toastContainer;
        this.defineOrden(this.idEquipoActual);
        
    }

    ngOnDestroy(){
        this.toastNotificacion.clear();
        this.actualiza.unsubscribe();
    }

    consultaEquipos() {
        let params = {
            servicio: "foroDiscusion",
            accion: "IDesk_Foro_Discusion_Consulta_Equipos",
            tipoRespuesta: "json",
            idPlantillaEquipo: this._idPlantillaEquipos, 
            idpersonidesk: this._iestdesk.idPerson, 
            esMaestro: this.rolActual
        };

        this._foroDiscusion.consultas(params)
            .subscribe(resp => {
                this.equipos = resp;

                for ( let equipo of resp ) {
                    this.idEquipos.push(equipo.idEquipo);
                    //this.equipos[equipo.idEquipo] = [];
                    //this.equipos[equipo.idEquipo].push(equipo);
                }

                this.idEquipoActual = resp[0].idEquipo;
                this.defineOrden(this.idEquipoActual);
            },
            errors => {
                console.log(errors);
            });
    }

    defineOrden(idEquipo) {
        this.idEquipoActual = idEquipo;
        if ( this.ordena == 1 ) {
            this.obtieneConversacionDesc(this.idEquipoActual);
        } else {
            this.obtieneConversacion(this.idEquipoActual);
        }
    }

    obtieneConversacion(idEquipo){
        let longitud = this.comentarios.length;
        let params = {
            servicio: "foroDiscusion",
            accion: "IDesk_Foro_Discusion_Respuestas",
            tipoRespuesta: "json",
            idForoDisc: this.idForoDisc, 
            idpersonidesk: this._iestdesk.idPerson, 
            esMaestro: this.rolActual, 
            idEquipo: idEquipo
        };
        this._foroDiscusion.consultas(params)
            .subscribe(resp => {
                this.comentarios = resp;
                this.chRef.detectChanges();
                let comentariosNuevos = resp.length - longitud;

                if (comentariosNuevos > 0 && longitud != 0) {
                    let toast = this.toastNotificacion.info(comentariosNuevos + ' Comentarios nuevos 🐬', '', {
                        disableTimeOut: true,
                        positionClass: 'toast-bottom-right'
                    });

                    toast.onTap.subscribe(() => {
                        this.scrollDown();
                    });
                }    
            },
            errors => {
                console.log(errors);
            });
    }

    obtieneConversacionDesc(idEquipo){
        let longitud = this.comentarios.length;
        let params = {
            servicio: "foroDiscusion",
            accion: "IDesk_Foro_Discusion_Respuestas_Desc",
            tipoRespuesta: "json",
            idForoDisc: this.idForoDisc, 
            idpersonidesk: this._iestdesk.idPerson, 
            esMaestro: this.rolActual, 
            idEquipo: idEquipo
        };

        this._foroDiscusion.consultas(params)
            .subscribe(resp => {
                this.comentarios = resp;
                this.chRef.detectChanges();
                let comentariosNuevos = resp.length - longitud;

                if (comentariosNuevos > 0 && longitud != 0) {
                    let toast = this.toastNotificacion.info(comentariosNuevos + ' Comentarios nuevos 🐬', '', {
                        disableTimeOut: true,
                        positionClass: 'toast-bottom-right'
                    });

                    toast.onTap.subscribe(() => {
                        this.scrollTop();
                    });
                }  
            },
            errors => {
                console.log(errors);
            });
    }

    ordenaResp(tipo){
        if ( tipo == 0 ) {
            this.obtieneConversacionDesc(this.idEquipoActual);
            this.ordena = 1;
        } else {
            this.obtieneConversacion(this.idEquipoActual);
            this.ordena = 0;
        }
    }

    verArchivos(idForoDiscRespuesta, idPersonAlta, content) {
        let params = {
            servicio: "foroDiscusion",
            accion: "IDesk_Foro_Discusion_Comentario_Archivos",
            tipoRespuesta: "json",
            idForoDiscRespuesta: idForoDiscRespuesta
        };

        this._foroDiscusion.consultas(params)
            .subscribe(resp => {
                this.arcComentarios = resp;
				this.idPersonAlta = idPersonAlta;
                //this.chRef.detectChanges();
                //this.mostrarArchivo(resp[0].ruta, resp[0].extension);
                this.modalReference = this.modalService.open(content);
            },
            errors => {
                console.log(errors);
            });
    }
	
	obtenArchivosAlumno(idForo, idAlumno){
        //console.log(idForo+' '+idAlumno);
        let params = {
            servicio: "foroDiscusion",
            accion: "IDesk_Maestro_Foro_Discusion_ArchAlumnos",
            tipoRespuesta: "json",
            idForoDisc: idForo, 
            idpersonidesk: idAlumno
        };

		this._foroDiscusion.consultas(params)
			.subscribe( resp => {
				//console.log(resp[0]);
				
				let rutas = [];
				let nombreArchivos = [];
				let idArchivos = [];
				let llaves = [];
				if(resp.length > 1){
					//console.log('descarga en zip');
				} else {
					//console.log('descarga normal');
					// test
					for (let i in resp){
						idArchivos.push(resp[i].idArchivo);
						nombreArchivos.push(resp[i].nombreArchivo);
						llaves.push(resp[i].llave);
						rutas.push(resp[i].ruta);
                    }
                    let params = {
                        accion: "delAlumno",
                        tipoRespuesta: "json",
                        idArchivos: JSON.stringify(idArchivos), 
                        nombreArchivos: JSON.stringify(nombreArchivos), 
                        rutas: JSON.stringify(rutas), 
                        llave: JSON.stringify(llaves), 
                        idAlumno: idAlumno
                    };
                    
					this._archivos.consultas(params)
						.subscribe( resp => {
							//console.log(resp);
								this.rutaZip = resp.ruta;
							window.open(this.rutaZip);
						}, errors => {
							console.log(errors);
						});
				}
			},
			errors => {
				console.log(errors);
			});
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

    responder(idDependeResp) {
        let name = 'comentario-' + idDependeResp; 
        const com: any = $('#' + name);
        const div: any = $('#div-reply');
        //console.log(idDependeResp + ' ' + name);
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
                element.innerHTML = this.comentario.value.respuesta;
                break;
            case 2:
                element.innerHTML = this.respComentario.value.respuesta;
                break;
        }
		//editor.html.set(editor.html.get().replace(/<img .*?>/g, ""));
		//editor.events.trigger('charCounter.update');
        return element.textContent.trim();
    };
    
    validaComentario(idDependeResp) {
		
        this.bloquearComentario = true;
        if ( idDependeResp == 0 ) {
			this.comentario.value.respuesta.replace(/<img .*?>/g, "");
			//console.log(1, this.comentario.value.respuesta);
			//console.log(2, this.comentario.value.respuesta.replace(/<img .*?>/g, ""));
            this.tipoValidacion = 1;
            this.comentario.patchValue({ 
                idForoDisc: this.idForoDisc,
                idEquipo: this.idEquipoActual,
                idDependeResp: idDependeResp,
                idArchivos: this.idArchivos,
				respuesta: this.comentario.value.respuesta.replace(/<img .*?>/g, "")
			});
            if( this.comentario.valid && this.formatter() != '' ) {
				this.altaComentario();
            } else {
                this.mensaje = 'Escriba su comentario antes de continuar';
                this.tipoRespuesta = 2;
                this.ngxSmartModalService.getModal('dialogoInformacion').open();
            }
        } else {
            this.tipoValidacion = 2;
			//console.log(1, this.respComentario.value.respuesta);
			//console.log(2, this.respComentario.value.respuesta.replace(/<img .*?>/g, ""));
            this.respComentario.patchValue({ 
                idForoDisc: this.idForoDisc,
                idEquipo: this.idEquipoActual,
                idDependeResp: this.idComResp,
                idArchivos: this.idArchivos,
				respuesta: this.respComentario.value.respuesta.replace(/<img .*?>/g, "")
			});
            if( this.respComentario.valid && this.formatter() != '' ) {
				this.altaRespuesta();
            } else {
                this.mensaje = 'Escriba su comentario antes de continuar';
                this.tipoRespuesta = 2;
                this.ngxSmartModalService.getModal('dialogoInformacion').open();
                this.bloquearComentario = false;
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

    altaComentarioMaestro(comentario) {
        let params = {
            servicio: "foroDiscusion",
            accion: "IDesk_Maestro_Foros_Discusion_Comentario",
            tipoRespuesta: "json",
            idForoDisc: comentario.idForoDisc,
            idEquipo: comentario.idEquipo,
            respuesta: comentario.respuesta,
            idDependeResp: comentario.idDependeResp,
            privada: comentario.privada,
            idpersonidesk: comentario.idpersonidesk,
            idArchivos: comentario.idArchivos 
        };
        this._foroDiscusion.consultas(params)
            .subscribe(resp => {
                if(resp[0].error == 0){
                    this.defineOrden(this.idEquipoActual);
                    this.limpiaComentario();
                    this.limpiaRespComentario();
                } else if (resp[0].error == 3) {
                    this.mensaje = resp[0].mensaje;
                    this.tipoRespuesta = 2;
                    this.ngxSmartModalService.getModal('dialogoInformacion').open();
                }
            },
            errors => {
                console.log(errors);
            });
    }

    altaComentarioAlumno(comentario) {
        let params = {
            servicio: "foroDiscusion",
            accion: "IDesk_Alumno_Foros_Discusion_Comentario",
            tipoRespuesta: "json",
            idForoDisc: comentario.idForoDisc,
            idEquipo: comentario.idEquipo,
            respuesta: comentario.respuesta,
            idDependeResp: comentario.idDependeResp,
            privada: comentario.privada,
            idpersonidesk: comentario.idpersonidesk,
            idArchivos: comentario.idArchivos 
        };

        this._foroDiscusion.consultas(params)
            .subscribe(resp => {
                if(resp[0].error == 0){
                    this.defineOrden(this.idEquipoActual);
                    this.limpiaComentario();
                    this.limpiaRespComentario();
                } else if (resp[0].error == 3) {
                    this.mensaje = resp[0].mensaje;
                    this.tipoRespuesta = 2;
                    this.ngxSmartModalService.getModal('dialogoInformacion').open();
                }
            },
            errors => {
                console.log(errors);
            });
    }
    
    votar(idForoDiscRespuesta) {
        if ( this._cerrado == 0 ) {
            let params = {
                servicio: "foroDiscusion",
                accion: "IDesk_Foro_Discusion_Votos",
                tipoRespuesta: "json",
                idForoDiscRespuesta: idForoDiscRespuesta, 
                idpersonidesk: this._iestdesk.idPerson, 
                esMaestro: this.rolActual
            };

            this._foroDiscusion.consultas(params)
                .subscribe(resp => {
                    if(resp[0].error == 0){
                        let votos = resp[0].votos;
                        let index = this.comentarios.findIndex(comentarios => comentarios.idForoDiscRespuesta == idForoDiscRespuesta);
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
    }

    adjuntarArchivo(content) {
        this.editando = this.idComResp == 0  ? ( this.archivosPub.length > 0 ? 15 : 0 ) : ( this.archivosResp.length > 0 ? 15 : 0 );
        this.cuantosArch = this.idComResp == 0  ? this.archivosPub.length : this.archivosResp.length;
        this.modalReference = this.modalService.open(content, { backdrop: 'static' });
    }
    
    archivos(idArchivos) {
        //console.log(JSON.stringify(idArchivos));
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
					this.mensaje = "Archivos subidos correctamente.";
					this.tipoRespuesta = 1;
				},
				errors => {
					console.log(errors);
					this.mensaje = "Ocurri� un error al subir los archivos.";
					this.tipoRespuesta = 2;
				});
			//this.modalReference.close();
			//this.ngxSmartModalService.getModal('dialogoInformacion').open();
		}, 1000 );
    }

	public cierraDialogoPublicarArchivos(){
		//console.log(this.chArchivo);
		//if(this.porcentaje == 0 || this.porcentaje == 100){
			this.modalReference.close();
		//}
	}

	public eliminaArchivo(idArchivo){
		let archivos = [];
		let fileRef = [];
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
                }
            }, errors => {
                console.log(errors);
            });
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

    open(content) {
        this.modalReference = this.modalService.open(content);
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

	getRespuesta(respuesta, n){
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
		this.modalReference.close();
		this.ngxSmartModalService.getModal('dialogoInformacion').open();
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
}