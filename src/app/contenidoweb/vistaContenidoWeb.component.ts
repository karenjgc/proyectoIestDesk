import { Component, OnInit, Input } from '@angular/core';
import { ContenidoWebService } from '../services/contenidoweb.service';
import { Iestdesk } from '../services/iestdesk.service';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
    selector: 'idesk-vistaContenidoWeb',
    templateUrl: './vistaContenidoWeb.component.html'
})
export class VistaContenidoWebComponent implements OnInit {
    
    @Input() vistaAlumno : any;
    public contenidoWeb;
    public esGoogle;

     constructor(
        public iestdesk: Iestdesk,
        public contenidoWebService: ContenidoWebService,
        public ngxSmartModalService: NgxSmartModalService,
     ){
        if (this.iestdesk.rolActual != 1) {
            let params = {
                servicio: "idesk",
                accion: "IDesk_Accesos_RegistraAcceso",
                tipoRespuesta: "json",
                idCurso: this.iestdesk.idCursoActual,
                idTipoModulo: 7,
                idElemento: this.contenidoWebService.idContenidoWeb,
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
        this.iestdesk.registraAcceso(61, this.contenidoWebService.idContenidoWeb);
        this.mostrarContenidoWeb();
     }

     mostrarContenidoWeb(){
        if(this.vistaAlumno){
             this.contenidoWeb = this.vistaAlumno;
        }else{
            let params = {
                servicio: "multimedia",
                accion: "IDesk_Contenido_Web_VistaInd",
                tipoRespuesta: "json",
                idContenidoWeb: this.contenidoWebService.idContenidoWeb
            };
            this.contenidoWebService.consultas(params)
                .subscribe(resp => {
                    this.contenidoWeb  = resp[0];
                    this.esGoogle = this.contenidoWeb.tipoTexto == 0 && this.contenidoWeb.linkHtml.match(/https?:\/\/(docs|drive)\.google\.com\//);
                    console.log('esGoogle', this.esGoogle);
                },
                errors => {
                    console.log(errors);
                });
        }
     }
}