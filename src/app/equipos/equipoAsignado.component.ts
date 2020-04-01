import { Component, Output, Input, ChangeDetectorRef, EventEmitter } from '@angular/core';
import { Validators, FormBuilder, FormGroup} from '@angular/forms';

import { Iestdesk } from '../services/iestdesk.service';
import { Equipos } from '../services/equipos.service';

import { NgxSmartModalService } from 'ngx-smart-modal';
import * as _moment from 'moment';
import 'moment/locale/es';

@Component({
    selector: 'idesk-equipoAsignado',
    templateUrl: './equipoAsignado.component.html'
})
//https://www.npmjs.com/package/ng-drag-drop
//https://github.com/valor-software/ng2-dragula

export class EquipoAsignadoComponent {
    @Output() estaCerrado = new EventEmitter();
	@Input() idPlantillaSolicitada: number;

    public alumnos = [];
    public alumnosU = [];
    public tipo: number = 0;
    public opciones: FormGroup;
    public equipo: FormGroup;
    
    public mensaje: string;
    public tipoRespuesta: number;
	public equipoNuevo: number = 1;
	public idPlantillaEquipo: number = 0;
	public mostrarListado: boolean = false;
	public editando: number = 0;
	public verNombrePlantilla: boolean = false;
	public tituloPlantilla: string;
	public editaPlantilla: boolean = false;
	public mostrarReutilizar: boolean = false;

    constructor(
        private _iestdesk: Iestdesk,
        private _equipos: Equipos,
        private chRef: ChangeDetectorRef,
        public ngxSmartModalService: NgxSmartModalService,
        private formBuilder: FormBuilder
    ){
    }

	ngOnInit(){
		this.tipo = this._equipos.tipo;

        this.equipo = this.formBuilder.group({
            idCurso: this._equipos.idCursoSolicitado,
            nombrePlantilla: '', //'Equipos del '+this.hoy, //'',
            nombreEquipos: ['', Validators.required], 
            numEquipo: ['', Validators.required],
            integrantes: ['', Validators.required],
            idpersonidesk: this._iestdesk.idPerson 
        });
		if(this.idPlantillaSolicitada > 0){
			this.editaPlantilla = true;
			this.obtenEquiposDePlantilla();
		} else {
			this.tituloPlantilla = 'Equipos del '+_moment().format('DD-MMM-YYYY'); //'Equipos del '+this.hoy //this.hoy = _moment().format('DD-MMM-YYYY');
			let params = {
				servicio: "equipos",
				accion: "IDesk_Obtiene_IntegrantesCurso",
				tipoRespuesta: "json",
				idCurso: String(this._equipos.idCursoSolicitado)
			};
			console.log('paramsAsignado', params);
			this._equipos.consultas(params)
				.subscribe( resp => {
					for(let i = 0; i < resp.length; i++){
						resp[i].numEquipo = 0;
						resp[i].equipo = '';
					}
					this.alumnosU = resp;
					this.mostrarListado = true;
					this.equipo.patchValue({ nombrePlantilla: this.tituloPlantilla });
					//console.clear();
					console.log(this.alumnosU);
				}, errors => {
					console.log(errors);
				});
		}
	}

	private obtenEquiposDePlantilla(){ //cb-
		let params = {
			servicio: "equipos",
			accion: "IDesk_Equipos_Consulta",
			tipoRespuesta: "json",
			idPlantillaEquipo: this.idPlantillaSolicitada
		};
		this._equipos.consultas(params)
			.subscribe( resp => {
				console.log(resp);
				this.alumnosU = resp;
				this.tituloPlantilla = resp[0].nombrePlantilla;
				this.equipo.patchValue({ nombrePlantilla: this.tituloPlantilla });
				this.acomodarEquipos(resp);
				this.mostrarListado = false;
			}, errors => {
				console.log(errors);
			});
	}

    private acomodarEquipos(resp) {
        this.alumnos = [];
		let max: number = 0;
		let min: number = 1;
        for(let i = 0; i < resp.length; i++) {
            if( !this.alumnos.find(x => x.numEquipo == resp[i].numEquipo) ){
                if(resp[i].numEquipo != 0){
					this.alumnos.push({
						numEquipo:  resp[i].numEquipo,
						alumnos: resp.filter(y => y.numEquipo == resp[i].numEquipo),
						equipo: resp[i].equipo
					});
				}
            }
			min = ( resp[i].numEquipo < min ) ? resp[i].numEquipo : min;
			max = ( resp[i].numEquipo > max ) ? resp[i].numEquipo : max;
        }
		this.mostrarListado = (min == 0) ? true : false;
		this.equipoNuevo = ++max;
    }

    onItemDrop(numEquipo, equipo, idPersonAlumno, e: any = null) { //cb
		let z = 0;
		equipo = equipo || 'Equipo '+numEquipo;
		z = this.alumnosU.findIndex(x => x.idPerson == ((idPersonAlumno == 0) ? e.dragData : idPersonAlumno) );
		this.alumnosU[z].numEquipo = numEquipo;
		this.alumnosU[z].equipo = equipo;
		this.acomodarEquipos(this.alumnosU.sort(function (a, b) {
			if (a.numEquipo > b.numEquipo) {
			  return 1;
			}
			if (a.numEquipo < b.numEquipo) {
			  return -1;
			}
			return 0;
		  }) );
    }
	
	public muestraInputNombre(numEquipo){ //cb
		this.editando = numEquipo;
	}

