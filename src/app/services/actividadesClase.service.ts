import { Injectable, Inject } from '@angular/core';
import { ServicioBase } from './servicioBase.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ActividadesClase extends ServicioBase {
    public idActividad: number = 0;
    public actividadClase;

    public idActividadAlumno: number = 0;
    public actividad: any;

    public tipoAlta: number = 0;
	public tituloActividad: string;
	public idActividadLibreOExterna: number = 0;

    constructor(
        private http: HttpClient,
        @Inject("BaseURL") private BaseURL
    ) { 
        super(http, BaseURL);
    }
}