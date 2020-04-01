import { Component, ElementRef, ViewChild, OnInit  } from '@angular/core';
import { Iestdesk } from '../../services/iestdesk.service';
import { DisenadorService } from '../../services/disenador.service';
import { ReportesBase } from '../../shared/classes/reportesBase';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'idesk-reporteAvance',
    templateUrl: './reporteAvance.component.html'
})

export class ReporteAvanceComponent extends ReportesBase implements OnInit {
   
    public reporte = {};
    public encabezados = {};
    public temas = {};
    public nombreMaterias = [];

    public alumnoDetalle = {};
    public encabezadosDetalle = {};
    public titulosDetalle = [];
    public alumnoActual: string = '';
    public idPersonAlumno: number = 0;
    public idCursoAlumno: number = 0;
    public tema: string = '';
    public numTema: number = 0;
    @ViewChild('alumno') dialogo: ElementRef;

    constructor(
        private iestdesk: Iestdesk,
        public disenador: DisenadorService,
        private modalService: NgbModal,
        private elRef: ElementRef)
    {
        super(
            iestdesk,
            disenador
		);
    }

    ngOnInit() {
        let params = {
            servicio: "reportes",
            accion: "IDesk_Reportes_Avance_Encabezados",
            tipoRespuesta: "json"
        }
        this.iestdesk.consultas(params) 
            .subscribe(resp => {
                this.titulosDetalle.push('idPerson', 'nombre', )
                for ( let item of resp ) {
                    if ( !this.encabezadosDetalle.hasOwnProperty(item.idTemarioElemento) ) { 
                        this.encabezadosDetalle[item.idTemarioElemento] = [];
                        this.titulosDetalle.push(item.idTemarioElemento);
                    } 

                    this.encabezadosDetalle[item.idTemarioElemento].push({
                        idTemarioElemento: item.idTemarioElemento,
                        columna: item.columna,
                        titulo: item.nombre,
                        tipo: item.tipo,
                        mostrar: item.mostrar
                    })
                }
            },
            errors => {
                console.log(errors);
            });
    }

    cargaReporte() {
        this.temas = {};
        this.encabezados = {};
        this.reporte = {};
        this.procesoCarga = true;

        for ( let idCurso of this.arrCurso ) {
            let i = 0;
            let params = {
                servicio: "idesk",
                accion: "IDesk_Maestro_Temario_Cursos_Listado",
                tipoRespuesta: "json",
                idCursos: idCurso,
                orden: 1
            };

            let params1 = {
                servicio: "reportes",
                accion: "IDesk_Reportes_AvancexTemas",
                tipoRespuesta: "json",
                idCurso: idCurso
            };

            this.iestdesk.consultas(params) 
                .subscribe(resp => {
                    if(!this.encabezados.hasOwnProperty(idCurso)){
                        this.encabezados[idCurso] = [];
                        this.temas[idCurso] = {};
                        this.reporte[idCurso] = {};
                        this.encabezados[idCurso].push('posicion', 'idPerson', 'nombre');
                    }

                    for(let tema of resp){
                        this.temas[idCurso][i+'-'+tema.idTema] = {
                            idTema: tema.idTema,
                            tema: tema.tema,
                            numTema: tema.numTema
                        };

                        this.encabezados[idCurso].push(tema.idTema);
                        i++;
                    }

                    this.iestdesk.consultas(params1) 
                        .subscribe(resp => {                            
                            for(let item of resp){ 
                                this.reporte[idCurso][item.idPerson] = {
                                    datos: item
                                }
                            }

                            for ( let item of Object.keys(this.reporte[idCurso]) ) {
                                for ( let i of Object.keys(this.reporte[idCurso][item].datos) ) {
                                    if ( !isNaN(this.reporte[idCurso][item].datos[i]) && i != 'idPerson' ){
                                        let tmp: number;
                                        tmp = +(this.reporte[idCurso][item].datos[i]);
                                        this.reporte[idCurso][item].datos[i] = Math.trunc(tmp) + '%';
                                    }
                                }
                            }
                        },
                        errors => {
                            console.log(errors);
                        });
                },
                errors => {
                    console.log(errors);
                });

            this.reporteCompleto = true;
            this.procesoCarga = false;
        }
    }

    detalleAlumno(idPerson, idTema, i, idCurso, nombre){
        this.alumnoActual = nombre;
        this.idPersonAlumno = idPerson;
        this.idCursoAlumno = idCurso;
        this.alumnoDetalle = {};
        
        this.tema = this.temas[idCurso][i + '-' + idTema].tema;
        this.numTema = i + 1;

        let params = {
            servicio: "reportes",
            accion: "IDesk_Reportes_Avance",
            tipoRespuesta: "json",
            idCurso: idCurso,
            idTema: idTema,
            idpersonidesk: idPerson
        };
        this.iestdesk.consultas(params) 
            .subscribe(resp => {
                for(let item of resp){ 
                    this.alumnoDetalle[item.idPerson] = {
                        datos: item
                    }
                }

                for ( let item of Object.keys(this.alumnoDetalle) ) {
                    for ( let i of Object.keys(this.alumnoDetalle[item].datos) ) {
                        if ( !isNaN(this.alumnoDetalle[item].datos[i]) && i != 'idPerson' ){
                            let tmp: number;
                            tmp = +(this.alumnoDetalle[item].datos[i]);
                            this.alumnoDetalle[item].datos[i] = Math.trunc(tmp); 
                        }
                    }
                }
            },
            errors => {
                console.log(errors);
            });

        console.log(this.titulosDetalle, this.encabezadosDetalle, this.alumnoDetalle);

        this.modalReference = this.modalService.open(this.dialogo, this.modalOption);
    }
}