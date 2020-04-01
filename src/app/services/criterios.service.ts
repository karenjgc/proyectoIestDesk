import { Injectable, Inject } from '@angular/core';
import { ServicioBase } from './servicioBase.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class CriteriosEvaluacion extends ServicioBase {
	public criterios;
	public comentarios: string;
	public idCriterioEvaluacion: number;
	public infoCriterio;
	
    constructor(
        private http: HttpClient,
        @Inject("BaseURL") private BaseURL
    ) { 
        super(http, BaseURL);
    }
}