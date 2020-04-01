import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';

import { Iestdesk } from '../services/iestdesk.service';
import { ForoDiscusion } from '../services/foroDiscusion.service';
import { Equipos } from '../services/equipos.service';
import { Rubricas } from '../services/rubricas.service';

import { RevisionBase } from '../shared/classes/revisionBase';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
    selector: 'idesk-revisionForoDisc',
    templateUrl: './revisionForo.component.html'
})

export class RevisionForoDiscComponent extends RevisionBase implements OnInit {
    public idForoDisc: number;
    public idForoDiscAlumno;
    public comentarios = [];
    public arcComentarios = [];

    @ViewChild('forumArea') private myScrollContainer: ElementRef;

    constructor(
        public iestdesk: Iestdesk,
        private foroDiscusion: ForoDiscusion,
        private equipos: Equipos,
        private rubricas: Rubricas,
        private _chRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _modalService: NgbModal,
        private _ngxSmartModalService: NgxSmartModalService
    ){
		super(iestdesk,
			equipos,
			rubricas,
			_formBuilder,
			_chRef,
			_modalService,
			_ngxSmartModalService
		);
		this.tipo = 2;
        this.idElemento = this.foroDiscusion.idForoDisc;

        this.formRevision = this._formBuilder.group({
            idForoDisc: this.idElemento,
            idAlumno: ['', Validators.required],
            calificacion:  ['', [Validators.required, Validators.max(10)]],
            comentariosMaestro: '',
			idArchivos: ''
        });
    }

    ngOnInit() {
		this.iestdesk.registraAcceso(53, this.idElemento);
        this.listadoAlumnos();

        let params = {
            servicio: "foroDiscusion",
            accion: "IDesk_Foro_Discusion_Vista_Ind",
            tipoRespuesta: "json",
            idForoDisc: this.idElemento
        };

        this.foroDiscusion.consultas(params)
            .subscribe(resp => {
				this.idPlantillaEquipos = resp[0].idPlantillaEquipos;
                this.idRubrica = resp[0].idRubrica;
				this.idRubricaArchivo = resp[0].idRubricaExterna;
				this.idRubricaLink = resp[0].idRubricaExternaLink;
				this.titulo = resp[0].titulo;
				this.obtenerRubricaExterna();
            },
            errors => {
                console.log(errors);
            });
    }

	public infoRevisa(alumno){
        this.formRevision.reset();
        this.formRevision.patchValue({
            idForoDisc: this.idElemento,
            idArchivos: ''
        });
        this.foroDiscusion.idAlumnoRev = 0;
        this.idAlumno = 0;
        this.foroDiscusion.idForoDiscAlumno = 0;

        if ( alumno.id != '' ) {
            this.revisar(alumno);
            ( this.idPlantillaEquipos != 0 ) ? this.consultaEquipo() : this.idEquipo = 0;
            setTimeout(() =>{
                this.obtieneConversacion();
                this.consultaRevision();
            }, 200);
        }
	}

    regresaListado() {
        this.formRevision.reset();
        this.formRevision.patchValue({
            idForoDisc: this.idElemento,
            idArchivos: ''
        });
        this.foroDiscusion.idAlumnoRev = 0;
        this.idAlumno = 0;
        this.foroDiscusion.idForoDiscAlumno = 0;

		this.verListado();
    }

    obtieneConversacion(){
        this.comentarios = [];
        let params = {
            servicio: "foroDiscusion",
            accion: "IDesk_Foro_Discusion_Respuestas",
            tipoRespuesta: "json",
            idForoDisc: this.idElemento, 
            idpersonidesk: this.idAlumno, 
            esMaestro: this.rolActual, 
            idEquipo: this.idEquipo
        };

        this.foroDiscusion.consultas(params)
            .subscribe(resp => {
                this.comentarios = resp;
                this._chRef.detectChanges();
                this.scrollDown();
            },
            errors => {
                console.log(errors);
            });
    }

    verArchivos(idForoDiscRespuesta, content) {
        let params = {
            servicio: "foroDiscusion",
            accion: "IDesk_Foro_Discusion_Comentario_Archivos",
            tipoRespuesta: "json",
            idForoDiscRespuesta: idForoDiscRespuesta
        };

        this.foroDiscusion.consultas(params)
            .subscribe(resp => {
                this.arcComentarios = resp;
                this.modalReference = this._modalService.open(content);
            },
            errors => {
                console.log(errors);
            });
    }

    scrollDown() {
        try {
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        } catch(err) { } 
    }

    consultaRevision() {
        let params = {
            servicio: "foroDiscusion",
            accion: "IDesk_Foro_Discusion_Consulta_Revision",
            tipoRespuesta: "json",
            idForoDisc: this.idElemento, 
            idAlumno: this.idAlumno
        };

        this.foroDiscusion.consultas(params)
            .subscribe(resp => {
                if ( resp.length > 0 ) {
                    this.formRevision.patchValue({
                        idForoDisc: this.idElemento,
                        idAlumno: this.idAlumno,
                        calificacion: resp[0].calificacion,
                        comentariosMaestro: resp[0].comentariosMaestro
                    });
                    this.foroDiscusion.idForoDiscAlumno = resp[0].idForoDiscAlumno;
                    this.editando = 6;
                }
            },
            errors => {
                console.log(errors);
            });
    }

    altaRevision() {
        if ( this.formRevision.valid ) {
            let params = {
                servicio: "foroDiscusion",
                accion: "IDesk_Maestro_Foro_Discusion_Revisa",
                tipoRespuesta: "json",
                idForoDisc: this.formRevision.value.idForoDisc,
                idAlumno: this.formRevision.value.idAlumno,
                calificacion: this.formRevision.value.calificacion,
                comentariosMaestro: this.formRevision.value.comentariosMaestro || '',
                idArchivos: this.formRevision.value.idArchivos
            };

            this.foroDiscusion.consultas(params)
                .subscribe(resp => {
                    if ( resp[0].error == 0 ) {
                        this.guardado = true;
                        this.regresaListado();
                    } else {
                        this.mensaje = resp[0].mensaje;
                        this.tipoRespuesta = 2;
                        this._ngxSmartModalService.getModal('dialogoInformacionForo').open();
                    }
                },
                errors => {
                    console.log(errors);
                });
        } else {
            this.mensaje = 'Ingrese la calificación antes de continuar. Recuerde que la máxima es 10.';
            this.tipoRespuesta = 2;
            this._ngxSmartModalService.getModal('dialogoInformacionForo').open();
        }
    }
}