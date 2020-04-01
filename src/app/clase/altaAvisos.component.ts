import { Component, ChangeDetectorRef, Output, OnInit, EventEmitter } from '@angular/core';
import { Validators, FormBuilder, FormGroup} from '@angular/forms';
import * as $ from 'jquery';

import { Iestdesk } from '../services/iestdesk.service';
import { Avisos } from '../services/avisos.service';
import { Recordings } from '../services/recording.service';
import { FroalaOptions } from '../shared/iestdesk/froala';
import { DatepickerOptions } from '../shared/classes/datepicker';
import { PublicacionGrupos } from '../shared/classes/publicacionGrupos';

import { NgxSmartModalService } from 'ngx-smart-modal';

import { DateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { MomentDateTimeAdapter } from 'ng-pick-datetime-moment';

export const MY_CUSTOM_FORMATS = {
    parseInput: 'DD/MM/YY HH:mm',
    fullPickerInput: 'DD/MM/YY HH:mm',
    datePickerInput: 'DD/MM/YY',
    timePickerInput: 'HH:mm',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
};

@Component({
    selector: 'idesk-altaAvisos',
    templateUrl: './altaAvisos.component.html',
    providers: [
        {provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE]},
        {provide: OWL_DATE_TIME_FORMATS, useValue: MY_CUSTOM_FORMATS},
    ]
})
export class AltaAvisosComponent implements OnInit {
    @Output() estaCerrado = new EventEmitter();

    public opcFroala = new FroalaOptions();
    public opcDatePicker = new DatepickerOptions();
    public startAt: any = this.opcDatePicker.setStartAt();
    public publicacionGrupos;

    public cursoActual: number;
    public idAviso: number = 0;
    public idAudio: number = 0;
    public aviso: FormGroup;
    public pubCursos = [];
    public temp = [];
    public idCursos: string;
    public idCursosPub = [];
    public fechaPublicacion = [];
    public fechaCaducidad = [];
    public finalizado: boolean = false;
    public mensajeDialogo: string;
    public tipoRespuesta: number;
    public options: Object = this.opcFroala.opcionesEmojis;
	public elementoEliminar: string;
    public idaEliminar;
    public guardaAudio = false;
    private mensaje: string;
    public hoy;

    constructor(
        private _iestdesk: Iestdesk,
        private _avisos: Avisos,
        private _recordings: Recordings,
        private formBuilder: FormBuilder,
        public ngxSmartModalService: NgxSmartModalService,
        private chRef: ChangeDetectorRef
    ){
        this.idAudio = 0;
        this.idAviso = this._avisos.idAviso;

        this.aviso = this.formBuilder.group({
            idAviso: this.idAviso,
            titulo: ['', Validators.required],
            mensaje: '',
            idAudio: 0,
            idCursos: ['', Validators.required],
            fechaPublicacion: ['', Validators.required],
            fechaCaducidad: ['', Validators.required],
            idpersonidesk: this._iestdesk.idPerson
        });        
    }

    ngOnInit() {
        this.publicacionGrupos = new PublicacionGrupos(this._iestdesk);
        this.cursoActual = this._iestdesk.idCursoActual;

        this.separarIdCursos();
        this.agrupar();

        if ( this.idAviso != 0 ){
            let params = {
                servicio: "avisos",
                accion: "IDesk_ConsultaAvisosxId",
                tipoRespuesta: "json",
                idAviso: this.idAviso
            };

            this._avisos.consultas(params)
                .subscribe(resp => {
                    this.chRef.detectChanges();
                    this.aviso.patchValue({ 
                        titulo: resp[0].titulo,
                        mensaje: resp[0].mensaje,
                        idCursos: resp[0].idCurso,
                        idAudio: resp[0].idAudio,
                        fechaPublicacion: resp[0].fechaPublicacion,
                        fechaCaducidad: resp[0].fechaCaducidad });
                                        
                    if (resp[0].idAudio != 0)
                        this.obtenerAudio(resp[0].idAudio);
                    let pub = <HTMLInputElement> document.getElementById('publicacion-' + this.cursoActual);
                    let cad = <HTMLInputElement> document.getElementById('caducidad-' + this.cursoActual);
                    this.chRef.detectChanges();
                    pub.value = resp[0].fechaPublicacion;
                    cad.value = resp[0].fechaCaducidad;

                    console.log(JSON.stringify(this.aviso.value));
                    this.temp.push(this._iestdesk.idCursoActual);
                },
                errors => {
                    console.log(errors);
                });
        } else {
            let x = new Date();
            this.hoy = new Date();
            console.log(this.hoy);
            this.temp.push(this._iestdesk.idCursoActual);
        }
    }

