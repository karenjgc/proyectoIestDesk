import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { Iestdesk } from '../services/iestdesk.service';
import { InformacionCurso } from '../services/infoCurso.service';

@Component({
    selector: 'idesk-infoCursoNav',
    templateUrl: './infoCursoNav.component.html'
})
export class InfoCursoNavComponent implements OnInit {
    public infoCurso;
    public inf = [];
    public rolActual;
    public idGrado: number;
    public idTipoCursoActual: number = 0;

    constructor(
        private _iestdesk: Iestdesk,
        private _infoCurso: InformacionCurso,
		private chRef: ChangeDetectorRef,
        private router: Router
    ){
        this.idGrado = this._iestdesk.idGrado;
        this.infoCurso = this._infoCurso.tipo;
        this.rolActual = this._iestdesk.rolActual;
        this.idTipoCursoActual = this._iestdesk.idTipoCursoActual;


        let params = {
            servicio: "infoCurso",
            accion: "IDesk_InfoCurso_Listado",
            tipoRespuesta: "json",
            idCurso: this._iestdesk.idCursoActual
        };
        this._infoCurso.consultas(params)
            .subscribe(resp => {
                console.log('entra :)');

                this._infoCurso.infoCurso = resp[0];

                if(resp.length > 0){
                    (resp[0].presentacion != '' || resp[0].idArchivoPresentacion != '' || resp[0].idLinkPresentacion ) ? this.inf.push(true) : ( this.rolActual == 2 ? this.inf.push(false) : this.inf.push(true) );
                    (resp[0].fundamentacion != '' || resp[0].idArchivoFundamentacion != '' || resp[0].idLinkFundamentacion ) ? this.inf.push(true) : ( this.rolActual == 2 ? this.inf.push(false) : this.inf.push(true) );
                    (resp[0].introduccion != '' || resp[0].idArchivoIntroduccion != '' || resp[0].idLinkIntroduccion ) ? this.inf.push(true) : ( this.rolActual == 2 ? this.inf.push(false) : this.inf.push(true) );
                    (resp[0].metodologia != '' || resp[0].idArchivoMetodologia != '' || resp[0].idLinkMetodologia ) ? this.inf.push(true) : ( this.rolActual == 2 ? this.inf.push(false) : this.inf.push(true) );
                    (resp[0].politicas != '' || resp[0].idArchivoPoliticas != '' || resp[0].idLinkPoliticas ) ? this.inf.push(true) : ( this.rolActual == 2 ? this.inf.push(false) : this.inf.push(true) );
                    (resp[0].planclase != '' || resp[0].idArchivoPlanClase != '' || resp[0].idLinkPlanClase ) ? this.inf.push(true) : ( this.rolActual == 2 ? this.inf.push(false) : this.inf.push(true) );
                } else {
                    for ( let x = 0; x < 6; x++ ) {
                        this.rolActual == 2 ? this.inf.push(false) : this.inf.push(true);
                    }
                }
                console.log(this.inf);
                this.chRef.detectChanges();
            },
            errors => {
                console.log(errors);
            });
    }

    ngOnInit(){
        
    }

    irInfoClase(ir: number){
        switch(ir){
            case 1:
                this._iestdesk.registraAcceso(9, 0);
                this._infoCurso.tipo = 1;
                this.router.navigate(['/informacion-del-curso/presentacion']);
            break;
            case 2:
                this._iestdesk.registraAcceso(10, 0);
                this._infoCurso.tipo = 6;
                this.router.navigate(['/informacion-del-curso/fundamentacion']);
            break;
            case 3:
                this._iestdesk.registraAcceso(11, 0);
                this._infoCurso.tipo = 2;
                this.router.navigate(['/informacion-del-curso/introduccion']);
            break;
            case 4:
                this._iestdesk.registraAcceso(12, 0);
                this._infoCurso.tipo = 3;
                this.router.navigate(['/informacion-del-curso/objetivos-y-competencias']);
            break;
            case 5:
                this._iestdesk.registraAcceso(13, 0);
                this._infoCurso.tipo = 7;
                this.router.navigate(['/informacion-del-curso/metodologia']);
            break;
            case 6:
                this._iestdesk.registraAcceso(14, 0);
                this._infoCurso.tipo = 4;
                this.router.navigate(['/informacion-del-curso/politicas']);
            break;
            /*case 7:
                this._infoCurso.tipo = 8;
                this.router.navigate(['/informacion-del-curso/cronograma']);
            break;
            case 8:
                this._infoCurso.tipo = 9;
                this.router.navigate(['/informacion-del-curso/criterios-de-evaluacion']);
            break;*/
            case 9:
                this._iestdesk.registraAcceso(17, 0);
                this._infoCurso.tipo = 10;
                this.router.navigate(['/informacion-del-curso/bibliografia']);
            break;
            case 10:
                this._iestdesk.registraAcceso(18, 0);
                this._infoCurso.tipo = 11;
                this.router.navigate(['/informacion-del-curso/carta-descriptiva']);
            break;
            case 11:
                this._iestdesk.registraAcceso(19, 0);
                this._infoCurso.tipo = 5;
                this.router.navigate(['/informacion-del-curso/plan-de-clase']);
            break;
        }
    }
}