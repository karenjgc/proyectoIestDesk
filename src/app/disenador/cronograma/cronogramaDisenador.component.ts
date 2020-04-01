import { Component, ChangeDetectorRef, OnInit, Input, OnDestroy } from '@angular/core';

import { Iestdesk } from '../../services/iestdesk.service';
import { Cronograma } from '../../services/cronograma.service';
import { DisenadorService } from '../../services/disenador.service';

import { NgxSmartModalService } from 'ngx-smart-modal';

import * as _moment from 'moment';
import 'moment/locale/es';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AltaTemaComponent } from '../../temario/altaTema.component';

@Component({
    selector: 'idesk-cronograma-disenador',
    templateUrl: './cronogramaDisenador.component.html'
})
export class CronogramaDisenadorComponent implements OnInit, OnDestroy {
    public rolActual: number;
    public fechas = [];
    public fechasSeleccionadas = [];
    public _fechasVista = {};
    public cursoActual;
    public modalidadActual;
    public mostrarOrdenTemas = false;

    public temas = [];
    public cronograma = { };
    public objectKeys = Object.keys;
    public mensaje;
    public tipoRespuesta;
    public modalReference;

    public colores = [
        'blueStone',
        'turquoiseBlue',
        'robin',
        'keppel',
        'powderBlue'
    ]

	public _idCurso: number;
    constructor(
        private iestdesk: Iestdesk,
        private _formBuilder: FormBuilder,
        private _cronograma: Cronograma,
        private _disenador: DisenadorService,
        private _chRef: ChangeDetectorRef,
        private _modalService: NgbModal,
        public _ngxSmartModalService: NgxSmartModalService,
        private router: Router,
        private route: ActivatedRoute
    ){ 
        this.rolActual = this.iestdesk.rolActual;
        this.cursoActual = this.iestdesk.cursoActual;
        this.modalidadActual = this.iestdesk.modalidadActual;
    }

    ngOnInit() {
        this.limpiar();
		//this.cargaCronograma();
    }

    ngOnDestroy(){
        this.limpiar();
    }

	@Input()
    set idCurso( id: number ) {
		console.log(this._idCurso, id);
        if ( this._idCurso != id ){
			this.limpiar();
            this._idCurso = id;
            this.iestdesk.idCursoActual = this._idCurso;
			this.cargaCronograma();
        }
    }

	cargaCronograma(){
        this.limpiar();
		this.temario();
        this.obtieneFechasSeleccionadas();
	}

    temario() {
        this.temas = [];
        let params = {
            servicio: "idesk",
            accion: "IDesk_Maestro_Temario_Cursos_Listado",
            tipoRespuesta: "json",
            idCursos: this._disenador.idCurso
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
        this.fechasSeleccionadas = [];
        let params = {
            servicio: "cronograma",
            accion: "IDesk_Cronograma_Fechas_Seleccionadas",
            tipoRespuesta: "json",
            idCurso: this._disenador.idCurso
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
        this.fechas = [];
        let params = {
            servicio: "cronograma",
            accion: "IDesk_Cronograma_Fechas",
            tipoRespuesta: "json",
            idCurso: this._disenador.idCurso
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
                this.preparaCronograma();
            },
            errors => {
                console.log(errors);
            });
    }

    preparaCronograma() { 
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
        console.log(indice, idFecha);

        if ( Number(this.cronograma[indice][0].fechas[idFecha - 1].parciales) == 0 && Number(this.cronograma[indice][0].fechas[idFecha - 1].festivo) == 0 ) {
            let nuevo: number = 0;
            let valorActual: number = 0;

            valorActual = this.cronograma[indice][0].fechas[idFecha - 1].seleccionado == '' ? 0 : Number(this.cronograma[indice][0].fechas[idFecha - 1].seleccionado);
            valorActual < 4 ? valorActual++ : valorActual = 0;
            this.cronograma[indice][0].fechas[idFecha - 1].seleccionado = valorActual;
            this.cronograma[indice][0].fechas[idFecha - 1].tipoSesion = valorActual == 1 ? 'P' : valorActual == 2 ? 'L' : valorActual == 3 ? 'SP' : valorActual == 4 ? 'V' : ' ';
        }
    }

    guardaCronograma() {
        let guardate = [];

        for ( let valor of Object.keys(this.cronograma) ) {
            for ( let x of this.cronograma[valor][0].fechas ) {
                if ( x.seleccionado != 0 ) {
                    let y = [];
                    y.push(this.cronograma[valor][0].idTema, x.seleccionado, x.fechaGuardado);
                    guardate.push(y.join('|'))
                }
            }
        }

        let params = {
            servicio: "cronograma",
            accion: "IDesk_Maestro_Cronograma_AsignaFechas",
            tipoRespuesta: "json",
            idCurso: this._disenador.idCurso,
            valores: guardate.join("$"),
            idpersonidesk: this.iestdesk.idPerson
        }
        console.log(params);
        this._cronograma.consultas(params)
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

    cierraDialogoInfo(resp) {
        this._ngxSmartModalService.getModal("dialogoInformacion").close();
    }

    tema(idTema) {
        this.modalReference.close();
        this.temario();
        this.preparaCronograma();
    }

	// destruye todo wuuuuu... para poder actualizar
	limpiar(){
        console.log('limpiando ando!');
		this.temas = [];
		this.fechasSeleccionadas = [];
		this.fechas = [];
		for (let prop of Object.getOwnPropertyNames(this._fechasVista)) {
		  delete this._fechasVista[prop];
		}
		for (let prop of Object.getOwnPropertyNames(this.cronograma)) {
		  delete this.cronograma[prop];
		}
	}

    irOrdenTemas(){
        this.mostrarOrdenTemas = true;
    }

    regresarCronograma(){
        this.limpiar();
        this.cargaCronograma();
        this.mostrarOrdenTemas = false;
    }

    nuevoTema() {
        this.modalReference = this._modalService.open(AltaTemaComponent, { backdrop: 'static' });
    }
}