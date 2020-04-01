import { Component, ChangeDetectorRef, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Iestdesk } from '../services/iestdesk.service';
import { ActividadesClase } from '../services/actividadesClase.service';

import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
    selector: 'idesk-altaActividad',
    templateUrl: './altaActividad.component.html'
})

export class AltaActividadesComponent implements OnInit {

    @Input() public modoTemario = false;
    @Output() public regresaTemario = new EventEmitter();

    public cursoActual: number = 0;
    public mostrarActividad = false;
    public tipoActividad = 0;
    public rutasActividades = [
        '/actividades-clase/nueva/libre',
        '/actividades-clase/nueva/libre',
        '/actividades-clase/nueva/ruleta',
        '/actividades-clase/nueva/jeopardy'
    ];

    constructor(
        public _iestdesk: Iestdesk,
        private _actividades: ActividadesClase,
        private chRef: ChangeDetectorRef,
        public ngxSmartModalService: NgxSmartModalService,
        private router: Router,
        private route: ActivatedRoute
    ){
    }

    ngOnInit() {
        this._iestdesk.registraAcceso(41, 0);
    }

    altaActividad(opc) {
        this._actividades.idActividad = 0;
        this._actividades.tipoAlta = opc == 0 ? 1 : 2; 

        if(this.modoTemario){
            this.mostrarActividad = true;
            this.tipoActividad = opc;
        }else{
            this.mostrarActividad = false;
            this.router.navigate([this.rutasActividades[opc]]);
        }
    }

    regresarTemario() {
        this.regresaTemario.emit("true");
    }
}