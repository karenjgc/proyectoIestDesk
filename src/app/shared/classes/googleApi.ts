import { GoogleUserService } from '../../services/googleUser.service';
import { GoogleApiService, GoogleAuthService } from 'ng-gapi';

declare var gapi : any;
declare var google: any;

export class GoogleApi {
    
    public pickerApiLoaded: boolean = false;
    
    constructor(
        private _googleUser: GoogleUserService,
        private authService: GoogleAuthService,
        private gapiService: GoogleApiService
    ){}

    verificarInicio() {
        
        if ( this.isLoggedIn() ) {
            this.inicializarDrive();
        }
        else {
            //alert(this.isLoggedIn());
            this.signIn();
            this.inicializarDrive();
        }
    }

    inicializarDrive() {
        this.gapiService.onLoad().subscribe();
        this.authService.getAuth().subscribe((auth) => {
            if( !auth.isSignedIn.get() )
                this.signIn();
        });
        this.gapiService.onLoad().subscribe(()=> {
            gapi.load('picker', {'callback': this.onPickerApiLoad.bind(this)} );
        });
    }

    isLoggedIn(): boolean {
        console.log(this._googleUser.isUserSignedIn());
        return this._googleUser.isUserSignedIn();
    }

    signIn() {
        this._googleUser.signIn();
        return this._googleUser.isUserSignedIn();
    }

    signOut(): void {
		this.authService.getAuth().subscribe((auth) => {
			try {
				gapi.auth2.getAuthInstance().disconnect();
			} catch (e) {
				console.error(e);
			}
		});
	}

    onPickerApiLoad() {
        this.pickerApiLoaded = true;
        console.log(this._googleUser.getToken());
        this.ver();
    }

    ver() {
        console.log(this._googleUser.getToken());
        const picker = new google.picker.PickerBuilder().
            addView(google.picker.ViewId.DOCS).
            setOAuthToken(this._googleUser.getToken()).
            //setDeveloperKey('AIzaSyA_w5T6HhlhH6RouNvDyQx4XVN75THA--Q').
            setCallback(this.pickerCallback).
            build();
        picker.setVisible(true);
    }

    pickerCallback(data) {
        var url = '';
        if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
          var doc = data[google.picker.Response.DOCUMENTS][0];
          url = doc[google.picker.Document.URL];
        }
       
        return url;
    }
}