	public actualizaNombreEquipo(numEquipo, inputNombre){ //cb
		let equipo = (<HTMLInputElement>document.getElementById(inputNombre)).value.trim();
		let cambiaNombre: boolean = true;
		for(let i = 0; i < this.alumnos.length; i++) {
			if(this.alumnos[i].numEquipo != numEquipo && this.alumnos[i].equipo == equipo && this.alumnos[i].equipo != ''){
				cambiaNombre = false;
				continue;
			}
		}

		if(cambiaNombre){
			for(let i = 0; i < this.alumnos.length; i++) {
				if(this.alumnos[i].numEquipo == numEquipo)
					this.alumnos[i].equipo = equipo;
			}
			for(let i = 0; i < this.alumnosU.length; i++) {
				if(this.alumnosU[i].numEquipo == numEquipo)
					this.alumnosU[i].equipo = equipo;
			}
			this.editando = 0;
		} else {
			this.mensaje = 'No puede haber dos equipos con el mismo nombre';
			this.tipoRespuesta = 2;
			this.ngxSmartModalService.getModal('dialogoInformacionA').open();
			this.editando = numEquipo;
		}
	}

	public validaEquipos(){
		if(this.alumnosU.find( x => x.numEquipo == 0)){
			this.mensaje = 'Aún hay alumnos sin equipo';
			this.tipoRespuesta = 2;
            this.ngxSmartModalService.getModal('dialogoInformacionA').open();
		} else
			this.acomodaValores();
	}

	private acomodaValores() { //cb-
		this.verNombrePlantilla = true;
        let equipos = [];
        let aa = [];
        let b = [];
        let listaIntegrantes = '';
		let listaNumeroEq = '';
		let listaNombreEq = '';
		let equipoTemp = [];
		let nombreEquipo = [];
		
        for ( let i = 0; i < this.alumnosU.length; i++ ) {
            if(!equipos.find(x => x == this.alumnosU[i].numEquipo)){
                equipos.push(this.alumnosU[i].numEquipo);
				nombreEquipo.push(this.alumnosU[i].equipo);
            }
        }
		listaNumeroEq = equipos.join('|');
		listaNombreEq = nombreEquipo.join('|');

        for ( let j = 0; j < equipos.length; j++ ) {
			equipoTemp = this.alumnosU.filter(a => a.numEquipo == equipos[j] );
            for ( let k = 0; k < equipoTemp.length; k++ ){
                aa.push(equipoTemp[k].idPerson);
            } 
			equipoTemp = [];
            b.push( aa.join('|') );
            aa = [];
        }
        listaIntegrantes = b.join('$');
		this.equipo.patchValue({ integrantes: listaIntegrantes });
		this.equipo.patchValue({ nombreEquipos: listaNombreEq });
		this.equipo.patchValue({ numEquipo: listaNumeroEq });
		
		console.log(this.idPlantillaSolicitada)
		this.guardar();
    }

	private guardar(){
		console.log(this.equipo.value);
		if(this.equipo.valid && !this.editaPlantilla){
			let params = {
				servicio: "equipos",
				accion: "IDesk_Equipos_Alta",
				tipoRespuesta: "json",
				idCurso: this.equipo.value.idCurso,
				nombrePlantilla: this.equipo.value.nombrePlantilla,
				nombreEquipos: this.equipo.value.nombreEquipos,
				numEquipo: this.equipo.value.numEquipo, //orden
				integrantes: this.equipo.value.integrantes,
				idpersonidesk: this.equipo.value.idpersonidesk
			};

			this._equipos.consultas(params)
				.subscribe( resp => {
					console.log(resp);
					this.mensaje = resp[0].mensaje;
					if(resp[0].error == 0){
						this.tipoRespuesta = 1;
						this.idPlantillaEquipo = resp[0].idPlantillaEquipo;
					} else {
						this.tipoRespuesta = 2;
					}
					this.ngxSmartModalService.getModal('dialogoInformacionA').open();
				},
				errors => {
					console.log(errors);
				});
		} else if(this.equipo.valid && this.editaPlantilla){
			let params = {
				servicio: "equipos",
				accion: "IDesk_Equipos_Edita",
				tipoRespuesta: "json",
				idCurso: this.equipo.value.idCurso,
				nombrePlantilla: this.equipo.value.nombrePlantilla,
				nombreEquipos: this.equipo.value.nombreEquipos,
				numEquipo: this.equipo.value.numEquipo, //orden
				integrantes: this.equipo.value.integrantes,
				idpersonidesk: this.equipo.value.idpersonidesk,
				idPlantillaEquipo: this.idPlantillaSolicitada
			};

			this._equipos.consultas(params)
				.subscribe( resp => {
					console.log(resp);
					this.mensaje = resp[0].mensaje;
					this.tipoRespuesta = (resp[0].error == 0) ? 1 : 2;
					this.ngxSmartModalService.getModal('dialogoInformacionA').open();
				},
				errors => {
					console.log(errors);
				});
		} else {
			this.mensaje = 'Revise los datos antes de continuar';
			this.tipoRespuesta = 2;
			this.ngxSmartModalService.getModal('dialogoInformacionA').open();
		}
	}

    cierraDialogoInfo(resp) { //cb
        this.ngxSmartModalService.getModal('dialogoInformacionA').close();
		if(this.tipoRespuesta == 1)
			this.cerrar();
    }

	cerrar(){ //cb
		console.log(this.idPlantillaEquipo, this._equipos.idCursoSolicitado);
		let arreglo: any;
		arreglo = { idPlantilla: this.idPlantillaEquipo, idCurso: this._equipos.idCursoSolicitado };
		this.estaCerrado.emit(arreglo);
	}

	public reutilizar(){ //cb
		this.mostrarReutilizar = true;
    }

	public reutilizado(e){ //cb
		console.log(e);
		this.mostrarReutilizar = false;
		if(e != 0){
			this.idPlantillaSolicitada = e;
			this.obtenEquiposDePlantilla();
		}		
	}

}