import { Component, OnInit, Input } from '@angular/core';
import { Iestdesk } from '../services/iestdesk.service';
import { identifierName } from '@angular/compiler';



@Component({
    selector: 'idesk-reportes-avancextema_detalle',
    templateUrl: './avancextema_detalle.component.html'
})

export class ReporteAvancexTemaDetalleComponent implements OnInit{
    public objectKeys = Object.keys;
    public temas = {};
    public reporte = {};
    public encabezados = {};
    public _idTema: number = 0;
    public _idpersonidesk: number = 0;
    public tema: string = '';
    public numTema: number = 0;
    public temaArr = [];

    constructor(
        private _iestdesk: Iestdesk
    ){
        console.clear();
        console.log("\n       \\    /\\\n        )  ( ')\n       (  /  )\n        \\(__)|");
    }

    @Input()
	set idTema( idTema: any ) {
		if ( this._idTema != idTema ){
            let tmp: number = this._idTema;
            this._idTema = idTema;
            console.log(tmp);
            if( tmp != 0 ) {
                this.obtenReporte();
                this.tema = this.temas[this._idTema].tema;
            }
		}
	}

    @Input()
	set idpersonidesk( idpersonidesk: any ) {
		if ( this._idpersonidesk != idpersonidesk ){
			this._idpersonidesk = idpersonidesk;
		}
	}

    ngOnInit(){
        this.obtenTemas();
        this.obtenEncabezados();
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
                this.temaArr = resp;
                let i = 0;

                for(let tema of resp){
                    this.temas[tema.idTema] = {
                        idTema: tema.idTema,
                        tema: tema.tema,
                        numTema: tema.numTema
                    };
                }
                this.tema = this.temas[this._idTema].tema;
                this.numTema = (this.temaArr.findIndex(x => x.idTema == this._idTema)) + 1;
            },
            errors => {
                console.log(errors);
            });
    }

    obtenEncabezados() {
        let params = {
            servicio: "reportes",
            accion: "IDesk_Reportes_Avance_Encabezados",
            tipoRespuesta: "json"
        }
        this._iestdesk.consultas(params) 
            .subscribe(resp => {
                for ( let item of resp ) {
                    if ( !this.encabezados.hasOwnProperty(item.idTemarioElemento) ) { 
                        this.encabezados[item.idTemarioElemento] = [];
                    } 

                    this.encabezados[item.idTemarioElemento].push({
                        idTemarioElemento: item.idTemarioElemento,
                        columna: item.columna,
                        titulo: item.nombre,
                        tipo: item.tipo,
                        mostrar: item.mostrar
                    })
                }
                this.obtenReporte();
            },
            errors => {
                console.log(errors);
            });
    }

    obtenReporte() {
        if ( this._idTema != 0 ) {
            let params = {
                servicio: "reportes",
                accion: "IDesk_Reportes_Avance",
                tipoRespuesta: "json",
                idCurso: this._iestdesk.idCursoActual,
                idTema: this._idTema,
                idpersonidesk: this._idpersonidesk
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
                                this.reporte[item].datos[i] = Math.trunc(tmp); /*tmp.toFixed(2);*/
                            }
                        }
                    }
                },
                errors => {
                    console.log(errors);
                });
        }
    }
}