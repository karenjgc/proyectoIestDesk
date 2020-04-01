import { Injectable, Inject } from '@angular/core';
import { ServicioBase } from './servicioBase.service';
import { HttpClient } from '@angular/common/http';


@Injectable()
export class Rubricas extends ServicioBase {
    public idRubrica: number = 0;

    constructor(
        private http: HttpClient,
        @Inject("BaseURL") private BaseURL
    ) { 
        super(http, BaseURL);
    }
}