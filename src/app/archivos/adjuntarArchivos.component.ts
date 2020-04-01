import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { Iestdesk } from '../services/iestdesk.service';
import { Archivos } from '../services/archivos.service';
import { Apuntes } from '../services/apuntes.service';
import { Tareas } from '../services/tareas.service';
import { ForoDiscusion } from '../services/foroDiscusion.service';
import { InformacionCurso } from '../services/infoCurso.service';
import { ActividadesClase } from '../services/actividadesClase.service';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

const URL = 'https://sie.iest.edu.mx/api/idesk/archivos.php';

@Component({
    selector: 'idesk-adjuntarArchivos',
    templateUrl: './adjuntarArchivos.component.html'
})

export class AdjuntarArchivosComponent implements OnInit {
	@Input() idArchivosObtenido: string;
    @Output() archivosAdjuntados = new EventEmitter();
	@Output() respuesta = new EventEmitter();

	public modalReference: any;
	
    protected maxFileSize: number = 20 * 1024 * 1024;
	public porcentaje: number = 0;
	public hasBaseDropZoneOver: boolean = false;
	public msjAlerta: string = '';
	public noSeSubieron = [];
    public archivos = [];
    public archivosEdicion = [];
	public idArchivos: string = '';
    public idArchivosEditado: string = '';
    public eliminados: number = 0;
    public cuantos: number = 0;
    public cuantosEditado: number = 0;
    public mostrarAvance: boolean = false;
	public _esEdicion: number;
	public _archivosAdj;
	private idEliminados = [];
	public arrArchivo;

	constructor(
		private _iestdesk: Iestdesk,
        private _apuntes: Apuntes,
        private _foroDiscusion: ForoDiscusion,
        private _actividadesClase: ActividadesClase,
		private _tareas: Tareas,
		private _infoCurso: InformacionCurso,
        private _archivos: Archivos,
		protected modalService: NgbModal,
		private http: HttpClient,
	){
		console.clear();
	}

	ngOnInit(){
		//archivos
		this._archivos.rol = this._iestdesk.rolActual;
		this.defineArchivosEdicion();
		// drag&drop
		let dropbox;
		let _this = this;
		dropbox = <HTMLElement>document.getElementById("dropbox");
		dropbox.addEventListener("dragenter", function(e){
			_this.stopPrevent(e);
			_this.hasBaseDropZoneOver = true;
		}, false);
		dropbox.addEventListener("dragleave", function(e){
			_this.stopPrevent(e);
			_this.hasBaseDropZoneOver = false;
		}, false);
		dropbox.addEventListener("dragover", function(e){
			e.dataTransfer.dropEffect = 'copy';
			_this.stopPrevent(e);
		}, false);
		dropbox.addEventListener("drop", function(e){
			_this.stopPrevent(e);
			_this.hasBaseDropZoneOver = false;
		}, false);
	}

	@Input()
    set esEdicion( edicion: number ) {
        if ( this._esEdicion != edicion ){
            this._esEdicion = edicion;
            this.defineArchivosEdicion();
        }
	}
	
	@Input()
    set archivosAdj( arch: number ) {
        if ( this._archivosAdj != arch ){
            this._archivosAdj = arch;
            this.defineArchivosEdicion();
        }
    }

	obtenerArchivos(files){
		this.noSeSubieron.length = 0;
		//cicloarchivos:
		for(let a of files){
			if(typeof(a) == 'object'){
				console.log(a);
				if(a.size <= this.maxFileSize){ 
					// ¿negar si el nombre del archivo ya existe? //
					/*let foundValue = this.archivos.filter( obj => obj.nombreArchivo == a.name);
					if(foundValue.length > 0)
						continue cicloarchivos;*/
					
					this.subir(a);
				} else {
					this.noSeSubieron.push(a.name +': archivo mayor a 20MB (' +(a.size/(1024*1024)).toFixed(2)+'MB).')
				}
			}
		}
		//console.log('por favor, espere\n', this.noSeSubieron); // spinner
	}

