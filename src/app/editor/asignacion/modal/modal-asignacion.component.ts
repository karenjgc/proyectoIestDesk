import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FroalaOptions } from '../../../shared/iestdesk/froala';
import { Validaciones } from '../../../shared/classes/validaciones';
import { EditorService } from '../../../services/editorService.service';
import { Iestdesk } from '../../../services/iestdesk.service';
import { NgxSmartModalService } from 'ngx-smart-modal';

import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
	selector: 'editor-modal-asignacion',
	templateUrl: './modal-asignacion.component.html'
})
export class ModalAsignacionComponent implements OnInit {
	// Configuración de Froala
	opcFroala = new FroalaOptions();
	options: Object = this.opcFroala.opcionesSimple;

	@Input() form;
	@Input() modal: number;
	@Output() cerrado = new EventEmitter();
	public validaciones = new Validaciones();
	public mostrarCampos: boolean = false;

	public formCorreo = { correo: '', texto: '' };
	public formAsigna = { seccion: '', nombreMaestro: '', cursoFinal: '' };
	public editando = 14;

	public muestraAlertaCorreo: boolean = false;
	public mostrarBotones: boolean = true;
	public opciones;

	public imagenDialog;
	public mensajeDialog;
	public mensajeOpcional;
	public accionDialog;
	public tipoDialog;
	public nombre: string = '';
	public descripcion: string = '';
  
	constructor(
		private iestdesk: Iestdesk,
		private editorService: EditorService,
		private activeModal:NgbActiveModal,
		public ngxSmartModalService: NgxSmartModalService,
	) {
	}

	ngOnInit(){
		if(this.modal == 2){
			this.obtenerElementos();
			this.formCorreo.texto = '<p>Buen día, maestro.</p><p>Le informamos que ya tiene material en su materia <b>'+this.editorService.materia.materia+'</b>.<p>Para revisarlo, por favor ingrese a su materia en el IEST Desk.</p>';
		} else {
			this.nombre = this.form.nombre;
			this.descripcion = this.form.descripcion;
		}
	}

	obtenerElementos(){
		let param = {
			servicio: 'editor',
			accion: 'IDesk_Editor_Asignacion_ConsultaSecciones',
			idMolde: this.editorService.materia.idCurso,
			idTipoCurso: this.editorService.materia.idTipoCurso,
			tipoRespuesta: 'json',
		};
		this.editorService.consultas(param).subscribe(resp => {
			this.opciones = {};

			for (let respuesta of resp) {
				if (!this.opciones.hasOwnProperty(respuesta.seccion)) {
					this.opciones[respuesta.seccion] = [];
				}
				this.opciones[respuesta.seccion].push(respuesta);
			}

			console.log('Opciones', this.opciones);
		});
	}

	ocultarBotones(e){
		this.formAsigna = { seccion: '', nombreMaestro: '', cursoFinal: '' };
		this.formCorreo.correo = '';
		this.muestraAlertaCorreo = false;
		if(e.activeId == 'folio'){
			this.formCorreo.texto = '<p>Buen día, maestro.</p><p>Le informamos que ya tiene material en su materia <b>'+this.editorService.materia.materia+'</b>.<p>Para revisarlo, por favor ingrese a su materia en el IEST Desk.</p>';
			this.mostrarBotones = true;
		} else {
			this.formCorreo.texto = '<p>Buen día, maestro.</p><p>Le informamos que ya tiene material en su materia <b>'+this.editorService.materia.materia+'</b>. El folio de su material es: <b>'+this.form.folio+'</b>.</p><p>Para revisarlo, por favor ingrese este folio en el IEST Desk.</p>';
			this.mostrarBotones = false;
		}
	}

	search = (text$: Observable<string>) => 
		text$.pipe(
			debounceTime(300),
			distinctUntilChanged(),
			map(term => {
				let resultado = [];
				let elemento = Object.keys(this.opciones).filter( v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10);

				for (let item of elemento) {
					resultado.push({
						materia: this.opciones[item][0].materia,
						idCursoFinal: this.opciones[item][0].idCurso,
						maestro: this.opciones[item][0].maestro,
						correo: this.opciones[item][0].correo,
						seccion: this.opciones[item][0].seccion
					});
				}
				return resultado;
			})
	);

	obtenMaestroSeleccionado(e){
		this.formAsigna.nombreMaestro = e.item.maestro;
		this.formAsigna.seccion = e.item.seccion;
		this.formAsigna.cursoFinal = e.item.idCursoFinal;
		this.formCorreo.correo = e.item.correo;
		this.muestraAlertaCorreo = false;
	}

	enviarCorreo(){
		//this.formCorreo.texto = this.formCorreo.texto.replace(/<img .*?>/g, "");
		if(this.formCorreo.correo == '' || this.formCorreo.texto == ''){
			this.muestraAlertaCorreo = true;
		} else {
			this.muestraAlertaCorreo = false;
			console.log('SE ESTÁ ENVIANDO EL CORREO... DEL MAL!', this.formCorreo, this.formAsigna);
		}
	}

