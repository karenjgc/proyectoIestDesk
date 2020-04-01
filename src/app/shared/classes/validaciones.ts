export class Validaciones {
    constructor(){ }

    verificaLongitud(cursos, elementos){
        let lon = elementos.length;

        for ( let i = 0; i < lon; i++ ){
            if ( elementos[i] != cursos )
                return false;
        }

        return true;
    }

    matchYoutubeUrl(url) {
        let p = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
        if(url.match(p)){
            return url.match(p)[1];
        }
        return false;
    }

    matchVimeoUrl(url) {
        let p = /(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/i;
        if(url.match(p)){
            return url.match(p)[1];
        }
        return false;
    }

    matchUrl(url) {
        let p =  /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
        return url.match(p);
    }

    matchSoundcloudUrl(url){
        let regexp = /^https?:\/\/(soundcloud\.com|snd\.sc)\/(.*)$/;        
        return url.match(regexp) && url.match(regexp)[2];
        

       // return false;
    }

    addhttp(url) {
        if (!/^(f|ht)tps?:\/\//i.test(url)) {
            url = "http://" + url;
        }
        return url;
    }
}