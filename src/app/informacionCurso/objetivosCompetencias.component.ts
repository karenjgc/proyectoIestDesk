import { Component } from '@angular/core';

import { Iestdesk } from '../services/iestdesk.service';
import { InformacionCurso } from '../services/infoCurso.service';

import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
    selector: 'idesk-objetivosCompetencias',
    templateUrl: './objetivosCompetencias.component.html'
})
export class ObjetivosCompetenciasComponent {
    public rolActual: number;
    public objetivos;
    public competencias;

    constructor(
        private _iestdesk: Iestdesk,
        private _infoCurso: InformacionCurso,
        public ngxSmartModalService: NgxSmartModalService
    ){ 
        this.rolActual = this._iestdesk.rolActual;
        
        
        this.obtieneObjetivos();
        this.obtieneCompetencias();
    }

    obtieneObjetivos() {
        let params = {
            servicio: "infoCurso",
            accion: "IDesk_InfoCurso_Objetivos",
            tipoRespuesta: "json",
            idCurso: this._iestdesk.idCursoActual
        };
        this._infoCurso.consultas(params)
            .subscribe(resp => {
                if ( resp[0].objetivos != '0' )
                    this.objetivos = resp[0].objetivos;
            },
            errors => {
                console.log(errors);
            });
    }

    obtieneCompetencias() {
        let params = {
            servicio: "infoCurso",
            accion: "IDesk_InfoCurso_Competencias",
            tipoRespuesta: "json",
            idCurso: this._iestdesk.idCursoActual
        };
        this._infoCurso.consultas(params)
            .subscribe(resp => {
                if ( resp[0].competencias != 0 )
                    this.competencias = resp;
            },
            errors => {
                console.log(errors);
            });
    }
}