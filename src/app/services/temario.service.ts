import { Injectable, Inject } from '@angular/core';
import { ServicioBase } from './servicioBase.service';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';


@Injectable()
export class Temario extends ServicioBase {

    constructor(
        private http: HttpClient,
        @Inject("BaseURL") private BaseURL
    ) { 
        super(http, BaseURL);
    }
    
}