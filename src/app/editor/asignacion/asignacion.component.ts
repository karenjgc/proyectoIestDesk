import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { EditorService } from '../../services/editorService.service';
import { Iestdesk } from '../../services/iestdesk.service';

//import { ListadoClonesComponent } from './clones/clones.component';

@Component({
  selector: 'app-asignacion',
  templateUrl: './asignacion.component.html'
})
export class AsignacionComponent {

  public materiasMolde;
  public estadosMoldes = {};
  public modoTemarioEditor = false;

  //@ViewChild(ListadoClonesComponent) public clones: ListadoClonesComponent;
  
  constructor(
    public iestdeskService: Iestdesk,
    public editorService: EditorService
  ) { 
    
  }
  
  obtenerEstadosMolde(){
    let params = {
      servicio: "editor",
      accion: "IDesk_Editor_Asignacion_EstadosMoldes",
      tipoRespuesta: "json"
    };
    this.editorService.consultas(params)
    .subscribe(resp => {

      for(let estado of Object.keys(resp)){
          this.estadosMoldes[resp[estado].idEstado] = resp[estado].imgEstado;
      }

    }, errors => {
      console.log(errors);
    });
  }
  
  regresarListado(event){
    this.editorService.mostrarListado = true;
	  this.editorService.mostrarClones = false;
	  this.editorService.materia = undefined;
  }

  regresarAsignacion(){
    this.editorService.mostrarListado = false;
    this.editorService.mostrarClones = true;
  }

  finalizarMolde(){
    console.log('FinalizarMolde');
  }
	
}
