import { ActividadesClase } from '../services/actividadesClase.service';
import { ActividadClase } from './actividadClase';

export class Ruleta extends ActividadClase {
    public turnosActuales = {};
    public turnosPasados = {};
    public confirmado = false;
    public equiposRespuestasCorrectas = {};
    public preguntasRespuestas = {};
    public preguntasActuales = {};
    public preguntasCorrectas = {};
    public posiciones = [];
    public terminado = false;
    public avancePreguntas = {};

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
                    for (let respuesta of resp) {
                        if (!this.preguntasRespuestas.hasOwnProperty(respuesta.pregunta)) {
                            this.preguntasRespuestas[respuesta.pregunta] = [];
                        }
                        this.preguntasRespuestas[respuesta.pregunta].push(respuesta);
                    }
                }
            },
            errors => {
                console.log(errors);
            }
        );

        this.crearWS();
        this.webSocket.onmessage = (ev) => this.recibirMensaje(ev);
    }

    recibirMensaje(mensaje) {
        var response = JSON.parse(mensaje.data);
		switch(response.tipo){
            case 'conexion':
                if (response.conectado == 1 && !response.escritorio) {
                    let conectado = false;

				    equipos_bucle:
                    for(let elemento of Object.keys(this.equipos)) {
                        if (!this.integrantesConectados.hasOwnProperty(elemento)) {
                            this.integrantesConectados[elemento] = [];
                            this.equiposRespuestasCorrectas[elemento] = 0;
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
                        let equipo = this.obtenerEquipoIntegrante(response.login);

                        let mensaje = {
                            tipo: "confirmaConexion",
                            integrante: response.login,
                            equipoIntegrante: equipo,
                            equipos: this.equipos,
                            colores: this.coloresEquipos,
                            iniciado: this.iniciado,
                            turnos: this.turnosActuales,
                            puntaje: this.obtieneAciertosEquipos(),
                            //equipo: this.equipoActual,
                            preguntas: this.preguntasActuales,
                            idActividad: this._actividadesClase.actividadClase.idActividadClase
                        };

                        this.webSocket.send(JSON.stringify(mensaje));
                    }
                } else {
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
                
                this.conectadosValidos();
			break;
			
			/*case 'terminarConexion':
				//msgBox.append("<div><span>No se aceptan más conexiones</span></div>");
			break;
				
			case 'controlJuego':
				if (response.iniciado == 1) {
					//msgBox.append("<div><span>Juego iniciado</span></div>");
				} else {
					//El juego termina y cerramos la conexión
					//msgBox.append("<div><span>Juego terminado</span></div>");
					this.webSocket.close();
				}
			break;*/
			
            case 'respuesta':
				if (response.respuesta.correcta == 1) {
					this.equiposRespuestasCorrectas[response.equipo]++; 
					if (!this.preguntasCorrectas.hasOwnProperty(response.equipo)) {
						this.preguntasCorrectas[response.equipo] = [];
					}
					this.preguntasCorrectas[response.equipo].push(response.respuesta.pregunta);
				} else {
					this.equiposRespuestasCorrectas[response.equipo] = 0;
					this.preguntasCorrectas[response.equipo] = [];
				}
                this.obtenerAleatorios(response.equipo);
			break;
		}
    }

    obtenerAleatorios(equipo = "") {
        let mensaje;

        //Validación de confirmación de equipo

        //Si entra aquí se hace la asignación de los turnos y de las preguntas
		if (equipo == "") {
            //Asigna turnos aleatorios
			for (let elemento of Object.keys(this.integrantesConectados)) {
				this.turnosActuales[elemento] = this.integrantesConectados[elemento][Math.floor(Math.random() * this.integrantesConectados[elemento].length)];
				this.turnosPasados[elemento] = [ this.turnosActuales[elemento] ];
			}
            
            //Asigna preguntas aleatorias
			for (let elemento of Object.keys(this.equipos)) {
                let llavePregunta = Object.keys(this.preguntasRespuestas)[Math.floor(Math.random() * Object.keys(this.preguntasRespuestas).length)];
				this.preguntasActuales[elemento] = this.preguntasRespuestas[llavePregunta];
			}

            this.iniciado = 1;

			mensaje = {
				tipo: "controlJuego",
				iniciado: 1,
                turnos: this.turnosActuales,
                preguntas: this.preguntasActuales,
                puntaje: this.obtieneAciertosEquipos(),
                idActividad: this._actividadesClase.actividadClase.idActividadClase
            };

            this.enviarInicio(mensaje);
		} else {
            //Si este es verdadero se termina el juego porque todas las respuestas están correctas
			if (this.preguntasCorrectas[equipo].length == Object.keys(this.preguntasRespuestas).length) {
				//equipoGanador = equipo;
				//estadoJuego = "terminado";
                this.calcularPosiciones();
			} else {
                //Si no, se asignan nuevos turnos y nuevas preguntas, dependiendo del equipo que contestó
				if (this.turnosPasados[equipo].length == this.integrantesConectados[equipo].length) {
                    //Si todos los integrantes ya tuvieron turno, limpiar arreglo para que vuelvan a participar
					this.turnosPasados[equipo] = [];
				}

                //Obtiene integrantes disponibles a partir de los conectados y los que ya tuvieron su turno
				let integrantesDisponibles = this.integrantesConectados[equipo].filter(elemento => {
					return this.turnosPasados[equipo].indexOf(elemento) == -1;
                });
                
				//Obtiene preguntas disponibles a partir de las que no han sido contestadas
				let preguntasDisponibles = Object.keys(this.preguntasRespuestas).filter(elemento => {
					return this.preguntasCorrectas[equipo].indexOf(elemento) == -1;
				});
				
                //Asigna pregunta aleatoria
                let llavePregunta = preguntasDisponibles[Math.floor(Math.random() * preguntasDisponibles.length)];
				//preguntasActuales[equipo][llavePregunta] = preguntasRespuestas[llavePregunta];
				this.preguntasActuales[equipo] = this.preguntasRespuestas[llavePregunta];

                //Asigna turno aleatorio
				this.turnosActuales[equipo] = integrantesDisponibles[Math.floor(Math.random() * integrantesDisponibles.length)];
				this.turnosPasados[equipo] = [ this.turnosActuales[equipo] ];

				mensaje = {
					tipo: "turnos",
					turnos: this.turnosActuales,
                    preguntas: this.preguntasActuales,
                    puntaje: this.obtieneAciertosEquipos(),
                    equipo: equipo,
                    idActividad: this._actividadesClase.actividadClase.idActividadClase
                };

                this.webSocket.send(JSON.stringify(mensaje));
			}
        }
    }
    
    obtieneAciertosEquipos() {
        let aciertosEquipos = {}
        for(let elemento of Object.keys(this.equipos)){
            aciertosEquipos[elemento] = (this.preguntasCorrectas[elemento] ? this.preguntasCorrectas[elemento].length : 0) + '/' + (Object.keys(this.preguntasRespuestas).length);
        }

        return aciertosEquipos;
    }

    obtienePorcentajeAciertos(equipo) {
        let numPreguntas = Object.keys(this.preguntasRespuestas).length;
        let numCorrectas = this.preguntasCorrectas[equipo] ? this.preguntasCorrectas[equipo].length : 0;
        
        this.avancePreguntas = {
            numPreguntas: numPreguntas,
            numCorrectas: numCorrectas,
            porcentajeRespuestas: ((numCorrectas/numPreguntas)*100)
        }

        return this.avancePreguntas;
    }

    calcularPosiciones() {
        for (let elemento of Object.keys(this.equipos)) {
            if (this.preguntasCorrectas[elemento]) {
                this.posiciones.push([this.preguntasCorrectas[elemento].length, elemento]);
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