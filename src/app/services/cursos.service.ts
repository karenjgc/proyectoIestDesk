import { Injectable, Inject } from '@angular/core';
import { ServicioBase } from './servicioBase.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class CursosService extends ServicioBase {

    public curso;

    constructor(
        private http: HttpClient,
        @Inject("BaseURL") private BaseURL
    ) { 
        super(http, BaseURL);
    }
}