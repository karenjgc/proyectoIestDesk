import { Injectable, Inject } from '@angular/core';
//import { Http } from '@angular/http';

import { Rol } from '../shared/iestdesk/rol';
import { ServicioBase } from './servicioBase.service';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class Iestdesk extends ServicioBase {
    public rol: Rol;
    public rolActual: number = 0;
    public idPerson: number = 0;
    public login: string = '';
    public cursoActual: string = '';
    public modalidadActual;
    public idCursoActual: number = 0;
    public idTipoCursoActual: number = 0;
	public idGrado: number = 0;
    public cursosLaterales: any[];
    public faltas: any[];
    public tema;
    public tema$ = new Subject<Number>();
    public actualizacion$ = new Subject<Number>();
    public esAsignadoCTE;

    constructor(
        private http: HttpClient,
        @Inject("BaseURL") private BaseURL
    ) { 
        super(http, BaseURL);

    }

    cambiarRol() {
        this.limpiaVariablesCurso();
        this.faltas = undefined;
    }

    limpiaVariablesCurso(){
        this.cursoActual = '';
        this.idCursoActual = 0;
        this.idTipoCursoActual = 0;
		this.idGrado = 0;
        this.cursosLaterales = undefined;
        this.modalidadActual = 0;
        this.faltas = undefined;
    }

    obtenerTemaActual() {
        return this.tema$;
    }

    establecerTemaActual(tema) {
        this.tema$.next(tema);
    }

    obtenerActualizacion() {
        return this.actualizacion$;
    }

    establecerActualizar(actualizacion) {
        this.actualizacion$.next(actualizacion);
    }

    registraAcceso(idTipoModulo, idElemento) {
        //console.log(idTipoModulo, idElemento)
        let params = {
            servicio: "idesk",
            accion: "IDesk_Registra_Acceso",
            tipoRespuesta: "json",
            idCurso: this.idCursoActual,
            idTipoModulo: idTipoModulo,
            idElemento: idElemento,
            idpersonidesk: this.idPerson,
            idPlataforma: 1,
            idVersionPlataforma: 0
        };

        this.consultas(params)
            .subscribe(resp => {
                console.log(resp);
            },
            errors => {
                console.log(errors);
            });
    }
}