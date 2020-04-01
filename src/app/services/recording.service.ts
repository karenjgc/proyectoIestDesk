import { Injectable, Inject } from '@angular/core';
import { ServicioBase } from './servicioBase.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class Recordings extends ServicioBase {

    public audio = {};
	public permiteGrabar: boolean = true;

    constructor(
        private http: HttpClient, @Inject("BaseURL") private BaseURL
    ) { 
		super(http, BaseURL);
    }

    setAudioGrabado(audioGrabado, idAudio){
        this.audio['audioGrabado'] = audioGrabado ;
        this.audio['idAudio'] = idAudio;
    }

    getAudioGrabado(){
        return this.audio;
    }
}