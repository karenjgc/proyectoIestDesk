import { Component, OnInit } from '@angular/core';

import { NgxSmartModalService } from 'ngx-smart-modal';
import { Iestdesk } from '../services/iestdesk.service';

@Component({
    selector: 'idesk-listadoAlumnos',
    templateUrl: './listado.component.html'
})

export class ListadoAlumnosComponent implements OnInit {
    
    public rolActual;
    public cursoActual;
    public maestro;
    public alumnos = {};
    public objectKeys = Object.keys;
    public correosSeleccionados: any = {};
    public mensaje: string;
    public tipoRespuesta: number;

    public mensajeBoton: string = "Seleccionar todos";
    public tipoSeleccion: number = 1;

    constructor(
        private _iestdesk: Iestdesk,
        public ngxSmartModalService: NgxSmartModalService
    ){
        this.rolActual = this._iestdesk.rolActual;
        this.cursoActual = this._iestdesk.idCursoActual;
    }

    ngOnInit() { 
        this._iestdesk.registraAcceso(35, 0);
        this.datosProfesor();
        this.listadoAlumnos();
    }

    datosProfesor(){
        let params = {
            servicio: "idesk",
            accion: "IDesk_Datos_Maestro",
            tipoRespuesta: "json",
            idCurso: this.cursoActual
        };

        this._iestdesk.consultas(params)
            .subscribe(resp => {
                this.maestro = resp[0];
            },
            errors => {
                console.log(errors);
            });
    }

    listadoAlumnos() {
        let params = {
            servicio: "idesk",
            accion: "IDesk_Listado_Alumnos",
            tipoRespuesta: "json",
            idCurso: this.cursoActual
        };

        this._iestdesk.consultas(params)
            .subscribe(resp => {
                for (let alumno of resp ) {
                    if ( !this.alumnos.hasOwnProperty(alumno.idPerson) ) {
                        this.alumnos[alumno.idPerson] = [];
                    }
                    
                    let url = 'https://sie.iest.edu.mx/app/CFPPSIEXYZ0/tempfile' + alumno.idPerson + '.jpg';

                    this.alumnos[alumno.idPerson].push({
                        idPerson: alumno.idPerson,
                        nombre: alumno.nombre,
                        correo: alumno.correo,
                        carrera: alumno.carrera,
                        abrCarrera: alumno.abrCarrera,
                        mostrarImagen: false,
                        imgAlumno: url
                    });
                }
            },
            errors => {
                console.log(errors);
            });
    }

    enter(alumno) {
        if ( this.rolActual == 1 ) {
            this.alumnos[alumno][0].mostrarImagen = true;
        }
    }

    leave(alumno) {
        if ( this.rolActual == 1 ) {
            this.alumnos[alumno][0].mostrarImagen = false;
        }
    }

    checkAll() {
        for ( let x in this.correosSeleccionados ) {
            delete this.correosSeleccionados[x];
        }

        if ( this.tipoSeleccion == 1 ){
            for ( let alumno of Object.keys(this.alumnos) ) {
                this.correosSeleccionados[this.alumnos[alumno][0].correo] = [];
            }
        }

        this.mensajeBoton = this.tipoSeleccion == 1 ? 'Quitar todos' : 'Seleccionar todos';
        this.tipoSeleccion = this.tipoSeleccion == 1 ? 0 : 1;
        console.log(this.tipoSeleccion);
    }

    enviaCorreo(correo) {
        window.open('https://mail.google.com/a/iest.edu.mx/?view=cm&fs=1&tf=1&to=' + correo + '&su=&body=' + escape('\n\n\n----------------------------------------------\n')+ unescape("%20%20") + 'Enviado desde mi IEST Desk&zx=RANDOMTEXT&shva=1&disablechatbrowsercheck=1&ui=2','gmailForm','scrollbars=yes,width=680,height=510,top=175,left=75,status=no,resizable=yes');
    }

    enviaCorreos() {
        let selecteds = Object.keys(this.correosSeleccionados).filter((item, index) => {
            return this.correosSeleccionados[item];
        });

        if ( selecteds.length > 0 ) {
            window.open('https://mail.google.com/a/iest.edu.mx/?view=cm&fs=1&tf=1&to=' + selecteds + '&su=&body=' + escape('\n\n\n----------------------------------------------\n') + unescape("%20%20") + 'Enviado desde mi IEST Desk&zx=RANDOMTEXT&shva=1&disablechatbrowsercheck=1&ui=2','gmailForm','scrollbars=yes,width=680,height=510,top=175,left=75,status=no,resizable=yes');
        } else {
            this.mensaje = 'Selecciona al menos un correo antes de continuar';
            this.tipoRespuesta = 2;
            this.ngxSmartModalService.getModal('dialogoInformacion').open();
        }    

        for ( let x in this.correosSeleccionados ) {
            delete this.correosSeleccionados[x];
        }
    }

    cierraDialogoInfo(resp) {
        this.ngxSmartModalService.getModal('dialogoInformacion').close();
    }
}