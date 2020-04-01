import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { DTTRADUCCION } from '../../../shared/dttraduccion';
import { Subject } from 'rxjs';
import { Iestdesk } from '../../../services/iestdesk.service';
import { EditorService } from '../../../services/editorService.service';

@Component({
  selector: 'app-vista-materias',
  templateUrl: './vista-materias.component.html',
})
export class VistaMateriasComponent implements AfterViewInit, OnDestroy {
  
  @ViewChild(DataTableDirective)

  public dtElement: DataTableDirective;
  public dtOptions =  {
    "aaSorting": [], //Desactiva la ordenación inicial
    "language": DTTRADUCCION,
    "dom": '<"row table-header mx-0"<"col-md-6 text-left"f><"col-md-6 p-0"<"row"<"col-md-10 p-0 text-right"i><"col-md-1 p-0"p>>>><"clear">',
    "pagingType": "simple",
    "columnDefs": [
        { orderable: false, targets: 0 }
    ]
  };  
  public dtTrigger: Subject<any> = new Subject();

  public materiasMolde;

  constructor(
    private iestdeskService: Iestdesk,
    private editorService: EditorService
  ) { 
    this.obtenerMaterias();
  }

  obtenerMaterias(){
      let params = {
        servicio: "editor",
        accion: "IDesk_Editor_Asignacion_ConsultaMoldes",
        tipoRespuesta: "json"
      };
      this.editorService.consultas(params)
      .subscribe(resp => {
          this.materiasMolde = resp;
          this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                dtInstance.destroy();
                this.dtTrigger.next();
          });
      }, errors => {
        console.log(errors);
      });
  }
  
  /*abrirMolde(materia){
    let params = {
      servicio: "editor",
      accion: "IDesk_Editor_Asignacion_GeneraTemario",
      tipoRespuesta: "json",
      idCurso: materia.idCurso,
      idCodigo: materia.idCodigo,
      idpersonidesk: this.iestdeskService.idPerson
    };
    this.editorService.consultas(params)
    .subscribe(resp => {
          this.iestdeskService.idCursoActual = materia.idCurso;
          this.iestdeskService.rolActual = 3;
          this.editorService.mostrarListado = false;
    }, errors => {
      console.log(errors);
    });
  }*/

  listadoProfesores(materia){
	this.editorService.mostrarListado = false;
	this.editorService.mostrarClones = true;
	this.editorService.materia = materia;
  }

  ngAfterViewInit(){
    this.dtTrigger.next();
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }
}