	subir(a){
		// ...
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
			console.log(xhr); //RESPUESTA
			if(xhr.status != 500){
				resp = JSON.parse(xhr.response);
				if(resp.status){
					_this.procesaArchivos(resp.idArchivo);
				} else {
					//respuesta del stored
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
			//console.log(xhr);
			//resp = JSON.parse(xhr.response);
			//console.log(e);
			
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

	private procesaArchivos(idArchivo) { 
        let temp = [];
        let envio = '';
        //console.log(idArchivo);
        let params = {
            //accion: (this._archivos.rol == 1 || this._archivos.rol == 3) ? "IDesk_Maestro_Archivos_Consulta" : "IDesk_Alumno_Archivos_Consulta",
            //cuantos: this.cuantos,
            servicio: "archivos",
            tipoRespuesta: "json",
            idpersonidesk: this._iestdesk.idPerson,
			accion: 'IDesk_Archivos_Consulta',
			idArchivos: idArchivo,
			rol: this._archivos.rol
        };

		this._archivos.consultas(params)
            .subscribe(resp => {
				let foundValue = this.archivos.filter( obj => obj.idArchivo == resp[0].idArchivo);
				if(foundValue.length < 1) {
					this.cuantos++;
					this.archivos.push(resp[0]);
					this.idArchivos += resp[0].idArchivo+'|';
					envio = (this.idArchivosEditado == '') ? this.idArchivos.slice(0, -1) : this.idArchivos + '|' + this.idArchivosEditado;
					this.archivosAdjuntados.emit(envio);
					console.log(this.archivos);
				}
				if ( this.porcentaje == 100 ) {
					this.ocultarProgreso();
				} else {
					this.mostrarAvance = true;
				}
            }, errors => {
                console.log(errors);
            });
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

	private defineArchivosEdicion() {
		if ( this._esEdicion != 0 ) {
			let acciones = {
				1 : {
					servicio: "tareas",
					accion: "IDesk_Alumno_Tareas_Archivos_Adjuntos",
					idTareaAlumno: (this._tareas.tarea == undefined) ? 0 : this._tareas.tarea.idTareaAlumno
				},
				2 : {
					servicio: "foroDiscusion",
					accion: "IDesk_Foro_Discusion_Vista_Ind_Archivos",
					idForoDisc: this._foroDiscusion.idForoDisc
				},
				3 : {
					servicio: "apuntes",
					accion: "IDesk_Apuntes_Consulta_Archivos",
					idApunte: this._apuntes.idApunte
				},
				4 : {
					servicio: "infoCurso",
					accion: "obtenArchivoInfoCurso",
					tipo: this._infoCurso.tipo,
					idInfCurso: (this._infoCurso.infoCurso == undefined) ? 0 : this._infoCurso.infoCurso.idInfCurso
				},
				5 : {
					servicio: "tareas",
					accion: "IDesk_Tareas_Archivos",
					idTarea: this._tareas.idTarea
				},
				6 : {
					servicio: "foroDiscusion",
					accion: "IDesk_Foro_Discusion_Consulta_Revision_Arch",
					idForoDiscAlumno: this._foroDiscusion.idForoDiscAlumno
				},
				7 : {
					servicio: "tareas",
					accion: "IDesk_Tareas_Consulta_Revision_Archivos",
					idTareaAlumno: this._tareas.idTareaAlumno ? this._tareas.idTareaAlumno : 0
				},
				8 : {
					servicio: "actividadesClase",
					accion: "IDesk_Actividad_Clase_Libre_Vista_Ind_Archivos",
					idActividad: this._actividadesClase.idActividad
				},
				9 : {
					servicio: "actividadesClase",
					accion: "IDesk_Alumno_Actividades_Clase_Libre_Archivos",
					idActividadAlumno: (this._actividadesClase.actividad == undefined) ? 0 : this._actividadesClase.idActividadAlumno
				},
				10: {
					servicio: "actividadesClase",
					accion: "IDesk_Actividades_Clase_Externa_Vista_Ind_Archivos",
					idActividad: this._actividadesClase.idActividad
				},
				11: {
					servicio: "actividadesClase",
					accion: "IDesk_Alumno_Actividades_Clase_Externa_Archivos",
					idActividadAlumno: (this._actividadesClase.actividad == undefined) ? 0 : this._actividadesClase.idActividadAlumno
				},
				12: {
					servicio: "actividadesClase",
					accion: "IDesk_Actividades_Clase_Libre_Revision_Archivos",
					tipoRespuesta: "json",
					idActividadAlumno: this._actividadesClase.idActividadAlumno
				},
				13: {
					servicio: "actividadesClase",
					accion: "IDesk_Actividades_Clase_Externa_Revision_Archivos",
					tipoRespuesta: "json",
					idActividadAlumno: this._actividadesClase.idActividadAlumno
				},
				14: {
					servicio: "editor",
					accion: "IDesk_Editor_Multimedia_Apuntes_ConsultaArchivos",
					tipoRespuesta: "json",
					idApunte: this._apuntes.idApunte
				},				
				15: { // foros :)
					servicio: "archivos",
					accion: (this._archivos.rol == 1) ? "IDesk_Maestro_Archivos_Consulta" : "IDesk_Alumno_Archivos_Consulta",
					tipoRespuesta: "json",
					cuantos: this._archivosAdj,
					idpersonidesk: this._iestdesk.idPerson,
				}
			};

			acciones[this._esEdicion]["tipoRespuesta"] = "json";
			this._tareas.consultas(acciones[this._esEdicion])
				.subscribe(resp => {
					this.obtenArchivosEdicion(resp);
				}, errors => {
				  console.log(errors);
				});
		}
	}

	obtenArchivosEdicion(resp) {
		let temp = [];
		let envio = '';
		this.archivosEdicion = resp;
		this.cuantosEditado = this.archivosEdicion.length;
		//console.log(this.archivosEdicion);	
		for(let i = 0; i < this.archivosEdicion.length; i++) {
			temp.push(this.archivosEdicion[i].idArchivo);
		}
		this.idArchivosEditado = temp.join("|");
		
		envio = (this.idArchivos == '') ? this.idArchivosEditado : this.idArchivos + '|' + this.idArchivosEditado;
		this.archivosAdjuntados.emit(envio);
    }

	public eliminaArchivo(idArchivo, tipo) {
        this.eliminados++;
		let archivosRef = [];
		let idArchivosRef: string = '';
		let envio: string;
		let cuantos: number = 0;
		let arreglo = [];
		let idArreglo = [];

		archivosRef = (tipo == 0) ? this.archivos : this.archivosEdicion;

		for(let i = 0; i < archivosRef.length ; i++){
			if(archivosRef[i].idArchivo != idArchivo){
				arreglo.push(archivosRef[i]);
				idArreglo.push(archivosRef[i].idArchivo);
				cuantos++;
			}
		}
		idArchivosRef = idArreglo.join('|');
		
		if(tipo == 0){
			this.idArchivos = idArchivosRef;
			this.archivos = arreglo;
			this.cuantos = cuantos;
			this.idEliminados.push(idArchivo);
		} else {
			this.idArchivosEditado = idArchivosRef;
			this.archivosEdicion = arreglo;
			this.cuantosEditado = cuantos;
		}

		if(this.idArchivos == '')
			envio = this.idArchivosEditado;
		else if(this.idArchivosEditado == '')
			envio = this.idArchivos;
		else
			envio = this.idArchivos + '|' + this.idArchivosEditado;

		this.archivosAdjuntados.emit(envio);
    }

	//
	public previsualizarArchivo(content, item){
		this.arrArchivo = [];
		this.arrArchivo.push(item);
		this.modalReference = this.modalService.open(content, { backdrop: 'static' });
	}

	private ocultarProgreso(){
		setTimeout( () => {
			this.porcentaje = 0;
			this.mostrarAvance = false;
		}, 3000);
	}

	private stopPrevent(e){
		e.stopPropagation();
		e.preventDefault();
	}

	/**
	private handleError(e, a){
		if(a.type == ''){
				this.noSeSubieron.push(a.name +': no es un archivo válido.');
				this.guardaError(a, 'Si no tiene extension, es carpeta');
			} else if(a.type != '' && +a.size == 0){
				this.noSeSubieron.push(a.name +': el archivo no existe.');
				this.guardaError(a, 'el archivo no existe :(');
			} else {
				this.noSeSubieron.push(a.name +': error de servidor.');
				this.guardaError(a, 'error XMLHttpRequest :(');
			}
			console.log('Error de servidor 2\ncuantos:', this.cuantos, a);
			if ( this.cuantos > 0 ) { 
				this.cuantos--;
			}
	}
	*/
}