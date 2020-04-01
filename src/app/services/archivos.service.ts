import { Injectable, Inject } from '@angular/core';
import { ServicioBase } from './servicioBase.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class Archivos extends ServicioBase {

    public rol;
    public idArchivos = "";

    constructor(
        private http: HttpClient,
        @Inject("BaseURL") private BaseURL
    ) { 
		super(http, BaseURL);
    }
}