import { Iestdesk } from '../../services/iestdesk.service';

export class PublicacionGrupos {
    public idCursos;
    
    constructor(
        private _iestdesk: Iestdesk
    ){}

    separarIdCursos() {
        let temp = [];
        for( let i = 0; i < this._iestdesk.cursosLaterales.length; i++ ) {
            temp.push(this._iestdesk.cursosLaterales[i].idCurso);
        }
        //console.log(temp.join('|'));
        return temp.join("|");
    }

    agrupar() {
        let pubCursos = [];
        for(let i = 0; i < this._iestdesk.cursosLaterales.length; i++) {
            if(!pubCursos.find(x => x.idCurso == this._iestdesk.cursosLaterales[i].idCurso)){
                pubCursos.push({
                    idCurso:  this._iestdesk.cursosLaterales[i].idCurso,
                    materia:  this._iestdesk.cursosLaterales[i].materia,
                    clave:  this._iestdesk.cursosLaterales[i].clave,
                    modalidad:  this._iestdesk.cursosLaterales[i].modalidad
                });
            }
        }

        return pubCursos;
    }

    agruparEditar() {
        let pubCursos = [];
        for(let i = 0; i < this._iestdesk.cursosLaterales.length; i++) {
            if ( this._iestdesk.cursosLaterales[i].idCurso == this._iestdesk.idCursoActual )
                if(!pubCursos.find(x => x.idCurso == this._iestdesk.cursosLaterales[i].idCurso)){
                    pubCursos.push({
                        idCurso:  this._iestdesk.cursosLaterales[i].idCurso,
                        materia:  this._iestdesk.cursosLaterales[i].materia,
                        clave:  this._iestdesk.cursosLaterales[i].clave,
                        modalidad:  this._iestdesk.cursosLaterales[i].modalidad
                    });
                }
        }

        return pubCursos;
    }

    obtenTemas(idCursos) {
        let temas = [];
        let params = {
            servicio: "idesk",
            accion: "IDesk_Maestro_Temario_Cursos_Listado",
            tipoRespuesta: "json",
            idCursos: idCursos
        };

        this._iestdesk.consultas(params)
            .subscribe(resp => {
                temas = resp;
            },
            errors => {
                console.log(errors);
            });
        
        return temas;
    }

}