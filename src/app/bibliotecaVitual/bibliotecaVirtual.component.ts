import { Component, ChangeDetectorRef, OnInit } from '@angular/core';

import { Iestdesk } from '../services/iestdesk.service';

import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'idesk-bibliotecaVirtual',
    templateUrl: './bibliotecaVirtual.component.html'
})

export class BibliotecaVirtualComponent implements OnInit {
    public biliotecas;

    constructor(
        private _iestdesk: Iestdesk,
        private _chRef: ChangeDetectorRef,
        public _modalService: NgbModal,
        public activeModal: NgbActiveModal
    ){

    }

    ngOnInit() {
        this._iestdesk.registraAcceso(26, 0);
        let params = {
            servicio: "idesk",
            accion: "IDesk_Biblioteca_Virtual_Listado",
            tipoRespuesta: "json"
        };

        this._iestdesk.consultas(params)
            .subscribe(resp => {
                this.biliotecas = resp;
            },
            errors => {
                console.log(errors);
            });
    }
}