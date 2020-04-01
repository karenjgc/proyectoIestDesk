import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { Iestdesk } from '../../../services/iestdesk.service';
import { EditorService } from '../../../services/editorService.service';

import { DataTableDirective } from 'angular-datatables';
import { DTTRADUCCION } from '../../../shared/dttraduccion';
import { FroalaOptions } from '../../../shared/iestdesk/froala';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSmartModalService } from 'ngx-smart-modal';

import * as _moment from 'moment';
import 'moment/locale/es';

@Component({
	selector: 'vista-clones',
	templateUrl: './vista-clones.component.html',
})
export class VistaClonesComponent implements AfterViewInit, OnDestroy {
	@Output() abrirDialogo = new EventEmitter();
	
	@ViewChild(DataTableDirective)
	
	public dtElement: DataTableDirective;
	public dtOptions =  {
		"aaSorting": [], //Desactiva la ordenación inicial
		"language": DTTRADUCCION,
		"dom": '<"row table-header mx-0"<"col-md-6 text-left"f><"col-md-6 p-0"<"row"<"col-md-10 p-0 text-right"i><"col-md-1 p-0"p>>>><"clear">',
		"pagingType": "simple",
		"columnDefs": [
			{
				orderable: false,
				targets: [4, 5]
			},
			{
				render: function(data, type) {
					if (type == 'sort') {
						let date = new Date(data);
						let d = date.valueOf();
						return d;
					}
					return data
				},
				targets: [2]
			}
		]
	};  
	public dtTrigger: Subject<any> = new Subject();
	public infoClon: any;
	public modalReference: any;

	constructor(
		private iestdeskService: Iestdesk,
		public editorService: EditorService,
		public _ngxSmartModalService: NgxSmartModalService,
		public modalService: NgbModal
	) {
		console.log(this.editorService.materia);
	}

	abreModal(content, obj){
		console.log(content);
		let x = { obj: obj, dialogo: content };
		this.abrirDialogo.emit( x );
	}

	rerender(){
		this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
			dtInstance.destroy();
			this.dtTrigger.next();
		});
	}

	/*cerrarModal(e){
		console.clear();
		switch(+e){
			case 2:
				this.infoClon.asignado = true;
			break;
			case 3:
				console.dir(this.editorService);
				if(this.editorService.listadoClones.length > 0)
					this.rerender();
			break;
		}
		this.modalReference.close();
	}*/

	

	ngAfterViewInit(){
		this.dtTrigger.next();
	}

	ngOnDestroy() {
		this.dtTrigger.unsubscribe();
	}

}