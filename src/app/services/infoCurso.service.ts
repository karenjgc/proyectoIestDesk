import { Injectable, Inject } from '@angular/core';
import { ServicioBase } from './servicioBase.service';
import { HttpClient } from '@angular/common/http';


@Injectable()
export class InformacionCurso extends ServicioBase {
    public infoCurso;
    public tipo: number = 0;
    public idBibliografia: number = 0;
    public bibliografia: any;

    constructor(
        private http: HttpClient,
        @Inject("BaseURL") private BaseURL
    ) { 
        super(http, BaseURL);
    }
}