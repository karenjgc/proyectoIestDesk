import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { Iestdesk } from '../services/iestdesk.service';
import { Videoconferencia } from "../services/videoconferencia.service";

import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
    selector: 'idesk-vistaVideoconferencias',
    templateUrl: './vistaVideoconf.component.html'
})

export class VideoconferenciasVistaComponent implements OnInit {
    public rolActual: number = 0;
    public conferencia;
    public titulo: string;
    @Input() public modoTemario;
    @Input() public vistaAlumno : any;

    constructor(
        private _iestdesk: Iestdesk,
        private _videoconf: Videoconferencia,
        public ngxSmartModalService: NgxSmartModalService,
        private router: Router
    ){
        this._iestdesk.registraAcceso(38, this._videoconf.idVideoconferencia);
        this.rolActual = this._iestdesk.rolActual;
    }

    ngOnInit(){
        this.cargaVideoconferencia();
    }

    gotoEditar(idVideoconferencia){
        this._videoconf.idVideoconferencia = idVideoconferencia;
        this.router.navigate(['/videoconferencias/nueva']);
    }

    cargaVideoconferencia(){
        if(this.vistaAlumno){
            this.modoTemario = true;
            this.conferencia = this.vistaAlumno.value;
        }else{
            let params = {
                servicio: "videoconferencia",
                accion: "IDesk_Videoconferencias_Vista",
                tipoRespuesta: "json",
                idVideoconferencia: this._videoconf.idVideoconferencia
            };
            this._videoconf.consultas(params)
                .subscribe(resp => {
                    this.conferencia = resp[0];
                    this.titulo = resp[0].titulo;
                },
                errors => {
                    console.log(errors);
                });
        }
    }
}