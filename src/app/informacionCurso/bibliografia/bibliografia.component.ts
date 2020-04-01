import { Component, ChangeDetectorRef } from '@angular/core';

import { Iestdesk } from '../../services/iestdesk.service';
import { InformacionCurso } from '../../services/infoCurso.service';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
    selector: 'idesk-bibliografia',
    templateUrl: './bibliografia.component.html'
})
export class BibliografiaComponent {
    public rolActual: number;
    public idGrado: number;
    public idTipoCursoActual: number = 0;
    public basicas = [];
    public complementarias = [];

    public elementoEliminar: string;
    public idaEliminar: number;
    public mensaje: string;
    public tipoRespuesta: number;

    public modalReference: any;
    public bib: any = '';

    constructor(
        private _iestdesk: Iestdesk,
        private _infoCurso: InformacionCurso,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        public ngxSmartModalService: NgxSmartModalService
    ){ 
        this.rolActual = this._iestdesk.rolActual;
        this.idGrado = this._iestdesk.idGrado;
        this.idTipoCursoActual = this._iestdesk.idTipoCursoActual;
        
        this.obtieneBibliografias();
    }

    obtieneBibliografias(){
        let params = {
            servicio: "infoCurso",
            accion: "IDesk_Bibliografias_Listado",
            tipoRespuesta: "json",
            idCurso: this._iestdesk.idCursoActual
        };
        this._infoCurso.consultas(params)
            .subscribe(resp => {
                this.evaluaBibliografias(resp);
            },
            errors => {
                console.log(errors);
            });
    }

    evaluaBibliografias(bibliografias) {
        this.basicas = [];
        this.complementarias = [];
        for ( let i = 0; i < bibliografias.length; i ++ ) {
            if ( bibliografias[i].tipoBibliografia == 1 ) {
                this.basicas.push(bibliografias[i]);
            } else {
                this.complementarias.push(bibliografias[i]);
            }
        }
        //console.log(this.basicas, this.complementarias)
    }

    abrirDialogo(content, b) {
        this._infoCurso.idBibliografia = b.idBibliografia;
        this._infoCurso.bibliografia = b;
        this.modalReference = this.modalService.open(content, { backdrop: 'static' });
    }

    biblografiaNueva(content){
        this._infoCurso.idBibliografia = 0;
        this._infoCurso.bibliografia = [];
        this.modalReference = this.modalService.open(content, { backdrop: 'static' });
    }

    altaCerrada(cerrado) {
        this.modalReference.close();

        if(cerrado == 1) {
            if ( this.rolActual == 1 ) 
                this.obtieneBibliografias();
        }
    }

    cierraDialogoInfo(resp) {
        this.ngxSmartModalService.getModal('dialogoInformacion').close();
    }

    confEliminar(idBibliografia, titulo){
        this.elementoEliminar = titulo;
        this.idaEliminar = idBibliografia;
        this.ngxSmartModalService.getModal('confirmarEliminacion').open();
    }

    confirmarCerrado(resp) {
        if( resp == 1 )
            this.eliminaBibliografia();
        else
            this.idaEliminar = 0;
        
        this.ngxSmartModalService.getModal('confirmarEliminacion').close();
    }

    eliminaBibliografia(){
        let params = {
            servicio: "infoCurso",
            accion: "IDesk_Maestro_Bibliografia_Elimina",
            tipoRespuesta: "json",
            idBibliografia: this.idaEliminar,
            idCurso: this._iestdesk.idCursoActual,
            idpersonidesk: this._iestdesk.idPerson
        };
        this._infoCurso.consultas(params)
            .subscribe(resp => {
                this.mensaje = resp[0].mensaje;
                if(resp[0].error == 0){
                    this.tipoRespuesta = 1;
                    this._infoCurso.idBibliografia = 0;
                    this.obtieneBibliografias();
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

    verBiblio(b, content){
        this.bib = b;
        this.modalReference = this.modalService.open(content, { backdrop: 'static' });
    }

    cerrarInfo(){
       this.bib = '';
       
       this.modalReference.close();
    }
}