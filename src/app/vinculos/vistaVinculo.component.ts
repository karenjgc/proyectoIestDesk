import { Component, Input, OnInit } from '@angular/core';
import { Iestdesk } from '../services/iestdesk.service';
import { Vinculos } from '../services/vinculos.service';

@Component({
    selector: 'idesk-vistaVinculo',
    templateUrl: './vistaVinculo.component.html'
})

export class VistaVinculoComponent implements OnInit {
    
    @Input() public idTema;
    @Input() vistaAlumno : any;
    public vinculo;

    constructor(
        private iestdesk: Iestdesk,
        private vinculos: Vinculos
    ){
          
    }

    ngOnInit(){
        //console.log('IdTema', this.idTema);
        this.vinculoAlumno();
    }

    vinculoAlumno() {
        if(this.vistaAlumno){
            this.vinculo = this.vistaAlumno.value;
            this.vinculo.vinculo = this.vistaAlumno.value.link;
        } else {
            let params = {
                servicio: "vinculos",
                accion: "IDesk_Alumno_Vinculos_VistaIndividual",
                tipoRespuesta: "json",
                idCurso: this.iestdesk.idCursoActual,
                idTema: this.idTema,
                idVinculo: this.vinculos.idVinculo
            };
            this.vinculos.consultas(params)
                .subscribe(resp => {
                    this.vinculo  = resp[0];
                    this.iestdesk.registraAcceso(22, this.vinculos.idVinculo);
                },
                errors => {
                    console.log(errors);
                });
        }
    }

    registrarAcceso(vinculo) {
        if (this.iestdesk.rolActual != 1) {
            let params = {
                servicio: "idesk",
                accion: "IDesk_Accesos_RegistraAcceso",
                tipoRespuesta: "json",
                idCurso: this.iestdesk.idCursoActual,
                idTipoModulo: 5,
                idElemento: vinculo,
                idpersonidesk: this.iestdesk.idPerson
            };
            this.iestdesk.consultas(params)
            .subscribe(
                resp => {
                    //console.log(resp);
                }, errors => {
                    console.log(errors);
                });
        }
        
        this.iestdesk.registraAcceso(22, vinculo);
    }
}