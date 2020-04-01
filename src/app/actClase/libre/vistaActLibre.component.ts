import { Component, ChangeDetectorRef, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Iestdesk } from '../../services/iestdesk.service';
import { ActividadesClase } from '../../services/actividadesClase.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Validaciones } from '../../shared/classes/validaciones';

@Component({
    selector: 'idesk-vistaActividadLibre',
    templateUrl: './vistaActLibre.component.html'
})

export class VistaActividadLibreComponent implements OnInit {
    @Input() public modoTemario = false;

    public rolActual;
    public titulito: string;
    public act;
    public linksActividades = [];
    public idActividad;
    public arrArchivos = [];
    public _arrArchivos = [];
    public _vistaAlumno: boolean = false;
    public _vistaPrevia;
	public mostrarArchivos: boolean = false;
	public archivosRevision = [];
	public modal;
	public modalReference: any;
    public verEntrega;
    public idPlantillaSolicitada;

    public mostrarCalif;
    public infoRevision;
    public tipoAlta;

    public validaciones = new Validaciones();

    constructor(
        private iestdesk: Iestdesk,
        private actividades: ActividadesClase,
        private _chRef: ChangeDetectorRef,
        private router: Router,
        private route: ActivatedRoute,
		private modalService: NgbModal
    ){
        this.rolActual = this.iestdesk.rolActual;
        this.idActividad = this.actividades.idActividad;
		//console.clear();
        this.verEntrega = ( this.rolActual != 1 ) ? 1 : 0;
        this.tipoAlta = this.actividades.tipoAlta;
    }

    @Input()
    set vistaAlumno ( v: boolean ) {
        if ( this._vistaAlumno != v ) {
            this._vistaAlumno = v;
        }
    }

	@Input()
	set vistaPrevia ( x ) {
        if ( this._vistaPrevia != x ) {
            this._vistaPrevia = x;
            this.act = x;
			console.clear();
			
            let paramsA = {
                servicio: "archivos",
                accion: "IDesk_Archivos_Consulta",
                tipoRespuesta: "json",
                idArchivos: this.act.idArchivos,
                rol: 1
            };
            this.actividades.consultas(paramsA)
                .subscribe(resp => {
                    this._arrArchivos = resp;

                    let paramsL = {
                        servicio: "links",
                        accion: "IDesk_Links_Consulta",
                        tipoRespuesta: "json",
                        idLinks: this.act.idLinks,
                        rol: 1
                    };
        
                    this.actividades.consultas(paramsL)
                        .subscribe(resp => {
                            this.linksActividades = resp;
                            this._chRef.detectChanges();
        
                            this.arrArchivos = this._arrArchivos;
                            for (let i in this.linksActividades) {
                                this.arrArchivos.push({
                                    idArchivo: this.linksActividades[i].idLink,
                                    nombreArchivo: this.linksActividades[i].nombre,
                                    ruta: this.linksActividades[i].idTipoLink == 3 ? this.linksActividades[i].link.replace('view', 'preview').replace('edit', 'preview') : this.linksActividades[i].idTipoLink == 4 ? this.linksActividades[i].link : this.linksActividades[i].idTipoLink == 1 ? 'https://www.youtube.com/embed/' + this.validaciones.matchYoutubeUrl(this.linksActividades[i].link): 'https://player.vimeo.com/video/' + this.validaciones.matchVimeoUrl(this.linksActividades[i].link) ,
                                    pesoFormato: 0,
                                    idTipoArchivo: 0,
                                    extension: this.linksActividades[i].idTipoLink == 3 ? 'drive' : this.linksActividades[i].idTipoLink == 4 ? 'link' : 'video',
                                    llave: '',
                                    imgMini: 'assets/images/elements/' + ( this.linksActividades[i].idTipoLink == 3 ? 'drive.png' : this.linksActividades[i].idTipoLink == 4 ? 'link.png' : this.linksActividades[i].idTipoLink == 1 ? 'youtube.png' : 'vimeo.png' )
                                });
                            }
        
                        }, errors => {
                            console.log(errors);
                        });
                },
                errors => {
                    console.log(errors);
                });

        }
    }

    ngOnInit(){
        this.iestdesk.registraAcceso(this.tipoAlta == 1 ? 49 : 50, this.idActividad);
        if ( !this._vistaPrevia ) {
            this.obtieneInfoAct();
        }
    }

    obtieneInfoAct() {
        let params = {
            servicio: "actividadesClase",
            accion: this.tipoAlta == 1 ? "IDesk_Actividades_Clase_Libre_Vista_Ind" : "IDesk_Actividades_Clase_Externa_Vista_Ind",
            tipoRespuesta: "json",
            idActividad: this.actividades.idActividad,
			idpersonidesk: this.iestdesk.idPerson
        };

        this.actividades.consultas(params)
            .subscribe(resp => {
                this.obtieneArchivos(); 
                this.consultaRevision();
                this.act = resp[0];

                this.titulito = resp[0].titulo;
				this.actividades.tituloActividad = resp[0].titulo;
                this.idActividad = this.tipoAlta == 1 ? resp[0].idActividadLibre : resp[0].idActividadExterna;
				this.actividades.idActividadLibreOExterna = this.idActividad;
            },
            errors => {
                console.log(errors);
            });
    }

