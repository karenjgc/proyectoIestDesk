import { Component, ChangeDetectorRef, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Iestdesk } from '../services/iestdesk.service';
import { Rubricas } from '../services/rubricas.service';

import { NgxSmartModalService } from 'ngx-smart-modal';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'idesk-vistaRubrica',
    templateUrl: './vistaRubrica.component.html'
})

export class VistaRubricaComponent implements OnInit {
    public rolActual: number;
    public mostrarMenu: boolean;

    public idRubrica: number = 0;
    public nombre: string = '';
    public rubrica;
    public tablaRubrica =[];
    public niveles: number;
    public niv = [];
    public _vistaAlumno:boolean = false;
    public _cambio: number = 0;
    
    public mensaje: string;
    public tipoRespuesta: number;

    constructor(
        private _iestdesk: Iestdesk,
        private _rubricas: Rubricas, 
        private chRef: ChangeDetectorRef,
		private http: HttpClient,
        private router: Router,
        private route: ActivatedRoute,
		public ngxSmartModalService: NgxSmartModalService
    ){
        this.idRubrica = this._rubricas.idRubrica;
        this.rolActual = this._iestdesk.rolActual;
    }

    ngOnInit() {
        this._iestdesk.registraAcceso(37, this.idRubrica);
        if ( this._rubricas.idRubrica != 0 ){
            this.detalleRubrica();
            this.vistaRubrica();
        }
        this._vistaAlumno == true ? this.mostrarMenu = false : this.mostrarMenu = true;
    }

    @Input() 
    set vistaAlumno ( v:boolean) {
        if ( this._vistaAlumno != v ) {
            this._vistaAlumno = v;
            
            this._vistaAlumno == true ? this.mostrarMenu = false : this.mostrarMenu = true;
        }
        //console.log(this._vistaAlumno);
    }

    @Input()
    set cambio ( c:number ) {
        if ( this._cambio != c ) {
            this._cambio = c;

            this.idRubrica = this._cambio;
            if ( this._rubricas.idRubrica != 0 ){
                this.detalleRubrica();
                this.vistaRubrica();
            }
        }
    }

    detalleRubrica() {
        let params = {
            servicio: "rubricas",
            accion: "IDesk_Rubrica_Detalle",
            tipoRespuesta: "json",
            idRubrica: this.idRubrica
        };

        this._rubricas.consultas(params)
            .subscribe(resp => {
                this.rubrica = resp[0];
                this.nombre = resp[0].nombre;
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
            idRubrica: this.idRubrica
        };

        this._rubricas.consultas(params)
            .subscribe(resp => {
                this.armaRubrica(resp);
            },
            errors => {
                console.log(errors);
            });
    }

    armaRubrica(r) {
        this.tablaRubrica = [];
        for ( let i = 0; i < r.length; i++ ) {
            if ( !this.tablaRubrica.find( x => x.idCategoria == r[i].idRubricaCategoria ) ) {
                let niveles = r.filter( y => y.idRubricaCategoria == r[i].idRubricaCategoria );
                this.tablaRubrica.push({
                    idCategoria: r[i].idRubricaCategoria,
                    titulo: r[i].titulo,
                    niveles: niveles.map(function (n) {
                        return { valor: n.valor, descripcion: n.descripcion }
                    })
                });
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

    reinicia() {
        this.rubrica = '';
        this.idRubrica = 0;
        this.tablaRubrica = [];
        this.niveles = 0;
        this.niv = [];
    }

    gotoEditar() {
        let params = {
            servicio: "rubricas",
            accion: "IDesk_Rubrica_VerificaUso",
            tipoRespuesta: "json",
            idRubrica: this._rubricas.idRubrica
        };

        this._rubricas.consultas(params)
            .subscribe(resp => {
                if ( resp[0].usada == 1 ) {
                    this.tipoRespuesta = 2;
                    this.mensaje = 'La rúbrica ya fue usada para revisión, por lo tanto no puede ser editada';
                    this.ngxSmartModalService.getModal('dialogoInformacionRub').open();
                } else {
                    this.router.navigate(['/rubricas-iest/nueva']);
                }
            },
            errors => {
                console.log(errors);
            }); 
    }

    cierraDialogoInfo(resp) {
        this.ngxSmartModalService.getModal('dialogoInformacionRub').close();
    }
}