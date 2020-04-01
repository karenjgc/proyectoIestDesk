import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Iestdesk } from '../services/iestdesk.service';
import { CriteriosEvaluacion } from '../services/criterios.service';
import { AltasBase } from '../shared/classes/altasBase';

import { PublicacionGrupos } from '../shared/classes/publicacionGrupos';

import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'idesk-criterios',
    templateUrl: './criterios.component.html'
})

export class CriteriosEvaluacionComponent extends AltasBase implements OnInit {
    public institucionales = { };
    public personalizados = { };
    public objectKeys = Object.keys;
	public comentarios: string = '';
	public idCriterioEvaluacion;
	public idCriterio: number = 0;
	public idGrado: number = 0;
	public elementoEliminar: string;
	public idaEliminar: number= 0;
    public criterios;

    constructor(
        public iestdesk: Iestdesk,
        private _criterios: CriteriosEvaluacion,
        private _chRef: ChangeDetectorRef,
		private _modalService: NgbModal,
		private router: Router,
        private route: ActivatedRoute,
        public _ngxSmartModalService: NgxSmartModalService
    ){
		super(iestdesk,
            null,
            null,
            null,
            _chRef,
            _modalService,
            _ngxSmartModalService,        
            router);

		this.rolActual = this.iestdesk.rolActual;
		this.idGrado = this.iestdesk.idGrado;
        this.rutaListado = "/criterios-de-evaluacion";
        this.criterios = this.iestdesk.idGrado >= 3 ? { ordinario: {}} : { parcial1: {}, parcial2: {}, ordinario: {} };

		this.criteriosInstitucionales();
        
    }

    ngOnInit() {
        this.iestdesk.registraAcceso(16, 0);
    }
    
	obtenerCriteriosAsignados(){
		if(this._criterios.idCriterioEvaluacion != 0){
			this.editando = 14;
			this.idCriterioEvaluacion = this._criterios.idCriterioEvaluacion;

			let params = {
				servicio: "criteriosEvaluacion",
				accion: "IDesk_Criterios_Consulta_Curso",
				tipoRespuesta: "json",
				idCurso: this.iestdesk.idCursoActual
			};
			this._criterios.consultas(params)
				.subscribe(resp => {
					this.comentarios = resp[0].comentarios;
					this.asignaCriterios(resp);
				},
				errors => {
					console.log(errors);
				});
			this.titulito = "Editar";
		} else {
			this.titulito = "Nuevo";
		}
	}

    criteriosInstitucionales() {
        let params = {
            servicio: "criteriosEvaluacion",
            accion: "IDesk_Maestro_Criterios_Institucionales",
            tipoRespuesta: "json",
            idCurso: this.iestdesk.idCursoActual
        };
        this._criterios.consultas(params)
            .subscribe(resp => {
                for ( let criterio of resp ) {
                    if ( !this.institucionales.hasOwnProperty(criterio.tipoEvaluacion) ) {
                        this.institucionales[criterio.tipoEvaluacion] = {};
                    } 
                    if ( criterio.obligatorio == 1 ) {
                        this.agregarCriterio(criterio);
                    } else {
                        this.institucionales[criterio.tipoEvaluacion][criterio.idCriterio] = criterio; //.push(criterio);
                    }
                }

                if(this.iestdesk.idGrado >= 3){ // 1 prepa, 2 prof, 3 posgrado, ¿+3 cde, cap, epads?; se eliminan parciales
                    delete this.institucionales['Parcial'];
                }
                
                this.criteriosPersonalizados();
            },
            errors => {
                console.log(errors);
            });
    }

    criteriosPersonalizados() {
        let params = {
            servicio: "criteriosEvaluacion",
            accion: "IDesk_Maestro_Criterios_Personalizados",
            tipoRespuesta: "json",
            idpersonidesk: this.iestdesk.idPerson
        };
        this._criterios.consultas(params)
            .subscribe(resp => {
                //console.log('Respuesta', resp);
                for (let criterio of resp) {
                    if ( !this.personalizados.hasOwnProperty(criterio.tipoEvaluacion) ) {
                        this.personalizados[criterio.tipoEvaluacion] = {};
                    } 
                    this.personalizados[criterio.tipoEvaluacion][criterio.idCriterio] = criterio;
                }
                
                if(this.iestdesk.idGrado >= 3){ // ídem
                    delete this.personalizados['Parcial'];
                }
                
                this.obtenerCriteriosAsignados();
            },
            errors => {
                console.log(errors);
            });
    }

    cantidadCriteriosDisponibles(tipoCriterio){
		let cantidadCriterios = 0;
		tipoCriterio == 1 ? tipoCriterio = this.institucionales : tipoCriterio = this.personalizados;

		for(let criterio of Object.keys(tipoCriterio)){
			cantidadCriterios += Object.keys(tipoCriterio[criterio]).length;
		}

	   return cantidadCriterios; // idGrado < 3 ? 3 : 1?
    }
    
