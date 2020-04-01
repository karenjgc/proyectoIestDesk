export class ActividadClaseAlumno{
    public wsURL = "ws://sie.iest.edu.mx:8000";
    public websocket;
    public usuario;

    constructor(
        private idActividad,
        public Nombre_Usuario,
    ) {
        this.usuario = this.Nombre_Usuario;
    }

    crearWS() {
        this.websocket = new WebSocket(this.wsURL);
        
        this.websocket.onopen = (ev) => this.abrirWS(ev);
        this.websocket.onerror = (ev) => this.errorWS(ev);
        this.websocket.onclose = (ev) => this.cerrarWS(ev);
    }

    abrirWS(ev) {
        let mensaje = {
            tipo: "conexion",
            login: this.usuario,
            conectado: 1,
            idActividad: this.idActividad
        };

        this.enviarMensaje(mensaje);
    }

    enviarMensaje(mensaje) {
        //console.log("Mensaje enviado:", mensaje);
        this.websocket.send(JSON.stringify(mensaje));
    }

    errorWS(ev) {
        let mensaje = {
            tipo: "conexion",
            login: this.usuario,
            conectado: 0,
            idActividad: this.idActividad
        };
        this.enviarMensaje(mensaje);
        //console.log("Ocurrió un error con el Web Socket");
        console.dir(ev);
    }

    cerrarWS(ev) {
        let mensaje = {
            tipo: "conexion",
            login: this.usuario,
            conectado: 0,
            idActividad: this.idActividad
        };
        this.enviarMensaje(mensaje);
        //console.log("Web Socket cerrado");
        //console.log("Se cerró porque: ", ev);
    }
}