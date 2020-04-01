import { Component, ChangeDetectorRef, ElementRef, OnInit, Input } from '@angular/core';
import { Validators, FormBuilder, FormGroup} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { Validaciones } from '../shared/classes/validaciones';

import { Iestdesk } from '../services/iestdesk.service';
import { Videoconferencia } from "../services/videoconferencia.service";

import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { DateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { MomentDateTimeAdapter } from 'ng-pick-datetime-moment';
import { AltasBase } from '../shared/classes/altasBase';
import { AltaTemaComponent } from "../temario/altaTema.component";
import { EditorService } from '../services/editorService.service';

import * as _moment from 'moment';


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
    selector: 'idesk-altaVideoconferencias',
    templateUrl: './altaVideoconf.component.html',
    providers: [
        {provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE]},
        {provide: OWL_DATE_TIME_FORMATS, useValue: MY_CUSTOM_FORMATS},
    ]
})

export class VideoconferenciasAltaComponent extends AltasBase implements OnInit {
    public validaciones = new Validaciones();
    public rolActual: number = 0;
    public cursoActual: number;
    public idVideoconferencia: number = 0;
    public modo: string;
    public duracionTmp: number = 15;
    @Input() public modoTemario;

    constructor(
        public iestdesk: Iestdesk,
        private videoconf: Videoconferencia,
        private _chRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        public _ngxSmartModalService: NgxSmartModalService,
        private _modalService: NgbModal,
        private router: Router,
        public editorService: EditorService
    ){
        super(iestdesk,
            null,
            null,
            _formBuilder,
            _chRef,
            _modalService,
            _ngxSmartModalService,        
            router);

        this.rolActual = this.iestdesk.rolActual;
        this.idVideoconferencia = this.videoconf.idVideoconferencia;
        
        this.rutaListado = "/videoconferencias";
		this.nombreDialogo = "dialogoInformacionConf";

        this.formulario = this._formBuilder.group({
            idVideoconferencia: this.idVideoconferencia,
            titulo: ['', Validators.required],
            descripcion: ['', Validators.required],
            duracion: ['', Validators.required],
            enlace: ['', Validators.required],
            fechaPublicacion: [this.iestdesk.rolActual == 3 ? new Date() : '', Validators.required],
            fechaTransmision: [this.iestdesk.rolActual == 3 ? new Date() : '', Validators.required],
            idCursos: ['', Validators.required],
            idTemas: ['', Validators.required],
            idpersonidesk: this.iestdesk.idPerson
        });

        this.cursoActual = this.iestdesk.idCursoActual;
        this.cursos = this.iestdesk.cursosLaterales;
        //this.temaSeleccionado = ' ';
		this.fechaTransmisionSeleccionada = ' ';
		//this.fechaPublicacionSeleccionada = ' ';
    }

    ngOnInit() {
        this.iestdesk.registraAcceso(59, this.idVideoconferencia);
        if ( this.idVideoconferencia == 0 ) {
            this.modo = 'Agregar Videoconferencia';
        } else {
            this.editando =  10;
            let params = {
                servicio: "videoconferencia",
                accion: "IDesk_Videoconferencias_Vista",
                tipoRespuesta: "json",
                idVideoconferencia: this.idVideoconferencia
            };
            this.videoconf.consultas(params)
                .subscribe(resp => {
                    this.contenidoEditor = resp[0].anabels == 1;
                    this.temaSeleccionado = +resp[0].idTema;
                    this.modo = resp[0].titulo;
                    this.formulario.patchValue({
                        idVideoconferencia: resp[0].idVideoconferencia,
                        titulo: resp[0].titulo,
                        descripcion: resp[0].descripcion,
                        duracion: resp[0].duracion,
                        enlace: resp[0].enlace,
                        fechaPublicacion: resp[0].fechaPublicacionISO,
                        fechaTransmision: resp[0].fechaTransmisionISO,
                        idCursos: this.iestdesk.idCursoActual,
                        idTemas: resp[0].idTema
                    });
                    this.duracionTmp = resp[0].duracion;
                    this.cargaElementos (resp[0].idTema, resp[0].fechaPublicacionISO, '', 0, 0, resp[0].fechaTransmisionISO );
                    this.agrupar();
                },
                errors => {
                    console.log(errors);
                });
        }
    }

