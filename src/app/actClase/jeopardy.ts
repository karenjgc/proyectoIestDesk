import { ActividadesClase } from '../services/actividadesClase.service';
import { ActividadClase } from "./actividadClase";

export class Jeopardy extends ActividadClase {
    public categoriasPreguntasRespuestas = {};
    public turnoActual;
    public equipoActual;
    public turnosPasados = { equipos: [], integrantes: {} };
    public equiposPuntaje = {};
    public posiciones = [];
    public intervaloTurno;
    public ronda = 1;
    public coloresCategorias = [
        "verde",
        "morado",
        "amarillo",
        "azul",
        "rojo"
    ];

    constructor(
        private _actividadesClase: ActividadesClase
    ) {
        super(_actividadesClase);

        let params = {
            servicio: "actividadesClase",
            accion: "IDesk_Actividades_Clase_ObtieneReactivos",
            tipoRespuesta: "json",
            idActividad: this._actividadesClase.actividadClase.idActividadClase,
            idTipoActividad: this._actividadesClase.actividadClase.idTipoActividad
        };

        this._actividadesClase.consultas(params).subscribe(
            resp => {
                if (resp) {
                    for(let respuesta of resp) {
                        if(!this.categoriasPreguntasRespuestas.hasOwnProperty(respuesta.categoria)) {
                            this.categoriasPreguntasRespuestas[respuesta.categoria] = {};
                        }
                        if(!this.categoriasPreguntasRespuestas[respuesta.categoria].hasOwnProperty(respuesta.pregunta)) {
                            this.categoriasPreguntasRespuestas[respuesta.categoria][respuesta.pregunta] = { "respuestas" : [], "contestado" : false };
                        }
                        this.categoriasPreguntasRespuestas[respuesta.categoria][respuesta.pregunta].respuestas.push(respuesta);
                    }
                    //console.log(this.categoriasPreguntasRespuestas);
                }
            },
            errors => {
                console.log(errors);
            }
        );

        this.crearWS();
        this.webSocket.onmessage = (ev) => this.recibirMensaje(ev);
    }

    obtenerAleatorios(inicial = "Inicial") {
        let mensaje;
        let terminado = true;

        //Verifica si se han contestado todas las preguntas.
        categorias:
        for(let categoria of Object.keys(this.categoriasPreguntasRespuestas)){
            for(let pregunta of Object.keys(this.categoriasPreguntasRespuestas[categoria])) {
               if(!this.categoriasPreguntasRespuestas[categoria][pregunta].contestado){
                   terminado = false;
                   break categorias;
               }
            }
        }
        
        if(!terminado){
            if(this.turnosPasados["equipos"].length == Object.keys(this.equipos).length) {
                this.ronda++;
                this.turnosPasados["equipos"] = [];
            }

            let equiposDisponibles = Object.keys(this.equipos).filter(equipo => {
                return this.turnosPasados["equipos"].indexOf(equipo) == -1;
            });

            this.equipoActual = equiposDisponibles[Math.floor(Math.random() * equiposDisponibles.length)];
            this.turnosPasados["equipos"].push(this.equipoActual);

            if (this.turnosPasados["integrantes"][this.equipoActual].length == this.integrantesConectados[this.equipoActual].length) {
                this.turnosPasados["integrantes"][this.equipoActual] = [];
            }

            let integrantesDisponibles = this.integrantesConectados[this.equipoActual].filter(integrante => {
                return this.turnosPasados["integrantes"][this.equipoActual].indexOf(integrante) == -1;
            });

            this.turnoActual = integrantesDisponibles[Math.floor(Math.random() * integrantesDisponibles.length)];
            this.turnosPasados["integrantes"][this.equipoActual].push(this.turnoActual);

            if (inicial == "Inicial") {
                this.iniciado = 1;

                mensaje = {
                    tipo: "controlJuego",
                    iniciado: this.iniciado,
                    turno: this.turnoActual,
                    equipo: this.equipoActual,
                    categoriasPreguntasRespuestas: this.categoriasPreguntasRespuestas,
                    puntajes: this.equiposPuntaje,
                    idActividad: this._actividadesClase.actividadClase.idActividadClase
                };
            } else {
                mensaje = {
                    tipo: "turnos",
                    turno: this.turnoActual,
                    equipo: this.equipoActual,
                    puntajes: this.equiposPuntaje,
                    idActividad: this._actividadesClase.actividadClase.idActividadClase
                };
            }
            
            if (this.intervaloTurno) {
                clearInterval(this.intervaloTurno);
            }

            this.intervaloTurno = setInterval(() => {
                this.obtenerAleatorios("false");
            }, 30000);

            this.webSocket.send(JSON.stringify(mensaje));
        } else {
            this.calcularPosiciones();
            clearInterval(this.intervaloTurno);
        }
    }

