import { Component, ChangeDetectorRef, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Validators, FormBuilder, FormGroup} from '@angular/forms';

import { Iestdesk } from '../../services/iestdesk.service';
import { NgxSmartModalService } from 'ngx-smart-modal';

import { DatepickerOptions } from '../classes/datepicker';
import { DateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { MomentDateTimeAdapter } from 'ng-pick-datetime-moment';
import { MY_CUSTOM_FORMATS } from '../../videoconferencias/altaVideoconf.component';
import * as _moment from 'moment';
import 'moment/locale/es';

@Component({
    selector: 'idesk-reabrirActividad',
    templateUrl: './reabrirActividad.component.html',
	providers: [
        {provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE]},
        {provide: OWL_DATE_TIME_FORMATS, useValue: MY_CUSTOM_FORMATS},
    ]
})

export class ReabrirActividadComponent implements OnInit, OnDestroy {
    @Output() fechaCierreNueva = new EventEmitter();
	@Input() fechaCierreOriginal: string;
	@Input() idElemento: number = 0;
	@Input() tipo: number = 0;
	@Input() idAlumno: number = 0;

    public cursoActual: number = 0;

    public reabrir: FormGroup;
    public guardado: boolean = false;
	public idExcepcion: number = 0;

    public mensaje: string;
    public tipoRespuesta: number;
	
	public opcDatePicker = new DatepickerOptions();
    public startAt: any = this.opcDatePicker.setStartAt();
	public fechaFormateada = '';

    constructor(
        private _iestdesk: Iestdesk,
        private chRef: ChangeDetectorRef,
        private formBuilder: FormBuilder,
        public ngxSmartModalService: NgxSmartModalService
    ){
    }

    ngOnInit(){
		//console.log('idElemento', this.idElemento);
		this.cursoActual = this._iestdesk.idCursoActual;

		this.reabrir = this.formBuilder.group({
            fechaCierreNueva: ['', Validators.required],
            idpersonidesk: this._iestdesk.idPerson
        });

		this.verificaActividadReabierta();
    }

    ngOnDestroy() {
		this.reabrir.reset();
    }

	setStartAt(){
		this.opcDatePicker.setStartAt();
	}

	verificaActividadReabierta(){
		let params = {
			servicio: "idesk",
			accion: "IDesk_Excepciones_Entrega_Consulta",
			tipoRespuesta: "json",
			idAlumno: this.idAlumno,
			idElemento: this.idElemento,
			tipo: this.tipo,
			idpersonidesk: this._iestdesk.idPerson
		};

		this._iestdesk.consultas(params)
			.subscribe(resp => {
				if(resp.length > 0){
					this.idExcepcion = resp[0].idExcepcion;
					this.fechaCierreOriginal = _moment(resp[0].fechaCierre).format("DD/MM/YY HH:mm");
				}
				//console.clear();
				//console.log(resp);
			}, errors => {
				console.log(errors);
			});
	}

    reabrirActividad() {
		if(this.reabrir.valid){
			this.fechaFormateada = (this.reabrir.value.fechaCierreNueva) ? this.reabrir.value.fechaCierreNueva.format("DD/MM/YY HH:mm") : '';

			let params = {
				servicio: "idesk",
				accion: "IDesk_Excepciones_Entrega_Captura",
				tipoRespuesta: "json",
				idExcepcion: this.idExcepcion, //0,
				idAlumno: this.idAlumno,
				idElemento: this.idElemento,
				tipo: this.tipo,
				fechaCierre: this.fechaFormateada,
				idpersonidesk: this._iestdesk.idPerson
			}

			this._iestdesk.consultas(params)
				.subscribe(resp => {
					this.mensaje = resp[0].mensaje;
					if(resp[0].error == 0){
						this.tipoRespuesta = 1;
						this.guardado = true;
					} else {
						this.tipoRespuesta = 2;
						this.fechaFormateada = ''
					}
					this.ngxSmartModalService.getModal('dialogoInformacionReabrir').open();
				},
				errors => {
					console.log(errors);
				});
		} else {
			this.mensaje = 'Seleccione una nueva fecha de cierre antes de continuar.';
            this.tipoRespuesta = 2;
            this.ngxSmartModalService.getModal('dialogoInformacionReabrir').open();
		}
    }

	cierraDialogoInfoReabrir(e) {
        this.ngxSmartModalService.getModal('dialogoInformacionReabrir').close();
        this.chRef.detectChanges();
        if ( this.tipoRespuesta == 1 && this.guardado ) 
			this.cerrar(e);
    }

    cerrar(e) {
		console.clear();
		//console.log(e);
        this.fechaCierreNueva.emit((e == 0) ? 0 : this.fechaFormateada);
    }
}