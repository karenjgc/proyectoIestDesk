import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Iestdesk } from '../services/iestdesk.service';
import { Archivos } from '../services/archivos.service';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

const URL = 'https://sie.iest.edu.mx/api/idesk/archivos.php';

@Component({
	selector: 'idesk-adjuntaUnArchivo',
	templateUrl: './adjuntarUnArchivo.component.html'
})

export class AdjuntaUnArchivoComponent implements OnInit {
	@Input() idArchivoObtenido: number;
	@Input() esEdicion: boolean;
	@Input() imagenes = false;
	@Output() archivosAdjuntos = new EventEmitter();
	@Output() respuesta = new EventEmitter();

	public formatosImagen = [
		'image/bmp',
		'image/jpeg',
		'image/x-citrix-jpeg',
		'image/gif',
		'image/png',
		'image/x-png',
		'image/tiff'
	];
	public modalReference: any;
	protected maxFileSize: number = 20 * 1024 * 1024;
	public idArchivo: string = '';
	public idArchivoEditado: string = '';
	public archivos = [];
	public archivosEdicion = [];

	public cuantos: number = 0;
	public porcentaje: number = 0;
	public noSeSubieron = [];
	public hasBaseDropZoneOver: boolean = false;

	public mostrarAvance: boolean = false;
	public mostrarAlertaCantidad: boolean = false;
	public arrArchivo;

	constructor(
		private _iestdesk: Iestdesk,
		private _archivos: Archivos,
		protected modalService: NgbModal
	){
	}
	
	ngOnInit() {
		//archivos
		this._archivos.rol = this._iestdesk.rolActual;
		setTimeout(()=>{
			console.log(this.imagenes);
			// drag&drop
			let dropbox; //
			let _this = this;
			dropbox = <HTMLElement>document.getElementById("dropbox1");
			
			dropbox.addEventListener("dragenter", function(e){
				_this.stopPrevent(e, true);
			}, false);
			dropbox.addEventListener("dragleave", function(e){
				_this.stopPrevent(e, false);
			}, false);
			dropbox.addEventListener("dragover", function(e){
				e.dataTransfer.dropEffect = (_this.cuantos < 1) ? 'copy' : 'none';
				_this.stopPrevent(e, true);
			}, false);
			dropbox.addEventListener("drop", function(e){
				_this.stopPrevent(e, false);
			}, false);
            this.defineArchivosEdicion(this.idArchivoObtenido);
        }, 900);
	}

	obtenerArchivos(files){
		this.noSeSubieron.length = 0;

		if(files.length == 1 && this.cuantos < 1){
			let a = files[0];
			this.mostrarAlertaCantidad = false;
			if(typeof(a) == 'object'){
				//console.log(a.size, this.maxFileSize);
				if(a.size <= this.maxFileSize){
					if(!this.imagenes || (this.imagenes && this.formatosImagen.indexOf(a.type) != -1)){
						this.subir(a);
						this.cuantos++;
					} else {
						this.noSeSubieron.push(a.name +': archivo especificado no es una imagen.')
					}
				} else {
					this.noSeSubieron.push(a.name +': archivo mayor a 20MB (' +(a.size/(1024*1024)).toFixed(2)+'MB).')
				}
			}
		} else {
			this.mostrarAlertaCantidad = true;
		}
	}

	subir(a){
		/*if(a.type == ''){
			this.noSeSubieron.push(a.name +': no es un archivo válido.');
			this.guardaError(a, 'Si no tiene extension, es carpeta');
			return;
		}*/
		/*if(a.type != '' && +a.size == 0){*/
		if ( +a.size == 0 ) {
			this.noSeSubieron.push(a.name +': el archivo no existe.');
			this.guardaError(a, 'El archivo no existe :(');
			return;
		}

 		this.mostrarAvance = true;
		let formData = new FormData();
		let xhr = new XMLHttpRequest();
		let resp;
		let _this = this;

		xhr.upload.addEventListener("progress", function(e) {
			if (e.lengthComputable) {
				_this.porcentaje = Math.round((e.loaded * 100) / e.total);
			}
		}, false);

		xhr.addEventListener("load", function(e){
			console.log(xhr);
			if(xhr.status != 500){
				resp = JSON.parse(xhr.response);
				if(resp.status){
					_this.procesaArchivos();
				} else {
					_this.noSeSubieron.push(a.name +': extensión no permitida.');
					_this.ocultarProgreso();
					if ( _this.cuantos > 0 ) { 
						_this.cuantos--;
					}
				}
			} else {
				_this.noSeSubieron.push(a.name +': error de servidor.');
				console.log('Error de servidor 1 -- cuantos:', _this.cuantos, a);
				_this.guardaError(a, 'PHP error 500 </3');
				_this.ocultarProgreso();
				if ( _this.cuantos > 0 ) { 
					_this.cuantos--;
				}
			}
		}, false);
		xhr.addEventListener("error", function(e){
			console.log('error: ', e);
			console.log(xhr);

			_this.noSeSubieron.push(a.name +': error de servidor.');
			_this.guardaError(a, 'error XMLHttpRequest :(');
			
			console.log('Error de servidor 2 -- cuantos:', _this.cuantos, a);
			if ( _this.cuantos > 0 ) { 
				_this.cuantos--;
			}
			_this.ocultarProgreso();
		}, false);

		xhr.open("POST", URL);	

		formData.append('ideskperson', String(this._iestdesk.idPerson));
		formData.append('rol' , String(this._iestdesk.rolActual));
		formData.append('file', a);
		xhr.send(formData);
	}

