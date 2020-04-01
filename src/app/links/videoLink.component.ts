import { Component, Output, Input, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Validators, FormBuilder, FormGroup} from '@angular/forms';

import { Iestdesk } from '../services/iestdesk.service';
import { Links } from "../services/links.service";

import { Validaciones } from '../shared/classes/validaciones';

@Component({
    selector: 'idesk-videoLink',
    templateUrl: './videoLink.component.html'
})

export class VideoLinkComponent  {
    @Input() tituloL: string;
    @Output() linksAdjuntos = new EventEmitter();

    public validaciones = new Validaciones();

    public link: FormGroup;
    public tipoLink: number = 0;
    public idVideo;
    public urlVideo;
    public _editando = 0;
    public error: boolean = false;
    public error1: boolean = false;
    
    public mensajeDialogo: string;
    public tipoRespuesta: number;

    constructor(
        private _iestdesk: Iestdesk,
        private _links: Links,
        private chRef: ChangeDetectorRef,
        private formBuilder: FormBuilder
    ){
        this.link = this.formBuilder.group({
            idLink: 0,
            titulo: 'Link de video - información de curso',
            enlace: ['', Validators.required],
            idTipoLink: [0, Validators.required],
            idpersonidesk: this._iestdesk.idPerson
        }); 

        this._links.rol = this._iestdesk.rolActual;
    }

    @Input()
    set editando( editando: number ) {
        console.log('desde editando: ', editando);
        if ( this._editando != editando ){
            this._editando = editando;
            this.defineLinkEdicion();
        }
    }

    defineLinkEdicion() {
        let params = {
            servicio: "links",
            accion: "IDesk_Links_Consulta",
            tipoRespuesta: "json",
            idLinks: this._editando,
            rol: 1
        };

        this._links.consultas(params)
            .subscribe(resp => {
                console.log(resp);
                this.link.patchValue({ 
                    idLink: resp[0].idLink,
                    titulo: resp[0].nombre,
                    enlace: resp[0].link,
                    idTipoLink: resp[0].idTipoLink });
                console.log(this.link.value);
                this.chRef.detectChanges();
                this.verificar();
            }, errors => {
                console.log(errors);
            });
    }

    verificar() {
        this.error = false;
        if ( this.idVideo = this.validaciones.matchYoutubeUrl(this.link.value.enlace) ) {
            console.log(this.idVideo);
            this.link.patchValue({ idTipoLink: 1 });
            this.urlVideo = 'https://www.youtube.com/embed/' + this.idVideo;
            this.tipoLink = this.link.value.idTipoLink;
            return true;
        } else if ( this.idVideo = this.validaciones.matchVimeoUrl(this.link.value.enlace) ) {
            this.link.patchValue({ idTipoLink: 2 });
            this.urlVideo = 'https://player.vimeo.com/video/' + this.idVideo;
            this.tipoLink = this.link.value.idTipoLink;
            return true;
        } else {
            this.error = true;
            this.link.patchValue({ idTipoLink: '' });
            this.tipoLink = this.link.value.idTipoLink;
            return false;
        }        
    }

    validaLink() {
        this.error1 = false;
        //console.log('valida link');
        if ( this.verificar() ) {
            if ( !this.link.valid ) {
                this.error1 = true;
            } else {
                this.altaLink();
            }
        }
    }

    //POLICIA: Otra vez se utiliza la misma función
    altaLink() {
        let params = {
            servicio: "links",
            accion: (this._links.rol == 1) ? "IDesk_Maestro_Link_Alta" : "IDesk_Alumno_Link_Alta",
            tipoRespuesta: "json",
            idCurso: this.link.value.idCurso,
            idTipoLink: this.link.value.idTipoLink,
            enlace: this.link.value.enlace,
            nombre: this.link.value.titulo,
            idpersonidesk: this.link.value.idpersonidesk
        };

        this._links.consultas(params)
            .subscribe(resp => {
                this.linksAdjuntos.emit(resp[0].idLink);
            },
            errors => {
                console.log(errors);
            });
    }

    elimina() {
        this.link.patchValue({ 
            enlace: '',
            idTipoLink: 0
        });     
        this.tipoLink = 0;
        this.urlVideo = '';
        this.linksAdjuntos.emit('0');
    }
}