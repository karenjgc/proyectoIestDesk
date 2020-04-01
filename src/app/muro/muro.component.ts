import { Component, ChangeDetectorRef, ElementRef, ViewChild, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators, FormBuilder, FormGroup} from '@angular/forms';

import { Iestdesk } from '../services/iestdesk.service';
import { FroalaOptions } from '../shared/iestdesk/froala';

@Component({
    selector: 'idesk-muro',
    templateUrl: './muro.component.html'
})

export class MuroComponent implements OnInit{
    public rolActual: number = 0;
    public opcFroala = new FroalaOptions();
    
    public muro: FormGroup;
    public options: Object = this.opcFroala.opcionesEmojis;

    constructor(
        private _iestdesk: Iestdesk,
        private formBuilder: FormBuilder,
        private chRef: ChangeDetectorRef,
        private router: Router,
        private route: ActivatedRoute
    ){
        this.rolActual = this._iestdesk.rolActual;
        this.muro = this.formBuilder.group({
            idCurso: this._iestdesk.idCursoActual,
            publicacion:  '',
			idpersonidesk: this._iestdesk.idPerson
        });
       
    }

    ngOnInit() {
        this._iestdesk.registraAcceso(20, 0);
    }
}