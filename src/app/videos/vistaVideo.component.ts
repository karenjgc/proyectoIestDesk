import { Component, OnInit, Input } from '@angular/core';
import { Iestdesk } from '../services/iestdesk.service';
import { VideosService } from '../services/videos.service';

@Component({
    selector: 'idesk-vistaVideo',
    templateUrl: './vistaVideo.component.html'
})

export class VistaVideoComponent implements OnInit {
    
    @Input() vistaAlumno : any;
    public video;

    constructor(
        public iestdesk: Iestdesk,
        public videoService: VideosService
    ){
        if (this.iestdesk.rolActual != 1) {
            let params = {
                servicio: "idesk",
                accion: "IDesk_Accesos_RegistraAcceso",
                tipoRespuesta: "json",
                idCurso: this.iestdesk.idCursoActual,
                idTipoModulo: 8,
                idElemento: this.videoService.idVideo,
                idpersonidesk: this.iestdesk.idPerson
            };
            this.iestdesk.consultas(params).subscribe(
                resp => {
                    console.log(resp);
                },
                errors => {
                    console.log(errors);
                }
            );
        }
    }

    ngOnInit(){
        this.iestdesk.registraAcceso(67, this.videoService.idVideo);
        this.mostrarVideo();
    }

    mostrarVideo(){
        if(this.vistaAlumno){
            this.video = this.vistaAlumno;
        }else{
            let params = {
                servicio: "multimedia",
                accion: "IDesk_Video_VistaInd",
                tipoRespuesta: "json",
                idVideo: this.videoService.idVideo
            };
            this.videoService.consultas(params)
                .subscribe(resp => {
                    this.video  = resp[0];
                },
                errors => {
                    console.log(errors);
                });
        }
    }
}