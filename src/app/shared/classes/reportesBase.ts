import { Input } from '@angular/core';
import { Iestdesk } from '../../services/iestdesk.service';
import { DisenadorService } from '../../services/disenador.service';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

export class ReportesBase {
    public ObjectKeys = Object.keys;

    public _idCurso: string;
    public arrCurso;
    public _fechas: string;
	public fechaInicio;
    public fechaFin;
    public procesoCarga: boolean = false;
    public reporteCompleto: boolean = false;

    public modalReference: any;
    public modalOption: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false
    };

    constructor(
        private _iestdesk: Iestdesk,
        private _disenador: DisenadorService )
    {
    }

    @Input()
    set idCurso( id ) {
        if ( this._idCurso != id ){
            this._idCurso = id.join('|');
            this.arrCurso = id;
        }
    }

    @Input()
    set fechas( fecha ) {
        if ( this._fechas != fecha ) {
            this._fechas = fecha;

            this.fechaInicio = this._disenador.fechasSemana.split("|")[0];
            this.fechaFin = this._disenador.fechasSemana.split("|")[1];
        }
    }
}