    validaVideoconf() {
        let valido = this.publicacionCursos();

        this.formulario.patchValue({ enlace: this.validaciones.addhttp(this.formulario.value.enlace) });
        valido = this.validaciones.matchUrl(this.formulario.value.enlace);
        console.log(this.formulario);
        if ( valido ) {
            if(this.iestdesk.rolActual == 3 ){
                if(this.editorService.esAsignado == 1){
                    this.fechaPublicacion = [];
                    this.fechaPublicacion.push(_moment(this.formulario.value.fechaPublicacion).format("DD/MM/YY HH:mm"));
                }
                
                this.fechaTransmision = [];
                this.fechaTransmision.push(_moment(this.formulario.value.fechaTransmision).format("DD/MM/YY HH:mm"));
                this.temas = [];
                this.temas.push(this.temaSeleccionado);
            }

            this.formulario.patchValue({
                idCursos: this.idCursosPub.join('|'),
                idTemas: this.temas.join('|'),
                fechaPublicacion: this.fechaPublicacion.join('|'),
                fechaTransmision: this.fechaTransmision.join('|')
            });

            if(!this.formulario.valid && this.iestdesk.rolActual != 3) {
                this.limpiaVariables();
                this.mensaje = 'Llene todos los campos antes de continuar';
                this.tipoRespuesta = 2;
                this.ngxSmartModalService.getModal('dialogoInformacion').open();
            } else{
                this.idVideoconferencia == 0 ? this.altaVideoconferencia() : this.editaVideoconferencia();
            }
        } else {
            this.limpiaVariables();
			let msg = (this.mensajeDialog) ? ' ('+this.mensajeDialog+')' : '';
            this.mensaje = 'Llene todos los campos de publicación a grupos seleccionados antes de continuar'+msg;
            this.tipoRespuesta = 2;
            this.ngxSmartModalService.getModal('dialogoInformacion').open();
        }
    }

    altaVideoconferencia(){
        let params = {
            servicio: "videoconferencia",
            accion: "IDesk_Maestro_Videoconferencias_Alta",
            tipoRespuesta: "json",
            idCursos: this.formulario.value.idCursos,
            titulo: this.formulario.value.titulo,
            idTemas: this.formulario.value.idTemas,
            descripcion: this.formulario.value.descripcion,
            enlace: this.formulario.value.enlace,
            duracion: this.formulario.value.duracion,
            fechaPublicacion: this.formulario.value.fechaPublicacion,
            fechaTransmision: this.formulario.value.fechaTransmision,
            idpersonidesk: this.formulario.value.idpersonidesk,
        };
        this.videoconf.consultas(params)
            .subscribe(resp => {
                this.mensaje = resp[0].mensaje;
                if(resp[0].error == 0){
                    this.tipoRespuesta = 1;
                    this.videoconf.idVideoconferencia = 0;
                    this.guardado = true;
                    this.formulario.reset();
                    this.ngxSmartModalService.getModal('dialogoInformacion').open();
                } else {
                    this.tipoRespuesta = 2;
                    this.ngxSmartModalService.getModal('dialogoInformacion').open();
                }
            },
            errors => {
                console.log(errors);
            });
    }

    editaVideoconferencia(){
        let params = {
            servicio: "videoconferencia",
            accion: "IDesk_Maestro_Videoconferencias_Edita",
            tipoRespuesta: "json",
            idVideoconferencia: this.formulario.value.idVideoconferencia,
            idCurso: this.formulario.value.idCursos,
            titulo: this.formulario.value.titulo,
            idTema: this.formulario.value.idTemas,
            descripcion: this.formulario.value.descripcion,
            enlace: this.formulario.value.enlace,
            duracion: this.formulario.value.duracion,
            fechaPublicacion: this.formulario.value.fechaPublicacion,
            fechaTransmision: this.formulario.value.fechaTransmision,
            idpersonidesk: this.formulario.value.idpersonidesk,
        };

        this.videoconf.consultas(params)
            .subscribe(resp => {
                this.mensaje = resp[0].mensaje;
                if(resp[0].error == 0){
                    this.tipoRespuesta = 1;
                    this.videoconf.idVideoconferencia = 0;
                    this.guardado = true;
                    this.formulario.reset();
                } else {
                    this.tipoRespuesta = 2;
                }
                this.ngxSmartModalService.getModal('dialogoInformacion').open();
            },
            errors => {
                console.log(errors);
            });
    }

    regresa() {
        //console.log('regresa');
        this.formulario.reset();
        this.limpiaVariables();
        this.router.navigate(['/videoconferencias']);
    }
    
    limpiaVariables() {
        this.temp = [];
        this.formulario.patchValue({ idVideoconferencia: 0 });
        this.formulario.patchValue({ idpersonidesk: this.iestdesk.idPerson });
    }

    setStartAt(){
		this.opcDatePicker.setStartAt();
    }
    
    nuevoTema() {
        this.modalReference = this._modalService.open(AltaTemaComponent, { backdrop: 'static' });
        this.modalReference.result.then(resp => {
            if (resp != 0) {
                this.obtenTemas(false);
            }
        });
    }

    cambiaDuracion(e) {
        console.log(e.value);
    }

    vistaAlumnoObjeto(content){
        this.modalReference = this._modalService.open(content, { backdrop: 'static' });
    }
}