import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

import { Iestdesk } from '../services/iestdesk.service';
import { Rubricas } from '../services/rubricas.service';

import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
    selector: 'idesk-revisionRubrica',
    templateUrl: './revisionRubrica.component.html'
})

export class RevisionRubricaComponent implements OnInit {
    @Output() calificacion = new EventEmitter();

    public rubrica = [];
    public seleccionados = [];
    public rolActual: number;
    public _idAlumno: number;
    public _idRubrica;
    public _idElemento;
    public _tipo;
    public tablaRubrica = [];
    public niv = [];
    public niveles;
    public categorias = 0;
    public calificacionTmp: number = 0;
    
    public mensaje: string;
    public tipoRespuesta: number;

    constructor (
        private _iestdesk: Iestdesk,
        private _rubricas: Rubricas,
        public ngxSmartModalService: NgxSmartModalService
    ){
        this.rolActual = this._iestdesk.rolActual;
    }

    ngOnInit(){
        this.rubricaRevisada();
        this.obtieneCalificacion();
        
        this.vistaRubrica();
    }

    @Input() 
    set idAlumno ( idAlumno: number ) {
        if ( this._idAlumno != idAlumno ) {
            this._idAlumno = idAlumno;
        }
    }

    @Input() 
    set idRubrica ( idRubrica: number ) {
        if ( this._idRubrica != idRubrica ) {
            this._idRubrica = idRubrica;
        }
    }

    @Input() 
    set idElemento ( idElemento: number ) {
        if ( this._idElemento != idElemento ) {
            this._idElemento = idElemento;
        }
    }

    @Input() 
    set tipo ( tipo: number ) {
        if ( this._tipo != tipo ) {
            this._tipo = tipo;
        }
    }

    rubricaRevisada() {
        let params = {
            servicio: "rubricas",
            accion: "IDesk_Rubrica_Valores_Alumno",
            tipoRespuesta: "json",
            idElemento: this._idElemento, 
            tipo: this._tipo, 
            idAlumno: this._idAlumno
        };

        this._rubricas.consultas(params)
            .subscribe(resp => {
                this.seleccionados = resp;
            },
            errors => {
                console.log(errors);
            });
    }

    vistaRubrica(){
        let params = {
            servicio: "rubricas",
            accion: "IDesk_Rubrica_Vista",
            tipoRespuesta: "json",
            idRubrica: this._idRubrica
        };

        this._rubricas.consultas(params)
            .subscribe(resp => {
                this.rubrica = resp;
                this.armaRubrica(resp);
            },
            errors => {
                console.log(errors);
            });
    }

    armaRubrica(r) {
        this.categorias = 0;
        this.tablaRubrica = [];
        let seleccionados = this.seleccionados;
        for ( let i = 0; i < r.length; i++ ) {
            if ( !this.tablaRubrica.find( x => x.idCategoria == r[i].idRubricaCategoria ) ) {
                let niveles = r.filter( y => y.idRubricaCategoria == r[i].idRubricaCategoria );
                this.tablaRubrica.push({
                    idCategoria: r[i].idRubricaCategoria,
                    titulo: r[i].titulo,
                    niveles: niveles.map(function (n) {
                        let x = 'campoRubrica';
                        if ( seleccionados.find( z => z.idRubricaDescripcion == n.idRubricaDescripcion ) )
                            x = 'campoRubrica-seleccionado' 
                        else
                            x = 'campoRubrica';
                        return { 
                            idRubricaDescripcion: n.idRubricaDescripcion, 
                            idRubricaCategoria: n.idRubricaCategoria, 
                            valor: n.valor, 
                            descripcion: n.descripcion, 
                            clase: x
                        }
                    })
                });
                this.categorias++;
                this.niveles = niveles.length;
            }

            if ( !this.niv.find( z => z.idRubricaNivel == r[i].idRubricaNivel ) ) {
                this.niv.push({
                    idRubricaNivel: r[i].idRubricaNivel,
                    valor: r[i].valor,
                    nombreValor: r[i].nombreValor
                });
            }
        }
    }

    evalua (idRubricaDescripcion, idRubricaCategoria, valor) {
        let valorMax = this.categorias * this.niveles;
        let valorObtenido = 0;

        if ( this.seleccionados.find( x => x.idRubricaCategoria == idRubricaCategoria ) ) {
            this.seleccionados.splice( this.seleccionados.findIndex(x => x.idRubricaCategoria == idRubricaCategoria) , 1)
        }

        this.seleccionados.push({
            idRubricaDescripcion: idRubricaDescripcion,
            idRubricaCategoria: idRubricaCategoria,
            valor: valor
        }); 

        for ( let s of this.seleccionados) {
            valorObtenido += Number(s.valor);
        }
        //console.log(valorMax, valorObtenido);

        this.calificacionTmp = Math.round((valorObtenido * 10)/valorMax);
        
        this.armaRubrica(this.rubrica);
    }

    guardaRevision(){
        if( this.categorias != this.seleccionados.length ) {
            this.mensaje = 'Seleccione un valor para todas las categorías de la rúbrica';
            this.tipoRespuesta = 2;
            this.ngxSmartModalService.getModal('dialogoInformacionRevRubrica').open();
        } else {
            let r = [];
            for ( let s of this.seleccionados ) {
                r.push(s.idRubricaDescripcion);
            }

            let params = {
                servicio: "rubricas",
                accion: "IDesk_Rubrica_Revision_Alta",
                tipoRespuesta: "json",
                idRubricaDescripcion: r.join('|'), 
                idElemento: this._idElemento, 
                tipo: this._tipo, 
                idAlumno: this._idAlumno, 
                idRubrica: this._idRubrica, 
                idpersonidesk: this._iestdesk.idPerson
            };

            this._rubricas.consultas(params)
                .subscribe(resp => {
                    if ( resp[0].error == 0 ) {
                        this.calificacion.emit(resp[0].calificacion)
                    } else {
                        this.mensaje = resp[0].mensaje;
                        this.tipoRespuesta = 2;
                        this.ngxSmartModalService.getModal('dialogoInformacionRevRubrica').open();
                    }
                },
                errors => {
                    console.log(errors);
                });
        }
    }

    obtieneCalificacion() {
        let params = {
            servicio: "rubricas",
            accion: "IDesk_Rubrica_Calificacion",
            tipoRespuesta: "json",
            idRubrica: this._idRubrica, 
            idAlumno: this._idAlumno, 
            idElemento: this._idElemento, 
            tipo: this._tipo
        };

        this._rubricas.consultas(params)
            .subscribe(resp => {
                if ( resp.length > 0 )
                    this.calificacionTmp = resp[0].calificacion;
            },
            errors => {
                console.log(errors);
            });
    }

    cierraDialogoInfo(resp) {
        this.ngxSmartModalService.getModal('dialogoInformacionRevRubrica').close();
    }
}