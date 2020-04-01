import { Component, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { Validators, FormBuilder, FormGroup} from '@angular/forms';

import { FroalaOptions } from '../../shared/iestdesk/froala';
import { Iestdesk } from '../../services/iestdesk.service';
import { InformacionCurso } from '../../services/infoCurso.service';

import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
    selector: 'idesk-altaBibliografia',
    templateUrl: './altaBibliografia.component.html'
})
export class AltaBibliografiaComponent {
    @Output() estaCerrado = new EventEmitter();

    public opcFroala = new FroalaOptions();

    public rolActual: number;
    public cursoActual: number;
    public temp = [];
    public cursos: any[];
    public idCursos: string = '';
    public pubCursos = [];
    public arrayAutores = [];
    public bibliografia: FormGroup;
    public idBibliografia: number = 0;
    public editando: boolean = false;
    public guardado: boolean = false;
    
    public mensaje: string;
    public tipoRespuesta: number;

    public reutilizar: boolean = false;
    public btnReutilizar: boolean = true;
    public vieneDeReutilizar: boolean = false;
    
    public options: Object = this.opcFroala.opciones;
    
    constructor(
        private _iestdesk: Iestdesk,
        private _infoCurso: InformacionCurso,
        private chRef: ChangeDetectorRef,
        private formBuilder: FormBuilder,
        public ngxSmartModalService: NgxSmartModalService
    ){
        this.idBibliografia = this._infoCurso.idBibliografia;
        this.bibliografia = this.formBuilder.group({
            idBibliografia: this.idBibliografia,
            titulo: ['', Validators.required],
            editorial: '',
            edicion: '',
            anio: '',
            lugar: '',
            idCursos: ['', Validators.required],
            autores: ['', Validators.required],
            comentarios: '',
            idpersonidesk: this._iestdesk.idPerson
        });

        this.cursoActual = this._iestdesk.idCursoActual;
        this.cursos = this._iestdesk.cursosLaterales;
        this.separarIdCursos();

        let params = {
            servicio: "idesk",
            accion: "IDesk_Maestro_Temario_Cursos_Listado",
            tipoRespuesta: "json",
            idCursos: this.idCursos
        };

        this._iestdesk.consultas(params)
            .subscribe(resp => {
                this.chRef.detectChanges();
                this.agrupar(resp);
            },
            errors => {
                console.log(errors);
            });

        this.temp.push(this.cursoActual);
        
        if ( this.idBibliografia == 0 ) {
            this.arrayAutores.push({ num: 1 });
        } else {
            this.editando = true;

            this.bibliografia.patchValue({ idBibliografia : this._infoCurso.bibliografia.idBibliografia,
                titulo : this._infoCurso.bibliografia.titulo,
                editorial: this._infoCurso.bibliografia.editorial,
                edicion: this._infoCurso.bibliografia.edicion,
                anio: this._infoCurso.bibliografia.anio,
                lugar: this._infoCurso.bibliografia.lugar,
                autores: this._infoCurso.bibliografia.autor,
                comentarios: this._infoCurso.bibliografia.comentarios });

            let x = this._infoCurso.bibliografia.autor.split('|');
            
            for ( let i = 0; i < x.length; i++ ) {
                this.arrayAutores.push(i);
            }
            
            setTimeout( () => {
                for ( let j = 0; j < this.arrayAutores.length; j++ ){
                    let nom = <HTMLInputElement> document.getElementById('autor-' + j);
                    nom.value = x[j];
                }
            }, 500);
        }
    }

    separarIdCursos() {
        for(let i = 0; i < this._iestdesk.cursosLaterales.length; i++) {
            this.temp.push(this._iestdesk.cursosLaterales[i].idCurso);
        }
        this.idCursos = this.temp.join("|");
        this.temp = [];
    }

    agrupar(temas){
        for(let i = 0; i < this._iestdesk.cursosLaterales.length; i++) {
            if(!this.pubCursos.find(x => x.idCurso == this._iestdesk.cursosLaterales[i].idCurso)){
                this.pubCursos.push({
                    idCurso:  this._iestdesk.cursosLaterales[i].idCurso,
                    materia:  this._iestdesk.cursosLaterales[i].materia,
                    clave:  this._iestdesk.cursosLaterales[i].clave,
                    temas: temas.filter(temas => temas.idCurso == this._iestdesk.cursosLaterales[i].idCurso)
                });
            }
        }
    }

    agregaAutores(){
        let i = this.arrayAutores.length;
        
        let x = this.arrayAutores[i-1].num + 1;
        this.arrayAutores.push({ num: x });
    }

    eliminaAutores(index){
        this.arrayAutores.splice(index, 1)
    }

    revisa(e) {
        if(e.target.checked){ 
            this.temp.push(e.target.value);
        } else {
            let index = this.temp.indexOf(e.target.value);
            this.temp.splice(index,1);
        }
        //console.log(JSON.stringify(this.temp));
    }

    verReutilizar() {
        this.reutilizar = true;
        this.btnReutilizar = false;
    }

    regresarAlta(regreso) {
        if ( regreso == 1 ) {
            this.reutilizar = false;
            this.btnReutilizar =  true;
        }
    }

