import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ActividadesClaseAlumnoService {

    constructor(
        private http: HttpClient,
        @Inject("BaseURL") private BaseURL
    ) {

    }
}