    asignaCriterios(criteriosGuardados){
        let opcionesCriterios = {
            'Parcial 1': this.criterios.parcial1,
            'Parcial 2': this.criterios.parcial2,
            'Ordinario': this.criterios.ordinario
        }
 
        for ( let criterio of criteriosGuardados){
            opcionesCriterios[criterio.nombreAlt.trim()][criterio.idTipoCriterio+'_'+criterio.idCriterio] = criterio;
            this.eliminaDeListados(criterio, criterio.idTipoCriterio);
        }
 
        this.sumaCriterios(true);
       
    }

    agregarCriterio(criterio, tipo = 0){		
        if ( criterio.tipoEvaluacion == 'Parcial' ){
            if (!this.criterios.parcial1.hasOwnProperty(criterio.idTipoCriterio+'_'+criterio.idCriterio)) {
                this.criterios.parcial1[criterio.idTipoCriterio+'_'+criterio.idCriterio] = criterio;
            }
            
            if (!this.criterios.parcial2.hasOwnProperty(criterio.idTipoCriterio+'_'+criterio.idCriterio)) {
                this.criterios.parcial2[criterio.idTipoCriterio+'_'+criterio.idCriterio] = criterio;
            }
        } else {
            this.criterios.ordinario[criterio.idTipoCriterio+'_'+criterio.idCriterio] = criterio;
        }
        
        this.eliminaDeListados(criterio, tipo);
    }

    eliminarCriterio(criterio, tipo){
        switch (tipo) {
            case 1:
                delete this.criterios.parcial1[criterio.idTipoCriterio+'_'+criterio.idCriterio];
            break;
            case 2:
                delete this.criterios.parcial2[criterio.idTipoCriterio+'_'+criterio.idCriterio];
            break;
            case 6:
                delete this.criterios.ordinario[criterio.idTipoCriterio+'_'+criterio.idCriterio];
            break;
        }

        if(criterio.idTipoCriterio == 1){
            if(!this.institucionales[criterio.tipoEvaluacion].hasOwnProperty(criterio.idCriterio)){
                this.institucionales[criterio.tipoEvaluacion][criterio.idCriterio] = criterio;
                this.institucionales[criterio.tipoEvaluacion][criterio.idCriterio].valor = 0;
            }
        }else{
            if(!this.personalizados[criterio.tipoEvaluacion].hasOwnProperty(criterio.idCriterio)){
                this.personalizados[criterio.tipoEvaluacion][criterio.idCriterio] = criterio;
                this.personalizados[criterio.tipoEvaluacion][criterio.idCriterio].valor = 0;
            }
        }

        this.sumaCriterios();
    }
    
    sumaCriterios(esEdicion = false){
        this.criterios['suma'] = {};
        for (let tipoCriterio of Object.keys(this.criterios)){
            if(tipoCriterio != 'suma'){

                let sumaTotal = 0;
                let index = 0;
                for(let criterio of Object.keys(this.criterios[tipoCriterio])){
					let elemento = <HTMLInputElement> document.getElementById('valor-' + tipoCriterio + '-' + index);
                    let valor = esEdicion ? this.criterios[tipoCriterio][criterio].valor : elemento.value.trim();

					
                    if(+valor != 0 || valor!= ""){
						if(+valor < this.criterios[tipoCriterio][criterio].minimo){
							valor = this.criterios[tipoCriterio][criterio].minimo;
							elemento.value = valor;
						}
						if(+valor > this.criterios[tipoCriterio][criterio].maximo){
							valor = this.criterios[tipoCriterio][criterio].maximo;
							elemento.value = valor;
						}
                        sumaTotal += +valor;
                    }
                
                    index ++;
                }
              
                this.criterios.suma[tipoCriterio] = sumaTotal;
            }
        }
    }

	eliminaDeListados(criterio, tipo){
		switch (+tipo) {
            case 1:
                delete this.institucionales[criterio.tipoEvaluacion][criterio.idCriterio];
            break;
            case 2:
                delete this.personalizados[criterio.tipoEvaluacion][criterio.idCriterio];
            break;
        }
	}

    cambio(args, tipo, indice) {
        this.criterios[tipo][indice].valor = args;
    }

