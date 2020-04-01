import { Component, OnInit, Input } from '@angular/core';
import { EditorService } from '../../services/editorService.service';

export interface AutoCompleteModel {
  value: any;
  display: string;
}

@Component({
  selector: 'idesk-tag-input',
  templateUrl: './tag-input.component.html'
})
export class TagInputComponent implements OnInit {
  
  @Input() public elementosTags;
  
  //Contiene elementos que se muestran en listado.
  public items = [];

  constructor(
    public editorService: EditorService
  ) { 
  }

  ngOnInit(){
    //Asigna a items los elementos a mostrar.
    this.items = this.elementosTags;
    
    //Filtra los elementos que no estan seleccionados que provienen de edición.
    console.log('Items', this.items.length);

    let filter = this.items.filter(elemento => {
        let res = this.editorService.tags.filter( elementoTags => elemento.value == elementoTags.value);
        return res.length == 0
    });
    this.items = filter;
    console.log('Filter', this.items.length);
    console.log('TagsMostrar', this.editorService.tags);
  }

  enviarTags($event){
    console.log('getTags', $event);
    console.log('tagNuevo', this.editorService.tags);
  }

  eliminarTags($event){
    //Elimina el elemento del arreglo de elementos seleccionados.
    this.editorService.eliminarTags($event);

    //Regresa el elemento que se elimino al arreglo de elementos.
    this.items.push($event);
  }
}