    obtieneArchivos() {
        let params = {
            servicio: "actividadesClase",
            accion: this.tipoAlta == 1 ? "IDesk_Actividad_Clase_Libre_Vista_Ind_Archivos" : "IDesk_Actividades_Clase_Externa_Vista_Ind_Archivos",
            tipoRespuesta: "json",
            idActividad: this.actividades.idActividad
        }

        this.actividades.consultas(params)
            .subscribe(resp => {
                this._arrArchivos = resp;
                this.obtieneLinks();
            },
            errors => {
                console.log(errors);
            });
    }

    obtieneLinks() {
        let params = {
            servicio: "actividadesClase",
            accion: this.tipoAlta == 1 ? "IDesk_Actividad_Clase_Libre_Vista_Ind_Links" : "IDesk_Actividades_Clase_Externa_Vista_Ind_Links",
            tipoRespuesta: "json",
            idActividad: this.actividades.idActividad
        }

        this.actividades.consultas(params)
            .subscribe(resp => {
                this.linksActividades = resp;

                this.arrArchivos = this._arrArchivos;
                for (let i in this.linksActividades) {
                    this.arrArchivos.push({
                        idArchivo: this.linksActividades[i].idLink,
                        nombreArchivo: this.linksActividades[i].nombre,
                        ruta: this.linksActividades[i].idTipoLink == 3 ? this.linksActividades[i].link.replace('view', 'preview').replace('edit', 'preview') : this.linksActividades[i].idTipoLink == 4 ? this.linksActividades[i].link : this.linksActividades[i].idTipoLink == 1 ? 'https://www.youtube.com/embed/' + this.validaciones.matchYoutubeUrl(this.linksActividades[i].link): 'https://player.vimeo.com/video/' + this.validaciones.matchVimeoUrl(this.linksActividades[i].link) ,
                        pesoFormato: 0,
                        idTipoArchivo: 0,
                        extension: this.linksActividades[i].idTipoLink == 3 ? 'drive' : this.linksActividades[i].idTipoLink == 4 ? 'link' : 'video',
                        llave: '',
                        imgMini: 'assets/images/elements/' + ( this.linksActividades[i].idTipoLink == 3 ? 'drive.png' : this.linksActividades[i].idTipoLink == 4 ? 'link.png' : this.linksActividades[i].idTipoLink == 1 ? 'youtube.png' : 'vimeo.png' )
                    });
                }
            },
            errors => {
                console.log(errors);
            });
    }

	verArchivos(content, modal) {
		this.modal = modal;
		this.modalReference = this.modalService.open(content, { backdrop: 'static' });
    }

	verEquipos(idPlantillaEquipos, content) {
		this.idPlantillaSolicitada = idPlantillaEquipos;
		this.modalReference = this.modalService.open(content, { backdrop: 'static' });
    }
    
    gotoEditar(){
        this.router.navigate(['/actividades-clase/nueva/libre']);
    }
    
    gotoRevisar(){
        this.router.navigate(['/actividades-clase/libre/revision']);
    }

    consultaRevision(){
		let params = {
            servicio: "actividadesClase",
            accion: this.tipoAlta == 1 ? "IDesk_Actividades_Clase_Libre_Consulta_Revision" : "IDesk_Actividades_Clase_Externa_Consulta_Revision",
            tipoRespuesta: "json",
            idActividad: this.actividades.idActividad,
            idpersonidesk: this.iestdesk.idPerson
        };

        this.actividades.consultas(params)
            .subscribe(resp => {
                if ( resp.length > 0 ) { //&& resp[0].calificacion != null) {
                    this.infoRevision = resp[0];
                    this.mostrarCalif = true;
                    this.consultaRevisionArch(this.tipoAlta == 1 ? resp[0].idActLibreAlumno : resp[0].idActExternaAlumno);
                } else {
                    this.mostrarCalif = false;
                }
            },
            errors => {
                console.log(errors);
            });
    }
    
    consultaRevisionArch(idActLibreAlumno){
        console.log(idActLibreAlumno)
        let params = {
            servicio: "actividadesClase",
			accion:this.tipoAlta == 1 ?  "IDesk_Actividades_Clase_Libre_Revision_Archivos" : "IDesk_Actividades_Clase_Externa_Revision_Archivos",
			tipoRespuesta: "json",
			idActividadAlumno: idActLibreAlumno
        };

        this.actividades.consultas(params)
            .subscribe(resp => {
                if ( resp.length > 0 ) {
                    this.archivosRevision = resp;
                    this.mostrarArchivos = true;
                } else {
                    this.mostrarArchivos = false;
                }
            },
            errors => {
                console.log(errors);
            });
    }
}