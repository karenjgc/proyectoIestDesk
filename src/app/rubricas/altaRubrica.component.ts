import { Component, ChangeDetectorRef, ElementRef, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators, FormBuilder, FormGroup} from '@angular/forms';

import { FroalaOptions } from '../shared/iestdesk/froala';
import { Validaciones } from '../shared/classes/validaciones';

import { Iestdesk } from '../services/iestdesk.service';
import { Rubricas } from "../services/rubricas.service";

import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
    selector: 'idesk-altaRubrica',
    templateUrl: './altaRubrica.component.html'
})

export class AltaRubricasComponent implements OnInit {
    @Input() altaExterna: boolean;
    @Output() alta = new EventEmitter();

    public opcFroala = new FroalaOptions();
    public validaciones = new Validaciones();
    public options: Object = this.opcFroala.opciones;
    public basic: Object =  this.opcFroala.opcionesBasico;
    public objectKeys = Object.keys;

    public productos = [];
    public grados = [];
    public tituloPagina: string;

    public idRubrica: number = 0;
    public rubrica: FormGroup;
    public _rubrica = {};
    public colspanNiveles: number = 0;
    public numCategorias: number = 0;
    public niveles = [];
    public categorias = [];

    public tmpRubrica: string[][];
    public rubricaValida: boolean;
    public descripcionesFinal;
    public nivelesFinal;
    public categoriasFinal;

    public mensaje: string;
    public tipoRespuesta: number;
    public guardado: boolean = false;
    
    constructor(
        public _iestdesk: Iestdesk,
        private _rubricas: Rubricas,
        private chRef: ChangeDetectorRef,
        private elRef: ElementRef,
        private formBuilder: FormBuilder,
        public ngxSmartModalService: NgxSmartModalService,
        private router: Router,
        private route: ActivatedRoute
    ){
		console.clear();
		console.log("\n      _..------.._\n    .'   .-\"\"-.   '.\n    |\\   '----'   /|\n    \\ `'--------'` / \n     '._        _.'\n        `\"\"\"\"\"\"`"); //unsere schöne Donut! <3
        this.rubrica = this.formBuilder.group({
            idRubrica: this.idRubrica,
            titulo: ['', Validators.required],
            descripcion: ['', Validators.required],
            tipoRubrica: 1,
			nivelEstudios: [this._iestdesk.idGrado, Validators.required],
            producto: [1, Validators.required],
            compartir: ['', Validators.required],
            niveles: ['', Validators.required],
            categorias: ['', Validators.required],
            descripciones: ['', Validators.required],
			idpersonidesk: this._iestdesk.idPerson
        });

        this.idRubrica = this._rubricas.idRubrica;
        if ( this.idRubrica == 0 ) {
            for ( let x = 0; x < 3; x++ ) {
                this._rubrica[x] = [];
                for ( let y = 0; y < 3; y++ ) {
                    this._rubrica[x].push({
                        nivel: y,
                        contenido: ''
                    });
                }
                this.niveles.push('');
                this.categorias.push('');
            }
            
            this.colspanNiveles = this.numCategorias = 3;
        }
    }

    ngOnInit() {
        this._iestdesk.registraAcceso(55, this.idRubrica);
        this.obtieneNiveles();
        this.obtieneProductos();

        if ( this.idRubrica == 0 ) {
            
            this.tituloPagina = "Agregar rúbrica IEST";
        } else {
            let params = {
                servicio: "rubricas",
                accion: "IDesk_Rubrica_Detalle",
                tipoRespuesta: "json",
                idRubrica: this.idRubrica
            };
    
            this._rubricas.consultas(params)
                .subscribe(resp => {
                    this.tituloPagina = resp[0].nombre;
                    this.rubrica.patchValue({
                        idRubrica: this.idRubrica,
                        titulo: resp[0].nombre,
                        descripcion: resp[0].descripcion,
                        tipoRubrica: 1,
                        nivelEstudios: resp[0].idGrado,
                        producto: resp[0].idProductoRubrica,
                        compartir: resp[0].c
                    });
                },
                errors => {
                    console.log(errors);
                });

            let params1 = {
                servicio: "rubricas",
                accion: "IDesk_Rubrica_Vista",
                tipoRespuesta: "json",
                idRubrica: this.idRubrica
            };
    
            this._rubricas.consultas(params1)
                .subscribe(resp => {
                    this.armaDatos(resp);
                },
                errors => {
                    console.log(errors);
                });
        }
    }

