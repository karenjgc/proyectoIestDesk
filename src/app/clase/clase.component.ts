import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'; 
import * as $ from 'jquery';
import * as moment from 'moment';
import 'moment/locale/es';

import { Iestdesk } from '../services/iestdesk.service';
import { Avisos } from '../services/avisos.service';
import { Calendario } from '../services/calendario.service';
import { Tareas } from '../services/tareas.service';
import { ForoDiscusion } from '../services/foroDiscusion.service';
import { Examenes } from '../services/examenes.service';
import { ActividadesClase } from '../services/actividadesClase.service';

import { SlideInOutAnimation } from '../shared/animations';

import { NgbModule, NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
    selector: 'idesk-clase',
    templateUrl: './clase.component.html',
    animations: [ SlideInOutAnimation ]
})
export class ClaseComponent implements OnInit {
    @ViewChild('childSemana') childSemana;
    @ViewChild('childMes') childMes;

    public idCurso: number = 0;
    public nombre_curso: string;
    public nombreCurso: string;
    private sub: any;
    public rolActual: number = 0;

    public avisos: any[];
    public avisoInd: any[];
    public avisoTitulo: string;
    public avisoMensaje: string;
    public noTieneAviso: boolean =  false;	

    public elementoEliminar: string;
    public idaEliminar: number;

    public mensaje: string;
    public tipoRespuesta: number;

    closeResult: string;
    public modalReference: any;
    
    public verMes: boolean = false;
    public mes: string;
    public hoy: string;

    public animationState = 'in';
    public collapse: string = 'open';

    public muestraElimina: boolean = false;

    constructor(
        private _iestdesk: Iestdesk,
        private _avisos: Avisos,
		private _calendario: Calendario,
		private _tareas: Tareas,
		private _examenes: Examenes,
		private _foroDiscusion: ForoDiscusion,
		private _actClase: ActividadesClase,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        public ngxSmartModalService: NgxSmartModalService,
        private router: Router,
        private route: ActivatedRoute
    ){
        this.verificaCurso();
        this.rolActual = this._iestdesk.rolActual;
        
        let fechaIni = moment().startOf('week').format('DD') + '/' + moment().startOf('week').format('MM') + '/' + moment().startOf('week').format('YYYY');
        let fechaFin = moment().endOf('week').format('DD') + '/' + moment().endOf('week').format('MM') + '/' + moment().endOf('week').format('YYYY');

        this.hoy = 'assets/images/calendario/' + moment().format('DD') + '.png';
        
        if ( this._iestdesk.rolActual == 1 ) {
            this.avisosMaestro();
        } else {
            this.avisosAlumno();
        }
		this.router.routeReuseStrategy.shouldReuseRoute = function() {
			return false;
		};
    }

