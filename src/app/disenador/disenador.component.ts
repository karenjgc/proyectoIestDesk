import { Component, ViewChild, OnInit } from '@angular/core';
import { Iestdesk } from '../services/iestdesk.service';
import { DisenadorService } from '../services/disenador.service';

import { NgxSmartModalService } from 'ngx-smart-modal';
import { DatepickerOptions } from '../shared/classes/datepicker';
import { DateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { MomentDateTimeAdapter } from 'ng-pick-datetime-moment';
import * as _moment from 'moment';
import 'moment/locale/es';
import * as XLSX from 'xlsx';

import { CronogramaDisenadorComponent } from './cronograma/cronogramaDisenador.component';
import { SupervisionComponent } from './supervision/supervision.component';
import { ReporteContenidoComponent } from './reportes/contenido.component';
import { ReporteInteraccionElementoMaestroComponent } from './reportes/interaccionElementoMaestro.component';
import { ReporteAvanceComponent } from './reportes/reporteAvance.component';
import { ReporteIngresoCierreComponent } from './reportes/ingresoCierre.component';
import { ReporteInteraccionElementoAlumnoComponent } from './reportes/interaccionElementoAlumno.component';

export const MY_CUSTOM_FORMATS = {
    parseInput: 'DD/MM/YY HH:mm',
    fullPickerInput: 'DD/MM/YY HH:mm',
    datePickerInput: 'DD/MM/YY',
    timePickerInput: 'HH:mm',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
};

@Component({
    selector: 'idesk-disenador',
    templateUrl: './disenador.component.html',
	providers: [
        {provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE]},
        {provide: OWL_DATE_TIME_FORMATS, useValue: MY_CUSTOM_FORMATS},
    ]
})

export class DisenadorComponent implements OnInit {
	public ObjectKeys = Object.keys;
    public rolActual: number = 0;
	
	public opcDatePicker = new DatepickerOptions();
    public startAt: any = this.opcDatePicker.setStartAt();
	
    public cursos = [];
	public cursoActual;
	public nombreMaterias;
	public reportes = {};
	public periodos;
	public tipoCursos;
	public semanas = [];
	public fechas: number = 0;
	public tipoCursoSeleccionado: number = 0;
	public vista;

	public modalidadSeleccionada: number = 0;
	public gradoSeleccionado: number = 0;

    public elementoEliminar: string;
    public idaEliminar: number;

    public mensaje: string;
    public tipoRespuesta: number;
	public fechaInicio;
	public fechaFin;
	public tipoReporte: number = 0;
	public oculto = false;
	public todoSeleccionado: boolean = false;
	public cursosSeleccionados = [];

	@ViewChild(CronogramaDisenadorComponent) cronograma: CronogramaDisenadorComponent;
	@ViewChild(SupervisionComponent) supervision: SupervisionComponent;
	@ViewChild(ReporteContenidoComponent) contenido: ReporteContenidoComponent;
	@ViewChild(ReporteInteraccionElementoMaestroComponent) interaccionMaestro: ReporteInteraccionElementoMaestroComponent;
	@ViewChild(ReporteInteraccionElementoAlumnoComponent) interaccionAlumno: ReporteInteraccionElementoAlumnoComponent;
	@ViewChild(ReporteAvanceComponent) avanceTema: ReporteAvanceComponent;
	@ViewChild(ReporteIngresoCierreComponent) ingresoCierre: ReporteIngresoCierreComponent;

    constructor(
        private _iestdesk: Iestdesk,
        public _disenador: DisenadorService,
        public ngxSmartModalService: NgxSmartModalService
    ){
        this.rolActual = this._iestdesk.rolActual;
		
	}
	
	ngOnInit() {
		this.listadoPeriodos();
		this.listadoTipoCurso();
		this.listadoReportes();
	}

	private listadoPeriodos(){
		let params = {
			servicio: "disenador",
			accion: "IDesk_Periodos",
			tipoRespuesta: "json"
		};
		this._disenador.consultas(params)
			.subscribe( resp => {
				this.periodos = resp;
				this._disenador.periodoSeleccionado = 90;
				console.log(resp);

				this.listadoSemanas();

				this.listadoCursos();
			},
			errors => {
				console.log(errors);
			});
	}

