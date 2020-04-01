import { Component, OnInit, Input } from '@angular/core';
import { Iestdesk } from '../services/iestdesk.service';
import { EditorService } from '../services/editorService.service';
import { AdjuntarCarpetasService } from '../services/adjuntarCarpetasService.service';

@Component({
    selector: 'idesk-vistaOda',
    templateUrl: './vistaOda.component.html'
})

export class VistaOdaComponent implements OnInit {
    
    @Input() vistaAlumno : any; 
    public oda;
    public rutaFrame;
    public nombreCarpetaTemporal;

    constructor(
        public iestdesk: Iestdesk,
        public editorService: EditorService,
        public adjuntarCarpetasService: AdjuntarCarpetasService
    ){
        if (this.iestdesk.rolActual != 1) {
            let params = {
                servicio: "idesk",
                accion: "IDesk_Accesos_RegistraAcceso",
                tipoRespuesta: "json",
                idCurso: this.iestdesk.idCursoActual,
                idTipoModulo: 13,
                idElemento: this.editorService.idOda,
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
       this.iestdesk.registraAcceso(69, this.editorService.idOda);
       this.mostrarOda();
    }

    mostrarOda(){
        if(this.vistaAlumno){
            this.oda = this.vistaAlumno;
            this.rutaFrame = this.adjuntarCarpetasService.rutaVistaAlumno;
            this.nombreCarpetaTemporal = this.adjuntarCarpetasService.getDirectorioTemporal().length > 0 ?this.adjuntarCarpetasService.getDirectorioTemporal()[0].webkitRelativePath.split('/')[0] :  '';
        }else{
            let params = {
                servicio: "multimedia",
                accion: "IDesk_Oda_VistaInd",
                tipoRespuesta: "json",
                idOda: this.editorService.idOda
            };
            this.editorService.consultas(params)
                .subscribe(resp => {
                    this.oda  = resp[0];
                    this.rutaFrame = this.adjuntarCarpetasService.eliminaAcentos(resp[0].titulo)  + '/' + resp[0].ruta;
                },
                errors => {
                    console.log(errors);
                });
        }
     }
}