    obtenerAudio(idAudio) {
        let params = {
            servicio: "avisos",
            accion: "IDesk_Audio_Consulta",
            tipoRespuesta: "json",
            idAudio: idAudio
        };

        this._avisos.consultas(params)
            .subscribe(resp => {
				this.idAudio = idAudio;
				this.chRef.detectChanges();
				setTimeout( () => {
					$("#audio").attr('src', resp[0].ruta);
				}, 1000);
            },
            errors => {
                console.log(errors);
            });
    }

    separarIdCursos() {
        this.idAviso == 0 ? this.idCursos = this.publicacionGrupos.separarIdCursos() : this.idCursos = String(this._iestdesk.idCursoActual);
    }

    agrupar() {      
        this.idAviso == 0 ? this.pubCursos = this.publicacionGrupos.agrupar() : this.pubCursos = this.publicacionGrupos.agruparEditar();
    }

    revisa(e) {
        let n_pub: string = 'pub-' + e.target.value;
        let n_cad: string = 'cad-' + e.target.value;
        let pub = <HTMLInputElement> document.getElementById(n_pub);
        let cad = <HTMLInputElement> document.getElementById(n_cad);

        if(e.target.checked){    
            pub.classList.remove('hidden');
            cad.classList.remove('hidden');
            this.temp.push(e.target.value);
        } else {
            pub.value = '';
            cad.value = '';
            pub.classList.add('hidden');
            cad.classList.add('hidden');

            let index = this.temp.indexOf(e.target.value);
            this.temp.splice(index,1);
        }
    }
    
    publicacionCursos() {
        for( let i = 0; i < this.temp.length; i++ ){
            let name: string = 'publicacion-' + this.temp[i];
            let name1: string = 'caducidad-' + this.temp[i];
            let pub = <HTMLInputElement> document.getElementById(name);
            let cad = <HTMLInputElement> document.getElementById(name1);

            this.idCursosPub.push(this.temp[i]);
            if(pub.value != '')
                this.fechaPublicacion.push(pub.value);
            if(cad.value != '')
                this.fechaCaducidad.push(cad.value);
        }
        console.log(JSON.stringify(this.fechaPublicacion), JSON.stringify(this.fechaCaducidad), JSON.stringify(this.idCursosPub));
    }

    agregaAudio(audio) {
        this.idAudio = 0;
        this.aviso.patchValue({ idAudio: audio });
    }

    validaAviso() {
		this.aviso.value.mensaje.replace(/<img .*?>/g, "");
        let audioGrabado = this._recordings.getAudioGrabado();
        console.log(audioGrabado);

        this.publicacionCursos();

       if( (this.idCursosPub.length == this.fechaPublicacion.length) && (this.idCursosPub.length == this.fechaCaducidad.length) && (this.fechaPublicacion.length == this.fechaCaducidad.length) ) {
            if(audioGrabado['audioGrabado'] && audioGrabado['idAudio'] == 0 && !this.guardaAudio  && this._recordings.permiteGrabar) {
                this.mensajeDialogo = 'Hay un audio sin guardar, ¿Desea continuar sin haber sido guardado?';
                this.ngxSmartModalService.getModal('confirmacionDialog').open();
            } else {
                this.aviso.patchValue({ idCursos: this.idCursosPub.join("|") });
                this.aviso.patchValue({ fechaPublicacion: this.fechaPublicacion.join("|") });
                this.aviso.patchValue({ fechaCaducidad: this.fechaCaducidad.join("|") });
    
                console.log(JSON.stringify(this.aviso.value));

                if ( this.aviso.valid && ( this.aviso.value.mensaje != '' || this.aviso.value.idAudio != 0 ) ) {
                    console.log('Guardar Aviso');
                    console.log(this.idAviso);
                    this.idAviso == 0 ? this.altaAviso() : this.editaAviso();
                } else {
                    this.limpiaVariables();
                    this.mensajeDialogo = ( this.aviso.value.mensaje == '' && this.aviso.value.idAudio == 0 ) ? 'Ingrese un mensaje o audio antes de continuar' : 'Ingrese el título del aviso antes de continuar';
                    this.tipoRespuesta = 2;
                    this.ngxSmartModalService.getModal('dialogoInformacionAviso').open();
                }
            }

        } else {
            this.limpiaVariables();
            this.mensajeDialogo = 'Ingrese los datos de publicación antes de continuar';
            this.tipoRespuesta = 2;
            this.ngxSmartModalService.getModal('dialogoInformacionAviso').open();
        }
    }

