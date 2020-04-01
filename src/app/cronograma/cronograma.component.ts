import { Component, ChangeDetectorRef, OnInit, Input } from '@angular/core';

import { Iestdesk } from '../services/iestdesk.service';
import { Cronograma } from '../services/cronograma.service';

import { NgxSmartModalService } from 'ngx-smart-modal';

import * as _moment from 'moment';
import 'moment/locale/es';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AltaTemaComponent } from '../temario/altaTema.component';
import { AltasBase } from '../shared/classes/altasBase';
import { Apuntes } from '../services/apuntes.service';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'idesk-cronograma',
    templateUrl: './cronograma.component.html'
})
export class CronogramaComponent extends AltasBase implements OnInit {
    
    @Input() modoTemario;

    public rolActual: number;
    public fechas = [];
    public fechasSeleccionadas = [];
    public _fechasVista = {};
    public cursoActual;
    public modalidadActual;

    public temas = [];
    public cronograma = { };
    public objectKeys = Object.keys;
    public mensaje;
    public tipoRespuesta;
    public modalReference;

    public mostrarOrdenTemas: boolean = false;

    public colores = [
        'blueStone',
        'turquoiseBlue',
        'robin',
        'keppel',
        'powderBlue'
    ]

    constructor(
        public iestdesk: Iestdesk,
        private _apuntes: Apuntes,
        private _formBuilder: FormBuilder,
        public _cronograma: Cronograma,
        private _chRef: ChangeDetectorRef,
        private _modalService: NgbModal,
        public _ngxSmartModalService: NgxSmartModalService,
        private router: Router,
        private route: ActivatedRoute
    ){ 
        super(iestdesk,
            null,
            null,
            _formBuilder,
            _chRef,
            _modalService,
            _ngxSmartModalService,        
            router);

        this.rolActual = this.iestdesk.rolActual;
        this.cursoActual = this.iestdesk.cursoActual;
        this.modalidadActual = this.iestdesk.modalidadActual;
        //this._cronograma.modoTemario = false;
    }

    ngOnInit() {
		this.iestdesk.registraAcceso(15, 0);
        this.temario();
        this.obtieneFechasSeleccionadas();
        //console.log(this.modalidadActual);
    }

    temario() {
        let params = {
            servicio: "idesk",
            accion: "IDesk_Maestro_Temario_Cursos_Listado",
            tipoRespuesta: "json",
            idCursos: this.iestdesk.idCursoActual
        };

        this.iestdesk.consultas(params)
            .subscribe( resp => {
                this.temas = resp;
            },
            errors => {
                console.log(errors);
            });
    }

    obtieneFechasSeleccionadas(){
        let params = {
            servicio: "cronograma",
            accion: "IDesk_Cronograma_Fechas_Seleccionadas",
            tipoRespuesta: "json",
            idCurso: this.iestdesk.idCursoActual
        };
        this._cronograma.consultas(params) 
            .subscribe(resp => {
                this.fechasSeleccionadas = resp;
                this.obtieneFechas();
            },
            errors => {
                console.log(errors);
            });
    }

    obtieneFechas() {
        let params = {
            servicio: "cronograma",
            accion: "IDesk_Cronograma_Fechas",
            tipoRespuesta: "json",
            idCurso: this.iestdesk.idCursoActual
        };
        this._cronograma.consultas(params)
            .subscribe(resp => {
                this.fechas = resp;

                let semanaAnterior = 0;
                let semana = 0;
                for ( let fecha of resp ) {
                    let x = _moment(fecha.fechaISO);
                    let mes =  x.format('MMM').toUpperCase().split('.').join("");
                    
                    if( !this._fechasVista.hasOwnProperty(mes) ) {
                        this._fechasVista[mes] = [];
                    }

                    if ( semanaAnterior != x.week() ) {
                        semanaAnterior = x.week();
                        semana = semana == 0 ? 1 : 0;
                    }

                    this._fechasVista[mes].push({
                        dia: x.date(),
                        semana: semana
                    });
                }

                console.log('fechasVista', this._fechasVista);
                this.preparaCronograma();
            },
            errors => {
                console.log(errors);
            });
    }

