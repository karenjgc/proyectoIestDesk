import { Component, OnInit } from '@angular/core';
import { Iestdesk } from '../services/iestdesk.service';

@Component({
    selector: 'idesk-reportes-avancextema',
    templateUrl: './avancextema.component.html'
})
export class ReporteAvancexTemaComponent implements OnInit{  
    public objectKeys = Object.keys;
    public temas = {};
    public temasTabla = [];
    public reporte = {};
    public reporteTabla = {};
    public idTema: number = 0;
    public idpersonidesk: number = 0;
    public mostrarDetalle: boolean = false;

    constructor(
        private _iestdesk: Iestdesk
    ){
    }

    ngOnInit() {
        this.obtenTemas();
    }

    obtenTemas() {
        let params = {
            servicio: "idesk",
            accion: "IDesk_Maestro_Temario_Cursos_Listado",
            tipoRespuesta: "json",
            idCursos: this._iestdesk.idCursoActual,
            orden: 1
        };
        this._iestdesk.consultas(params) 
            .subscribe(resp => {
                this.temas = {};
                let i = 0;
                
                this.temasTabla.push('posicion', 'idPerson', 'nombre');

                for(let tema of resp){
                    this.temas[i+'-'+tema.idTema] = {
                        idTema: tema.idTema,
                        tema: tema.tema,
                        numTema: tema.numTema
                    };

                    this.temasTabla.push(tema.idTema);
                    i++;
                }
                
                this.obtenReporte();
            },
            errors => {
                console.log(errors);
            });
    }

    obtenReporte() {
        let params = {
            servicio: "reportes",
            accion: "IDesk_Reportes_AvancexTemas",
            tipoRespuesta: "json",
            idCurso: this._iestdesk.idCursoActual
        };
        this._iestdesk.consultas(params) 
            .subscribe(resp => {
                this.reporte = {};
                
                for(let item of resp){ 
                    this.reporte[item.idPerson] = {
                        datos: item
                    }
                }

                for ( let item of Object.keys(this.reporte) ) {
                    for ( let i of Object.keys(this.reporte[item].datos) ) {
                        if ( !isNaN(this.reporte[item].datos[i]) && i != 'idPerson' ){
                            let tmp: number;
                            tmp = +(this.reporte[item].datos[i]);
                            this.reporte[item].datos[i] = Math.trunc(tmp) + '%';
                        }
                    }
                }
            },
            errors => {
                console.log(errors);
            });
    }

    detalleAlumno(idpersonidesk, idTema) {
        if ( !isNaN(idTema) ) {
            this.idTema = idTema;
            this.idpersonidesk = idpersonidesk;
            this.mostrarDetalle = true;
        }
    }

    regresar(){
        this.mostrarDetalle = false;
        this.idTema = 0;
        this.idpersonidesk = 0;
    }
}