import { ChangeDetectorRef, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup} from '@angular/forms';

import { FroalaOptions } from '../iestdesk/froala';
import { DatepickerOptions } from './datepicker';
import { Validaciones } from './validaciones';

import { Iestdesk } from '../../services/iestdesk.service';
import { Equipos } from '../../services/equipos.service';

import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Rubricas } from '../../services/rubricas.service';
import * as _moment from 'moment';
import 'moment/locale/es';

import { Subject } from 'rxjs';
import { EventEmitter } from '@angular/core';

export class AltasBase {
    public opcFroala = new FroalaOptions();
    public opcDatePicker = new DatepickerOptions();
    public validaciones = new Validaciones();
    public publicacionGrupos;
    public options: Object = this.opcFroala.opciones;
    public startAt: any = this.opcDatePicker.setStartAt();

    public temasCursos = {};
    public titulito: string = '';

    public cursoActual: number = 0;
    public editando: number = 0;
    public rolActual;

    public idForoDisc: number = 0;
    public formulario: FormGroup;
    public pubCursos = [];
    public temp = [];
    public cursos: any[];
    public idCursos: string = '';
    
    public idRubrica = 0;
    public idRubricaExterna = 0;
    public idRubricaExternaLink = 0;
    public tituloRubrica: string;
    public altaE: boolean = true;

    public idCursosPub = [];
    public fechaPublicacion = [];
    public fechaCierre = [];
    public fechaTransmision = [];
    public temas = [];
    public modalidad = [];
    public idEquipos = [];
    public modificaEquipos;
    public mostrarReutilizar;
    public mostrarTema;
    public mostrarAltaTema: boolean = true;

    public modalidadTrabajo = [];
	public mostrarAlertaEquipos: boolean = false;

    public mensaje: string;
    public tipoRespuesta: number;
    public guardado: boolean = false;

    public modalReference: any;
    public modalidadEquipos: string;

    public idArchivos: string = '';
    public idLinks: string = '';

    public vieneDeReutilizar: boolean = false;
	public plantillasCurso = [];
    
    public vistaPreviaForo;
    public vistaAlumno: boolean = true;

    public rutaListado;
	public nombreDialogo;
	
	public cerradoObj = { };

    public modalidadTrabajoSeleccionada;
    public temaSeleccionado;
    public fechaCierreSeleccionada;
    public fechaPublicacionSeleccionada;
    public fechaTransmisionSeleccionada;
	public idPlantillaSolicitada;

    public mensajeDialog;
    public actualizaOrdenTemas: boolean = false;

    public hoy;
    public bloquear: boolean = false; // para bloquear botones en el alta x.x
    
    @Input() public modoTemario = false;
    @Input() public contenidoEditor = false;
    @Output() public regresaTemario = new EventEmitter();
    @Output() public regresaVinculos = new EventEmitter();

    constructor(
        private _iestdesk: Iestdesk,
        private _equipos: Equipos = null,
        private _rubricas: Rubricas = null,
        private formBuilder: FormBuilder = null,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        public ngxSmartModalService: NgxSmartModalService,
        private _router: Router
    ) {
        this.hoy = new Date();
        this.cursoActual = this._iestdesk.idCursoActual;
        this.cursos = this._iestdesk.cursosLaterales;

        this.obtenModalidadTrabajo();
        this.separarIdCursos();

        this.obtenTemas(this._iestdesk.rolActual != 3);

        if(this._iestdesk.rolActual != 3){
            this.mostrarAltaTema = !(this.cursos[this.cursos.findIndex(x => x.idCurso == this.cursoActual)].modalidad == 2);
        }       

        console
    }

    obtenModalidadTrabajo() {
        let params = {
            servicio: "idesk",
            accion: "IDesk_Maestro_ModTrabajo_Listado",
            tipoRespuesta: "json"
        };
        this._iestdesk.consultas(params)
            .subscribe(resp => {
                this.modalidadTrabajo = resp;
                this.modalidadTrabajoSeleccionada = !this.modalidadTrabajoSeleccionada ? this.modalidadTrabajo[0].idModTrabajo : this.modalidadTrabajoSeleccionada;
                this.agrupar();
            },
            errors => {
                console.log(errors);
            });
    }

    separarIdCursos() {
        if (this.editando != 0 || this._iestdesk.rolActual == 3) {
            this.idCursos = String(this._iestdesk.idCursoActual);
        } else {
            let temp = [];
            for( let i = 0; i < this._iestdesk.cursosLaterales.length; i++ ) {
                temp.push(this._iestdesk.cursosLaterales[i].idCurso);
            }
            this.idCursos = temp.join("|");
        }
    }

