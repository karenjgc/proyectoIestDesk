import { Component, ChangeDetectorRef, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { Iestdesk } from '../services/iestdesk.service';
import { InformacionCurso } from '../services/infoCurso.service';

@Component({
    selector: 'idesk-segundoNav',
    templateUrl: './segundoNav.component.html'
})
export class SegundoNavComponent implements OnInit{
    @Input() componente: number;
    public rolActual: number;
    public idTipoCursoActual: number;
    public nombre_curso: string;
    public cursoActual: number;
    public cursos: any[];
    public faltas = [];

    constructor(
        private _iestdesk: Iestdesk,
        private _infoCurso: InformacionCurso,
        private chRef: ChangeDetectorRef,
        private router: Router
    ){

        this.rolActual = this._iestdesk.rolActual;
        this.nombre_curso = this._iestdesk.cursoActual;
        this.cursoActual = this._iestdesk.idCursoActual;
        this.idTipoCursoActual = this._iestdesk.idTipoCursoActual;

        if (!this._iestdesk.cursosLaterales) {
            let params = {
                servicio: "idesk",
                accion: this._iestdesk.rolActual == 1 ? "IDesk_Maestro_ListadoCursos" : "IDesk_Alumno_ListadoCursos",
                tipoRespuesta: "json",
                idpersonidesk: this._iestdesk.idPerson,
                idTipoCurso: this._iestdesk.idTipoCursoActual
            };

            this._iestdesk.consultas(params)
                .subscribe(resp => {
                    this.cursos = resp;
                    this._iestdesk.cursosLaterales = resp;
                },
                errors => {
                    console.log(errors);
                });

            if(this._iestdesk.rolActual != 1 && this._iestdesk.idTipoCursoActual == 1){
                let params = {
                    servicio: "idesk",
                    accion: "IDesk_ConsultaFaltasporAlumno",
                    tipoRespuesta: "json",
                    idpersonidesk: this._iestdesk.idPerson,
                    idCurso: this._iestdesk.idCursoActual
                };

                this._iestdesk.consultas(params)
                    .subscribe(resp => {
                        this.faltas = resp[0];
                        this._iestdesk.faltas = resp[0];
                    },
                    errors => {
                        console.log(errors);
                    });
            }
        } else {
            this.cursos = this._iestdesk.cursosLaterales;
            if(this._iestdesk.rolActual != 1) this.faltas = this._iestdesk.faltas;
        }
    }

    ngOnInit(){}

    irMenuPrincipal(ir: number){
		//console.log(ir, this._iestdesk.idCursoActual, this._iestdesk.cursoActual, this._iestdesk.idGrado);
        switch(ir){
            case 1:
                this.router.navigate(['/curso', this._iestdesk.idCursoActual, this._iestdesk.cursoActual]);
            break;
            case 2:
                this.router.navigate(['/temario']);
            break;
            case 3:
                this.router.navigate(['/tareas']);
            break;
            case 4:
                this.router.navigate(['/foro-discusion']);
            break;
            case 5:
                this.router.navigate(['/apuntes']);
            break;
            case 6:
                this.router.navigate(['/actividades-clase']);
            break;
            case 7:
                this.router.navigate(['/foro-dudas']);
            break;
            case 18:
                let params = {
                    servicio: "infoCurso",
                    accion: "IDesk_InfoCurso_Listado",
                    tipoRespuesta: "json",
                    idCurso: this._iestdesk.idCursoActual
                };
                this._infoCurso.consultas(params)
                    .subscribe(resp => {
                        this._infoCurso.infoCurso = resp[0];
                        if( this.rolActual == 1 ) {
                            this._infoCurso.tipo = 1;
                            this._iestdesk.registraAcceso(9, 0);
                            this.router.navigate(['/informacion-del-curso/presentacion']);
                        } else {
							if(resp.length > 0){
								if ( resp[0].presentacion != '' || resp[0].idLinkPresentacion != '' || resp[0].idArchivoPresentacion != '' )
								{
                                    this._iestdesk.registraAcceso(9, 0);
									this._infoCurso.tipo = 1;
									this.router.navigate(['/informacion-del-curso/presentacion']);
								} else if (resp[0].fundamentacion != '' || resp[0].idLinkFundamentacion != '' || resp[0].idArchivoFundamentacion != '' )
								{
                                    this._iestdesk.registraAcceso(10, 0);
									this._infoCurso.tipo = 6;
									this.router.navigate(['/informacion-del-curso/fundamentacion']);
								} else if(resp[0].introduccion != '' || resp[0].idLinkIntroduccion != '' || resp[0].idArchivoIntroduccion != '' )
								{
                                    this._iestdesk.registraAcceso(11, 0);
									this._infoCurso.tipo = 2;
									this.router.navigate(['/informacion-del-curso/introduccion']);
								} else if (resp[0].objetivos != '' || resp[0].idLinkObjetivos != '' || resp[0].idArchivoObjetivos != ''  )
								{
                                    this._iestdesk.registraAcceso(12, 0);
									this._infoCurso.tipo = 3;
									this.router.navigate(['/informacion-del-curso/objetivos-y-competencias']);
								} else if (resp[0].metodologia != '' || resp[0].idLinkMetodologia != '' || resp[0].idArchivoMetodologia != '' ) {
                                    this._iestdesk.registraAcceso(13, 0);
									this._infoCurso.tipo = 7;
									this.router.navigate(['/informacion-del-curso/metodologia']);
								} else if (resp[0].politicas != '' || resp[0].idLinkPoliticas != '' || resp[0].idArchivoPoliticas != '' )
								{
                                    this._iestdesk.registraAcceso(14, 0);
									this._infoCurso.tipo = 4;
									this.router.navigate(['/informacion-del-curso/politicas']);
								} else if (resp[0].planclase != '' || resp[0].idLinkPlanClase != '' || resp[0].idArchivoPlanClase != '' )
								{
                                    this._iestdesk.registraAcceso(18, 0);
									this._infoCurso.tipo = 5;
									this.router.navigate(['/informacion-del-curso/plan-de-clase']);
								}
							} else {
								console.log('\nNo se encontró información.');
                                this._iestdesk.registraAcceso(17, 0);
								this._infoCurso.tipo = 10;
								this.router.navigate(['/informacion-del-curso/bibliografia']);
							}
                        }
                    },
                    errors => {
                        console.log(errors);
                    });
            break;
            case 19:
                this.router.navigate(['/muro']);
            break;
            case 22:
                this.router.navigate(['/vinculos']);
            break;
            case 23:
                this.router.navigate(['/examenes']);
            break;
			case 24:
				( this.rolActual == 1 ) ? this.router.navigate(['/calificaciones/maestro']) : this.router.navigate(['/calificaciones/alumno']);
			break;
            case 25:
                this.router.navigate(['/glosario']);
            break;
            case 26:
                this.router.navigate(['/rubricas-iest']);
            break;
            case 27:
                this.router.navigate(['/videoconferencias']);
            break;
            case 28:
                this.router.navigate(['/criterios-de-evaluacion']);
            break;
            case 29:
                this.router.navigate(['/cronograma']);
            break;
            case 30:   
                this.router.navigate(['/listado-alumnos']);
            break;
            case 31:   
            this.router.navigate(['/reportes']);
            break;
        }
    }

	goToCurso(curso){
        this._iestdesk.limpiaVariablesCurso();
        this._iestdesk.cursoActual = this._iestdesk.rolActual == 1 ? curso.materia + ' - ' + curso.seccion : curso.materia;
        this._iestdesk.idCursoActual = curso.idCurso;
        this._iestdesk.idTipoCursoActual = this.idTipoCursoActual;
        this._iestdesk.idGrado = curso.idGrado;
        this._iestdesk.modalidadActual = curso.modalidad;      
        this._iestdesk.faltas = [];  
        this.router.navigate(['/curso', curso.idCurso, curso.materia]);
    }

    gotoMain(){
        this._iestdesk.limpiaVariablesCurso();
        this.router.navigate(['/']);
    }
}