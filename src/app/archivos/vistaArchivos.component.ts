import { Component, ChangeDetectorRef, OnInit, Input, NgZone } from '@angular/core';

import { Iestdesk } from '../services/iestdesk.service';
import { Archivos } from '../services/archivos.service';

import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
    selector: 'idesk-vistaArchivos',
    templateUrl: './vistaArchivos.component.html'
})

export class VistaArchivosComponent {
	@Input() nombreActividad: string;
	@Input() personAlta: string;
	@Input() tipoDescarga: number;
	@Input() previsualizador: boolean;

	public arrArchivos: any;
    public rolActual: number;
    public tipo: number;
	public ruta: string;
	public nombre: string;
	//public numeroArchivos: number;
	public mensaje: string;
	public nombreZip: string;
	public rutaZip: string;
	public target: string;
	public rutaImagen: string;
	public mensajeDialog: string;

	public mostrarDescarga: boolean = true;
	public ruta1arch: string = '';
	public nombre1arch: string = '';

    constructor(
        private _iestdesk: Iestdesk,
        private chRef: ChangeDetectorRef,
		private _archivos: Archivos,
		public ngxSmartModalService: NgxSmartModalService,
		//private zone: NgZone
    ){  
    }

	@Input()
	set archivos( archivos: any ) {
		if ( this.arrArchivos != archivos ){
			this.arrArchivos = archivos;
			this.mostrarDescarga = ( (this.arrArchivos.find(x => x.idTipoArchivo != 0) != undefined) && this.nombreActividad != undefined ) ? true : false;
			this.ruta1arch = ( this.arrArchivos.length == 1 ) ? this.arrArchivos[0].ruta.replace('https://sie.iest.edu.mx', '..') : '';
			this.nombre1arch = ( this.arrArchivos.length == 1 ) ? this.arrArchivos[0].nombreArchivo : '';
			this.inicializaArchivos();
		}
	}

	private inicializaArchivos(){
		if(this.arrArchivos.length > 0)
			this.mostrarArchivo(this.arrArchivos[0].ruta, this.arrArchivos[0].extension, this.arrArchivos[0].nombreArchivo);
		this.chRef.detectChanges();
	}

    private mostrarArchivo(ruta, extension, nombreArch) {
		if ( extension == 'pdf' ){
			this.tipo = 1;
			this.ruta = ruta;

		} else if ( extension == 'jpg' || extension == 'jpge' || extension == 'jpeg' || extension == 'png' || extension == 'gif' ) {
			this.tipo = 2;
			this.ruta = ruta;
		} else if ( extension == 'doc' || extension == 'docm' || extension == 'docx' || extension == 'dotx' || extension == 'mdb' || extension == 'pps' || extension == 'ppsx' || extension == 'ppt' || extension == 'pptm' || extension == 'pptx' || extension == 'xls' || extension == 'xlsm' || extension == 'xlsx' || extension == 'xlt' ) {
			this.tipo = 3;
			this.ruta = 'https://view.officeapps.live.com/op/embed.aspx?src='+ ruta;
		} else if ( extension == 'drive' || extension == 'video' || extension == 'link' ){
			this.tipo = extension == 'link' ? -1 : 0;
			this.rutaImagen = "assets/images/elements/link_bolita.png";
			this.target = '_blank';
			this.ruta = ruta;
			this.nombre = nombreArch;
		} else {
			this.tipo = 4;
			this.rutaImagen = "assets/images/elements/download_circle.png";
			this.target = '_self';
			this.ruta = ruta.replace('https://sie.iest.edu.mx', '..');
			this.nombre = nombreArch;
		}
		this.chRef.detectChanges();
	}

	avisa() {
		if ( this.arrArchivos.find(x => x.idTipoArchivo == 0) ) {
			this.mensajeDialog = "Recuerda que los enlaces, documentos de Google Drive y videos de Youtube y Vimeo no se descargarán en este archivo.";
			this.ngxSmartModalService.getModal('confirmacion').open();
		} else {
			this.descargaZip(this.personAlta, this.nombreActividad);
		}
	}

	cerrarDialogConfirmacion(e){
		this.ngxSmartModalService.getModal('confirmacion').close();
		this.descargaZip(this.personAlta, this.nombreActividad);
	}
	
    public descargaZip(personAlta, nombreActividad){
		//console.log(personAlta, nombreActividad)
		let idArchivos = [];
		let nombreArchivos = [];
        let rutas = [];
        let llave = [];
		
		if(this.arrArchivos.length > 1){
			for (let i in this.arrArchivos){
				if ( this.arrArchivos[i].idTipoArchivo > 0 ) {
					idArchivos.push(this.arrArchivos[i].idArchivo);
					nombreArchivos.push(this.arrArchivos[i].nombreArchivo);
					rutas.push(this.arrArchivos[i].ruta);
					llave.push(this.arrArchivos[i].llave);
				}
			}
			
			//console.log(rutas);
			//console.log(llave);
			(personAlta != '0') ?	
				this.descargaArchivosAlumno(idArchivos.join('||'), nombreArchivos.join('||'), llave.join('||'), rutas.join('||'), personAlta) :  //(JSON.stringify(idArchivos), JSON.stringify(nombreArchivos), JSON.stringify(llave), JSON.stringify(rutas), personAlta) : 
				this.descargaArchivosMaestro(idArchivos.join('||'), nombreArchivos.join('||'), llave.join('||'), rutas.join('||'), nombreActividad); //(JSON.stringify(idArchivos), JSON.stringify(nombreArchivos), JSON.stringify(llave), JSON.stringify(rutas), nombreActividad);
			
		} else if(this.arrArchivos.length == 1)
			window.open(this.arrArchivos[0].ruta);
		else {
			this.mensaje = 'No se encontraron archivos para descargar.';
			//console.log(this.mensaje);
			//this.tipoRespuesta = 2;
			//this.ngxSmartModalService.getModal('dialogoInformacion').open();
		}
    }

	private descargaArchivosAlumno(ids, nombreArchivos, llaves, rutas, idPersonAlta){
		let params = {
            accion: "delAlumno",
			idArchivos: ids,
			nombreArchivos: nombreArchivos,
			rutas: rutas,
			llave: llaves,
			idAlumno: idPersonAlta
        };

		this._archivos.consultas(params, 'api/idesk/descargaZip.php')
			.subscribe( resp => {
				this.nombreZip = resp.zip;
				this.rutaZip = resp.ruta;
				window.open(this.rutaZip);
			}, errors => {
				console.log(errors);
			});
	}

	private descargaArchivosMaestro(ids, nombreArchivos, llaves, rutas, nombreActividad){
		let params = {
            accion: "actividad",
			idArchivos: ids,
			nombreArchivos: nombreArchivos,
			rutas: rutas,
			llave: llaves,
			nombreActividad: nombreActividad
        };

		this._archivos.consultas(params, 'api/idesk/descargaZip.php')
			.subscribe( resp => {
				this.nombreZip = resp.zip;
				this.rutaZip = resp.ruta;
				window.open(this.rutaZip);
			}, errors => {
				console.log(errors);
			});
	}

}