import { Component, ChangeDetectorRef, ElementRef, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { Iestdesk } from '../services/iestdesk.service';
import { Temario } from "../services/temario.service";

import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AltasBase } from '../shared/classes/altasBase';
import { EditorService } from '../services/editorService.service';

@Component({
    selector: 'idesk-altaTema',
    templateUrl: './altaTema.component.html'
})

export class AltaTemaComponent extends AltasBase {
    @Output() temaAlta = new EventEmitter();
    @Input() public idTemaModal = 0;
    
    public idTema: number = 0;
    public guardado: boolean = false;
    public cursoEditor = [];
    public mensaje: string;
    public tipoRespuesta: number;

    constructor(
        public iestdesk: Iestdesk,
        private _temario: Temario,
        private editorService: EditorService,
        private _chRef: ChangeDetectorRef,
        private elRef: ElementRef,
        private _formBuilder: FormBuilder,
        public _modalService: NgbModal,
        public activeModal: NgbActiveModal,
        public _ngxSmartModalService: NgxSmartModalService,
        public router: Router
    ){  
        super(iestdesk,
            null,
            null,
            _formBuilder,
            _chRef,
            _modalService,
            _ngxSmartModalService,        
            router);

        this.idTema = this.iestdesk.tema ? this.iestdesk.tema.idTema : 0;

        this.formulario = this._formBuilder.group({
            idTema: this.idTema,
            nombreTema: [ !this.iestdesk.tema ? '' : this.iestdesk.tema.tema, Validators.required],
            idCursos: [!this.iestdesk.tema ? '' : this.iestdesk.tema.idCurso, Validators.required],
            idpersonidesk: [this.iestdesk.idPerson, Validators.required]
        });
        
        if(iestdesk.rolActual == 3){
            this.cursoEditor.push({
                idCurso:  this.iestdesk.idCursoActual,
                materia:  this.editorService.materia.materia,
                clave:  this.editorService.materia.ClaveAlfa,
                seleccionada: true
            });
        }
    }

    validaTema() {
        let valido = this.publicacionCursos();
        this.formulario.patchValue({idCursos: this.idCursosPub.join('|') });
        //console.log('TEMP', this.idCursosPub);

        if ( valido ) {
            
            if( this.formulario.valid ){
               this.altaEditaTema();
            } else {
                this.mensaje = 'Ingrese el título del tema antes de continuar';
                this.tipoRespuesta = 2;
                this.ngxSmartModalService.getModal('dialogoInformacionTema').open();
            }
        } else {
            this.mensaje = 'Seleccione al menos un grupo para agregar el tema';
            this.tipoRespuesta = 2;
            this.ngxSmartModalService.getModal('dialogoInformacionTema').open();
        }
    }

    altaEditaTema() {
        let params = {
            servicio: "temario",
            accion: this.idTema == 0 ? "IDesk_Maestro_Tema_Alta" : "IDesk_Maestro_Tema_Edita",
            idTema: this.idTema,
            tipoRespuesta: "json",
            idCursos: this.formulario.value.idCursos,
            tema: this.formulario.value.nombreTema,
            idpersonidesk: this.formulario.value.idpersonidesk
        };
        this._temario.consultas(params)
            .subscribe(resp => {
                this.mensaje = resp[0].mensaje;
                if(resp[0].error == 0){
                    this.tipoRespuesta = 1;
                    this.idTema = resp[0].idTema;
                    this.guardado = true;
                } else {
                    this.tipoRespuesta = 2;
                }
                this.ngxSmartModalService.getModal('dialogoInformacionTema').open();
            },
            errors => {
                console.log(errors);
            });
    }
 
    cierraDialogoInfoTema(resp) {
        this.ngxSmartModalService.getModal('dialogoInformacionTema').close();
        this._chRef.detectChanges();
        if ( this.tipoRespuesta == 1 && this.guardado ){
            this.regresa(1);
        }
    }

    regresa(idTema) {
        this.iestdesk.establecerActualizar(idTema != 0);
        this.iestdesk.tema = 0;
        this.activeModal.close(idTema);
    }
}