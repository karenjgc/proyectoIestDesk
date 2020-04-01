import { Injectable, Inject } from '@angular/core';
import { ServicioBase } from './servicioBase.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class Equipos extends ServicioBase {
    public tipo: number = 0;
    public modalidad: number = 0;
    public cant: number = 0;
    public idCursoSolicitado: number = 0;

    constructor(
        private http: HttpClient,
        @Inject("BaseURL") private BaseURL
    ) { 
        super(http, BaseURL);
    }
}