	private listadoTipoCurso(){
		let params = {
			servicio: "disenador",
			accion: "IDesk_Disenador_TipoCurso",
			tipoRespuesta: "json"
		};
		this._disenador.consultas(params)
			.subscribe( resp => {
				this.tipoCursos = resp;
			},
			errors => {
				console.log(errors);
			});
	}

	private listadoReportes(){
		let params = {
			servicio: "disenador",
			accion: "IDesk_Disenador_Reportes",
			tipoRespuesta: "json"
		};
		this._disenador.consultas(params)
			.subscribe( resp => {
				for(let i in resp){
					if ( resp[i].dependeDe == 0 ){
						if (!this.reportes.hasOwnProperty(resp[i].idReporte)) {
							this.reportes[resp[i].idReporte] = {};
							this.reportes[resp[i].idReporte].reporte = resp[i].reporte;
						}
					} else {
						if (this.reportes.hasOwnProperty(resp[i].dependeDe)) {
							if(!this.reportes[resp[i].dependeDe].hasOwnProperty('hijos'))
								this.reportes[resp[i].dependeDe].hijos = {};
							if (!this.reportes[resp[i].dependeDe].hijos.hasOwnProperty(resp[i].idReporte)) {
								this.reportes[resp[i].dependeDe].hijos[resp[i].idReporte] = {};
								this.reportes[resp[i].dependeDe].hijos[resp[i].idReporte].reporte = resp[i].reporte;
							}
						}
					}
				}
				//console.log(this.reportes);
			},
			errors => {
				console.log(errors);
			});
	}

	private listadoSemanas() {
		this.semanas = [];

		let params = {
            servicio: "disenador",
            accion: "IDesk_Disenador_SemanasSemestre",
            tipoRespuesta: "json",
			idPeriodo: this._disenador.periodoSeleccionado
		};
		
		this._disenador.consultas(params)
            .subscribe(resp => {
				this.semanas = resp;
				this._disenador.fechasSemana = resp[0].valor;
				this._disenador.semanaSeleccionada = resp[0].texto;
			},
            errors => {
                console.log(errors);
            });
	}

    listadoCursos(e = null) {
		this._disenador.tipoCursoSeleccionado = this.tipoCursoSeleccionado;

		let tmp = (e) ? e : 90;
		if ( tmp != this._disenador.periodoSeleccionado ) {
			this._disenador.periodoSeleccionado = tmp;
			this.listadoSemanas;
			this.obtenFechasDefault(tmp);
			console.log(this._disenador.periodoSeleccionado);
		}

		this.cursos = [];
        let params = {
            servicio: "disenador",
            accion: "IDesk_Disenador_ListadoCursos",
            tipoRespuesta: "json",
			idPeriodo: (e) ? e : 90,
			modalidad: this.modalidadSeleccionada,
			grado: this.gradoSeleccionado,
			tipoC: this.tipoCursoSeleccionado
        };

        this._disenador.consultas(params)
            .subscribe(resp => {
				for(let c of resp){
					if(!c.hasOwnProperty('seleccionado'))
						c.seleccionado = false;
					this.cursos.push(c);
				}
				this.verificaMarcados();
				console.log(this.cursos);
            },
            errors => {
                console.log(errors);
            });
    }

	obtenFechasDefault(e = null){
		this._disenador.periodo = this.periodos.find( x => x.idPeriodo == (e ? e.target.value : 90));
		if(this._disenador.periodo != undefined){
			this.fechaInicio = new Date(this._disenador.periodo.IniPeriodo);
			this.fechaFin = new Date(this._disenador.periodo.FinPeriodo);
			this._disenador.rangoFechas = [ new Date(this.fechaInicio), new Date(this.fechaFin) ];
		}
	}

	vistaActual(e){
		this.vista = e;
		let verifica = 0;
		if(e == 2){
			for ( let i in this.cursos ) {
				if ( this.cursos[i].seleccionado && verifica == 0 ) {
					this.cursos[i].seleccionado = true;
					verifica = 1;
				} else {
					this.cursos[i].seleccionado = false;
				}
			}
		} else {
			this.verificaMarcados();
		}
	}

