import { ActividadClaseAlumno } from './actividadClaseAlumno';

export class JeopardyAlumno extends ActividadClaseAlumno {
    public iniciado = false;
    public turnoActual = false;
    public turno;
    public preguntaActual;
    public posicion;
    public estadoJuego = "En progreso";
    public puntaje;
    public equipos = {};
    public mostrarPregunta = false;
    public mostrarTablero = true;
    public estadoConexion = "Desconectado";
    public equipo;
    public equipoTurno;
    public contestado;
    public indice;
    public colores;
    public categoriasPreguntasRespuestas;
    public objectKeys = Object.keys;
    public coloresCategorias = [
        "verde",
        "morado",
        "amarillo",
        "azul",
        "rojo"
    ];

    constructor(
        private idActividadClase,
        private NombreUsuario
    ) {
        super(idActividadClase, NombreUsuario);
        this.usuario = this.NombreUsuario;
        this.crearWS();
        this.websocket.onmessage = (ev) => this.recibirMensaje(ev);
    }

    recibirMensaje(mensaje) {
        //PENDIENTE
        let objMensaje = JSON.parse(mensaje.data);

            switch(objMensaje.tipo) {
                case 'conexion':
                    this.estadoConexion = "Conectado, confirmando equipo";
                break;

                case 'controlJuego':
                    if (objMensaje.iniciado == 1) {
                        this.iniciado = true;
                        this.turnoActual = objMensaje.turno == this.usuario;
                        this.turno = objMensaje.turno;
                        this.categoriasPreguntasRespuestas = objMensaje.categoriasPreguntasRespuestas;
                        //this.preguntaActual = objMensaje.preguntas[this.equipo];
                        this.puntaje = objMensaje.puntajes[this.equipo];
                        this.equipoTurno = objMensaje.equipo;
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
                    this.indice = objMensaje.indice;
                    this.contestado = objMensaje.respuesta.correcta == 1 ? "correcto" : "incorrecto";
                    this.categoriasPreguntasRespuestas[objMensaje.respuesta.categoria][objMensaje.respuesta.pregunta].contestado = true;
                break;

                case 'turnos':
                    if (objMensaje.equipo == 0) {
                        this.turnoActual = false;
                        this.turno = "Pausa";
                        this.mostrarPregunta = false;
                        this.equipoTurno = "Pausa";
                    } else {
                        this.turnoActual = objMensaje.turno == this.usuario;
                        this.turno = objMensaje.turno;
                        this.puntaje = objMensaje.puntajes[this.equipo];
                        this.equipoTurno = objMensaje.equipo;
                        setTimeout(()=> {
                            this.contestado = null;
                            this.indice = null;
                            this.mostrarTablero = true;
                            this.mostrarPregunta = false;
                        }, 2500);
                    }
                break;

                case 'terminarConexion':
                    this.estadoJuego = "En progreso";
                    this.iniciado = false;
                    this.turnoActual = false;
                    this.websocket.close();
                break;
            }
    }

    elegirPregunta(pregunta, puntos) {
        if (!pregunta.contestado && this.turnoActual && !this.mostrarPregunta) {
            this.mostrarTablero = false;
            this.mostrarPregunta = true;
            this.preguntaActual = pregunta;
            this.preguntaActual.puntos = puntos;
        }
    }

    enviarRespuesta(respuesta, i) {
        if (!this.contestado) {
            this.indice = i;
            this.contestado = respuesta.correcta == 1 ? "correcto" : "incorrecto";

            let mensaje = {
                tipo: "respuesta",
                respuesta: respuesta,
                indice: i,
                equipo: this.equipo,
                puntos: this.preguntaActual.puntos,
                idActividad: this.idActividadClase
            };
            
            this.enviarMensaje(mensaje);
        }
    }
}