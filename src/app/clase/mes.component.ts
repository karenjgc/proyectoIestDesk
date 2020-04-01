import { Component, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as $ from 'jquery';
import * as _moment from 'moment';
import 'moment/locale/es';

import { Iestdesk } from '../services/iestdesk.service';
import { Calendario } from '../services/calendario.service';
import { Tareas } from '../services/tareas.service';
import { ForoDiscusion } from '../services/foroDiscusion.service';
import { Examenes } from '../services/examenes.service';
import { ActividadesClase } from '../services/actividadesClase.service';
import { Videoconferencia } from '../services/videoconferencia.service';

import { NgbModule, NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'idesk-mes',
    templateUrl: './mes.component.html'
})
export class MesComponent {
	@Output() mesAct = new EventEmitter();
    //public mes: string;
    public rolActual: number;
    public actual: number;
    public calendar = [];
    public actividades = [];
    public actDia = [];
	public mes: string;
	public nuevoMes: any = _moment().startOf('month');
	public inicioMes: any;
    
    closeResult: string;
    public modalReference: any;

    constructor(
        private _iestdesk: Iestdesk,
        private _calendario: Calendario,
		private _tareas: Tareas,
		private _examenes: Examenes,
		private _foroDiscusion: ForoDiscusion,
		private _actClase: ActividadesClase,
        private _videoconf: Videoconferencia,
        private chRef: ChangeDetectorRef,
        private router: Router,
        private modalService: NgbModal,
        private route: ActivatedRoute
    ){  
        this.rolActual = this._iestdesk.rolActual;
		this._calendario.rol = this.rolActual;
        this.actual = Number(_moment().format('MM'));
		this.inicioMes = _moment().startOf('month');
		this.obtenMesActual();
    }

    cambiaMes(tipo: string){
        let fechaIni: string;
        let fechaFin: string;

        if(tipo == 'desp')
			this.nuevoMes = this.inicioMes.add(1, 'months');
		else
			this.nuevoMes = this.inicioMes.subtract(1, 'months');

		fechaIni = this.nuevoMes.startOf('month').format('DD') + '/' + this.nuevoMes.startOf('month').format('MM') + '/' + this.nuevoMes.startOf('month').format('YYYY');
		fechaFin = this.nuevoMes.endOf('month').format('DD') + '/' + this.nuevoMes.endOf('month').format('MM') + '/' + this.nuevoMes.endOf('month').format('YYYY')

		this.actual = Number(this.nuevoMes.format('MM'));
		this.mes = this.nuevoMes.format('MMMM').toUpperCase();
		this.calendarioPersonal(fechaIni, fechaFin);
    }

    obtenMesActual() {
        let fechaIni = _moment().startOf('month').format('DD') + '/' + _moment().startOf('month').format('MM') + '/' + _moment().startOf('month').format('YYYY');
        let fechaFin = _moment().endOf('month').format('DD') + '/' + _moment().endOf('month').format('MM') + '/' + _moment().endOf('month').format('YYYY');

		this.mes = _moment().format('MMMM').toUpperCase();
		this.calendarioPersonal(fechaIni, fechaFin);
    }