	validaElemento(){
		console.log(this.editorService.listadoClones);
		switch(this.modal){
			case 1:
			case 3:
				this.descripcion = this.descripcion.replace(/<img .*?>/g, "");
				if(this.nombre == '' || this.descripcion == ''){
					this.mensajeDialog = 'Llene todos los campos antes de continuar';
					this.mensajeOpcional = null;
					this.imagenDialog = 1;
					this.accionDialog = 0;
					this.tipoDialog = 2;
				} else {
					this.modal == 1 ? this.editaInfoClon() : this.clonarMolde();
					return;
				}
			break;
			case 2:
				if(this.formAsigna.seccion == '' || this.formAsigna.nombreMaestro == ''){
					this.mensajeDialog = 'Seleccione a un profesor para asignarle la materia';
					this.mensajeOpcional = null;
					this.imagenDialog = 1;
					this.accionDialog = 0;
					this.tipoDialog = 2;
				} else {
					this.mensajeDialog = '¿Está seguro de asignar "'+this.editorService.materia.materia+'" al profesor '+this.formAsigna.nombreMaestro+'?';
					this.mensajeOpcional = 'Una vez asignada, no será posible cambiarla.';
					this.imagenDialog = 3;
					this.accionDialog = 1;
					this.tipoDialog = 1;
				}
			break;
		}
			
		this.ngxSmartModalService.getModal('dialogoInformacion').open();
	}

	clonarMolde(){
		let params = {
			servicio: 'editor',
			accion: 'IDesk_Editor_Asignacion_ClonarMolde',
			tipoRespuesta: 'json',
			idCursoMolde: this.editorService.materia.idCurso,
			nombre: this.nombre,
			descripcion: this.descripcion
		};
		this.tipoDialog = 2;
		this.editorService.consultas(params)
			.subscribe(resp => {
				console.log(resp);
				this.mensajeDialog = 'Molde clonado correctamente';
				this.imagenDialog = 0;
				this.accionDialog = 3;
				this.editorService.mostrarTablaFetos = false;
				this.obtenerClones();
			}, errors => {
				console.log(errors);
				this.mensajeDialog = 'Ocurrió un error al clonar el molde';
				this.imagenDialog = 1;
				this.accionDialog = 0;
			});
		this.ngxSmartModalService.getModal('dialogoInformacion').open();
	}

	editaInfoClon(){
		let params = {
			servicio: 'editor',
			accion: 'IDesk_Editor_Asignacion_EditarInformacionClon',
			tipoRespuesta: 'json',
			nombreClon: this.nombre,
			descripcion: this.descripcion,
			idClon: this.form.idMoldeClon
		};
		this.tipoDialog = 2;
		this.editorService.consultas(params)
			.subscribe( resp => {
				this.mensajeDialog = resp[0].mensaje;
				if(resp[0].error == 0){
					this.imagenDialog = 0;
					this.accionDialog = 3;
					this.editorService.mostrarTablaFetos = false;
					this.obtenerClones();
				} else {
					this.imagenDialog = 1;
					this.accionDialog = 0;
				}
			}, errors => {
				console.log(errors);
				this.mensajeDialog = 'Ocurrió un error al intentar editar la información de la materia';
				this.imagenDialog = 1;
				this.accionDialog = 0;
			});
		this.ngxSmartModalService.getModal('dialogoInformacion').open();
	}

	obtenerClones(){
		let params = {
			servicio: 'editor',
			accion: 'IDesk_Editor_Asignacion_ConsultaClones',
			tipoRespuesta: 'json',
			idMolde: this.editorService.materia.idCurso,
		};

		this.editorService.consultas(params)
			.subscribe(resp => {
				this.editorService.listadoClones = [];
				if(resp.length > 0) {
					this.editorService.listadoClones = resp;
					this.editorService.mostrarTablaFetos = true;
				}
				
			}, errors => {
				console.log(errors);
			});
	}

	asignar(){
		this.editorService.mostrarTablaFetos = false;
		this.tipoDialog = 2;
		let params = {
			servicio: 'editor',
			accion: 'IDesk_Editor_Asignacion_AsignarClon',
			tipoRespuesta: 'json',
			idCursoClon: this.form.idCurso,
			idCursoFinal: this.formAsigna.cursoFinal,
			idpersonidesk: this.iestdesk.idPerson
		};

		this.editorService.consultas(params)
			.subscribe( resp => {
				console.log(resp);
				this.mensajeDialog = 'Materia asignada correctamente a '+this.formAsigna.nombreMaestro;
				this.mensajeOpcional = null;
				this.imagenDialog = 0;
				this.accionDialog = 2;
				this.obtenerClones();
			}, errors => {
				console.log(errors);
				this.mensajeDialog = 'Ocurrió un error al intentar asignar la materia';
				this.mensajeOpcional = null;
				this.imagenDialog = 1;
				this.accionDialog = 0;
			});
	}

	cierraDialogoInfo(e){
		if(e.accion == 1 && e.respuesta == 1){
			this.asignar();
		} else 
			if((e.accion == 2 || e.accion == 3) && e.respuesta == 1){
				this.ngxSmartModalService.getModal('dialogoInformacion').close();
				this.closeModal(e.accion);
			} else {
				this.ngxSmartModalService.getModal('dialogoInformacion').close();
			}
	}

	closeModal(b){
		//this.cerrado.emit(b);
		this.activeModal.close(b);
	}
}