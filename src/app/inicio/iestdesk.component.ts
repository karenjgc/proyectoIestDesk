import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Iestdesk } from '../services/iestdesk.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'idesk-inicio',
    templateUrl: './iestdesk.component.html'
})

export class IestdeskComponent implements OnInit {
    public cursos: any[]; 
    public cursosFiltrados = [];
    public tieneCursos: number;
    public usuario: number;
    public rol;

    public mostrarCambia: boolean = false;

    @ViewChild('primerNav') primerNav;

    constructor(
        private _iestdesk: Iestdesk,
        private chRef: ChangeDetectorRef,
        private router: Router,
        private route: ActivatedRoute,
        public toastNotificacion: ToastrService
    ){ 
        var ua= navigator.userAgent, tem, navegador,
        M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if(/trident/i.test(M[1])) {
            tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
            navegador = 'IE';
        }else {
            if(M[1]=== 'Chrome') {
                tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
                if(tem!= null) {
                    navegador = tem.slice(1).join(' ').replace('OPR', 'Opera');
                }
            }else {
                M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
                if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
                
                navegador = M[0];
            }
        }

        if (navegador === 'IE') {
          this.router.navigate(['error-navegacion']);
        }
        
        let dia = new Date("2018-10-29");
        if(new Date() < dia && localStorage.getItem("vioNotificacion") != "1"){
            localStorage.setItem("vioNotificacion", "1");
            this.toastNotificacion.info('¡Hemos extendido el soporte de la versión de prueba del IEST Desk para incluir el navegador Safari!', '🐬 Aviso 🐬', {
                timeOut: 15000,
                positionClass: 'toast-bottom-full-width'
            });
        }
    }

    ngOnInit(){ 
        if(this._iestdesk.idPerson == 0){
            
            let params = {
                servicio: "idesk",
                accion: "IDesk_Obtiene_IdIEST",
                tipoRespuesta: "json"
            };

            this._iestdesk.consultas(params)
                .subscribe(resp => {
                    this._iestdesk.idPerson = resp.idPerson;
                    this.usuario = resp.idPerson;

                    /* CTE: 11869, 18323, 12470, 8357, 17629, 17308 */

                    this.mostrarCambia = ( resp.idPerson == 6029 || resp.idPerson == 17837 || resp.idPerson == 15256 || resp.idPerson == 14741 || resp.idPerson == 19922 || resp.idPerson == 11869 || resp.idPerson == 18323 || resp.idPerson == 12470 || resp.idPerson == 8357 || resp.idPerson == 17629 || resp.idPerson == 17308 ) ? true : false;

                    this.obtieneRol(resp.idPerson);
                },
                errors => {
                    console.log(errors);
                });
        } else {
            this.obtieneCursos( this._iestdesk.rolActual, this._iestdesk.idPerson );
        }
    }
    
    obtieneDatosPersonales(idPerson){
        let params = {
            servicio: "idesk",
            accion: "IDesk_Obtiene_DatosPersonales",
            tipoRespuesta: "json",
            idpersonidesk: idPerson
        };

        this._iestdesk.consultas(params)
            .subscribe(resp => {
                this._iestdesk.login = resp[0].NombreUsuario;
               // console.log(this.usuario, this._iestdesk.login);
            },
            errors => {
                console.log(errors);
            });
    }

    obtieneRol(idPerson){
        let actual;
        let params = {
            servicio: "idesk",
            accion: "IDesk_RolesdePersona",
            tipoRespuesta: "json",
            idpersonidesk: idPerson
        };

        this._iestdesk.consultas(params)
            .subscribe(resp => {
                this._iestdesk.rol = resp;
                this.rol = resp;
                this._iestdesk.rolActual = actual = resp[0].rolMaestro == 1 ? 1 : 2;
                this.obtieneCursos( actual, idPerson );
            },
            errors => {
                console.log(errors);
            });
    }

    obtieneCursos(rol, idPerson) {
        let params = {
            servicio: "idesk",
            accion: rol == 1 ? "IDesk_Maestro_ListadoCursos" : "IDesk_Alumno_ListadoCursos",
            tipoRespuesta: "json",
            idTipoCurso: 0,
            idpersonidesk: idPerson
        };
        this._iestdesk.consultas(params)
			.subscribe(resp => {
				this.cursos = resp;
				if ( this.cursos.length > 0 ) {
					this.tieneCursos = 1;
					this.filtrar();
				} else 
					this.tieneCursos = 0;

			}, errors => {
				console.log(errors);
			});
    }

    filtrar() {
        for(let i = 0; i < this.cursos.length; i++) {
            if(!this.cursosFiltrados.find(x => x.idTipoCurso == this.cursos[i].idTipoCurso)){
                this.cursosFiltrados.push({
                    idTipoCurso: this.cursos[i].idTipoCurso,
                    etiqueta: this.cursos[i].etiqueta,
                    cursos: this.cursos.filter(curso => curso.idTipoCurso == this.cursos[i].idTipoCurso)
                });
            }
        }
    }

    goToCurso(curso){        
        this._iestdesk.idGrado = curso.idGrado;
        this._iestdesk.cursoActual = this._iestdesk.rolActual == 1 ? curso.materia + ' - ' + curso.clave : curso.materia;
        this._iestdesk.idCursoActual = curso.idCurso;
        this._iestdesk.idTipoCursoActual = curso.idTipoCurso;
        this._iestdesk.modalidadActual = curso.modalidad;
        this._iestdesk.faltas = [];
        this.router.navigate(['/curso', curso.idCurso, this._iestdesk.cursoActual]);
		
    }

    cambiaUsuario() {
        this._iestdesk.idPerson = this.usuario;
        this.cursosFiltrados = [];

        this.obtieneRol(this.usuario);
        this.obtieneDatosPersonales(this.usuario);
    
        this.chRef.detectChanges();
        this.primerNav.obtieneRol(this.usuario);
    }
}