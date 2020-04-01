import { Injectable, Inject } from '@angular/core';
import { ServicioBase } from './servicioBase.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ForoDiscusion extends ServicioBase {
    public idForoDisc: number = 0;
    public idAlumnoRev: number = 0;
    public idForoDiscAlumno: number = 0;

    constructor(
        private http: HttpClient,
        @Inject("BaseURL") private BaseURL
    ) { 
        super(http, BaseURL);
    }
}