	toggleMaterias() {
		this.oculto = !this.oculto;
	}

	cambiaFechas(rango) {
		this.fechas++;
		if ( this.vista == 3 && this.tipoCursoSeleccionado != 2 ) {
			this._disenador.semanaSeleccionada = this.semanas[this.semanas.findIndex(x => x.valor == rango)].texto;
		} else {
			this._disenador.fechasSemana = _moment(this._disenador.rangoFechas[0]).format("DD/MM/YY HH:mm") + '|' + _moment(this._disenador.rangoFechas[1]).format("DD/MM/YY HH:mm");
		}
	} 

	marcarTodo() {
		let nombreMaterias = '';
		this.cursoActual = '';
		this.cursosSeleccionados = [];
		this._disenador.nombreCursos = {};
		for(let c of this.cursos){
			if(c.hasOwnProperty('seleccionado')){
				c.seleccionado = this.todoSeleccionado;
				this.cursoActual += c.idCurso+'|';
				this.cursosSeleccionados.push(c.idCurso);
				this._disenador.nombreCursos[c.idCurso] = c.materia +' '+ c.clave + ' - ' + c.maestro;
				nombreMaterias += c.materia+' '+ c.clave +'|';
			}
		}
		this._disenador.procesaNombres(nombreMaterias); 
		if ( !this.todoSeleccionado ) {
			this.cursosSeleccionados = [];
			this._disenador.nombreCursos = {};
			nombreMaterias = '';
			this.cursoActual = '';
		}
		console.log(this.cursosSeleccionados.join('|'));
		console.log('marcatodo\n', this._disenador.nombreMaterias);
	}

	verificaMarcados(){
		let verifica = 1, nombreMaterias = '';
		this.cursoActual = '';
		this.cursosSeleccionados = [];
		this._disenador.nombreCursos = {};
		if(this.cursos.length == 0){
			verifica = 0;
		} else {
			for(let c of this.cursos){
				if(c.hasOwnProperty('seleccionado')){
					if(!c.seleccionado){
						verifica = 0;
					} else {
						this.cursoActual += c.idCurso+'|';
						this.cursosSeleccionados.push(c.idCurso);
						this._disenador.nombreCursos[c.idCurso] = c.materia +' '+ c.clave + ' - ' + c.maestro;
						nombreMaterias += c.materia+' '+ c.clave +'|';
					}
				}
			}
		}
		this._disenador.procesaNombres(nombreMaterias);
		console.log(this.cursoActual);
		console.log(this.cursosSeleccionados.join('|'));
		console.log('verifica\n', this._disenador.nombreMaterias);
		this.todoSeleccionado = (verifica == 0) ? false : true;
	}

    gotoCronograma(idCurso: number, nombreCurso: string){
		this.cronograma.limpiar();
        this._disenador.idCurso = idCurso;
        this._disenador.nombreCurso = nombreCurso;
		this.cursoActual = idCurso;
		for(let c of this.cursos){
			c.seleccionado = (c.idCurso == idCurso);
		}
    }

	mostrarReporte() {
		switch (+this.tipoReporte) {
			case 1:
				this.contenido.cargaReporte();
				break;
			case 13:
				this.interaccionMaestro.cargaReporte();
				break;
			case 14:
				this.avanceTema.cargaReporte();
				break;
			case 15:
				this.ingresoCierre.cargaReporte();
				break;
			case 16:
				this.interaccionAlumno.cargaReporte();
				break;
		}
	}
	
	exportarExcel() {
		let x;
		let ws: XLSX.WorkSheet;
		switch (+this.tipoReporte) {
			case 1:
				ws = XLSX.utils.table_to_sheet(this.contenido.table.nativeElement);
				break;
			case 13:
				ws = XLSX.utils.table_to_sheet(this.interaccionMaestro.table1.nativeElement);
				break;
		}

		
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Supervision');
        
        XLSX.writeFile(wb, 'Reporte_supervision.xlsx');
	}

    cierraDialogoInfo(resp) {
        this.ngxSmartModalService.getModal('dialogoInformacion').close();
       
	}
}