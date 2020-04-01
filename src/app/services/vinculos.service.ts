import { Injectable, Inject } from '@angular/core';
import { ServicioBase } from './servicioBase.service';

import { HttpClient } from '@angular/common/http';

@Injectable()
export class Vinculos extends ServicioBase {
    public idVinculo: number = 0;

    constructor(
        private http: HttpClient,
        @Inject("BaseURL") private BaseURL
    ) { 
        super(http, BaseURL);
    }

    obtenUrlImagen(url){
        let uri = "https://api.linkpreview.net?key=59e783a0c514361913e005ee039bc1b92f9348f3f7a56&q=" + url;

        return this.http.get<any>(uri);

    }
}