    obtenTemas(agrupar = true) {
        let params = {
            servicio: "idesk",
            accion: "IDesk_Maestro_Temario_Cursos_Listado",
            tipoRespuesta: "json",
            idCursos: this.idCursos
        };
        this._iestdesk.consultas(params)
            .subscribe(resp => {

                for(let elemento of resp) {
                    if (!this.temasCursos.hasOwnProperty(elemento.idCurso)) {
                        this.temasCursos[elemento.idCurso] = [];
                    }
                    this.temasCursos[elemento.idCurso].push(elemento);
                }

				this.temaSeleccionado = this.temaSeleccionado ? this.temaSeleccionado : (this.temasCursos[this.cursoActual] != undefined) ? this.temasCursos[this.cursoActual][0].idTema : 0; // materias sin temas
                this._iestdesk.establecerTemaActual(this.temaSeleccionado);
                if (agrupar) {
                    this.agrupar();
                }
            },
            errors => {
                console.log(errors);
            });
    }

    agrupar() {
        this.pubCursos = [];
        if(this._iestdesk.rolActual != 3){
            for(let i = 0; i < this._iestdesk.cursosLaterales.length; i++) {
                if ( this.editando == 0 || this._iestdesk.cursosLaterales[i].idCurso == this._iestdesk.idCursoActual ) {
                    if(!this.pubCursos.find(x => x.idCurso == this._iestdesk.cursosLaterales[i].idCurso) && this._iestdesk.cursosLaterales[i].idGrado == this._iestdesk.idGrado){
                        this.pubCursos.push({
                            idCurso:  this._iestdesk.cursosLaterales[i].idCurso,
                            materia:  this._iestdesk.cursosLaterales[i].materia,
                            clave:  this._iestdesk.cursosLaterales[i].clave,
                            seleccionada: this._iestdesk.cursosLaterales[i].idCurso == this._iestdesk.idCursoActual
                        });
                        this.fechaPublicacionSeleccionada ? this.pubCursos[this.pubCursos.length - 1]["fechaPublicacion"] = this.fechaPublicacionSeleccionada : this.pubCursos[this.pubCursos.length - 1]["fechaPublicacion"] = this.hoy;
						this.fechaCierreSeleccionada ? this.pubCursos[this.pubCursos.length - 1]["fechaCierre"] = this.fechaCierreSeleccionada : '';
                        this.temaSeleccionado ? this.pubCursos[this.pubCursos.length - 1]["tema"] = this.temaSeleccionado : '';
                        this.modalidadTrabajoSeleccionada ? this.pubCursos[this.pubCursos.length - 1]["modalidadTrabajo"] = this.modalidadTrabajoSeleccionada : '';
                        this.idPlantillaSolicitada ? this.pubCursos[this.pubCursos.length - 1]["idPlantilla"] = this.idPlantillaSolicitada : ' ';
                        this.fechaTransmisionSeleccionada ? this.pubCursos[this.pubCursos.length - 1]["fechaTransmision"] = this.fechaTransmisionSeleccionada : '';
                    }
                }
            }
       }
    }

    cargaElementos(tema = "", fechaPub = "", fechaCierre = "", modTrab = 0, idPlantilla = 0, fechaTransmision = "") {
        this.temaSeleccionado = tema;

        this.fechaPublicacionSeleccionada = fechaPub != "" ? new Date(fechaPub.split(' ').join('T')) : undefined;
        this.fechaCierreSeleccionada = fechaCierre != "" ? new Date(fechaCierre.split(' ').join('T')) : undefined;
        this.modalidadTrabajoSeleccionada = modTrab != 0 ? modTrab : 0;
        this.fechaTransmisionSeleccionada = fechaTransmision != "" ? new Date(fechaTransmision) : undefined;
        
        this.idPlantillaSolicitada = +(idPlantilla) != 0 ? +idPlantilla : 0;
        this.cerradoObj[this.cursoActual] = idPlantilla;
        console.log('cerradoObj', this.cerradoObj);
    }

    abreModalNgTemplate(content){
		// verEquipo(), abreRubrica(), verRbrica()
		this.modalReference = this.modalService.open(content, { backdrop: 'static' });
    }
    
