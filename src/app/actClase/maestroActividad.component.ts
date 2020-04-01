import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActividadesClase } from '../services/actividadesClase.service';
import { Ruleta } from './ruleta';
import { Router } from '@angular/router';
import { NgDragDropModule } from 'ng-drag-drop';
import { Jeopardy } from './jeopardy';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
    selector: 'maestro-actividad',
    templateUrl: './maestroActividad.component.html'
})

export class MaestroActividadComponent implements OnInit, OnDestroy {
    public actividadClase;
    public tiempoActivo = "15 : 00";
    public tiempoMinutos = 15;
    public tiempoSegundos = this.tiempoMinutos * 60;
    public contador;
    public actividad;
    public objectKeys = Object.keys;
    public iniciado = false;
    public modalAbierto = false;
    public mostrarEquipos = false;
    public integrantesEliminados = [];
    public diferenciaEquipos = false;
    public equiposVacios = false;
    public mensajeDialog = "";
    public accionDialog = 0;
    public equipoEliminar;
    public integranteEliminar;
    public iconosActividades = {
        1: "./assets/images/actividades/ruleta-naranja.png",
        2: "./assets/images/actividades/jeopardy-naranja.png"
    };

    constructor(
        private _actividadesClase: ActividadesClase,
        private router: Router,
        public ngxSmartModalService: NgxSmartModalService
    ){
        this.actividadClase = this._actividadesClase.actividadClase;
        switch (+this.actividadClase.idTipoActividad) {
            //Ruleta
            case 1:
                this.actividad = new Ruleta(this._actividadesClase);
            break;

            //Jeopardy
            case 2:
                this.actividad = new Jeopardy(this._actividadesClase);
            break;
        }
    }

    ngOnInit(){
        
    }
    
    agregarEquipo(){
        let nombreNuevoEquipo = "Equipo " + (this.actividad.controlEquipos.length + 1);
        this.actividad.equipos[nombreNuevoEquipo] = [];
        this.actividad.controlEquipos.push(nombreNuevoEquipo);
        this.actividad.obtenerNuevoColor(nombreNuevoEquipo);
    }

    moverIntegranteEquipo(e: any, equipoReceptor: any){         
        let integrante = e.dragData.integrante;
        let equipoIntegrante = e.dragData.equipo;
        
        //Verifica si no existe el integrante en el equipoReceptor.
        if(this.actividad.equipos[equipoReceptor].indexOf(integrante) == -1){
            //Se agrega al equipoReceptor.
            this.actividad.equipos[equipoReceptor].push(integrante);
            
            //Verifica si el integrante esta conectado y existe el equipoReceptor en integrantesConectados
            if(this.actividad.integrantesConectados.hasOwnProperty(equipoIntegrante) && this.actividad.integrantesConectados[equipoIntegrante].indexOf(integrante) != -1){
                this.actividad.integrantesConectados[equipoReceptor] = [];
                this.actividad.integrantesConectados[equipoReceptor].push(integrante);
                this.actividad.integrantesConectados[equipoIntegrante].splice(this.actividad.integrantesConectados[equipoIntegrante].indexOf(integrante),1);
            }

            //Si no proviene de integrante-eliminados
            if(equipoIntegrante != 'integrante-eliminados'){                    
                //Se elimina del equipo del integrante.
                this.actividad.equipos[equipoIntegrante].splice(this.actividad.equipos[equipoIntegrante].indexOf(integrante), 1);

                //Si el equipo del integrante queda vacio se elimina.
                if(this.actividad.equipos[equipoIntegrante].length == 0){
                    delete this.actividad.equipos[equipoIntegrante];
                }
            }else{
                //Se elimina de los integrantes eliminados.
                this.integrantesEliminados.splice(this.integrantesEliminados.indexOf(integrante),1);
            }

            //console.log('Mover Integrante Conectado',this.actividad.integrantesConectados);
        }
    }