	calendarioPersonal(fechaIni, fechaFin){
		this.calendar = [];
		let params = {
            servicio: "calendario",
            accion: (this._iestdesk.rolActual == 1) ? "IDesk_Maestro_Calendario" : "IDesk_Alumno_Calendario",
			tipoRespuesta: "json",
			idCurso: this._iestdesk.idCursoActual,
			fechaIni: fechaIni,
			fechaFin: fechaFin
        };
		this._calendario.consultas(params)
			.subscribe(resp => {
				this.actividades = resp;
				this.chRef.detectChanges();
				let startWeek;// = this.nuevoMes.startOf('month').week();
				let endWeek; // = this.nuevoMes.endOf('month').week();
				let semanitaAntes = 0; 
				let fechaAntes: any;// agrega semana cuando el año inicia en la semana 52
				let fechaDespues: any;
				let semanitaDespues = 0; // agrega semana cuando el año termina en la semana 1
				let thisYear = this.nuevoMes.year();
				//console.log(thisYear);
				//console.log(resp);

				if ( this.nuevoMes.startOf('month').week() >= 52) { // enero
					startWeek = 1;
					fechaAntes = this.nuevoMes.clone().subtract(1, 'months').endOf('month');
					semanitaAntes = fechaAntes.weeksInYear(); //52;
				} else
					startWeek = this.nuevoMes.startOf('month').week();

				if ( this.nuevoMes.endOf('month').week() == 1) { // diciembre
					endWeek = this.nuevoMes.weeksInYear(); //52;
					semanitaDespues = 1;
					fechaDespues = this.nuevoMes.clone().add(1, 'months');
				} else
					endWeek = this.nuevoMes.endOf('month').week();

				if ( semanitaAntes != 0 ) {
					this.calendar.push({
						week: semanitaAntes,
						days: Array(7).fill(0).map((n, i) => [
							fechaAntes.week(semanitaAntes).startOf('week').clone().add(n + i, 'day').format('DD'), fechaAntes.week(semanitaAntes).startOf('week').clone().add(n + i, 'day').format('MM'), this.actividades.filter(a => a.diaMes == fechaAntes.week(semanitaAntes).startOf('week').clone().add(n + i, 'day').format('DD') && a.mes == fechaAntes.week(semanitaAntes).startOf('week').clone().add(n + i, 'day').format('MM') )
						])
					});
					this.nuevoMes = fechaAntes.add(1, 'weeks');
				} else
					this.nuevoMes = this.nuevoMes.startOf('month');

				for( var week = startWeek; week <= endWeek; week++ ) {
					this.calendar.push({
						week:week,
						days: Array(7).fill(0).map((n, i) => [
							this.nuevoMes.clone().year(thisYear).week(week).startOf('week').add(n + i, 'day').format('DD'), this.nuevoMes.clone().year(thisYear).week(week).startOf('week').add(n + i, 'day').format('MM'), this.actividades.filter(a => a.diaMes == this.nuevoMes.clone().year(thisYear).week(week).startOf('week').add(n + i, 'day').format('DD') && a.mes == this.nuevoMes.clone().year(thisYear).week(week).startOf('week').add(n + i, 'day').format('MM') )							//mesExtra.week(week).startOf('week').clone().add(n + i, 'day').format('DD'), mesExtra.week(week).startOf('week').clone().add(n + i, 'day').format('MM'), this.actividades.filter(a => a.diaMes == mesExtra.week(week).startOf('week').clone().add(n + i, 'day').format('DD') && a.mes == mesExtra.week(week).startOf('week').clone().add(n + i, 'day').format('MM') )
						])
					})
				}
				
				if ( semanitaDespues == 1 ) {
					this.calendar.push({
						week: semanitaDespues,
						days: Array(7).fill(0).map((n, i) => [
							fechaDespues.week(semanitaDespues).startOf('week').clone().add(n + i, 'day').format('DD'), fechaDespues.week(semanitaDespues).startOf('week').clone().add(n + i, 'day').format('MM'), this.actividades.filter(a => a.diaMes == fechaDespues.week(semanitaDespues).startOf('week').clone().add(n + i, 'day').format('DD') && a.mes == fechaDespues.week(semanitaDespues).startOf('week').clone().add(n + i, 'day').format('MM') )
						])
					})
				}

				this.mesAct.emit(this.mes);
				//console.log(JSON.stringify(this.calendar));
			}, errors => {
				console.log(errors);
			});

	}

    verDia(actividades, content) {
        //console.log(JSON.stringify(actividades), actividades);
        this.actDia = actividades;
        this.modalReference = this.modalService.open(content, { size: 'sm' });
    }

    irElemento( i ) {
        this.modalReference.close();
        //console.log('si entro :)', idActividad, titulo, tipoActividad);
		console.log(i);
        switch(i.tipoActividad){
            case '1':
                this._tareas.idTarea = i.idActividad;
                this.router.navigate(['/tareas/vista', i.titulo]);
                break;
            case '2':
                this._foroDiscusion.idForoDisc = i.idActividad;
                this.router.navigate(['/foro-discusion/vista']);
                break;
            case '3':
                if( +i.tipoActividadClase == 6 || +i.tipoActividadClase == 7 ) {
					this._actClase.tipoAlta = i.tipoActividadClase == 6 ? 1 : i.tipoActividadClase == 7 ? 2 : 0; 
					this._actClase.idActividad = i.idActividad;
					this.router.navigate(['/actividades-clase/vista/libre']);
				} else {
					this._actClase.idActividad = i.idActividad;
					/*this._actClase.actividadClase = {
						idTipoActividad: elemento.idTipoActividad,
						tipoActividad: this.tiposActividad[elemento.idTipoActividad]
					}*/
					if(this.rolActual == 1){
						this.router.navigate(['/actividades-clase/maestro-actividad']);
					}else{
						this.router.navigate(['/actividades-clase/alumno-actividad']);
					}
				}
                break;
            case '4':
                // examen
                console.log('Examen');
                break;
			case '5':
				this._videoconf.idVideoconferencia = i.idActividad;
				this.router.navigate(['/videoconferencias/', i.titulo]);
				break;
        }
    }
}