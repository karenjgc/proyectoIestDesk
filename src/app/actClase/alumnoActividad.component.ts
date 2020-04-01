import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { RuletaAlumno } from './ruletaAlumno';
import { Iestdesk } from '../services/iestdesk.service';
import { JeopardyAlumno } from './jeopardyAlumno';
import { ActividadesClase } from '../services/actividadesClase.service';

@Component({
    selector: 'alumno-actividad',
    templateUrl: './alumnoActividad.component.html'
})

export class AlumnoActividadComponent implements OnInit {
    @Input() public modoTemario = false;

    public actividadClase;
    public equipo;
    public contestado;
    public indice;
    public nombreActividad;
    public idTipoActividadClase;
    public actividad;
    public animacion;
    public usuario;
    public idPerson;
    public ruleta = 1;
    public objectKeys = Object.keys;
    public imagenPosiciones = [
        "./assets/images/actividades/1erlugar.png",
        "./assets/images/actividades/2dolugar.png",
        "./assets/images/actividades/3erlugar.png",
        ".assets/images/actividades/loser.png"
    ];
 
    constructor(
        private _datosActividad: ActividadesClase,
        private _ideskService: Iestdesk
    ) {
        this.idPerson = _ideskService.idPerson;
        this.usuario = _ideskService.login;
        this.nombreActividad = this._datosActividad.actividadClase.tipoActividad;
        this.idTipoActividadClase = this._datosActividad.actividadClase.idTipoActividad;
        this.validarConexion();
    }
     
    ngOnInit(){
    }

    validarConexion(refresh = null) {
        //Consultar las actividades de clase abiertas (se supone que solo puede haber una en el curso abierta en el momento)
        let params = {
            servicio: "actividadesClase",
            accion: "IDesk_Actividades_Clase_ObtieneActividadAbierta",
            tipoRespuesta: "json",
            idCurso: this._ideskService.idCursoActual,
            idpersonidesk: this._ideskService.idPerson
        };

        this._datosActividad.consultas(params).subscribe(
            resp => {
                if (resp.length > 0) {
                    this.actividad = resp[0];

                    if(+this.actividad.idTipoActividad != this.idTipoActividadClase){
                       this.actividad = null;
                       this.actividadClase = null;
                    }else{
                        switch(+this.actividad.idTipoActividad){
                            case 1:
                                this.actividadClase = new RuletaAlumno(this._datosActividad, this.actividad.idActividadClase, this.usuario);
                            break;
                            case 2:
                                this.actividadClase = new JeopardyAlumno(this.actividad.idActividadClase, this.usuario);
                            break;
                        }
                    }
                } else {
                    this.actividad = null;
                    this.actividadClase = null;
                }

                if (refresh) {
                    refresh.refreshing = false;
                }
            },
            errors => {
                console.log(errors);
            }
        );
    }
    
    /*refrescarModulo(args) {
        let pullRefresh = args.object;
        //actividad && actividadClase && actividadClase.iniciado
        if (!this.actividad || !this.actividadClase || !this.actividadClase.iniciado) {
            this.validarConexion(pullRefresh);
        } else {
            pullRefresh.refreshing = false;
        }
    }*/
    
    refrescarModulo(args) {
        let pullRefresh = args.object;
        //actividad && actividadClase && actividadClase.iniciado
        if (!this.actividad || !this.actividadClase || !this.actividadClase.iniciado) {
            this.validarConexion(pullRefresh);
        } else {
            pullRefresh.refreshing = false;
        }
    }

    girarRuleta() {
        this.actividadClase.girarRuleta(this.ruleta);
    }

    ngOnDestroy() {
        if (this.actividadClase) {
            let mensaje = {
                tipo: "conexion",
                login: this.usuario,
                conectado: 0,
                idActividad: this.actividad.idActividadClase
            };
            this.actividadClase.enviarMensaje(mensaje);
            this.actividadClase.websocket.close();
        }
    }
}