    abrir(content, curso) {
        let c =  this._iestdesk.rolActual == 3 ? curso : this.pubCursos.find( c => c.idCurso == curso);
        
        console.log('c', c);
        console.log('Curso', curso);

        if (c && this._iestdesk.rolActual == 3) {
            this.idPlantillaSolicitada = c.idPlantillaEquipos.trim() == '' ? 0 : c.idPlantillaEquipos;
            this.modificaEquipos = c.idPlantillaEquipos.trim() == '' ? 0 : 1;
        } else {
            this.idPlantillaSolicitada = String(c.idPlantilla).trim() == '' ? 0 : c.idPlantilla;
            this.modificaEquipos = String(c.idPlantilla).trim() == '' ? 0 : 1;
        }

        this.modalidadTrabajoSeleccionada =  !c ? 1 : ( this._iestdesk.rolActual == 3 ? c.idModTrabajo : c.modalidadTrabajo);
        this.modalidadEquipos = (this.modalidadTrabajoSeleccionada == 2) ? 'Aleatorio' : 'Asignado';

        this._equipos.tipo = this.modalidadTrabajoSeleccionada;
        this._equipos.idCursoSolicitado = this._iestdesk.rolActual == 3 ? curso.idCurso : curso;

        this.modalReference = this.modalService.open(content);
    }

    altaCerrada(cerrado) {
		if(cerrado.idPlantilla != 0){
			this.cerradoObj[cerrado.idCurso] = cerrado.idPlantilla;
            this.idPlantillaSolicitada = cerrado.idPlantilla;
            this.modificaEquipos = 1;
		}
        this.modalReference.close();
    }

    publicacionCursos() {
		this.mensajeDialog = null;
        this.fechaPublicacion = [];
        this.fechaCierre = [];
        this.temas = [];
        this.idEquipos = [];
        this.fechaTransmision = [];
        this.idCursosPub = [];
        
        if(this._iestdesk.rolActual == 3){            
            if (this.temasCursos[this.cursoActual][0].idTema != '') {
                this.temas.push(this.temasCursos[this.cursoActual][0].idTema);
                this.fechaPublicacion.push(_moment(new Date('1900-01-01')).format("DD/MM/YY HH:mm"));
                this.fechaCierre.push(_moment(new Date('1900-01-01')).format("DD/MM/YY HH:mm"));
                this.idCursosPub.push(this.cursoActual);
                
                if(this._iestdesk.esAsignadoCTE == 1){ //Machincuepa fechas de publicacion temario asignado.

                    if( this.modalidad && this.modalidad[0] == '1') {
                        this.idEquipos.push('0');
                    } else {
                        if(this.modalidad && this.modalidad[0] != '1' && this.modalidad[0] != '' && this.idPlantillaSolicitada && +this.idPlantillaSolicitada != 0) {
                            this.idEquipos.push( this.idPlantillaSolicitada );
                        } else  {
                            if (this.idPlantillaSolicitada && this.idPlantillaSolicitada != "") {
                                console.log('idPlantilla', this.idPlantillaSolicitada);
                                this.mensajeDialog = "generar un equipo";
                                return false;
                            }
                        }
                    }
                }else{
                    this.modalidad.push('1');
                    this.idEquipos.push('0');
                }
            } else {
                this.mensajeDialog = "Debe seleccionar el tema";
                return false;
            }
        }else{
            this.modalidad = []; //Modalidad Trabajo

            for(let curso of this.pubCursos) {
                if (curso.seleccionada) {
                    if (curso.fechaPublicacion && curso.fechaPublicacion != '') {
                        this.fechaPublicacion.push(_moment(curso.fechaPublicacion).format("DD/MM/YY HH:mm")); // .format() es de momentjs
                    } else {
                        if (curso.hasOwnProperty("fechaPublicacion")) {
                            this.mensajeDialog = "seleccionar fecha de publicación";
                            return false;
                        }
                    }

                    if (curso.fechaCierre && curso.fechaCierre != ' ') {
                        this.fechaCierre.push(_moment(curso.fechaCierre).format("DD/MM/YY HH:mm"));
                    } else {
                        if (curso.hasOwnProperty("fechaCierre")) {
                            this.mensajeDialog = "seleccionar fecha de cierre";
                            return false;
                        }
                    }
					if (curso.fechaTransmision && curso.fechaTransmision != ' ') {
                        this.fechaTransmision.push(_moment(curso.fechaTransmision).format("DD/MM/YY HH:mm"));
                    } else {
                        if (curso.hasOwnProperty("fechaTransmision")) {
                            this.mensajeDialog = "seleccionar fecha de transmisión";
                            return false;
                        }
                    }
                    if (curso.tema != ' ') {
                        this.temas.push(curso.tema);
                    } else {
                        if (curso.hasOwnProperty("tema")) {
                            this.mensajeDialog = "seleccionar tema";
                            return false;
                        }
                    }
                    if (curso.modalidadTrabajo && curso.modalidadTrabajo != '') {
                        this.modalidad.push(curso.modalidadTrabajo);
                    } else {
                        if (curso.hasOwnProperty("modalidadTrabajo")) {
                            this.mensajeDialog = "Debe seleccionar la modalidad de trabajo";
                            return false;
                        }
                    }

                    if( curso.modalidadTrabajo && curso.modalidadTrabajo == '1') {
                        this.idEquipos.push('0');
                    } else {
                        if(curso.modalidadTrabajo && curso.modalidadTrabajo != '1' && curso.modalidadTrabajo != '' && this.cerradoObj[curso.idCurso] && +this.cerradoObj[curso.idCurso] != 0) {
                            this.idEquipos.push( this.cerradoObj[curso.idCurso] );
                        } else  {
                            if (curso.hasOwnProperty("idPlantilla")) {
                                this.mensajeDialog = "generar un equipo";
                                return false;
                            }
                        }
                    }

                    this.idCursosPub.push(curso.idCurso);
                }
            }
        }

        return true;

    }

