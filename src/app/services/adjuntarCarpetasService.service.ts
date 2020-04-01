
import {map} from 'rxjs/operators';
import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AdjuntarCarpetasService {

    private directorioTemporal;
    public rutaVistaAlumno = '';

    constructor(
        private http: HttpClient,
        @Inject("BaseURL") private BaseURL
    ) { 
    }

    setDirectorioForm(){
        this.directorioTemporal = new FormData();
    }

    setDirectorioTemporal(nombre:string,archivo){
       this.rutaVistaAlumno = '';
       this.directorioTemporal.append(nombre,archivo);
    }

    getDirectorioTemporal() {
        return this.directorioTemporal.getAll('archivos[]');
    }

    getDirectorio() {
        return this.directorioTemporal;
    }

    eliminarDirectorioTemporal(){
       this.directorioTemporal.delete("archivos[]");
       this.directorioTemporal.delete("paths");
       this.directorioTemporal.delete("nombreCarpeta");
    }

    eliminaAcentos(cadena) {
        /*normalize()ing to NFD Unicode normal form decomposes combined graphemes into the combination of simple ones. The è of Crème ends up expressed as e + ̀.
        Using a regex character class to match the U+0300 → U+036F range, it is now trivial to globally get rid of the diacritics, which the Unicode standard conveniently groups as the Combining Diacritical Marks Unicode block.*/
        return cadena.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    }
}