    recibirMensaje(mensaje) {
        var response = JSON.parse(mensaje.data);
        //console.log(response);
		switch(response.tipo) {
            case 'conexion':
                if (response.conectado == 1 && !response.escritorio) {
                    let conectado = false;

				    equipos_bucle:
                    for(let elemento of Object.keys(this.equipos)) {
                        if (!this.integrantesConectados.hasOwnProperty(elemento)) {
                            this.integrantesConectados[elemento] = [];
                            this.equiposPuntaje[elemento] = 0;
                        }
                        for (let elementoArr of this.equipos[elemento]) {
                            if (response.login == elementoArr && this.confirmado == false) {
                                if (this.integrantesConectados[elemento].indexOf(response.login) == -1) {
                                    this.integrantesConectados[elemento].push(elementoArr);
                                }
                                conectado = true;
                                break equipos_bucle;
                            }
                        }
                    }

                    if (conectado) { //Reconexion
                        let mensaje = {
                            tipo: "confirmaConexion",
                            integrante: response.login,
                            equipoIntegrante: this.obtenerEquipoIntegrante(response.login),
                            equipos: this.equipos,
                            colores: this.coloresEquipos,
                            iniciado: this.iniciado,
                            turno: this.turnoActual,
                            equipo: this.equipoActual,
                            categoriasPreguntasRespuestas: this.categoriasPreguntasRespuestas,
                            puntajes: this.equiposPuntaje,
                            idActividad: this._actividadesClase.actividadClase.idActividadClase
                        };
                        this.webSocket.send(JSON.stringify(mensaje));
                    }
                } else {
                    if (response.conectado == 0) {
                        equipos_desconexion_bucle:
                        for(let elemento of Object.keys(this.equipos)) {
                            for (let elementoArr of this.equipos[elemento]) {
                                if (response.login == elementoArr) {
                                    this.integrantesConectados[elemento].splice(this.integrantesConectados[elemento].indexOf(elementoArr), 1);
                                    break equipos_desconexion_bucle;
                                }
                            }
                        }
                    }
                }
                
                //this.conectadosValidos();
			break;
			
            case 'respuesta':
                if(!this.categoriasPreguntasRespuestas[response.respuesta.categoria][response.respuesta.pregunta].contestado){
                    this.equiposPuntaje[response.equipo] += response.respuesta.correcta == 1  ?  response.puntos : -response.puntos;
                    this.categoriasPreguntasRespuestas[response.respuesta.categoria][response.respuesta.pregunta].contestado = true;
                    this.obtenerAleatorios("false");
                }
			break;
        }
    }

    calcularPosiciones() {
        for (let elemento of Object.keys(this.equipos)) {
            if (this.equiposPuntaje[elemento]) {
                this.posiciones.push([this.equiposPuntaje[elemento], elemento]);
            } else {
                this.posiciones.push([0, elemento]);
            }
        }

        this.posiciones.sort((a, b) => {
            return b[0] - a[0];
        });
        
        this.enviarTermino(this.posiciones);
    }
}