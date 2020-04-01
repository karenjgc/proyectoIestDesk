import { Injectable, Inject } from '@angular/core';
import { ServicioBase } from './servicioBase.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class Tareas extends ServicioBase {
    public idTarea: number;
    public modEntrega: any[];
	public idTareaAlumno: number;
	public tituloTarea: string;
	public tarea: any;

    constructor(
        private http: HttpClient,
        @Inject("BaseURL") private BaseURL
    ) { 
		super(http, BaseURL);
    }
}