    armaDatos(rubrica) {

        for ( let r of rubrica ) {
            let x = Number(r.orden) - 1;
            if ( !this._rubrica.hasOwnProperty(x) ) {
                this._rubrica[x] = [];
                this.categorias.push(r.titulo);
                this.numCategorias++;
            }
            if( !this.niveles.find(x => x == r.nombreValor) ) {
                this.niveles.push( r.nombreValor );
                this.colspanNiveles++;
            }

            this._rubrica[x].push({
                nivel: r.valor,
                contenido: r.descripcion
            });

        }

        //console.log(this._rubrica);
    }

    obtieneNiveles() {
        let params = {
            servicio: "idesk",
            accion: "IDesk_ObtieneGrados",
            tipoRespuesta: "json"
        };

        this._iestdesk.consultas(params)
            .subscribe(resp => {
                this.grados = resp;
            },
            errors => {
                console.log(errors);
            });
    }

    obtieneProductos() {
        let params = {
            servicio: "rubricas",
            accion: "IDesk_Maestro_Rubricas_ListadoProductos",
            tipoRespuesta: "json"
        };

        this._rubricas.consultas(params)
            .subscribe(resp => {
                this.productos = resp;
            },
            errors => {
                console.log(errors);
            });
    }

    aumentarNiveles(){
        if ( this.colspanNiveles < 5 ) {
            this.niveles.push('');
            this.colspanNiveles++;
            for ( let x = 0; x < this.numCategorias; x++ ) {
                //console.log(this._rubrica[x]);
                this._rubrica[x].push({
                    nivel: this.colspanNiveles - 1,
                    contenido: ''
                });
            }
        } else {
            this.mensaje = 'El número máximo de niveles permitidos en la rúbrica es de 5';
            this.tipoRespuesta = 2;
            this.ngxSmartModalService.getModal('dialogoInformacionRubrica').open();
        }
        //console.log(this.niveles, this.niveles.length);
    }

    aumentarCategorias(){
        if ( this.numCategorias < 5 ) {
            this.categorias.push();
            this.numCategorias++;
            this._rubrica[this.numCategorias - 1] = [];
            for ( let y = 0; y < this.colspanNiveles; y++ ) {
                this._rubrica[this.numCategorias - 1].push({
                    nivel: y,
                    contenido: ''
                });
            }
        } else {
            this.mensaje = 'El número máximo de categorias permitidas en la rúbrica es de 5';
            this.tipoRespuesta = 2;
            this.ngxSmartModalService.getModal('dialogoInformacionRubrica').open();
        }
    }

    eliminarCategorias(index) {
        //console.log(index, this._rubrica[index]);
        if ( this.numCategorias > 3 ) {
            this.numCategorias--;
            this.categorias.splice(index, 1);
            delete this._rubrica[index];
        } else {
            this.mensaje = 'El número mínimo de categorias permitidas en la rúbrica es de 3';
            this.tipoRespuesta = 2;
            this.ngxSmartModalService.getModal('dialogoInformacionRubrica').open();
        }
        //console.log(this._rubrica);
    }

    eliminarNiveles(index) {
        //console.log(index);
        if ( this.colspanNiveles > 3 ) {
            this.colspanNiveles--;
            this.niveles.splice(index, 1);
            for ( let x = 0; x < this.numCategorias; x++ ) {
                this._rubrica[x].splice(index,1);
            }
        } else {
            this.mensaje = 'El número mínimo de niveles permitidos en la rúbrica es de 3';
            this.tipoRespuesta = 2;
            this.ngxSmartModalService.getModal('dialogoInformacionRubrica').open();
        }
        //console.log(this._rubrica);
    }

    armaRubrica(){
        this.nivelesFinal = [];
        this.categoriasFinal = [];

        let cartegoriasYay = [];
        let descripcionesYay = [];
        let nivelesYay = [];
        let tmp = [];
        let tmp1 = [];
        let tmp2 = [];

        this.rubricaValida = true;

        for( let i = 0; i < this.categorias.length; i++ ){
            let cat = this.categorias[i];

            cat != '' ? cartegoriasYay.push(cat) : this.rubricaValida = false;
        }

        for ( let l = 0; l < this.niveles.length; l++ ) {
            let n = <HTMLInputElement> document.getElementById('nombreValor-' + (this.niveles.length - l));

            n.value != '' ? ( tmp1.push(n.value), tmp2.push(this.niveles.length - l)) : this.rubricaValida = false;
        }
        nivelesYay.push(tmp2.join('|'), tmp1.join('|'));


        for ( let r in Object.keys(this._rubrica) ) {
            for ( let n in this._rubrica[r]) {
                this._rubrica[r][n].contenido != '' ? tmp.push(this._rubrica[r][n].contenido): this.rubricaValida = false;
            }
            descripcionesYay.push(tmp.join('|'));
            tmp = [];
        }

        this.nivelesFinal = nivelesYay.join('$').replace(/<img .*?>/g, "");
        this.categoriasFinal = cartegoriasYay.join('|').replace(/<img .*?>/g, "");
        this.descripcionesFinal = descripcionesYay.join('$').replace(/<img .*?>/g, "");
    }

