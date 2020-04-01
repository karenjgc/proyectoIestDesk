import { Component, ChangeDetectorRef, ElementRef, Output, EventEmitter } from '@angular/core';

import { Iestdesk } from '../services/iestdesk.service';
import { ForoDiscusion } from "../services/foroDiscusion.service";
import { Rubricas } from '../services/rubricas.service';
import { Links } from '../services/links.service';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
    selector: 'idesk-reutilizarForoDisc',
    templateUrl: './reutilizarForoDiscusion.component.html'
})

export class ReutilizarForoDiscusionComponent {
    @Output() regresarReutilizado = new EventEmitter();

    public cursos = [];
    public reutilizables = [];
    public infoForo;
    public archivos = [];
    public archivosForo = [];
    public linksForo = [];
    public tipo: number;
    public ruta: string;
	public numeroArchivos: number;
    public busquedaTitulo;
    
    public modalReference: any;

    constructor(
        private _iestdesk: Iestdesk,
        private _foroDiscusion: ForoDiscusion,
        private chRef: ChangeDetectorRef,
        private _rubricas: Rubricas, 
        private _links: Links,
        private modalService: NgbModal,
        public ngxSmartModalService: NgxSmartModalService
    ){
        this.cursosImpartidos();
        this.consultaForos(0);
    }

    cursosImpartidos() {
        let params = {
            servicio: "idesk",
            accion: "IDesk_Maestro_CursosImpartidos",
            tipoRespuesta: "json",
            idCurso: this._iestdesk.idCursoActual,
            idpersonidesk: this._iestdesk.idPerson
        };

        this._iestdesk.consultas(params)
            .subscribe(resp => {
                this.cursos = resp;
                //console.log(resp);
            },
            errors => {
                console.log(errors);
            });
    }

    consultaForos(val) {
        let params = {
            servicio: "foroDiscusion",
            accion: "IDesk_Maestro_Foro_Discusion_Reutilizar",
            tipoRespuesta: "json",
            idCodigo: val,
            idCurso: this._iestdesk.idCursoActual, 
            idpersonidesk: this._iestdesk.idPerson
        };

        this._foroDiscusion.consultas(params)
            .subscribe(resp => {
                this.reutilizables = resp;
                //console.log(resp);
            },
            errors => {
                console.log(errors);
            });
    }

    revisa(e) {
        this.consultaForos(e.target.value);
    }

    vistaPrevia(idForo) {
        let params = {
            servicio: "foroDiscusion",
            accion: "IDesk_Foro_Discusion_Vista_Ind",
            tipoRespuesta: "json",
            idForoDisc: idForo
        };
        this._foroDiscusion.consultas(params)
            .subscribe(resp => {
                this.infoForo = resp[0];
            },
            errors => {
                console.log(errors);
            });
        
        let paramsArchivos = {
            servicio: "foroDiscusion",
            accion: "IDesk_Foro_Discusion_Vista_Ind_Archivos",
            tipoRespuesta: "json",
            idForoDisc: idForo
        };
        
        this._foroDiscusion.consultas(paramsArchivos)
            .subscribe(resp => {
                this.archivosForo = resp;
            },
            errors => {
                console.log(errors);
            });
        
        let paramsLinks = {
            servicio: "foroDiscusion",
            accion: "IDesk_Foro_Discusion_Vista_Ind_Links",
            tipoRespuesta: "json",
            idForoDisc: idForo
        };

        this._foroDiscusion.consultas(paramsLinks)
            .subscribe(resp => {
                this.linksForo = resp;
            },
            errors => {
                console.log(errors);
            });
        
    }

    verRubrica(content, idRubrica) {
        this._rubricas.idRubrica = idRubrica;
        this.modalReference = this.modalService.open(content, { backdrop: 'static' });
    }

    verArchivos(content) {
        this.modalReference = this.modalService.open(content);
    }

    reutilizar(infoForo) {
        this.regresarReutilizado.emit(infoForo);
    }
}