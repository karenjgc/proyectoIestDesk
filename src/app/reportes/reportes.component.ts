import { Component, OnInit } from '@angular/core';
import { Iestdesk } from '../services/iestdesk.service';

@Component({
    selector: 'idesk-reportes',
    templateUrl: './reportes.component.html'
})
export class ReportesComponent implements OnInit{

    public objectKeys = Object.keys;
    public mostrarDetalle: boolean = false;
    public idTema: number = 0;
    public idpersonidesk: number = 0;
    public temas = {};

    constructor(
        private _iestdesk: Iestdesk
    ){
    }

    ngOnInit() {
        console.clear();
        console.log("\n       \\    /\\\n        )  ( ')\n       (  /  )\n        \\(__)|");

        this._iestdesk.registraAcceso(70, 0);
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

                for(let tema of resp){
                    this.temas[tema.idTema] = {
                        idTema: tema.idTema,
                        tema: tema.tema,
                        numTema: tema.numTema
                    };
                }
                
            },
            errors => {
                console.log(errors);
            });
    }

    detalleTema() {
        this.mostrarDetalle = true;
    }

    regresar(){
        this.mostrarDetalle = false;
        this.idTema = 0;
        this.idpersonidesk = 0;
    }
}