    validaRubrica(){
		this.rubrica.value.descripcion.replace(/<img .*?>/g, "");
        this.armaRubrica();
        let comp = <HTMLInputElement> document.getElementById('compartir');
        comp ? this.rubrica.patchValue({ compartir: 1 }) : this.rubrica.patchValue({ compartir: 0 });
        if ( this.rubricaValida )
            this.rubrica.patchValue({
                niveles: this.nivelesFinal,
                categorias: this.categoriasFinal,
                descripciones: this.descripcionesFinal
            })

        if (  this.rubrica.valid ) {
            this.idRubrica == 0 ? this.altaRubrica() : this.editaRubrica();
        } else {
            this.mensaje = 'Ingresa la información antes de continuar';
            this.tipoRespuesta = 2;
            this.ngxSmartModalService.getModal('dialogoInformacionRubrica').open();
        }
    }

    altaRubrica() {
        let params = {
            servicio: "rubricas",
            accion: "IDesk_Maestro_Rubricas_Alta",
            tipoRespuesta: "json",
            nombre: this.rubrica.value.titulo,
            descripcion: this.rubrica.value.descripcion,
            nivel: this.rubrica.value.nivelEstudios,
            idProductoRubrica: this.rubrica.value.producto,
            compartir: this.rubrica.value.compartir,
            idTipoRubrica: this.rubrica.value.tipoRubrica,
            categorias: this.rubrica.value.categorias,
            niveles: this.rubrica.value.niveles,
            descripciones: this.rubrica.value.descripciones,
            idpersonidesk: this.rubrica.value.idpersonidesk
        };

        this._rubricas.consultas(params)
            .subscribe(resp => {
                this.mensaje = resp[0].mensaje;
                if ( resp[0].error == 0 ) {
                    this.tipoRespuesta = 1;
                    this.idRubrica = resp[0].idRubrica;
                    this.guardado = true;
                } else {
                    this.tipoRespuesta = 2;
                }
                this.ngxSmartModalService.getModal('dialogoInformacionRubrica').open();
            },
            errors => {
                console.log(errors);
            });
    }

    editaRubrica() {
        let params = {
            servicio: "rubricas",
            accion: "IDesk_Maestro_Rubricas_Edita",
            tipoRespuesta: "json",
            idRubrica: this.idRubrica,
            nombre: this.rubrica.value.titulo,
            descripcion: this.rubrica.value.descripcion,
            nivel: this.rubrica.value.nivelEstudios,
            idProductoRubrica: this.rubrica.value.producto,
            compartir: this.rubrica.value.compartir,
            idTipoRubrica: this.rubrica.value.tipoRubrica,
            categorias: this.rubrica.value.categorias,
            niveles: this.rubrica.value.niveles,
            descripciones: this.rubrica.value.descripciones,
            idpersonidesk: this.rubrica.value.idpersonidesk
        };
        //console.log(params);
        this._rubricas.consultas(params)
            .subscribe(resp => {
                this.mensaje = resp[0].mensaje;
                if ( resp[0].error == 0 ) {
                    this.tipoRespuesta = 1;
                    this.idRubrica = resp[0].idRubrica;
                    this.guardado = true;
                } else {
                    this.tipoRespuesta = 2;
                }
                this.ngxSmartModalService.getModal('dialogoInformacionRubrica').open();
            },
            errors => {
                console.log(errors);
            });
    }

	cierraDialogoInfo(resp) {
        this.ngxSmartModalService.getModal('dialogoInformacionRubrica').close();
        this.chRef.detectChanges();
		if( this.altaExterna == true && this.guardado ){
			this.alta.emit(this.idRubrica);
		} else {
			if ( this.guardado ) {
                this.router.navigate(['/rubricas-iest']);
            }
		}
	}

    cancelar(){
        if( this.altaExterna == true ){
			this.alta.emit(0);
		} else {
			this.router.navigate(['/rubricas-iest']);
		}
    }
}