import { Component, Input, EventEmitter, OnInit } from '@angular/core';

import { Iestdesk } from '../services/iestdesk.service';
import { Equipos } from '../services/equipos.service';

import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
    selector: 'idesk-vistaEquipos',
    templateUrl: './vistaEquipos.component.html'
})

export class VistaEquiposComponent implements OnInit {
	@Input() vistaReutilizar: boolean;
    public alumnos = [];
    public alumnosU = [];
    public tipo: number = 0;

	public _idPlantillaEquipos: number = 0;

    constructor(
        private _iestdesk: Iestdesk,
        private _equipos: Equipos,
        public ngxSmartModalService: NgxSmartModalService,
    ){
    }

	ngOnInit(){
		this.consultaEquipos();
	}

	private consultaEquipos(){
		this._iestdesk.rolActual == 1 ? this.equipos(this._idPlantillaEquipos) : this.equipoInd(this._idPlantillaEquipos);
		console.clear();
		//console.log('equipos');
	}

	@Input()
    set idPlantillaEquipos( idPlantillaEquipos: number ) {
        if ( this._idPlantillaEquipos != idPlantillaEquipos ){
            this._idPlantillaEquipos = idPlantillaEquipos;
			this.consultaEquipos();
        }
    }
    private equipos(idPlantillaEquipos) {
		let params = {
            servicio: "equipos",
            accion: "IDesk_Equipos_Consulta",
            tipoRespuesta: "json",
            idPlantillaEquipo: idPlantillaEquipos
        };

		this._equipos.consultas(params)
			.subscribe(resp => {
				this.agrupaEquipos(resp);
			},
			errors => {
				console.log(errors);
			});
    }

    private equipoInd(idPlantillaEquipos) {
		let params = {
            servicio: "equipos",
            accion: "IDesk_Equipos_ObtieneEquipoxPersona",
			tipoRespuesta: "json",
			idPlantillaEquipo: idPlantillaEquipos, 
			idpersonidesk: this._iestdesk.idPerson
        };

		this._equipos.consultas(params)
			.subscribe(resp => { 
				this.agrupaEquipos(resp);
			},
			errors => {
				console.log(errors);
			});
    }

	private agrupaEquipos(a) {
        this.alumnos = [];
        for(let i = 0; i < a.length; i++) {
            if( !this.alumnos.find(x => x.numEquipo == a[i].numEquipo) ){
                if(a[i].numEquipo != 0){
					this.alumnos.push({
						numEquipo:  a[i].numEquipo,
						alumnos: a.filter(y => y.numEquipo == a[i].numEquipo),
						equipo: a[i].equipo
					});
				}
            }
        }
    }
}