    eliminarElemento(e: any){
        let tipoElemento = e.dragData.tipo;
        this.equipoEliminar = e.dragData.equipo;
        this.integranteEliminar = e.dragData.integrante;

        //Si equipo es diferente de integrante-eliminados
        if(this.equipoEliminar != "integrante-eliminados"){
            if(tipoElemento == 1){ //Elimina Equipo
                let integrantesConectados = () => {
                    let valido = false;
                    for(let integrante of this.actividad.equipos[this.equipoEliminar]){
                        if(this.actividad.integrantesConectados.hasOwnProperty(this.equipoEliminar)){
                            if(this.actividad.integrantesConectados[this.equipoEliminar].indexOf(integrante) != -1){
                                valido = true;
                                return valido;
                            }
                        }
                    }

                    return valido;
                };
                
                if(integrantesConectados()){
                    this.accionDialog = 1;
                    this.mensajeDialog = "Hay un integrante conectado en el equipo que desea eliminar ¿Desea continuar?";
                    this.ngxSmartModalService.getModal('confirmacionDialog').open();
                }else{
                   this.eliminarEquipo(this.equipoEliminar);
                }
            }else{ //Elimina Integrante
                this.eliminarIntegrante(this.equipoEliminar, this.integranteEliminar);
            }
        }
    }
    
    eliminarEquipo(equipoEliminar){
        for(let integrante of this.actividad.equipos[equipoEliminar]){
            if(this.integrantesEliminados.indexOf(integrante) == -1){
                this.integrantesEliminados.push(integrante);
            }
        }
        
        this.actividad.colores.push(this.actividad.coloresEquipos[equipoEliminar]);
        delete this.actividad.coloresEquipos[equipoEliminar];
        delete this.actividad.equipos[equipoEliminar];
        delete this.actividad.integrantesConectados[equipoEliminar];
    }

    eliminarIntegrante(equipoEliminar,integranteEliminar){
        if(this.integrantesEliminados.indexOf(integranteEliminar) == -1){
            this.integrantesEliminados.push(integranteEliminar);
            this.actividad.equipos[equipoEliminar].splice(this.actividad.equipos[equipoEliminar].indexOf(integranteEliminar), 1);
            
            //Verifica si el integrante esta conectado y existe el equipoReceptor en integrantesConectados
            if(this.actividad.integrantesConectados.hasOwnProperty(equipoEliminar) && this.actividad.integrantesConectados[equipoEliminar].indexOf(integranteEliminar) != -1){
                this.actividad.integrantesConectados[equipoEliminar].splice(this.actividad.integrantesConectados[equipoEliminar].indexOf(integranteEliminar),1);
            }

            if(this.actividad.equipos[equipoEliminar].length == 0){
                this.actividad.colores.push(this.actividad.coloresEquipos[equipoEliminar]);
                delete this.actividad.coloresEquipos[equipoEliminar];
                delete this.actividad.equipos[equipoEliminar];
                delete this.actividad.integrantesConectados[equipoEliminar];
            } 
        }
    }

    cambiarMinutos() {
        this.tiempoSegundos = this.tiempoMinutos * 60;
        this.tiempoActivo = this.formatearSegundosAMinutos(this.tiempoSegundos);
    }

    iniciarContador() {
        if (!this.contador && this.actividadClase.confirmado) {
            this.contador = setInterval(() => {
                this.tiempoSegundos--;
                this.tiempoActivo = this.formatearSegundosAMinutos(this.tiempoSegundos);

                if(this.tiempoSegundos == 0){
                    clearInterval(this.contador);
                    this.actividad.calcularPosiciones();
                }
            }, 1000);

            this.iniciado = true;
            this.mostrarEquipos = true;
            this.actividad.obtenerAleatorios();
        }
    }

    pausarContador() {
        clearInterval(this.contador);
        clearInterval(this.actividad.intervaloTurno);
        this.contador = null;
        this.iniciado = false;
        this.actividad.enviarPausa();
    }

    pararContador() {
        clearInterval(this.contador);
        this.contador = null;
        this.tiempoSegundos = this.tiempoMinutos * 60;
        this.tiempoActivo = this.formatearSegundosAMinutos(this.tiempoSegundos);
        this.iniciado = false;
        //this.confirmado = false; 
        clearInterval(this.actividad.intervaloTurno);
        this.actividad.calcularPosiciones();
    }

