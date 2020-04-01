import { Component, Output, EventEmitter, ElementRef, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import * as $ from 'jquery';
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';

declare const navigator: any;
declare const MediaRecorder: any;

import { Recordings } from '../services/recording.service';
import { Iestdesk } from '../services/iestdesk.service';
import { Avisos } from '../services/avisos.service';

import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
	selector: 'idesk-audio',
	templateUrl: './audio.component.html'
})

export class RecordingComponent {
	@Output() adjuntaAudio = new EventEmitter();
	public isRecording: boolean = false;
	public saved: boolean = false;
	public chunks: any = [];
	public mediaRecorder: any;
	
	public isFinished: boolean = false;
	public audioSource: string;
	public audio: any;
	public idAudio;
	public createdBlob: any;
	//public valido: boolean = true;

	private idPerson: string;
    public mensaje: string;
	private duracion;
	private inicio;
	private fin;

	public tipoRespuesta: number;
	public mensajeDialogo: string;

	constructor(
		private _iestdesk: Iestdesk,
		private _recording: Recordings, 
		private http: HttpClient,
		private _avisos: Avisos,
		private sanitizer: DomSanitizer,
        private chRef: ChangeDetectorRef,
        private elRef: ElementRef,
        public ngxSmartModalService: NgxSmartModalService
    ) {
		this.idPerson = String(this._iestdesk.idPerson);
    }
	
	ngOnInit(){
		let al: any = $('#alerta-microfono');
		let al1: any = $('#alerta-guardado');
		al.slideUp();
		al1.slideUp();
		this.inicializaRecorder();
	}
	
	private inicializaRecorder(){
		this._recording.setAudioGrabado(false, 0);
		const onSuccess = stream => {
			//this.mediaRecorder = new MediaRecorder(stream, {mimeType : "audio/ogg"}); // -.-"
			this.mediaRecorder = new MediaRecorder(stream);
			this.mediaRecorder.onstart = e => {
				this.inicio = moment();
			};
			this.mediaRecorder.onstop = e => {
				this.fin = moment();
				this.duracion = this.fin.format('x')-this.inicio.format('x'); //ms
			};
			this.mediaRecorder.ondataavailable = e => {
				this.chunks.push(e.data);
				const blob = new Blob(this.chunks, { "type": "audio/mpeg" });
				this.audio = new Audio();
				this.audioSource = window.URL.createObjectURL(blob);
				this.chRef.detectChanges();
				this.createdBlob = blob;
				this.chunks.length = 0;
				let a = this.sanitizer.bypassSecurityTrustResourceUrl(this.audioSource);
				//console.log(a);
				//if(a.hasOwnProperty('changingThisBreaksApplicationSecurity'))
					//a = a.changingThisBreaksApplicationSecurity;
				//$("#audio-element").attr('src', String(a));
			};
		};
		navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
		navigator.getUserMedia({ // nuevo
		
		//navigator.mediaDevices.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
		//navigator.mediaDevices.getUserMedia({
			audio: true },
			onSuccess,
			e => {
				//this.valido = false;
				this._recording.permiteGrabar = false;
                //console.log(e);
            }
		);
	}

	record() {
		this.saved = false;
		this._recording.setAudioGrabado(true, 0);

		if ( this.audio != undefined ){
			this.audio.pause();
		}
		if ( this._recording.permiteGrabar ) {
			this.isRecording = true;
			
			this.mediaRecorder.start();
			setTimeout( () => {
				if(this.mediaRecorder.state == 'recording')
					this.stop();
			}, 180000); // 3 min para avisos de la materia.
		} else {
			let al: any = $('#alerta-microfono');
			al.slideDown();
		}
	}

	stop() {
		this.mediaRecorder.stop();
		this.isRecording = false;
		this.isFinished = true;
		this._recording.setAudioGrabado(true, 0);
	}

	confirmarAudio(){
		let size: number;
		let type: string;
		let url: string;
		let audioFile: any;
		let filename: string;
		let date: number;
		
		this.audio.pause();
		url = this.audioSource;
		size = this.createdBlob.size;
		type = this.createdBlob.type;
		
		date = new Date().valueOf();
		filename = date + '_' + this.idPerson;
		audioFile = this.blobAarchivo(this.createdBlob, filename);
		
		this.guardaArchivo(audioFile);
	}
	
	private blobAarchivo(myBlob: Blob, filename: string){
		let file: any = myBlob;
		//file = new File([myBlob], filename+".ogg");
		file = new File([myBlob], filename+".mp3", { type: "audio/mpeg" });
		return file;
	}
	
	//
	private guardaArchivo(audioFile){
		let al1: any = $('#alerta-guardado');
		let files: FileList;
		let formData: FormData = new FormData();
		formData.append("files", audioFile);
		formData.append("caso", "0");
		formData.append("idpersonidesk", this.idPerson);
		formData.append("duracion", this.duracion);

		// script guardado de archivo de audio
		this.http.post<any>("https://sie.iest.edu.mx/api/idesk/recordings.php", formData)
			.subscribe( resp => {
				//console.log(resp);
				if ( resp.status == false ){
					this.mensaje = resp.msg;
					al1.slideDown();
				} else {
					//console.log(resp.idAudio);
					this.idAudio = resp.idAudio;
					this._recording.setAudioGrabado(true, this.idAudio);
					this.adjuntaAudio.emit(resp.idAudio);
					this.saved = true;
				}
			}, errors => {
				console.log(errors);
			});
    }

	sanitizeString(url){
		return this.sanitizer.bypassSecurityTrustUrl(url);
	}

    cierraDialogoInfo(resp) {
        this.ngxSmartModalService.getModal('dialogoInformacion').close();
	}

}