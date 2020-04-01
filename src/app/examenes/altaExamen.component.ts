import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Iestdesk } from '../services/iestdesk.service';
import { Examenes } from "../services/examenes.service";

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { AltasBase } from '../shared/classes/altasBase';
import { DateTimeAdapter, OWL_DATE_TIME_LOCALE, OWL_DATE_TIME_FORMATS } from 'ng-pick-datetime';
import { MomentDateTimeAdapter } from 'ng-pick-datetime-moment';
import { MY_CUSTOM_FORMATS } from '../videoconferencias/altaVideoconf.component';
import { Equipos } from '../services/equipos.service';

@Component({
    selector: 'idesk-altaExamen',
    templateUrl: './altaExamen.component.html',
    providers: [
        {provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE]},
        {provide: OWL_DATE_TIME_FORMATS, useValue: MY_CUSTOM_FORMATS},
    ]
})

export class AltaExamenComponent extends AltasBase {

    public idExamen: number = 0;
    
    constructor(
        private iestdesk: Iestdesk,
        private equipos: Equipos,
        private examenes: Examenes,
        private _formBuilder: FormBuilder,
        private _chRef: ChangeDetectorRef,
        private _modalService: NgbModal,
        public _ngxSmartModalService: NgxSmartModalService,
        private router: Router,
        private route: ActivatedRoute
    ){
        super(iestdesk,
            equipos,
            null,
            _formBuilder,
            _chRef,
            _modalService,
            _ngxSmartModalService,        
            router);

            this.rutaListado = "/examenes";

            this.formulario = this._formBuilder.group({
                idExamen: this.idExamen,
                idCursos: ['', Validators.required],
                titulo: ['', Validators.required],
                fechaPublicacion: ['', Validators.required],
                fechaCierre: ['', Validators.required],
                seccionesAleatorias: [0, Validators.required],
                reactivosAleatorios: [0, Validators.required],
                tiempoExamen: [15, Validators.required],
                idPlantillaEquipos: ['', Validators.required],
                idpersonidesk: this.iestdesk.idPerson
            });
    }

    validaExamen() {}    
}