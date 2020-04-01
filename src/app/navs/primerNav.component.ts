import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { Iestdesk } from '../services/iestdesk.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { BibliotecaVirtualComponent } from '../bibliotecaVitual/bibliotecaVirtual.component';
import { ConfiguracionesComponent } from '../configuraciones/configuraciones.component';

@Component({
    selector: 'idesk-primerNav',
    templateUrl: './primerNav.component.html'
})
export class PrimerNavComponent implements OnInit {
    public variosRoles: Boolean = false;
    public nombre_curso: string;
    public actual: number;
    public rol;
    public editor: boolean = false;
    public tieneRol: number = 1;

    public _idPerson: number = 0;
    public _roles = [];

    modalReference: any;
    modalOption: NgbModalOptions = {
        backdrop: 'static',
        keyboard: false
    };

    constructor(
        private _iestdesk: Iestdesk,
        private _modalService: NgbModal,
        private location: Location,
        private router: Router
    ){
        if(this._iestdesk.idPerson == 0){
            let params = {
                servicio: "idesk",
                accion: "IDesk_Obtiene_IdIEST",
                tipoRespuesta: "json"
            };

            this._iestdesk.consultas(params)
                .subscribe(resp => {
                    this._iestdesk.idPerson = resp.idPerson;
                    this.obtieneDatosPersonales(resp.idPerson);
                    this.obtieneRol(resp.idPerson);
                    if ( this._iestdesk.cursoActual ) this.nombre_curso = this._iestdesk.cursoActual;
                },
                errors => {
                    console.log(errors);
                });
        } else {
            this.evaluaRoles(this._iestdesk.rol[0]);
            if( !(this.router.url === '/' || this.router.url == '/inicio') )
                this.nombre_curso = this._iestdesk.cursoActual;
        }
		console.clear();
		console.log("\n                    /\n               ,.. /\n             ,'   ';\n  ,,.__    _,' /';  .\n :','  ~~~~    '. '~\n:' (   )         )::,\n'. '. .=----=..-~  .;'\n '  ;'  ::   ':.  '\"\n   (:   ':    ;)\n    \\\\   '\"  ./\n     '\"      '\"");
    }
/*
    @Input() 
    set idPerson ( idPerson: number ) {
        if ( this._idPerson != idPerson ){
            this._idPerson = idPerson;
        }
    }

    @Input() 
    set roles ( roles ) {
        if ( this._roles != roles ){
            this._roles = roles;
        }
    }*/

    ngOnInit(){
        /*if ( this._idPerson == 0 ) this._idPerson = this._iestdesk.idPerson;
        if ( this._roles.length == 0 ) this.evaluaRoles(this._roles); else this.evaluaRoles(this._iestdesk.rol);*/
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
            //console.log('Nombre Usuario:', this._iestdesk.login);
        },
        errors => {
            console.log(errors);
        });
    }

    obtieneRol(idPerson){
        let params = {
            servicio: "idesk",
            accion: "IDesk_RolesdePersona",
            tipoRespuesta: "json",
            idpersonidesk: idPerson
        };

        this._iestdesk.consultas(params)
            .subscribe(resp => {
                this._iestdesk.rol = resp;
                if ( this._iestdesk.rol[0].rolMaestro == 1 ) 
                    this._iestdesk.rolActual = 1;
                else 
                    this._iestdesk.rolActual = 2;
                this.evaluaRoles(resp[0]);
            },
            errors => {
                console.log(errors);
            });
    }

    evaluaRoles(rol){
        if( rol.variosRoles == 1 )
            this.variosRoles = true;

        if ( rol.rolMaestro == 1 ) 
            if ( this._iestdesk.rolActual == 0 ) this._iestdesk.rolActual = 1;
        else if( rol.rolAlumno == 1 )
            if ( this._iestdesk.rolActual == 0 ) this._iestdesk.rolActual = 2;
        else if( rol.rolEditor == 1 )
            if ( this._iestdesk.rolActual == 0 ) this._iestdesk.rolActual = 3;
        else if( rol.rolDisenador == 1 )
            if ( this._iestdesk.rolActual == 0 ) this._iestdesk.rolActual = 4;
            
        if ( rol.rolEditor == 1 )
            this.editor = true;

        this.actual = this._iestdesk.rolActual;

        if( rol.rolMaestro == 0 && rol.rolAlumno == 0 && rol.rolEditor == 1 && rol.rolDisenador == 1) 
            this.tieneRol = 0;
        else
            this.tieneRol = 1;

        this.rol = rol;
    }

    cambiarRol(rol) {
        this._iestdesk.rolActual = rol;
        this._iestdesk.registraAcceso(40, rol);
        if ( rol < 3 ) {
            this._iestdesk.cambiarRol();
            if( this.router.url === '/')
                this.router.navigate(['/inicio']);
            else
                this.router.navigate(['']);
        } else {
            switch(rol) {
                case 3:
                    this.router.navigate(['/editor']);
                    //window.open('https://sie.iest.edu.mx/iestdesk/editor', '_self');
                    break;
                case 4: 
                    //this._iestdesk.idCursoActual = 695;
                    this.router.navigate(['/disenador']);
                    break;
            }
        }
    }

    gotoMain(){
        this._iestdesk.limpiaVariablesCurso();
        this._iestdesk.rolActual < 4 ? this.router.navigate(['/']) : this.router.navigate(['/disenador']);
    }

    abreBibliotecas() {
        this.modalReference = this._modalService.open( BibliotecaVirtualComponent, { backdrop: 'static' });
    }

    abreConfiguraciones() {
        this.modalReference = this._modalService.open( ConfiguracionesComponent, { backdrop: 'static' });
    }

}