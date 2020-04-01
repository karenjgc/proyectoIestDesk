import { Component, OnInit, Input } from '@angular/core';
import { Iestdesk } from '../services/iestdesk.service';
import { PodcastService } from '../services/podcast.service';

@Component({
    selector: 'idesk-vistaPodcast',
    templateUrl: './vistaPodcast.component.html'
})
export class VistaPodcastComponent implements OnInit{
    
    @Input() vistaAlumno : any;
    public podcast;

    constructor(
        public iestdesk: Iestdesk,
        public podcastService: PodcastService
    ){
        if (this.iestdesk.rolActual != 1) {
            let params = {
                servicio: "idesk",
                accion: "IDesk_Accesos_RegistraAcceso",
                tipoRespuesta: "json",
                idCurso: this.iestdesk.idCursoActual,
                idTipoModulo: 9,
                idElemento: this.podcastService.idPodcast,
                idpersonidesk: this.iestdesk.idPerson
            };
            this.iestdesk.consultas(params).subscribe(
                resp => {
                    //console.log(resp);
                },
                errors => {
                    console.log(errors);
                }
            );
        }
    }

    ngOnInit(){
        this.iestdesk.registraAcceso(65, this.podcastService.idPodcast);
        this.mostrarPodcast();
    }
    
    obtieneAudio(idAudio){
        let params = {
            servicio: "avisos",
            accion: "IDesk_Audio_Consulta",
            tipoRespuesta: "json",
            idAudio: idAudio
        };
        this.podcastService.consultas(params)
        .subscribe(resp => {
            this.podcast.url  = resp[0].ruta;
            console.log('URL', this.podcast);
        },
        errors => {
            console.log(errors);
        });
    }

    mostrarPodcast(){
        if(this.vistaAlumno){
            this.podcast = this.vistaAlumno;

            if(this.podcast.tipoAudio == 1 && this.podcast.idArchivo != 0){
               this.obtieneAudio(this.podcast.idArchivo);
            }

        }else{
            let params = {
                servicio: "multimedia",
                accion: "IDesk_Podcast_VistaInd",
                tipoRespuesta: "json",
                idPodcast: this.podcastService.idPodcast
            };
            this.podcastService.consultas(params)
            .subscribe(resp => {
                this.podcast  = resp[0];
                //console.log('Podcast', resp[0]);
            },
            errors => {
                console.log(errors);
            });
        }
    }
}