    reutilizado(bibliografia) {
        this.bibliografia.patchValue({ 
            idBibliografia : bibliografia.idBibliografia,
            titulo : bibliografia.titulo,
            editorial: bibliografia.editorial,
            edicion: bibliografia.edicion,
            anio: bibliografia.anio,
            autores: bibliografia.autor 
        });

        this.arrayAutores.splice(0, 1);
        let x = bibliografia.autor.split('|');
        
        for ( let i = 0; i < x.length; i++ ) {
            this.arrayAutores.push(i);
        }
        
        this.chRef.detectChanges();
        setTimeout( () => {
			for ( let j = 0; j < this.arrayAutores.length; j++ ){
                let nom = <HTMLInputElement> document.getElementById('autor-' + j);
                nom.value = x[j];
            }
		}, 500);
        

        this.vieneDeReutilizar = true;
        this.regresarAlta(1);
    }

    agrupaAutores() {
        let x = this.arrayAutores.length;
        let y = [];
        let z: string;

        for ( let i = 0; i < x; i++ ) {
            let nom = <HTMLInputElement> document.getElementById('autor-' + i);
            
            if ( nom.value.trim() != '' )
                y.push(nom.value);
        }

        if( y.length == x )
            return y.join('|');
        else
            return '1';
    }

    validaBibliografia() {
		//this.bibliografia.value.comentarios.replace(/<img .*?>/g, "");
        let autoresCadena: string = this.agrupaAutores();

        this.bibliografia.patchValue({ 
            idCursos: this.temp.join('|'),
            autores: autoresCadena
        });
console.log(this.bibliografia);
        if ( this.bibliografia.valid && autoresCadena != '1' ) {
            if ( this.editando ) 
                this.editaBibliografia();
            else
                this.altaBibliografia();
        } else {
            this.mensaje = 'Llene todos los campos antes de continuar';
            this.tipoRespuesta = 2;
            this.ngxSmartModalService.getModal('dialogoInformacion').open();
        }
    }

    altaBibliografia(){
        let params = {
            servicio: "infoCurso",
            accion: "IDesk_Maestro_Bibliografia_Alta",
            tipoRespuesta: "json",
            idBibliografia: this.bibliografia.value.idBibliografia,
            titulo: this.bibliografia.value.titulo,
            editorial: this.bibliografia.value.editorial,
            edicion: this.bibliografia.value.edicion,
            anio: this.bibliografia.value.anio,
            lugar: this.bibliografia.value.lugar,
            autores: this.bibliografia.value.autores,
            idCursos: this.bibliografia.value.idCursos,
            comentarios: this.bibliografia.value.comentarios,
            idpersonidesk: this._iestdesk.idPerson
        };
        this._infoCurso.consultas(params)
            .subscribe(resp => {
                this.mensaje = resp[0].mensaje;
                if(resp[0].error == 0){
                    this.tipoRespuesta = 1;
                    this._infoCurso.idBibliografia = 0;
                    this.guardado = true;
                    this.ngxSmartModalService.getModal('dialogoInformacion').open();
                } else {
                    this.tipoRespuesta = 2;
                    this.ngxSmartModalService.getModal('dialogoInformacion').open();
                }
            },
            errors => {
                console.log(errors);
            });
    }

    editaBibliografia(){
        let params = {
            servicio: "infoCurso",
            accion: "IDesk_Maestro_Bibliografia_Edita",
            tipoRespuesta: "json",
            idBibliografia: this.bibliografia.value.idBibliografia,
            titulo: this.bibliografia.value.titulo,
            editorial: this.bibliografia.value.editorial,
            edicion: this.bibliografia.value.edicion,
            anio: this.bibliografia.value.anio,
            lugar: this.bibliografia.value.lugar,
            autores: this.bibliografia.value.autores,
            idCursos: this.bibliografia.value.idCursos,
            comentarios: this.bibliografia.value.comentarios,
            idpersonidesk: this._iestdesk.idPerson
        };
        this._infoCurso.consultas(params)
            .subscribe(resp => {
                this.mensaje = resp[0].mensaje;
                if(resp[0].error == 0){
                    this.tipoRespuesta = 1;
                    this._infoCurso.idBibliografia = 0;
                    this.guardado = true;
                    this.ngxSmartModalService.getModal('dialogoInformacion').open();
                } else {
                    this.tipoRespuesta = 2;
                    this.ngxSmartModalService.getModal('dialogoInformacion').open();
                }
            },
            errors => {
                console.log(errors);
            });
    }

    cancelaBibliografia(){
        this.cerrarDialogo(0);
    }

    cierraDialogoInfo(resp) {
        this.ngxSmartModalService.getModal('dialogoInformacion').close();
        if ( this.tipoRespuesta == 1 && this.guardado ) 
            this.cerrarDialogo(1);
    }

    cerrarDialogo(cerrado: number) {
        this.bibliografia.reset();
        this.limpiaVariables();
        this.estaCerrado.emit(cerrado);
    }

    limpiaVariables() {
        this.temp = [];
        this.bibliografia.patchValue({ idVinculo: 0, idpersonidesk: this._iestdesk.idPerson });
    }
}