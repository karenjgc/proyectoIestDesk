import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { AltasBase } from '../shared/classes/altasBase';
import { Iestdesk } from '../services/iestdesk.service';
import { ActividadesClase } from '../services/actividadesClase.service';
import { Equipos } from '../services/equipos.service';
import { Rubricas } from '../services/rubricas.service';
import { FormBuilder } from '@angular/forms';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: "modal-alta-reactivos",
    templateUrl: "./modal-alta-reactivos.component.html"
})
export class ModalAltaReactivoComponent extends AltasBase {
    
    public tipo = 1;
    @Input() parametros;
    public coloresCategorias = [
        "Verde",
        "Morado",
        "Amarillo",
        "Azul",
        "Rojo"
    ];

    constructor(
        public iestdesk: Iestdesk,
        private actividadesClase: ActividadesClase,
        private equipos: Equipos,
        private rubricas: Rubricas,
        private _formBuilder: FormBuilder,
        private _chRef: ChangeDetectorRef,
        private _modalService: NgbModal,
        private activeModal: NgbActiveModal
    ){
        super(iestdesk,
            equipos,
            rubricas,
            _formBuilder,
            _chRef,
            _modalService,
            null,        
            null);
    }

    cerrarModal() {
        this.activeModal.close(false);
    }

    cambio(tipo) {
        this.tipo = tipo;
    }

}