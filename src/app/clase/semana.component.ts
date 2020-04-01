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

@Component({
    selector: 'idesk-semana',
    templateUrl: './semana.component.html'
})
export class SemanaComponent {
    @Output() mesAct = new EventEmitter();
    public rolActual: number;

    public semana = [];
	public mes: string;
	private mesInt: number;
	private diaInt: number;
	public inicioSemana: any;
	public mesActual = [];
	public listadoLun = [];
	public listadoMar = [];
	public listadoMie = [];
	public listadoJue = [];
	public listadoVie = [];
	public listadoSab = [];
	public listadoDom = [];

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
        private route: ActivatedRoute
    ){
        this.rolActual = this._iestdesk.rolActual;
        
        let fechaIni = _moment().startOf('week').format('DD') + '/' + _moment().startOf('week').format('MM') + '/' + _moment().startOf('week').format('YYYY');
        let fechaFin = _moment().endOf('week').format('DD') + '/' + _moment().endOf('week').format('MM') + '/' + _moment().endOf('week').format('YYYY');

        this.obtenSemanaActual();
    }

    obtenSemanaActual(){
        let i: number;
        let finSemana: any;
		let hoy: any;
		hoy = _moment();
		this.mes = hoy.format('MMMM').toUpperCase();
		this.mesInt = hoy.format('MM');
		this.diaInt = hoy.format('DD');

        this.semana = Array.apply(null, Array(7)).map( (_, i) => {
            return _moment(i, 'e').format('DD');
        });

		this.inicioSemana = _moment().startOf('week');
        finSemana = _moment().endOf('week');
        
        this.obtenDatosCalendario( this.inicioSemana.format('DD-MM-gggg'), finSemana.format('DD-MM-gggg') );
   }

    cambiaSemana(tipo: string){
        let nuevoDia: any;
        let finSemana: string;
        let inicioSemana: string;
        let i;

        if(tipo == 'desp')
            nuevoDia = this.inicioSemana.weekday(7);
        else
            nuevoDia = this.inicioSemana.weekday(-7);
		
        inicioSemana = nuevoDia.format('DD-MM-gggg');
        this.mes = nuevoDia.format('MMMM').toUpperCase();
        this.semana = [];
        this.semana.push(nuevoDia.format('DD'));

        for( i = 1; i<=6; i++){
            nuevoDia = nuevoDia.add('1', 'day');
            this.semana.push( nuevoDia.format('DD') );
			if(nuevoDia.format('DD') == this.diaInt  && nuevoDia.format('MM') == this.mesInt)
				this.mes = nuevoDia.format('MMMM').toUpperCase();
        }
		
        finSemana = nuevoDia.endOf('week').format('DD-MM-gggg');
        this.obtenDatosCalendario( inicioSemana, finSemana );
    }

	obtenDatosCalendario(fechaIni, fechaFin){
		let params = {
            servicio: "calendario",
            accion: (this._iestdesk.rolActual == 1) ? "IDesk_Maestro_Calendario" : "IDesk_Alumno_Calendario",
            tipoRespuesta: "json",
			idCurso: this._iestdesk.idCursoActual,
			fechaIni: fechaIni,
			fechaFin: fechaFin
        };
		this._calendario.consultas(params)
			.subscribe( resp => {
				this.limpiaArreglos();
				//console.log(resp);
				for(let i in resp){
					switch(+resp[i].diaSemana){
						case 1:
							this.listadoLun.push({ idActividad: resp[i].idActividad, titulo: resp[i].titulo, tipoActividad: resp[i].tipoActividad, icono: resp[i].icono, tipoActividadClase: resp[i].tipoActividadClase });
						break;
						case 2:
							this.listadoMar.push({ idActividad: resp[i].idActividad, titulo: resp[i].titulo, tipoActividad: resp[i].tipoActividad, icono: resp[i].icono, tipoActividadClase: resp[i].tipoActividadClase });
						break;
						case 3:
							this.listadoMie.push({ idActividad: resp[i].idActividad, titulo: resp[i].titulo, tipoActividad: resp[i].tipoActividad, icono: resp[i].icono, tipoActividadClase: resp[i].tipoActividadClase });
						break;
						case 4:
							this.listadoJue.push({ idActividad: resp[i].idActividad, titulo: resp[i].titulo, tipoActividad: resp[i].tipoActividad, icono: resp[i].icono, tipoActividadClase: resp[i].tipoActividadClase });
						break;
						case 5:
							this.listadoVie.push({ idActividad: resp[i].idActividad, titulo: resp[i].titulo, tipoActividad: resp[i].tipoActividad, icono: resp[i].icono, tipoActividadClase: resp[i].tipoActividadClase });
						break;
						case 6:
							this.listadoSab.push({ idActividad: resp[i].idActividad, titulo: resp[i].titulo, tipoActividad: resp[i].tipoActividad, icono: resp[i].icono, tipoActividadClase: resp[i].tipoActividadClase });
						break;
						case 7:
							this.listadoDom.push({ idActividad: resp[i].idActividad, titulo: resp[i].titulo, tipoActividad: resp[i].tipoActividad, icono: resp[i].icono, tipoActividadClase: resp[i].tipoActividadClase });
						break;
					}
				}
				this.mesAct.emit(this.mes);
			}, errors => {
				console.log(errors);
			});
    }

    irElemento(i){ // idActividad, titulo, tipoActividad ) {
        //console.log('si entro :)', idActividad, titulo, tipoActividad);
		console.clear();
		console.log(i);
        switch(+i.tipoActividad){
            case 1:
                this._tareas.idTarea = i.idActividad;
                this.router.navigate(['/tareas/vista', i.titulo]);
                break;
            case 2:
                this._foroDiscusion.idForoDisc = i.idActividad;
                this.router.navigate(['/foro-discusion/vista']);
                break;
            case 3:
				if( +i.tipoActividadClase == 6 || +i.tipoActividadClase == 7 ) {
					this._actClase.tipoAlta = i.tipoActividadClase == 6 ? 1 : i.tipoActividadClase == 7 ? 2 : 0; 
					this._actClase.idActividad = i.idActividad;
					this.router.navigate(['/actividades-clase/vista/libre']);
				} else {
					this._actClase.idActividad = i.idActividad;
					if(this.rolActual == 1){
						this.router.navigate(['/actividades-clase/maestro-actividad']);
					}else{
						this.router.navigate(['/actividades-clase/alumno-actividad']);
					}
				}
                //console.log('Actividad de clase');
                break;
            case 4:
                // examen
                console.log('Examen');
                break;
            case 5:
                this._videoconf.idVideoconferencia = i.idActividad;
                this.router.navigate(['/videoconferencias/', i.titulo]);
                break;
        }
    }

    limpiaArreglos(){
        this.listadoLun.length = 0;
        this.listadoMar.length = 0;
        this.listadoMie.length = 0;
        this.listadoJue.length = 0;
        this.listadoVie.length = 0;
        this.listadoSab.length = 0;
        this.listadoDom.length = 0;
    }
}