	private procesaArchivos(){
		let temp = [];
		let envio = '';
		let archivo = [];

		archivo = this.archivos;
		this.archivos = [];

		if(this.cuantos == 1){
			let params = {
				servicio: "archivos",
				accion: (this._iestdesk.rolActual == 1 || this._iestdesk.rolActual == 3) ? "IDesk_Maestro_Archivos_Consulta" : "IDesk_Alumno_Archivos_Consulta",
				tipoRespuesta: "json",
				cuantos: 1,
				idpersonidesk: this._iestdesk.idPerson
			};

			this._archivos.consultas(params)
				.subscribe(resp => {
					this.archivos = resp;

					this.idArchivo = (this.archivos.length > 0) ? this.archivos[0].idArchivo : this.idArchivo = '';
					envio = this.idArchivo;

					this._archivos.idArchivos = this.idArchivo;

					this.archivosAdjuntos.emit(envio);
					if ( this.porcentaje == 100 ) {
						this.ocultarProgreso();
					} else {
						this.mostrarAvance = true;
					}
				}, errors => {
					console.log(errors);
				});
				this.archivos = archivo;
		} else {
			this.archivosAdjuntos.emit(this.archivos);
		}
	}

	private guardaError(a, error){
		let params = {
            servicio: "archivos",
            tipoRespuesta: "json",
			accion: 'IDesk_Archivos_Alta_Errores',
			nombreArchivo: a.name,
			pesoFormato: (a.size/1024).toFixed(4),
            idpersonidesk: this._iestdesk.idPerson,
			msg: error,
        };

		this._archivos.consultas(params)
            .subscribe(resp => {
				console.log('ok');
            }, errors => {
                console.log(errors);
            });
	}

	public eliminaArchivo(idArchivo) {
		let params = {
			servicio: "archivos",
			accion: (this._archivos.rol == 1) ? "IDesk_Maestro_Archivo_Elimina" : "IDesk_Alumno_Archivo_Elimina",
			tipoRespuesta: "json",
			idArchivo: idArchivo,
			idpersonidesk: this._iestdesk.idPerson
		};

		this._archivos.consultas(params)
			.subscribe(resp => {
				if ( resp[0].error == 0 )
					this.cuantos = 0;
					( this.esEdicion ) ? this.defineArchivosEdicion(0) : this.procesaArchivos();
					this.archivos = [];
					this._archivos.idArchivos = "";
			}, errors => {
				console.log(errors);
			})
	}

	private defineArchivosEdicion(idArchivo) {
		//console.log(idArchivo);
		if (this.esEdicion == true) {
			let params = {
				servicio: "archivos",
				accion: "IDesk_Archivos_Consulta",
				tipoRespuesta: "json",
				idArchivos: idArchivo,
				rol: this._iestdesk.rolActual
			};

			this._archivos.consultas(params)
				.subscribe(resp => {
					this.obtenArchivosEdicion(resp);
				}, errors => {
					console.log(errors);
			});
		}
    }
	
	private obtenArchivosEdicion(resp) {
		let temp = [];
		let envio = '';
		this.archivosEdicion = resp;
		this.cuantos = this.archivosEdicion.length;
		//console.log(JSON.stringify(resp));
		
		this.idArchivoEditado = (this.archivosEdicion.length > 0) ? this.archivosEdicion[0].idArchivo : '';
		envio = this.idArchivoEditado;
		this.archivosAdjuntos.emit(envio);
	}

	//
	public previsualizarArchivo(content, item){
		this.arrArchivo = [];
		this.arrArchivo.push(item);
		console.clear();
		console.log(this.arrArchivo);
		this.modalReference = this.modalService.open(content, { backdrop: 'static' });
	}

	private ocultarProgreso(){
		setTimeout( () => {
			this.porcentaje = 0;
			this.mostrarAvance = false;
		}, 3000);
	}

	private stopPrevent(e, b){
		e.stopPropagation();
		e.preventDefault();
		this.hasBaseDropZoneOver = b;
	}
}