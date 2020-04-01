import { Injectable, Inject } from '@angular/core';
import { ServicioBase } from './servicioBase.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class DisenadorService extends ServicioBase {

    public rangoFechas: Date[];
    public idCurso: number = 0;
    public nombreCurso: string = '';
	public periodo: any;
	public idReporte: number = 0;
    public nombreMaterias: string = '';
    public nombreCursos = {};
    public fechasSemana: string = '';
    public semanaSeleccionada: string = '';
    public periodoSeleccionado: number = 90;

    public tipoCursoSeleccionado: number = 0;

    constructor(
        private http: HttpClient,
        @Inject("BaseURL") private BaseURL
    ) { 
        super(http, BaseURL);
    }

	procesaNombres(nombres){
		this.nombreMaterias = nombres.slice(0, -1).replace(/\|/g, ', ');
	}
}