import { ActividadClase } from './../shared/actividad-clase.interface';
import { ActividadClaseAlumno } from './actividadClaseAlumno';
import { ActividadesClase } from '../services/actividadesClase.service';

export class RuletaAlumno extends ActividadClaseAlumno implements ActividadClase {
    public iniciado = false;
    public turnoActual = false;
    public turno;
    public preguntaActual;
    public posicion;
    public estadoJuego = "En progreso";
    public puntaje;
    public equipos = {};
    public mostrarPregunta = false;
    public estadoConexion = "Desconectado";
    public equipo;
    public ruletaElem;
    public contestado;
    public indice;
    public usuario;
    public ruletaAnimacion = false;
    public colores;

    constructor(
        private _actividadesClase: ActividadesClase,
        private idActividadClase,
        private NombreUsuario,
    ) {
        super(idActividadClase, NombreUsuario);
        this.usuario = this.NombreUsuario;
        //console.log('Crear WS');
        this.crearWS();
        this.websocket.onmessage = (ev) => this.recibirMensaje(ev);
    }

    recibirMensaje(mensaje) {
        //console.log(mensaje.data);
        let objMensaje = JSON.parse(mensaje.data);
        
        switch(objMensaje.tipo) {
            case 'conexion':
                this.estadoConexion = "Conectado, confirmando equipo";
            break;

            case 'controlJuego':
                if (objMensaje.iniciado == 1) {
                    this.iniciado = true;
                    this.turnoActual = objMensaje.turnos[this.equipo] == this.usuario;
                    this.turno = objMensaje.turnos[this.equipo];
                    this.preguntaActual = objMensaje.preguntas[this.equipo];
                    this.puntaje = objMensaje.puntaje;
                } else {
                    this.estadoJuego = "Terminado";
                    this.turnoActual = false;
                    this.iniciado = false;
                    objMensaje.posiciones.forEach((posicion, indice) => {
                        if (posicion[1] == this.equipo) {
                            if (indice > 2) {
                                this.posicion = 3;
                                return false;
                            }
                            this.posicion = indice;
                        }
                    });
                }
            break;

            case 'equipos':
                this.equipos = objMensaje.equipos;
                this.colores = objMensaje.colores;
                equipos_bucle:
                for(let elemento of Object.keys(objMensaje.equipos)) {
                    for (let elementoArr of objMensaje.equipos[elemento]) {
                        if (this.usuario == elementoArr) {
                            this.equipo = elemento;
                            break equipos_bucle;
                        }
                    }
                }
            break;

            case 'respuesta':
                if (objMensaje.equipo == this.equipo) {
                    this.indice = objMensaje.indice;
                    this.contestado = objMensaje.respuesta.correcta == 1 ? "correcto" : "incorrecto";
                }               
            break;

            case 'turnos':
                if (objMensaje.equipo == this.equipo) {
                    this.turnoActual = objMensaje.turnos[this.equipo] == this.usuario;
                    this.turno = objMensaje.turnos[this.equipo];
                    this.puntaje = objMensaje.puntaje;
                    setTimeout(()=> {
                        this.contestado = null;
                        this.indice = null;
                        this.mostrarPregunta = false;
                        this.preguntaActual = objMensaje.preguntas[this.equipo];
                    }, 2500);
                } else {
                    if (objMensaje.equipo == 0) {
                        this.turnoActual = false;
                        this.turno = "Pausa";
                        this.mostrarPregunta = false;
                        this.estadoConexion = "Desconectado";
                    }
                }
            break;

            case 'giraRuleta':
                if (objMensaje.equipo == this.equipo && objMensaje.turnoActual != this.usuario) {
                    this.mostrarPregunta = true;
                    this.preguntaActual = objMensaje.preguntaActual;
                }
            break;

            case 'terminarConexion':
                this.websocket = null;
            break;
        }
    }

    enviarRespuesta(respuesta, i) {
        if (!this.contestado) {
            this.indice = i;
            this.contestado = respuesta.correcta == 1 ? "correcto" : "incorrecto";

            let mensaje = {
                tipo: "respuesta",
                equipo: this.equipo,
                respuesta: respuesta,
                indice: i,
                idActividad: this.idActividadClase
            };
            
            this.enviarMensaje(mensaje);

            setTimeout(()=> {
                this.contestado = false;
                this.mostrarPregunta = false;
            }, 2500);
        }
    }

    girarRuleta(ruleta) {
        if (!this.mostrarPregunta && this.turnoActual) {
            this.ruletaAnimacion = true;

            //Se va a cambiar 
            setTimeout(()=>{
                let mensaje = {
                    tipo: "giraRuleta",
                    turnoActual: this.usuario,
                    equipo: this.equipo,
                    preguntaActual: this.preguntaActual
                };
                this.enviarMensaje(mensaje);
                this.mostrarPregunta = true;
                this.ruletaAnimacion = false;
            },3000)
        }
    }
   
}