    ngOnInit(){
        this._iestdesk.registraAcceso(29, this._iestdesk.idCursoActual);
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    toggleShowDiv(divName: string) {
        if (divName === 'divA') {
            if ( this.collapse === 'open' ) this.collapse = 'closed'; else this.collapse = 'open';
            
            this.animationState = this.animationState === 'out' ? 'in' : 'out';
            
        }
    }

	/** Calendario **/	
	cambiaSemana(tipo: string){
        ( this.verMes == false)  ? this.childSemana.cambiaSemana(tipo) : this.childMes.cambiaMes(tipo);
    }
    
    irHoy(){
        ( this.verMes == false) ? this.childSemana.obtenSemanaActual() : this.childMes.obtenMesActual();
    }
	
    cambiarVista() {
        this._iestdesk.registraAcceso(( this.verMes == false) ? 31 : 32, this._iestdesk.idCursoActual)
        this.verMes = ( this.verMes == false) ? true : false;
    }

    setMes(mes) {
        this.mes = mes;
    }
    /** Fin Calendario **/
    
    /** Avisos  **/
    avisosMaestro() {
        let params = {
            servicio: "avisos",
            accion: "IDesk_Maestro_Avisos_Consulta",
            tipoRespuesta: "json",
            idCurso: this._iestdesk.idCursoActual
        };

        this._avisos.consultas(params)
            .subscribe(resp => {
                this.avisos = resp;
                this.noTieneAviso = this.avisos.length == 0;
            }, errors => {
                console.log(errors);
            });
    }

    avisosAlumno() {
        let params = {
            servicio: "avisos",
            accion: "IDesk_Alumno_Avisos_Consulta",
            tipoRespuesta: "json",
            idCurso: this._iestdesk.idCursoActual
        };

        this._avisos.consultas(params)
            .subscribe(resp => {
                this.avisos = resp;
				this.noTieneAviso = this.avisos.length == 0;
            }, errors => {
                console.log(errors);
            });
    }

    eliminaAviso(){
        let params = {
            servicio: "avisos",
            accion: "IDesk_Maestro_Avisos_Elimina",
            tipoRespuesta: "json",
            idAviso: this.idaEliminar,
            idCurso: this._iestdesk.idCursoActual,
            idpersonidesk: this._iestdesk.idPerson
        };

        this._avisos.consultas(params)
            .subscribe(resp => {
                if(resp[0].error == 0){
                    this.tipoRespuesta = 1;
                    this.mensaje = 'Aviso eliminado correctamente.';
                    this._avisos.idAviso = 0;
                    this.avisosMaestro();
                } else {
                    this.tipoRespuesta = 2;
                    this.mensaje = 'Error al eliminar el aviso.';
                }
                this.ngxSmartModalService.getModal('dialogoInformacion').open();
            },
            errors => {
                console.log(errors);
            });
    }

    avisoCerrado(cerrado) {
        this.modalReference.close();
        if ( cerrado == 1 ) {
            if ( this._iestdesk.rolActual == 1 ) {
                this.avisosMaestro();
            } else {
                this.avisosAlumno();
            }
        }
    }

    abrirAviso(idAviso) {
        this._iestdesk.registraAcceso(7, idAviso);
        this.avisoInd = [];
        let params = {
            servicio: "avisos",
            accion: "IDesk_ConsultaAvisosxId",
            tipoRespuesta: "json",
            idAviso: idAviso
        };

        this._avisos.consultas(params)
            .subscribe(resp => {
				//console.log(resp);
                this.avisoInd = resp;
                if ( resp[0].idAudio != 0 ) {
                    this.obtenAudio(resp[0].idAudio);
                }
            }, errors => {
                console.log(errors);
            });

        this.ngxSmartModalService.getModal('verAviso').open();
    }

    obtenAudio(idAudio) {
        let params = {
            servicio: "avisos",
            accion: "IDesk_Audio_Consulta",
            tipoRespuesta: "json",
            idAudio: idAudio
        };

        this._avisos.consultas(params)
            .subscribe(resp => {
				$("#audio-element").attr('src', resp[0].ruta);
            }, errors => {
                console.log(errors);
            });
    }

    pausaAudio() {
        let audio = <HTMLAudioElement>document.getElementById('audio-element');
        if ( audio ) { 
            audio.pause(); 
        }
    }

    confEliminar(idAviso, titulo){
        this.elementoEliminar = titulo;
        this.idaEliminar = idAviso;
        this.muestraElimina = true;
        //this.ngxSmartModalService.getModal('confirmarEliminacion').open();
    }

    confirmarCerrado(resp) {
        if( resp == 1 ){
            this.eliminaAviso();
            //this.ngxSmartModalService.getModal('verAviso').close();
        } else
            this.idaEliminar = 0;
        
        this.muestraElimina = false;
        this.ngxSmartModalService.getModal('verAviso').close();
    }
    /** Fin Avisos **/

    verificaCurso() {
        this.sub = this.route.params.subscribe(params => {
            this.idCurso = +params['idCurso']
            this.nombreCurso = params['nombreCurso'];
        });
        //console.log(this._iestdesk.idCursoActual, this._iestdesk.cursoActual);

        if ( this._iestdesk.cursoActual != '' ){
            this.nombre_curso = this._iestdesk.cursoActual;
        } else {
            this._iestdesk.cursoActual = this.nombre_curso;
            this._iestdesk.idCursoActual = this.idCurso;
        }
    }

    open(content) {
        this.modalReference = this.modalService.open(content, { backdrop: 'static' });
        this.modalReference.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
    }

    private getDismissReason(reason: any): string {
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return  `with: ${reason}`;
        }
    }

    abrirDialogo(content, idAviso) {
        this._iestdesk.registraAcceso(30, idAviso);
        this._avisos.idAviso = idAviso;
        if ( idAviso != 0 ) this.ngxSmartModalService.getModal('verAviso').close();
        this.modalReference = this.modalService.open(content, {windowClass: 'rounded-lg', backdrop: 'static' });
    }

    cierraDialogoInfo(resp) {
        this.ngxSmartModalService.getModal('dialogoInformacion').close();
    }
}