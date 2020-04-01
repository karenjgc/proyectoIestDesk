import { ActividadesClase } from "../services/actividadesClase.service";

export class ActividadClase {
    public wsUrl = "wss://sie.iest.edu.mx:8000";
    public webSocket;
    public equipos = {};
    public equiposOriginales = {};
    public controlEquipos;
    public colores = [
        'naranja',
        'aqua',
        'rosa-claro',
        'verde-limon',
        'morado',
        'rosa-mexicano',
        'azul',
        'verde',
        'rojo',
        'amarillo',
        'lila',
        'verde-botella',
        'amarillo-claro',
        'morado-claro',
        'azul-marino',
        'azul-cielo',
        'menta',
        'violeta',
        'cafe',
        'verde-pasto',
        'azul-mezclilla',
        'vino'
    ];
    public coloresEquipos= {};
    public integrantesConectados = {};
    public permiteConfirmar = false;
    public terminado = false;
    public confirmado = false;
    public iniciado = 0;

    constructor(
        private actividadesClase: ActividadesClase
    ) {
        let params = {
            servicio: "actividadesClase",
            accion: "IDesk_Actividades_Clase_CambiarConexion",
            tipoRespuesta: "json",
            idActividad: this.actividadesClase.actividadClase.idActividadClase,
            abrir: 1
        };

        this.actividadesClase.consultas(params).subscribe(
            resp => {
                //console.log(resp);
            },
            errors => {
                console.log(errors);
            }
        );

        let paramsEquipo = {
            servicio: "equipos",
            accion: "IDesk_Equipos_Consulta",
            tipoRespuesta: "json",
            idPlantillaEquipo: this.actividadesClase.actividadClase.idPlantillaEquipos
        };

        this.actividadesClase.consultas(paramsEquipo).subscribe(
            resp => {
                if (resp) {
                    for (let elemento of resp) {
                        if (!this.equipos.hasOwnProperty(elemento.equipo)) {
                            this.equipos[elemento.equipo] = [];
                            this.equiposOriginales[elemento.equipo] =[];
                        }
                        this.equipos[elemento.equipo].push(elemento.login);
                        this.equiposOriginales[elemento.equipo].push(elemento.login);
                    }
                    
                    this.controlEquipos = Object.keys(this.equiposOriginales);
                    this.obtenerColoresAleatorios(this.equipos);
                }
            },
            errors => {
                console.log(errors);
            }
        );
    }

    crearWS() {
        this.webSocket = new WebSocket(this.wsUrl);

        this.webSocket.onopen = (ev) => this.abrirConexion(ev);
        this.webSocket.onerror = (ev) => this.errorConexion(ev);
        this.webSocket.onclose = (ev) => this.cerrarConexion(ev);
    }

    abrirConexion(ev) { 
        let mensaje = {
            tipo: "conexion",
            escritorio: true,
            idActividad: this.actividadesClase.actividadClase.idActividadClase
        };
        this.webSocket.send(JSON.stringify(mensaje));
        //console.log(ev);
    }

    errorConexion(ev) {
        let mensaje = {
            tipo: "terminarConexion",
            idActividad: this.actividadesClase.actividadClase.idActividadClase
        };
        //console.log(ev);
        this.webSocket.send(JSON.stringify(mensaje));
    }

    cerrarConexion(ev) {
        let mensaje = {
            tipo: "terminarConexion",
            idActividad: this.actividadesClase.actividadClase.idActividadClase
        };
        //console.log(mensaje);
        this.webSocket.send(JSON.stringify(mensaje));
        //console.log(ev);
    }

    enviarEquipos() {
        let mensaje = {
            tipo: "equipos",
            equipos: this.equipos,
            colores: this.coloresEquipos,
            idActividad: this.actividadesClase.actividadClase.idActividadClase
        };

        //console.log(mensaje);
        this.webSocket.send(JSON.stringify(mensaje));
    }

    obtenerColoresAleatorios(equiposRecibidos){
        for(let equipo of Object.keys(equiposRecibidos)){
            let colorAleatorio = Math.floor(Math.random() * this.colores.length);
            this.coloresEquipos[equipo] = this.colores[colorAleatorio];
            this.colores.splice(colorAleatorio, 1);
        }
    }

    obtenerNuevoColor(nuevoEquipo){
        let colorAleatorio = Math.floor(Math.random() * this.colores.length);
        this.coloresEquipos[nuevoEquipo] = this.colores[colorAleatorio];
        this.colores.splice(colorAleatorio,1);
    }

    conectadosValidos(){
        for(let elemento of Object.keys(this.equipos)){
            if(this.integrantesConectados.hasOwnProperty(elemento)){
                if(this.integrantesConectados[elemento].length == 0){
                    this.permiteConfirmar = false;
                    break;
                }
            }else{
                this.permiteConfirmar = false;
                break;
            }

            this.permiteConfirmar = true;
        } 
    }

    obtenerEquipoIntegrante(integrante) {
        let equipo = "";

        equipos_bucle:
        for(let elemento of Object.keys(this.equipos)) {
            for (let elementoArr of this.equipos[elemento]) {
                if (integrante == elementoArr) {
                    equipo = elemento;
                    break equipos_bucle;
                }
            }
        }

        return equipo;
    }

    enviarInicio(mensaje) {
        this.terminado = false;
        this.webSocket.send(JSON.stringify(mensaje));
    }

    enviarPausa() {
        let turnos = {};
        for(let equipo of Object.keys(this.equipos)){
            turnos[equipo] = 'Pausa';
        }
        
        let mensaje = {
            tipo: "turnos",
            turnos: turnos,
            equipo: 0,
            idActividad: this.actividadesClase.actividadClase.idActividadClase
        };

        this.webSocket.send(JSON.stringify(mensaje));
    }

    enviarTermino(posiciones) {
        let mensaje = {
            tipo: "controlJuego",
            iniciado: 0,
            posiciones: posiciones,
            idActividad: this.actividadesClase.actividadClase.idActividadClase
        };
        this.iniciado = 0;
        this.terminado = true;
        this.webSocket.send(JSON.stringify(mensaje));
    }
}