	revisaMostrarAlerta(modalidadTrabajo = null){
        if(modalidadTrabajo){
            if(modalidadTrabajo > 1){
                this.mostrarAlertaEquipos = true;
            } else {
                this.mostrarAlertaEquipos = false;
            }
        }else{
            for(let curso of this.pubCursos){
                if(curso.modalidadTrabajo > 1){
                    this.mostrarAlertaEquipos = true;
                    return;
                } else 
                    this.mostrarAlertaEquipos = false;
            }
        }
	}

    reutilizar(content) {
		this.editando = 0;
        content == 1 ? this.mostrarReutilizar = true : this.modalReference = this.modalService.open(content, { backdrop: 'static' });
    }

    regresarAlta(){
        this.mostrarReutilizar ? this.mostrarReutilizar = false : this.modalReference.close();
    }

    archivos(idArchivos) {
        this.formulario.patchValue({ idArchivos : idArchivos });
    }

    links(idLinks) {
        this.formulario.patchValue({ idLinks : idLinks });
    }

    rubrica(rubrica) {
        this.modalReference.close();
        this.formulario.patchValue({ idRubrica: rubrica });
        this.idRubrica = rubrica;
        this.idRubricaExterna = 0;
        this.idRubricaExternaLink = 0;
        this.obtenerInfoRubrica();
    }

    obtenRespuesta(x){ //rubricaExterna
        this.formulario.patchValue({ idRubricaExterna : x });
        this.idRubricaExterna = x;
        this.idRubrica = 0;
		this.idRubricaExternaLink = 0;
    }

    linksRubrica(linkRubrica){
        this.formulario.patchValue({ idRubricaExternaLink: linkRubrica });
        this.idRubricaExternaLink = linkRubrica;
        this.idRubricaExterna = 0;
		this.idRubrica = 0;
    }

	obtenerInfoRubrica(){
        let params = {
            servicio: "rubricas",
            accion: "IDesk_Rubrica_Detalle",
            tipoRespuesta: "json",
            idRubrica: this.idRubrica
        };
		this._rubricas.consultas(params)
			.subscribe( resp => {
				this._rubricas.idRubrica = this.idRubrica;
				this.tituloRubrica = resp[0].nombre;
			}, errors => {
				console.log(errors);
			})
    }
    
    eliminaRubrica(){
        this._rubricas.idRubrica = 0;
		this.idRubrica = 0;
		this.formulario.patchValue({ idRubrica: 0 });
	}

    tema(idTema) {
        this.modalReference.close();
        this.obtenTemas(false);
    }

    vistaPrevia(content) { // vistaAlumno
        this.vistaPreviaForo = this.formulario.value;
        this.modalReference = this.modalService.open(content, { backdrop: 'static' });
    }

    cierraDialogoInfo(resp) {
        this.ngxSmartModalService.getModal("dialogoInformacion").close();

        if( this.guardado && !this.modoTemario ) {

            if( this.rutaListado == '/vinculos' ){
                this.regresaVinculos.emit("true");
            }else{
                this._router.navigate([this.rutaListado]);
            }
            
        } else {
            if( this.guardado ){
                this.regresaTemario.emit("true");
            }
        }
    }
	
	setStartAt(){
		this.opcDatePicker.setStartAt();
	}

    limpiaVariables() {
        this.idCursosPub = [];
        this.fechaPublicacion = [];
        this.fechaCierre = [];
        this.temas = [];
        this.idEquipos = [];
        this.modalidad = [];
    }

	cancelaAlta(){
        this.limpiaVariables();
        this._router.navigate([this.rutaListado]);
    }
}