    altaAviso(){
        console.log('Alta Aviso');
        let params = {
            servicio: "avisos",
            accion: "IDesk_Maestro_Avisos_Alta",
            tipoRespuesta: "json",
            idCursos: this.aviso.value.idCursos,
            titulo: this.aviso.value.titulo,
            idAudio: this.aviso.value.idAudio,
            mensaje: this.aviso.value.mensaje,
            fechaPublicacion: this.aviso.value.fechaPublicacion,
            fechaCaducidad: this.aviso.value.fechaCaducidad,
            idpersonidesk: this.aviso.value.idpersonidesk
        };

        this._avisos.consultas(params)
            .subscribe(resp => {
                if(resp[0].error == 0){
                    this.mensajeDialogo = 'Aviso guardado correctamente';
                    this.tipoRespuesta = 1;
                    this.finalizado = true;
                    this.guardaAudio = false;
                } else {
                    this.mensajeDialogo = 'Error al guardar el aviso';
                    this.tipoRespuesta = 2;
                }
                this.ngxSmartModalService.getModal('dialogoInformacionAviso').open();
            }, errors => {
                console.log(errors);
            });
    }

    editaAviso() {
        console.log('Edita Aviso');
		let params = {
            servicio: "avisos",
            accion: "IDesk_Maestro_Avisos_Edita",
            tipoRespuesta: "json",
            idAviso: this.aviso.value.idAviso,
            idCurso: this.aviso.value.idCursos,
            titulo: this.aviso.value.titulo,
            idAudio: this.aviso.value.idAudio,
            mensaje: this.aviso.value.mensaje.replace(/<img .*?>/g, ""),
            fechaPublicacion: this.aviso.value.fechaPublicacion,
            fechaCaducidad: this.aviso.value.fechaCaducidad,
            idpersonidesk: this.aviso.value.idpersonidesk
        };

        this._avisos.consultas(params)
            .subscribe(resp => {
                if(resp[0].error == 0){
                    this._avisos.idAviso = 0;
                    this.mensajeDialogo = 'Aviso editado correctamente';
                    this.tipoRespuesta = 1;
                    this.finalizado = true;
                    this.guardaAudio = false;
                } else {
                    this.mensajeDialogo = 'Error al editar el aviso';
                    this.tipoRespuesta = 2;
                }
                this.ngxSmartModalService.getModal('dialogoInformacionAviso').open();
            }, errors => {
                console.log(errors);
            });
    }

    cancelaAviso() {
        this.cerrarDialogo(0);
    }

    cerrarDialogo(cerrado: number) {
         //Limpiar formulario
        this.aviso.reset();
        this.limpiaVariables();
        this.estaCerrado.emit(cerrado);
    }

    cerrarDialogConfirmacion(resp) {
        if(+resp['respuesta'] == 1){
            switch(+resp['accion']){
                case 1: // Valida Aviso
                   this.guardaAudio = true;
                   this.limpiaVariables();
                   this.validaAviso();
                break;
            }
        }

        console.log(resp);
        this.ngxSmartModalService.getModal('confirmacionDialog').close();
    }

    cierraDialogoInfo(resp) {
        this.ngxSmartModalService.getModal('dialogoInformacionAviso').close();
        if( this.finalizado ) 
            this.cerrarDialogo(1);

    }

    limpiaVariables() {
        this.idCursosPub = [];
        this.fechaPublicacion = [];
        this.fechaCaducidad = [];
        this.aviso.patchValue({ idpersonidesk: this._iestdesk.idPerson });
    }

	//Eliminar audio ya guardado en un aviso
	confEliminar(){
        this.elementoEliminar = 'Audio de aviso';
        this.idaEliminar = this.aviso.value.idAudio //this.idAudioGuardado;
        this.ngxSmartModalService.getModal('confirmarEliminacion').open();
	}

	confirmarCerrado(resp) {
        if( resp == 1 )
            this.eliminaAudio()
        else
            this.idaEliminar = 0;
		console.log(this.idaEliminar);
        this.ngxSmartModalService.getModal('confirmarEliminacion').close();
    }

    private eliminaAudio(){
		this.idAudio = 0;
        this.aviso.patchValue({ idAudio: this.idAudio });
        let params = {
            servicio: "avisos",
            accion: "IDesk_Maestro_Audio_Elimina",
            tipoRespuesta: "json",
            idAudio: this.idaEliminar,
            idpersonidesk: this._iestdesk.idPerson
        };
        
        this._avisos.consultas(params)
            .subscribe(resp => {
                if(resp[0].error == 0){
                    this.tipoRespuesta = 1;
					this.mensajeDialogo = 'Audio de aviso borrado correctamente';
                    this.ngxSmartModalService.getModal('dialogoInformacionAviso').open();
                } else {
                    this.tipoRespuesta = 2;
					this.mensajeDialogo = 'Ocurrió un error al intentar borrar el audio del aviso';
                    this.ngxSmartModalService.getModal('dialogoInformacionAviso').open();
                }
            },
            errors => {
                console.log(errors);
            });
		console.log(this.aviso.value);
    }
}