    preparaCronograma() { 
        this.cronograma = { };
        let contador = 0;
        for ( let tema of this.temas ) {
            let color;
            let x: number = 0;
            let f = [];
            if ( !this.cronograma.hasOwnProperty(tema.idTema) ) {
                this.cronograma[tema.idTema] = [];
                contador < 4 ? contador++ : contador = 0;
                //let x = Math.floor(Math.random() * this.colores.length);
                color = this.colores[contador];
                //this.colores.splice(x, 1);
            }

            for ( let fecha of this.fechas ) {
                let index: number = this.fechasSeleccionadas.findIndex(x => x.fechaISO == fecha.fechaISO && x.idTema == tema.idTema);
                let tmp: number;
                let s = this.fechasSeleccionadas.find( x => x.fechaISO == fecha.fechaISO && x.idTema == tema.idTema ) ? this.fechasSeleccionadas[this.fechasSeleccionadas.findIndex(x => x.fechaISO == fecha.fechaISO && x.idTema == tema.idTema)].seleccionado : 0;

                //console.log(this.fechasSeleccionadas[this.fechasSeleccionadas.findIndex(x => x.fechaISO == fecha.fechaISO && x.idTema == tema.idTema)]);
                tmp = ( (x + 1) < this.fechas.length ) ? this.fechas[x + 1].parciales : 0;
                
                f.push({
                    id: fecha.id,
                    fechaISO: fecha.fechaISO,
                    fechaGuardado: fecha.fechaGuardado,
                    festivo: fecha.festivo,
                    parciales: fecha.parciales,
                    hoy: _moment(fecha.fechaISO).format('MMMM Do YYYY') == _moment().format('MMMM Do YYYY') ? 1 : 0,
                    seleccionado: s,
                    tipoSesion: tmp > 0 && +s > 0 ? 'P' : (+s == 1 ? 'P' : +s == 2 ? 'L' : +s == 3 ? 'SP' : +s == 4 ? 'V' : '')
                });
                x++;
            } 

            this.cronograma[tema.idTema].push({
                tema: tema.tema,
                idTema: tema.idTema,
                color: color,
                fechas: JSON.parse(JSON.stringify( f ))
            });
        }
        //console.log(this.cronograma);
    }

    selecciona(indice, idFecha) {
        console.log('indice ', indice, ' idfecha ', idFecha);
        let tmpIni: number = 0, tmpFin: number = 0;
        let fechaIni: number = 0, fechaFin: number = 0
        if ( this.rolActual == 1 && this.modalidadActual == 1 ) {
            for ( let crono of this.cronograma[indice][0].fechas ) {
                if ( crono.seleccionado == 1 ) {
                    if ( tmpIni == 0 ) { 
                       tmpIni = crono.id; 
                    }
                    tmpFin = +crono.id > +tmpFin ? +crono.id : +tmpFin;
                }
            }

            //console.log('tmp Ini ', tmpIni, ' tmp Fin', tmpFin);
            fechaIni = +tmpIni != 0 ? ( +tmpIni > +idFecha ? +idFecha : +tmpIni ) : +idFecha;
            fechaFin = +tmpFin == +idFecha ? (+idFecha - 1) : (+tmpIni < +idFecha ? +idFecha : +tmpFin); 
            //console.log('inicio ', fechaIni, 'fin',  fechaFin);
            
            if( ( ( tmpIni == idFecha ) || ( tmpFin == idFecha ) ) ) {
                this.cronograma[indice][0].fechas[idFecha - 1].seleccionado = 0;
            } else {
                for ( let crono of this.cronograma[indice][0].fechas ) {
                    let x = +crono.id >= +fechaIni && +crono.id <= +fechaFin ? 1 : 0;
                    this.cronograma[indice][0].fechas[crono.id - 1].seleccionado = x;
                }
            }
        }
    }

    guardaCronograma() {
        let guardate = [];

        for ( let valor of Object.keys(this.cronograma) ) {
            for ( let x of this.cronograma[valor][0].fechas ) {
                if ( x.seleccionado == 1 ) {
                    let y = [];
                    y.push(this.cronograma[valor][0].idTema, 1, x.fechaGuardado);
                    guardate.push(y.join('|'))
                }
            }
        }

        let params = {
            servicio: "cronograma",
            accion: "IDesk_Maestro_Cronograma_AsignaFechas",
            tipoRespuesta: "json",
            idCurso: this.iestdesk.idCursoActual,
            valores: guardate.join("$"),
            idpersonidesk: this.iestdesk.idPerson
        }
        //console.log(params);
        this._cronograma.consultas(params)
            .subscribe(resp => {
                this.mensaje = resp[0].mensaje;
                if(resp[0].error == 0){
                    this.tipoRespuesta = 1;
                } else {
                    this.tipoRespuesta = 2;
                }
                
                this.ngxSmartModalService.getModal('dialogoInformacion').open();
            },
            errors => {
                console.log(errors);
            });
    }

    cierraDialogoInfo(resp) {
        this.ngxSmartModalService.getModal("dialogoInformacion").close();
    }

    irOrdenTemas(){
        this.mostrarOrdenTemas = true;
    }

    regresarCronograma() {
        this.temario();
        this.preparaCronograma();
        this.mostrarOrdenTemas = false;
    }

    nuevoTema() {
        this.modalReference = this._modalService.open( AltaTemaComponent, { backdrop: 'static' });
    }
}