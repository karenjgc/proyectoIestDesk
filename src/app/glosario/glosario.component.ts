import { Component, ChangeDetectorRef, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as $ from 'jquery';

import { Iestdesk } from '../services/iestdesk.service';
import { Tareas } from "../services/tareas.service";

import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
    selector: 'idesk-glosario',
    templateUrl: './glosario.component.html'
})

export class GlosarioComponent {

    constructor(){
        //console.log(':)');
    }
}