    guardarCriterios() {
        let valores = [];
        let valido = true;
		let periodo;

        criterios:
        for(let parcial of Object.keys(this.criterios)){

            if(parcial != 'suma'){
                if(Object.keys(this.criterios[parcial]).length == 0){
                    valido = false;
                    this.mensaje = "Es necesario agregar como mínimo un criterio de evaluación en cada una de las secciones";
                    break criterios;
                }
    
                let index = 0;
                let porcentajeParcial = 0;
                for (let tipoCriterio of Object.keys(this.criterios[parcial])){
                    let nom = <HTMLInputElement> document.getElementById('valor-' + parcial + '-' + index);
    
                    if(+nom.value.trim() == 0 || nom.value.trim() == ""){
                        valido = false;
                        this.mensaje = "Es necesario completar todos los campos para realizar el registro de criterios de evaluación";
                        break criterios;
                    }
                     
                    porcentajeParcial += +nom.value;
                    periodo = (parcial == 'ordinario') ? 6 : (parcial == 'parcial1') ? 1 : 2;
    
                    let cadena = periodo + ":" + this.criterios[parcial][tipoCriterio].idCriterioTipoEvaluacion + ":" + this.criterios[parcial][tipoCriterio].idTipoCriterio + ":" + this.criterios[parcial][tipoCriterio].idCriterio + ":" + nom.value;
                    valores.push(cadena);
                    index++; 
                }
    
                if(porcentajeParcial != 100){
                    valido = false;
                    this.mensaje = "La suma total de los criterios de evaluación debe ser igual a 100";
                    break criterios;
                }

            }
        }

		this.publicacionCursos();

        if(valido){
            let params = {
                servicio: "criteriosEvaluacion",
                accion: (this._criterios.idCriterioEvaluacion == 0) ? "IDesk_Maestro_Criterios_Alta" : "IDesk_Maestro_Criterios_Edita",
                tipoRespuesta: "json",
                idCurso: this.idCursosPub.join('|'),
                valores: valores.join("|"),
				comentarios: this.comentarios,
                idpersonidesk: this.iestdesk.idPerson,
				idCriterioEvaluacion: this._criterios.idCriterioEvaluacion
            };

            this._criterios.consultas(params)
				.subscribe(resp => {
					//console.log(resp);
					this.tipoRespuesta = resp[0].error == 0 ? 1 : 2;
					this.mensaje = resp[0].mensaje;
					this.guardado = true;
				}, errors => {
					console.log(errors);
			}); 

        } else {
			this.tipoRespuesta = 2;
			this.idCursosPub = [];
        }
		this.ngxSmartModalService.getModal('dialogoInformacion').open();
    }

    agregarPersonalizado(content, idCriterio){
		this.idCriterio = idCriterio;
		this.modalReference = this._modalService.open(content, { backdrop: 'static' });
    }

	respCriterioPer(resp) {
        if ( resp != 0 ) {
			if(this.iestdesk.idGrado >= 3 && this._criterios.infoCriterio.tipoEvaluacion == 'Parcial'){
				this.modalReference.close();
				return;
			} else {
				if ( !this.personalizados.hasOwnProperty(this._criterios.infoCriterio.tipoEvaluacion) ) {
					this.personalizados[this._criterios.infoCriterio.tipoEvaluacion] = {};
				} 
				this.personalizados[this._criterios.infoCriterio.tipoEvaluacion][this._criterios.infoCriterio.idCriterio] = this._criterios.infoCriterio;
			}
        }
		this.modalReference.close();
    }

	dialogEliminaPersonalizado(id, titulo){
		this.elementoEliminar = 'el criterio '+titulo;
		this.idaEliminar = id;
		this.ngxSmartModalService.getModal('confirmarEliminacion').open();
    }

	eliminaCriterioPersonalizado(resp){
		this.ngxSmartModalService.getModal('confirmarEliminacion').close();
		if( resp == 1 ){
			let params = {
				servicio: "criteriosEvaluacion",
				accion: "IDesk_Criterios_Personalizados_Elimina",
				tipoRespuesta: "json",
				idCriterio: this.idaEliminar, 
				idpersonidesk: this.iestdesk.idPerson
			};

			this._criterios.consultas(params)
				.subscribe(resp => {
					//console.log(resp);
					this.mensaje = resp[0].mensaje;
                    this.tipoRespuesta = (resp[0].error == 0) ? 1 : 2;
					let criterioRespuesta = this.personalizados;
                    this.eliminaDeListados( criterioRespuesta[resp[0].tipoEvaluacion][resp[0].idCriterio], 2);
				},
				errors => {
					console.log(errors);
					this.mensaje = 'Ocurrió un error al eliminar el criterio. Intente más tarde.';
					this.tipoRespuesta = 2;
				});
				this.ngxSmartModalService.getModal('dialogoInformacion').open();
		} else {
			this.idaEliminar = 0;
		}
    }

	obtenNuevoCriterio(idCriterio){
		let params = {
			servicio: 'criteriosEvaluacion',
			tipoRespuesta: 'json',
			accion: 'IDesk_Criterio_Personalizado_Consulta',
			idCriterio: idCriterio
		};
		this._criterios.consultas(params)
			.subscribe( resp => {
				if (!this.personalizados.hasOwnProperty(resp[0].tipoEvaluacion)) {
					this.personalizados[resp[0].tipoEvaluacion] = {};
                } 
                
                this.personalizados[resp[0].tipoEvaluacion][resp[0].idCriterio] = resp[0];
                
			}, errors => {
				console.log(errors);
			});
	}

	longitudValor(e){
		if ((<HTMLInputElement>document.getElementById(e.srcElement.id)).value.length > 2)
			e.preventDefault();
	}
}