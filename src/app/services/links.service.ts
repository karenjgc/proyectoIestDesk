import { Injectable, Inject } from '@angular/core';
import { ServicioBase } from './servicioBase.service';
import { HttpClient } from '@angular/common/http';


@Injectable()
export class Links extends ServicioBase {
    public link: any;
    public edicion: boolean = false;
    public rol;

    constructor(
        private http: HttpClient,
        @Inject("BaseURL") private BaseURL
    ) { 
        super(http, BaseURL);
    }
}