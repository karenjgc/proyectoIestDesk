import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Iestdesk } from '../../../services/iestdesk.service';
import { EditorService } from '../../../services/editorService.service';
import { VistaClonesComponent } from './vista-clones.component';
import { ModalAsignacionComponent } from '../modal/modal-asignacion.component';

import { FroalaOptions } from '../../../shared/iestdesk/froala';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
	selector: 'editor-clones',
	templateUrl: './clones.component.html',
})
export class ListadoClonesComponent {
	@ViewChild(VistaClonesComponent) vistaClon: VistaClonesComponent;

	//public listadoClones = [];
	public formClon = { nombre: '', descripcion: '' };
	public objectKeys = Object.keys;
	public opcFroala = new FroalaOptions();
	public options: Object = this.opcFroala.opcionesSimple;
	public mensajeDialog: string = '';
	public imagenDialog: number;
	public accionDialog: number;
	public infoClon: any;
	public modal: number;
	public modalReference: any;

	constructor(
		private iestdeskService: Iestdesk,
		public editorService: EditorService,
		public _ngxSmartModalService: NgxSmartModalService,
		public modalService: NgbModal
	) { 
		this.obtenerClones();
		console.clear();
		console.log(this.editorService);
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
				if(resp.length > 0){
					this.editorService.listadoClones = resp;
					this.editorService.mostrarTablaFetos = true;
					this.vistaClon.rerender();
				}
			}, errors => {
				console.log(errors);
			});
	}

	abreModal(content){
		this.modalReference = this.modalService.open(content, { backdrop: 'static' });
	}

	abreDialogo(e = null){
		this.modalReference = this.modalService.open(ModalAsignacionComponent, { backdrop: 'static' });
		if(e){
			this.modalReference.componentInstance.modal = e.dialogo;
			this.modalReference.componentInstance.form = e.obj;
		} else {
			this.modalReference.componentInstance.modal = 3;
			this.modalReference.componentInstance.form = '';
		}
	}

	//clonar molde

	cerrar(e){
		this.modalReference.close();
		this.formClon.nombre = '';
		this.formClon.descripcion = '';
	}

	cierraDialogoInfo(e){
		console.log(e);
		this._ngxSmartModalService.getModal('dialogoInformacionClonar').close();
		if(e.accion == 1)
			this.cerrar(0);
	}

}
