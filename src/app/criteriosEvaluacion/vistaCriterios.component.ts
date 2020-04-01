import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Iestdesk } from '../services/iestdesk.service';
import { CriteriosEvaluacion } from '../services/criterios.service';

import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'idesk-vistaCriterios',
    templateUrl: './vistaCriterios.component.html'
})

export class VistaCriteriosComponent implements OnInit {
    public objectKeys = Object.keys;
	public comentarios: string = '';
    public criterios = { parcial1: [], parcial2: [], ordinario: [] };
	public rolActual;
	public existeInfo: boolean = true;

    constructor(
        public iestdesk: Iestdesk,
        private _criterios: CriteriosEvaluacion,
        private _chRef: ChangeDetectorRef,
		private _modalService: NgbModal,
		private router: Router,
        private route: ActivatedRoute,
        public _ngxSmartModalService: NgxSmartModalService
    ){
    }

    ngOnInit() {
		this.iestdesk.registraAcceso(16, 0);
		this.rolActual = this.iestdesk.rolActual;
		this.obtenCriteriosCurso();
    }

	obtenCriteriosCurso(){
		let params = {
			servicio: "criteriosEvaluacion",
            accion: "IDesk_Criterios_Consulta_Curso",
            tipoRespuesta: "json",
            idCurso: this.iestdesk.idCursoActual
		};

		this._criterios.consultas(params)
            .subscribe(resp => {
				//console.log(resp);
				if(resp.length > 0){
					this.comentarios = resp[0].comentarios;
					for ( let criterio of resp ) {
						switch(criterio.idTipoBloque){
							case '1':
								this.criterios.parcial1.push(criterio);
							break;
							case '2':
								this.criterios.parcial2.push(criterio);
							break;
							case '6':
								this.criterios.ordinario.push(criterio);
							break;
						}
					}
					this._criterios.idCriterioEvaluacion = resp[0].idCriterioEvaluacion;
				} else {
					if(this.rolActual == 1){
						this._criterios.idCriterioEvaluacion = 0;
						this.goToEditar();
					} else {
						this.existeInfo = false;
					}
					
				}
            },
            errors => {
                console.log(errors);
            });
	}

	goToEditar(){
		this.router.navigate(['/criterios-de-evaluacion/nuevo']);
	}
}