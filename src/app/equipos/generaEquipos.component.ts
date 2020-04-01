import { Component, Output, Input, ChangeDetectorRef, EventEmitter, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup} from '@angular/forms';

import { Iestdesk } from '../services/iestdesk.service';
import { Equipos } from '../services/equipos.service';

import { NgxSmartModalService } from 'ngx-smart-modal';
import * as _moment from 'moment';
import 'moment/locale/es';

@Component({
    selector: 'idesk-generaEquipos',
    templateUrl: './generaEquipos.component.html'
})
//https://www.npmjs.com/package/ng-drag-drop
//https://github.com/valor-software/ng2-dragula

export class GeneraEquiposComponent implements OnInit {
    @Output() estaCerrado = new EventEmitter();
	@Input() idPlantillaSolicitada: number;

    public alumnos = [];
    public alumnosU = [];
    public tipo: number = 0;
    public opciones: FormGroup;
    public equipo: FormGroup;
    
    public mensaje: string;
    public tipoRespuesta: number;
	public equipoNuevo: number;
	public idPlantillaEquipo: number = 0;
	public editando: number = 0;
	public verNombrePlantilla: boolean = false;
	public tituloPlantilla: string;
	public editaPlantilla: boolean = false;
	//public mostrarReutilizar: boolean = false;

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

        this.opciones = this.formBuilder.group({
            idCurso: this._equipos.idCursoSolicitado,
            modoCalculo: ["1", Validators.required],
            cantidad: [0, Validators.required]
        });
        
        this.equipo = this.formBuilder.group({
            idCurso: this._equipos.idCursoSolicitado,
            nombrePlantilla: '', //'Equipos del '+this.hoy, //'',
            nombreEquipos: ['', Validators.required], 
            numEquipo: ['', Validators.required],
            integrantes: ['', Validators.required],
            idpersonidesk: this._iestdesk.idPerson 
        });

		console.log(this.idPlantillaSolicitada);
		if(this.idPlantillaSolicitada > 0){
			this.editaPlantilla = true;
			//this.obtenEquiposDePlantilla();
			let params = {
				servicio: "equipos",
				accion: "IDesk_Equipos_Consulta",
				tipoRespuesta: "json",
				idPlantillaEquipo: this.idPlantillaSolicitada
			};
            console.log('paramsEquipo', params);
			this._equipos.consultas(params)
				.subscribe( resp => {
					console.log(resp);
					this.alumnosU = resp;
					this.tituloPlantilla = resp[0].nombrePlantilla;
					this.equipo.patchValue({ nombrePlantilla: this.tituloPlantilla });
					this.acomodarEquipos(resp);
				}, errors => {
					console.log(errors);
				});
		} else {
			this.tituloPlantilla = 'Equipos del '+_moment().format('DD-MMM-YYYY');
			this.equipo.patchValue({ nombrePlantilla: this.tituloPlantilla }); 
		}
	
		(<HTMLInputElement>document.getElementById('numEquipos')).checked = true;
	}

	//private obtenEquiposDePlantilla(){ //cb-
	//}

    generar() {
        if ( this.opciones.value.cantidad != 0 && this.opciones.value.modoCalculo != 0 && this.opciones.valid ) {
			this.alumnos = [];
			let params = {
				servicio: "equipos",
				accion: "IDesk_Equipos_Aleatorios",
				tipoRespuesta: "json",
				idCurso: this.opciones.value.idCurso,
				modoCalculo: this.opciones.value.modoCalculo,
				cantidad: this.opciones.value.cantidad
			};

			this._equipos.consultas(params)
				.subscribe(resp => {
					this.alumnosU = resp;
					this.acomodarEquipos(resp);
					console.log(resp);
				},
				errors => {
					console.log(errors);
				});
        } else  {
            this.mensaje = 'Seleccione el modo de cálculo y la cantidad antes de continuar';
            this.tipoRespuesta = 2;
            this.ngxSmartModalService.getModal('dialogoInformacionG').open();
        }
    }

    private acomodarEquipos(resp) {
        this.alumnos = [];
		let max: number = 0;
        for(let i = 0; i < resp.length; i++) {
            if(!this.alumnos.find(x => x.numEquipo == resp[i].numEquipo)){
                this.alumnos.push({
                    numEquipo:  resp[i].numEquipo,
                    alumnos: resp.filter(y => y.numEquipo == resp[i].numEquipo),
					equipo: resp[i].equipo
                });
            }
			max = ( resp[i].numEquipo > max ) ? resp[i].numEquipo : max;
        }
		this.equipoNuevo = ++max;
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
			this.ngxSmartModalService.getModal('dialogoInformacionG').open();
			this.editando = numEquipo;
		}
		
	}

    onItemDrop(e: any, numEquipo, equipo) { //cb
        let z = 0;
		equipo = equipo || 'Equipo '+numEquipo;
        z = this.alumnosU.findIndex(x => x.idPerson == e.dragData);
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
          }));
    }

    acomodaValores() { //cb-
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
					this.mensaje = resp[0].mensaje;
					if(resp[0].error == 0){
						this.tipoRespuesta = 1;
						this.idPlantillaEquipo = resp[0].idPlantillaEquipo;
					} else
						this.tipoRespuesta = 2;
					this.ngxSmartModalService.getModal('dialogoInformacionG').open();
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
					this.ngxSmartModalService.getModal('dialogoInformacionG').open();
				},
				errors => {
					console.log(errors);
				});
		} else {
			this.mensaje = 'Revise los datos antes de continuar';
			this.tipoRespuesta = 2;
			this.ngxSmartModalService.getModal('dialogoInformacionG').open();
		}
	}

    cierraDialogoInfo(resp) { //cb
		this.ngxSmartModalService.getModal('dialogoInformacionG').close();
		if(this.tipoRespuesta == 1)
			this.cerrar();
    }

	cerrar(){ //cb
		console.log(this.idPlantillaEquipo, this._equipos.idCursoSolicitado);
		let arreglo: any;
		arreglo = { idPlantilla: this.idPlantillaEquipo, idCurso: this._equipos.idCursoSolicitado };
		this.estaCerrado.emit(arreglo);
	}

	/*public reutilizar(){ //cb
		this.mostrarReutilizar = true;
    }

	public reutilizado(e){ //cb
		console.log(e);
		this.mostrarReutilizar = false;
		if(e != 0){
			this.idPlantillaSolicitada = e;
			this.obtenEquiposDePlantilla();
		}		
	}*/

}