    confirmarEquipos() {
        //Variable para diferencias entre los equiposOriginales y los nuevos.
        this.diferenciaEquipos = this.hayDiferenciaEquipos();
        //console.log('Hay diferencia:', this.diferenciaEquipos);

        //Variable para modal de eliminar equipos.
        this.validaEquiposVacios();
        
        this.actividadClase.confirmado = true;

        if (this.actividadClase.idTipoActividad == 2) {
            for(let equipo of Object.keys(this.actividad.equipos)) {
                this.actividad.turnosPasados.integrantes[equipo] = [];
            }
        }

        this.actividad.enviarEquipos();
    }
    
    hayDiferenciaEquipos(){
        if(Object.keys(this.actividad.equiposOriginales).length != Object.keys(this.actividad.equipos).length){
            return true;
        }

        for(let equipo of Object.keys(this.actividad.equiposOriginales)){
            if(!this.actividad.equipos[equipo] || this.actividad.equiposOriginales[equipo].length != this.actividad.equipos[equipo].length){
                return true;
            }

            for(let integrante of this.actividad.equiposOriginales[equipo]){
                if(this.actividad.equipos[equipo].indexOf(integrante) == -1){
                    return true;
                }
            }
        }
    }

    validaEquiposVacios(eliminar = ""){
        for(let equipo of Object.keys(this.actividad.equipos)){
            if(this.actividad.equipos[equipo].length == 0){
                delete this.actividad.equipos[equipo];
                //return true;
            }
        }
        
        //Returns para modal de opción para eliminar equipos vacios.
        //return false;
    }

    formatearSegundosAMinutos(segundos) {
        let numMinutos = Math.floor(segundos / 60) >= 10 ? Math.floor(segundos / 60) : "0" + Math.floor(segundos / 60),
            numSegundos = segundos % 60;

        let segundosForm = numSegundos < 10 ? "0" + numSegundos : numSegundos,
            segundosFormateados = numMinutos + " : " + segundosForm;
    
        return segundosFormateados;
    }
    
    terminaJuego(){
        if(this.actividad.terminado){
            clearInterval(this.contador);
            this.contador = null;
            this.iniciado = false;
            return true;
        }else{
            return false;
        }
    }
    
    cerrarDialog(resp) {
        this.ngxSmartModalService.getModal('dialogoActividad').close();
    }

    cerrarDialogConfirmacion(resp) {
        if(+resp['respuesta'] == 1){
            //console.log('Acepto');
            switch(+resp['accion']){
                case 1: //Eliminar equipo.
                   this.eliminarEquipo(this.equipoEliminar);
                   //console.log('Eliminar Equipo');
                break;
            }
        }
        //console.log(resp);
        this.ngxSmartModalService.getModal('confirmacionDialog').close();
    }

    cerrarModal(){
        this.modalAbierto = true;
        this.router.navigate(['/actividades-clase']);
    }
    
    muestraEquipos(){
        this.mostrarEquipos = !this.mostrarEquipos;
    }

    ngOnDestroy() {
        if (this.actividad.webSocket) {
            let params = {
                servicio: "actividadesClase",
                accion: "IDesk_Actividades_Clase_CambiarConexion",
                tipoRespuesta: "json",
                idActividad: this._actividadesClase.actividadClase.idActividadClase,
                abrir: 0
            };

            
            //console.log(this._actividadesClase.actividadClase);
            if (+this._actividadesClase.actividadClase.idTipoActividad == 2) {
               clearInterval(this.actividad.intervaloTurno);
            }
            this._actividadesClase.consultas(params)
            .subscribe(
                resp => {
                    let mensaje = {
                        tipo: "terminarConexion",
                        idActividad: this._actividadesClase.actividadClase.idActividadClase
                    };
                    //console.log(mensaje);
                    this.actividad.webSocket.send(JSON.stringify(mensaje));
                    this.actividad.webSocket.close();
                },
                errors => {
                    console.log(errors);
                }
            );
        }
    }
}