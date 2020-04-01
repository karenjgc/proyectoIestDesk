import { Injectable, Inject, Input } from '@angular/core';
import { ServicioBase } from './servicioBase.service';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Iestdesk } from './iestdesk.service';

@Injectable()
export class EditorService extends ServicioBase {

    public tags = [];
    public mostrarListado = true;
	public mostrarClones = false;
    public idOda: number = 0;
	public materia: any;
	public llevarTemario$ = new Subject<any>();
    public listadoClones = [];
	public mostrarTablaFetos: boolean = false;
	public esAsignado;
	

    constructor(
        private http: HttpClient,
		private iestdeskService: Iestdesk,
        @Inject("BaseURL") private BaseURL
    ) { 
        super (http, BaseURL);
    }

    setTags(tags: object) {
        this.tags.push(tags);
    }

    getTags() {
        return this.tags;
    }

	irTemario(obj) {
        this.llevarTemario$.next(obj); //it is publishing this value to all the subscribers that have already subscribed to this message
    }

    detectarIrTemario() {
        return this.llevarTemario$;
    }

	abrirTemario(obj, a = null){
		console.log('abrirTemario', a, obj);
		this.esAsignado = a ? 1 : 0;
		this.iestdeskService.esAsignadoCTE = this.esAsignado;
		
		console.log('esAsignado', this.esAsignado);

		let params = {
			servicio: "editor",
			accion: "IDesk_Editor_Asignacion_GeneraTemario",
			tipoRespuesta: "json",
			idCurso: (a) ? obj.asignado : obj.idCurso,
			idCursoPadre:  this.materia.idCurso == obj.idCurso ? 0 : this.materia.idCurso,
			idCodigo: this.materia.idCodigo,
			idPlan: this.materia.idPlan,
			idpersonidesk: this.iestdeskService.idPerson
		};
		this.consultas(params)
			.subscribe(resp => {
				this.iestdeskService.idCursoActual = (a) ? obj.asignado : obj.idCurso;
				this.iestdeskService.rolActual = 3;
				this.mostrarClones = false;
		}, errors => {
			  console.log(errors);
		});
	}

	/*obtenerClones(){
		let params = {
			servicio: 'editor',
			accion: 'IDesk_Editor_Asignacion_ConsultaClones',
			tipoRespuesta: 'json',
			idMolde: this.materia.idCurso,
		};

		this.consultas(params)
			.subscribe(resp => {
				this.listadoClones = (resp.length > 0) ? resp : [];
			}, errors => {
				console.log(errors);
			});
	}*/
	
    asignarTags(etiquetas){
		this.tags = [];
        for(let tag of etiquetas.split('$$')){
          let detalleEtiqueta = tag.split('|');
          this.setTags({
            display:detalleEtiqueta[1], tipo: 1, value:detalleEtiqueta[0]
          });
        }
    
		this.tags.splice(this.tags.length-1, 1);		
		return this.tags;
    }

    eliminarTags($event){
        for (var i=0; i < this.tags.length; i++) {
            if (this.tags[i].value === $event['value']) {
                this.tags.splice(i,1);
            }
		}
		
		console.log('eliminaTags',this.tags);
    }

}