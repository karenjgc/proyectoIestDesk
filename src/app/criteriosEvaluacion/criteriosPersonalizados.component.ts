import { Component, ChangeDetectorRef, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { Validators, FormBuilder, FormGroup} from '@angular/forms';

import { Iestdesk } from '../services/iestdesk.service';
import { CriteriosEvaluacion } from '../services/criterios.service';

import { NgxSmartModalService } from 'ngx-smart-modal';
import { FroalaOptions } from '../shared/iestdesk/froala';

@Component({
    selector: 'idesk-criteriosPersonalizados',
    templateUrl: './criteriosPersonalizados.component.html'
})
export class CriteriosPersonalizadosComponent implements OnInit {
    @Output() alta = new EventEmitter();

    //opcFroala = new FroalaOptions();
    //options: Object = this.opcFroala.opciones;
    public formulario: FormGroup;
    public idCriterioPersonalizado: number = 0;
    public idTipoCriterioEvaluacion: number = 0;
	public mensaje: string = '';
	public tipoRespuesta: number;
	public editando: boolean = false;
	public idGrado: number = 0;

    constructor(
        private _iestdesk: Iestdesk,
        private _criterios: CriteriosEvaluacion,
        private chRef: ChangeDetectorRef,
        private formBuilder: FormBuilder,
        public ngxSmartModalService: NgxSmartModalService
    ){
		this.idGrado = this._iestdesk.idGrado;
        this.formulario = this.formBuilder.group({
            idCriterio: this.idCriterioPersonalizado,
            criterio: ['', Validators.required],
			idTipoCriterioEvaluacion: [(this.idGrado < 3) ? 1 : 2, Validators.required ],
            idpersonidesk: this._iestdesk.idPerson
        });   
    }

    ngOnInit(){}

    @Input()
    set idcriterio ( c: number ) {
        if ( this.idCriterioPersonalizado != c ) {
            this.idCriterioPersonalizado = c;
			this.editando = true;
			this.obtenNuevoCriterio();
        }
    }

    validaCriterio() {
        if ( this.formulario.valid ) {
            this.altaEdicionCriterio();
        } else {
			this.tipoRespuesta = 2;
			this.mensaje = 'Complete todos los campos para continuar.';
			this.ngxSmartModalService.getModal('dialogoInformacionC').open();
        }
    }

    altaEdicionCriterio () {
		let params = {
			servicio: "criteriosEvaluacion",
			tipoRespuesta: "json",
			accion: "IDesk_Criterios_Personalizados_AltaEdicion",
			criterio: this.formulario.value.criterio,
			idTipoCriterioEvaluacion: this.formulario.value.idTipoCriterioEvaluacion,
			idpersonidesk: this.formulario.value.idpersonidesk,
			idCriterio: this.idCriterioPersonalizado
		};
		this._criterios.consultas(params)
			.subscribe(resp => {
				this.mensaje = resp[0].mensaje;
				if(resp[0].error == 0){
					this.idCriterioPersonalizado = resp[0].idCriterio;
					this.tipoRespuesta = 1;
					this.obtenNuevoCriterio();
				} else {
					this.tipoRespuesta = 2;
				}
			}, errors => {
				this.mensaje = 'Ocurrió un error al guardar. Intente más tarde.';
				this.tipoRespuesta = 2;
			});
			this.ngxSmartModalService.getModal('dialogoInformacionC').open();
		
    }

	cierraDialogoInfo(resp) {
		this.ngxSmartModalService.getModal('dialogoInformacionC').close();
		if(this.tipoRespuesta == 1){
			this.cerrar(this.idCriterioPersonalizado);
		}
    }

	obtenNuevoCriterio(){
		let params = {
			servicio: 'criteriosEvaluacion',
			tipoRespuesta: 'json',
			accion: 'IDesk_Criterio_Personalizado_Consulta',
			idCriterio: this.idCriterioPersonalizado
		};
		this._criterios.consultas(params)
			.subscribe( resp => {
				this._criterios.infoCriterio = resp[0];
				if(this.editando){
					this.formulario.patchValue({
						criterio: resp[0].criterio,
						idTipoCriterioEvaluacion: resp[0].idCriterioTipoEvaluacion,
						idCriterio: resp[0].idCriterio
					});
				}
			}, errors => {
				console.log(errors);
			});
	}

	cerrar(e){
		this.alta.emit(e);
	}

}