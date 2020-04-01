import { Component, ChangeDetectorRef, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { Iestdesk } from '../../services/iestdesk.service';
import { DisenadorService } from '../../services/disenador.service';

@Component({
    selector: 'idesk-disenadorNav',
    templateUrl: './disenadorNav.component.html'
})
export class DisenadorNavComponent implements OnInit {
    @Output() vistaSeleccionada = new EventEmitter();
	public rolActual: number;
    public nombre_curso: string;
    public cursoActual: number;
    //public cursos: any[];
	public vista: number = 2;

    constructor(
        private _iestdesk: Iestdesk,
		private _disenador: DisenadorService,
        private chRef: ChangeDetectorRef,
        private router: Router
    ){
        this.rolActual = this._iestdesk.rolActual;
        this.nombre_curso = this._iestdesk.cursoActual;
        this.cursoActual = this._iestdesk.idCursoActual;
    }

    ngOnInit(){
		this.irMenuVista(this.vista);
	}

    irMenuVista(ir: number){
		this.vista = ir;
		this.vistaSeleccionada.emit(ir);
    }
}