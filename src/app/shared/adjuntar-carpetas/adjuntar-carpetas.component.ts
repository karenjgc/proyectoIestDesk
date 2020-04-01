import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AdjuntarCarpetasService } from '../../services/adjuntarCarpetasService.service';

@Component({
  selector: 'app-adjuntar-carpetas',
  templateUrl: './adjuntar-carpetas.component.html'
})
export class AdjuntarCarpetasComponent implements OnInit {

  public webKitPath =  [];
  public cantidadArchivos = 0;
  public progresoCarpeta = 0;
  public nombreCarpeta; 
  
  @ViewChild('file') file: ElementRef;

  constructor(
    private adjuntarCarpetas:AdjuntarCarpetasService
  ) { }

  ngOnInit() {
    this.adjuntarCarpetas.setDirectorioForm();
  }

  cantidadCarpetas(){
    return (this.adjuntarCarpetas.getDirectorioTemporal().length > 0);
  }

  creaRefCarpeta(event){
      console.log('event', event);
      event.preventDefault();
      event.stopPropagation();

      this.cantidadArchivos = this.file.nativeElement.files.length;

      if(this.cantidadArchivos > 0 && this.cantidadArchivos < 100){
          const progresoBarra = +(100/this.cantidadArchivos);

          let index=0;
          for(let archivo of this.file.nativeElement.files){
              const fileReader = new FileReader();
              fileReader.readAsBinaryString(archivo);
              fileReader.onloadend = () => {
                  this.progresoCarpeta+=progresoBarra;
              };
    
              this.adjuntarCarpetas.setDirectorioTemporal("archivos[]",archivo);
              this.webKitPath.push({ //Array para obtener la ruta de carpeta.
                pathArchivo:this.adjuntarCarpetas.eliminaAcentos(archivo.webkitRelativePath),
                nombreArchivo:this.adjuntarCarpetas.eliminaAcentos(archivo.name)
              });
              index++;
          }
          
          if(index == this.cantidadArchivos){
            setTimeout(() => {
              this.progresoCarpeta = 0;
            },2000);
            
            this.nombreCarpeta = this.webKitPath[0]['pathArchivo'].split("/");
            this.nombreCarpeta = this.nombreCarpeta[0];
            this.adjuntarCarpetas.setDirectorioTemporal("paths", JSON.stringify(this.webKitPath));

            console.log('webkit', this.webKitPath);
          }
      }else{
        alert('Exceso de archivos');
        this.cantidadArchivos=0;
      }
  }

  eliminaRefCarpeta(){
    this.webKitPath = [];
    this.progresoCarpeta = 0;
    this.cantidadArchivos = 0;
    this.file.nativeElement.value = "";
    this.adjuntarCarpetas.eliminarDirectorioTemporal();   
  }

}

//8875
