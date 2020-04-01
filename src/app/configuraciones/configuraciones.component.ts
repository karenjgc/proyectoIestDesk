import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { GoogleUserService } from '../services/googleUser.service';
import { GoogleApiService, GoogleAuthService } from 'ng-gapi';

import { Iestdesk } from '../services/iestdesk.service';
import { GoogleApi } from '../shared/classes/googleApi';

import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
    selector: 'idesk-configuraciones',
    templateUrl: './configuraciones.component.html'
})

export class ConfiguracionesComponent extends GoogleApi implements OnInit {
    public rolActual: number = 0; 
    public sesionIniciada: boolean = false;
    public configuraciones = {};
    public objectKeys = Object.keys;
    public mensaje;
    public tipoRespuesta;

    public confListado = [];
    public confGuardadas = [];

    constructor(
        private _iestdesk: Iestdesk,
        private _chRef: ChangeDetectorRef,
        public _modalService: NgbModal,
        public activeModal: NgbActiveModal,
        public _ngxSmartModalService: NgxSmartModalService,
        private googleUser: GoogleUserService,
        private _authService: GoogleAuthService,
        private _gapiService: GoogleApiService
    ){
        super(googleUser, _authService, _gapiService);
        this.rolActual = this._iestdesk.rolActual;
    }

    ngOnInit() {
        this._iestdesk.registraAcceso(28, 0);

        this.verificaConfiguraciones();

        if ( this.isLoggedIn() ) {
            this.sesionIniciada = true;
        }
    }

    verificaConfiguraciones(){
        let params = {
            servicio: "configuraciones",
            accion: "IDesk_Configuraciones_GuardadasxPersona",
            tipoRespuesta: "json",
            idpersonidesk: this._iestdesk.idPerson,
            dispositivo: 1,
            esMaestro: this.rolActual == 1 ? 1 : 0
        };

        this._iestdesk.consultas(params)
            .subscribe(resp => {
                this.confGuardadas = resp;
                this.obtieneConfiguraciones();
            },
            errors => {
                console.log(errors);
            });
    }

    obtieneConfiguraciones(){
        let params = {
            servicio: "configuraciones",
            accion: "IDesk_Configuraciones_Listado",
            tipoRespuesta: "json"
        };

        this._iestdesk.consultas(params)
            .subscribe(resp => {
                this.confListado = resp;
                this.preparaConfiguraciones();
            },
            errors => {
                console.log(errors);
            });
    }

    preparaConfiguraciones() {
        for ( let conf of this.confListado ) {
            if ( !this.configuraciones.hasOwnProperty(conf.modulo) ) {
                this.configuraciones[conf.modulo] = [];
            }
            this.configuraciones[conf.modulo].push({
                tipoConfiguracion: conf.tipoConfiguracion,
                idTipoConfiguracion: conf.idTipoConfiguracion,
                habilitado: this.confGuardadas.findIndex(x => x.idTipoConfiguracion == conf.idTipoConfiguracion) >= 0 ? false : true
            });
            //console.log(this.confGuardadas.findIndex(x => x.idTipoConfiguracion == conf.idTipoConfiguracion));
        }
        //console.log(JSON.stringify(this.configuraciones));
    }

    guardaConfiguraciones() {
        let v = [];  

        for ( let conf of Object.keys(this.configuraciones) ){
            for ( let i of this.configuraciones[conf]) {
                let tmp = [];
                tmp.push(
                    i.idTipoConfiguracion,
                    i.habilitado == true ? 1 : 0,
                )
                v.push(tmp.join('|'));
            } 
        }

        let params = {
            servicio: "configuraciones",
            accion: "IDesk_Configuraciones_Guardar",
            tipoRespuesta: "json", 
            idpersonidesk: this._iestdesk.idPerson,
            dispositivo: 1,
            esMaestro: this.rolActual == 1 ? 1 : 0,
            conf: v.join('$')
        }

        this._iestdesk.consultas(params)
            .subscribe(resp => {
                this.mensaje = resp[0].mensaje;
                if(resp[0].error == 0){
                    this.tipoRespuesta = 1;
                } else {
                    this.tipoRespuesta = 2;
                }
                
                this._ngxSmartModalService.getModal('dialogoInformacion').open();
            },
            errors => {
                console.log(errors);
            });
    }

    entraGoogle() {
        this.sesionIniciada = this.signIn();
    }

    cierraGoogle() {
        this.signOut();
        this.sesionIniciada = false;
        var strWindowFeatures = "location=yes,height=570,width=520,scrollbars=yes,status=yes";
        var url = 'https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=https://sie.iest.edu.mx/iestdesk/sesion_cerrada.php'
        let myWindow = window.open(url, '_blank', strWindowFeatures);

        setTimeout(function(){ 
            myWindow.close(); 
        }, 4000)
    }

    cierraDialogoInfo(resp) {
        this._ngxSmartModalService.getModal("dialogoInformacion").close();
    }
}