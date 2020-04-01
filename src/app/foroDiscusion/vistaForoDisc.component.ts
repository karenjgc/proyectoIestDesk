import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as $ from 'jquery';

import { Iestdesk } from '../services/iestdesk.service';
import { ForoDiscusion } from '../services/foroDiscusion.service';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'idesk-vistaForoDisc',
    templateUrl: './vistaForoDisc.component.html'
})
export class VistaForoDiscComponent implements OnInit {    
    public rolActual: number = 0;
    public idForoDisc: number;

    public foroDiscusion: string;
    public permiteArchivos: number;
    public cerrado: number;
    public idPlantillaEquipos;
    public infoRevision = [];
    public archivosRevision = [];
    public mostrarCalif: boolean = false;
    public mostrarArch: boolean = false;

    public mostrar: boolean = false;
    public ordena: number = 0;
    public modalReference;
    
    @Input() public modoTemario;

    constructor(
        public _iestdesk: Iestdesk,
        private _foroDiscusion: ForoDiscusion,
        private router: Router,
        private modalService: NgbModal
    ){
        this.rolActual = this._iestdesk.rolActual;
        this.idForoDisc = this._foroDiscusion.idForoDisc;

        if ( this.rolActual == 2 ) {
            this.consultaRevision();
        }
    }

    ngOnInit() {
		this._iestdesk.registraAcceso(2, this.idForoDisc);
    }

    gotoEditar() {
        this.router.navigate(['/foro-discusion/nuevo']);
    }

    gotoRevisar() {
        this.router.navigate(['/foro-discusion/revision']);
    }

    ocultarInfo(){
        const div: any = $('#informacion-foro');
        const info: any = $('#info');
        info.hide();
        div.removeClass('col-5');
        div.addClass('col-12');
        this.mostrar = true;
    }

    mostrarInfo() {
        const div: any = $('#informacion-foro');
        const info: any = $('#info');
        div.removeClass('col-12');
        div.addClass('col-5');
        info.slideDown();
        this.mostrar = false;
    }

    getNombreForo(tmp) {
        this.foroDiscusion = tmp[0].titulo;
        this.permiteArchivos = tmp[0].permiteArchivos;
        this.cerrado = tmp[0].cerrado;
        this.idPlantillaEquipos= tmp[0].idPlantillaEquipos;
    }

    consultaRevision() {
        let params = {
            servicio: "foroDiscusion",
            accion: "IDesk_Foro_Discusion_Consulta_Revision",
            tipoRespuesta: "json",
            idForoDisc: this.idForoDisc, 
            idAlumno: this._iestdesk.idPerson
        };

        this._foroDiscusion.consultas(params)
            .subscribe(resp => {
                if ( resp.length > 0 ) {
                    this.infoRevision = resp[0];
                    this.mostrarCalif = true;
                    this.consultaRevisionArch(resp[0].idForoDiscAlumno);
                } else {
                    this.mostrarCalif = false;
                }
            },
            errors => {
                console.log(errors);
            });
    }

    consultaRevisionArch(idForoDiscAlumno ) {
        let params = {
            servicio: "foroDiscusion",
            accion: "IDesk_Foro_Discusion_Consulta_Revision_Arch",
            tipoRespuesta: "json",
            idForoDiscAlumno : idForoDiscAlumno 
        };

        this._foroDiscusion.consultas(params)
            .subscribe(resp => {
                if ( resp.length > 0 ) {
                    this.archivosRevision = resp;
                    this.mostrarArch = true;
                } else {
                    this.mostrarArch = false;
                }
            },
            errors => {
                console.log(errors);
            });
    }

    verArchivos(content) {
        this.modalReference = this.modalService.open(content);
    }
}