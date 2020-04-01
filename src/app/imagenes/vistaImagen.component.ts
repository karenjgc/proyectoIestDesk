import { Component, OnInit, Input } from '@angular/core';
import { ImagenesService } from '../services/imagenes.service';
import { Iestdesk } from '../services/iestdesk.service';

@Component({
    selector: 'idesk-vistaImagen',
    templateUrl: './vistaImagen.component.html'
})

export class VistaImagenComponent implements OnInit{
    
    @Input() vistaAlumno : any;
    public imagen;

    constructor(
        public iestdesk: Iestdesk,
        public imagenesService: ImagenesService
    ){
        if (this.iestdesk.rolActual != 1 && !this.vistaAlumno) {
            let params = {
                servicio: "idesk",
                accion: "IDesk_Accesos_RegistraAcceso",
                tipoRespuesta: "json",
                idCurso: this.iestdesk.idCursoActual,
                idTipoModulo: 10,
                idElemento: this.imagenesService.idImagen,
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
        this.iestdesk.registraAcceso(63, this.imagenesService.idImagen);
        this.cargaImagen();
    }

    cargaImagen(){
        if(this.vistaAlumno){
            this.imagen = this.vistaAlumno;
            if(this.imagen.idArchivo){
                let params = {
                    servicio: "archivos",
                    accion: "IDesk_Archivos_Consulta",
                    tipoRespuesta: "json",
                    idArchivos: this.vistaAlumno.idArchivo,
                    rol: this.iestdesk.rolActual
                };
                this.imagenesService.consultas(params)
                .subscribe(resp => {
                    
                    this.imagen.llave = resp[0].llave.trim();
                }, errors => {
                    console.log(errors);
                });
            }
        }else{
            let params = {
                servicio: "multimedia",
                accion: "IDesk_Imagen_VistaInd",
                tipoRespuesta: "json",
                idImagen: this.imagenesService.idImagen
            };
            this.imagenesService.consultas(params)
            .subscribe(resp => {
                this.imagen = resp[0];    
            }, errors => {
                console.log(errors);
            });
        }
    }
}