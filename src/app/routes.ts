import { Routes } from "@angular/router";

import { IestdeskComponent } from "./inicio/iestdesk.component";
import { MultimediaVideoComponent } from "./editor/multimedia/multimedia-video/multimedia-video.component";
import { MultimediaComponent } from "./editor/multimedia/multimedia.component";
import { CalificacionesMaestroComponent } from "./calificaciones/calificacionesMaestro.component";
import { CalificacionesAlumnoComponent } from "./calificaciones/calificacionesAlumno.component";
import { ListadoAlumnosComponent } from "./listadoAlumnos/listado.component";
import { VideoconferenciasVistaComponent } from "./videoconferencias/vistaVideoconf.component";
import { VideoconferenciasAltaComponent } from "./videoconferencias/altaVideoconf.component";
import { VideoconferenciasComponent } from "./videoconferencias/videoconf.component";
import { GlosarioComponent } from "./glosario/glosario.component";
import { ClaseComponent } from "./clase/clase.component";
import { TemarioComponent } from "./temario/temario.component";
import { TareasComponent } from "./tareas/tareas.component";
import { AltaTareasComponent } from "./tareas/altaTareas.component";
import { VistaTareaComponent } from "./tareas/vistaTarea.component";
import { RevisionTareaComponent } from "./tareas/revisionTarea.component";
import { ForoDiscusionComponent } from "./foroDiscusion/foroDiscusion.component";
import { AltaForoDiscusionComponent } from "./foroDiscusion/altaForoDiscusion.component";
import { VistaForoDiscComponent } from "./foroDiscusion/vistaForoDisc.component";
import { RevisionForoDiscComponent } from "./foroDiscusion/revisionForo.component";
import { ApuntesComponent } from "./apuntes/apuntes.component";
import { AltaApuntesComponent } from "./apuntes/altaApuntes.component";
import { VistaApunteComponent } from "./apuntes/vistaApunte.component";
import { ActividadesClaseComponent } from "./actClase/actividadesClase.component";
import { AltaActividadesComponent } from "./actClase/altaActividad.component";
import { AltaActividadLibreComponent } from "./actClase/libre/altaLibre.component";
import { VistaActividadLibreComponent } from "./actClase/libre/vistaActLibre.component";
import { AltaJeopardyComponent } from "./actClase/jeopardy/altaJeopardy.component";
import { AltaRuletaComponent } from "./actClase/ruleta/altaRuleta.component";
import { VistaRubricaComponent } from "./rubricas/vistaRubrica.component";
import { RubricasComponent } from "./rubricas/rubricas.component";
import { AltaExamenComponent } from "./examenes/altaExamen.component";
import { ExamenesComponent } from "./examenes/examenes.component";
import { VinculosComponent } from "./vinculos/vinculos.component";
import { MuroComponent } from "./muro/muro.component";
import { AltaRubricasComponent } from "./rubricas/altaRubrica.component";
import { CronogramaComponent } from "./cronograma/cronograma.component";
import { VistaCriteriosComponent } from "./criteriosEvaluacion/vistaCriterios.component";
import { CriteriosEvaluacionComponent } from "./criteriosEvaluacion/criterios.component";
import { CartaDescriptivaComponent } from "./informacionCurso/cartaDescriptiva.component";
import { BibliografiaComponent } from "./informacionCurso/bibliografia/bibliografia.component";
import { InformacionCursoComponent } from "./informacionCurso/informacionCurso.component";
import { ObjetivosCompetenciasComponent } from "./informacionCurso/objetivosCompetencias.component";
import { ForoDudasComponent } from "./foroDudas/foroDudas.component";
import { RevisionActividadLibreComponent } from "./actClase/libre/revisionLibre.component";
import { MaestroActividadComponent } from "./actClase/maestroActividad.component";
import { AlumnoActividadComponent } from "./actClase/alumnoActividad.component";
import { MultimediaPodcastComponent } from "./editor/multimedia/multimedia-podcast/multimedia-podcast.component";
import { MultimediaOdaComponent } from "./editor/multimedia/multimedia-oda/multimedia-oda.component";
import { MultimediaApuntesComponent } from "./editor/multimedia/multimedia-apuntes/multimedia-apuntes.component";
import { EditorNavComponent } from "./navs/editor-nav.component";
import { AsignacionComponent } from "./editor/asignacion/asignacion.component";
import { EdicionComponent } from "./editor/edicion/edicion.component";
import { EditorComponent } from "./editor/editor.component";
import { CronogramaDisenadorComponent } from "./disenador/cronograma/cronogramaDisenador.component";
import { DisenadorComponent } from "./disenador/disenador.component";
import { ErrorNavegacionComponent } from "./error-navegacion/error-navegacion.component";
import { ReportesComponent } from "./reportes/reportes.component";

export const appRoutes: Routes = [
    { path: '', component: IestdeskComponent },
    { path: 'error-navegacion', component: ErrorNavegacionComponent }, 
    { path: 'inicio/', component: IestdeskComponent }, 
    { path: 'curso/:idCurso/:nombreCurso', component: ClaseComponent },
    { path: 'curso', component: ClaseComponent },
    { path: 'temario', component: TemarioComponent },
    { path: 'tareas', component: TareasComponent },
    { path: 'tareas/nueva', component: AltaTareasComponent },
    { path: 'tareas/vista/:nombre', component: VistaTareaComponent },
	{ path: 'tareas/revision', component: RevisionTareaComponent },
    { path: 'foro-discusion', component: ForoDiscusionComponent },
    { path: 'foro-discusion/nuevo', component: AltaForoDiscusionComponent },
    { path: 'foro-discusion/vista',component: VistaForoDiscComponent },
    { path: 'foro-discusion/revision',component: RevisionForoDiscComponent },
    { path: 'apuntes', component: ApuntesComponent },
    { path: 'apuntes/nuevo', component: AltaApuntesComponent },
    { path: 'apuntes/vista/:nombreCurso', component: VistaApunteComponent },
    { path: 'actividades-clase', component: ActividadesClaseComponent },
    { path: 'actividades-clase/nueva', component: AltaActividadesComponent },
    { path: 'actividades-clase/nueva/libre', component: AltaActividadLibreComponent },
    { path: 'actividades-clase/vista/libre', component: VistaActividadLibreComponent },
    { path: 'actividades-clase/nueva/jeopardy', component: AltaJeopardyComponent },
    { path: 'actividades-clase/nueva/ruleta', component: AltaRuletaComponent},
    { path: 'actividades-clase/libre/revision', component: RevisionActividadLibreComponent },
    { path: 'actividades-clase/maestro-actividad',component:MaestroActividadComponent},
    { path: 'actividades-clase/alumno-actividad',component:AlumnoActividadComponent},
    { path: 'foro-dudas', component: ForoDudasComponent },
    { path: 'informacion-del-curso/presentacion', component: InformacionCursoComponent },
    { path: 'informacion-del-curso/fundamentacion', component: InformacionCursoComponent },
    { path: 'informacion-del-curso/introduccion', component: InformacionCursoComponent },
    { path: 'informacion-del-curso/objetivos-y-competencias', component: ObjetivosCompetenciasComponent },
    { path: 'informacion-del-curso/metodologia', component: InformacionCursoComponent },
    { path: 'informacion-del-curso/politicas', component: InformacionCursoComponent },
    { path: 'informacion-del-curso/plan-de-clase', component: InformacionCursoComponent },
    { path: 'informacion-del-curso/bibliografia', component: BibliografiaComponent },
    { path: 'informacion-del-curso/carta-descriptiva', component: CartaDescriptivaComponent },
    { path: 'criterios-de-evaluacion/nuevo', component: CriteriosEvaluacionComponent },
	{ path: 'criterios-de-evaluacion', component: VistaCriteriosComponent },
    { path: 'cronograma', component: CronogramaComponent },
    { path: 'reportes', component: ReportesComponent },
    { path: 'muro', component: MuroComponent },
    { path: 'vinculos', component: VinculosComponent },
    { path: 'examenes', component: ExamenesComponent },
    { path: 'examenes/nuevo', component: AltaExamenComponent },
    { path: 'rubricas-iest', component: RubricasComponent },
    { path: 'rubricas-iest/nueva', component: AltaRubricasComponent },
    { path: 'rubricas-iest/vista', component: VistaRubricaComponent },
    { path: 'glosario', component: GlosarioComponent },
    { path: 'videoconferencias', component: VideoconferenciasComponent },
    { path: 'videoconferencias/nueva', component: VideoconferenciasAltaComponent },
    { path: 'videoconferencias/:nombre', component: VideoconferenciasVistaComponent },
    { path: 'listado-alumnos', component: ListadoAlumnosComponent },
	{ path: 'calificaciones/alumno', component: CalificacionesAlumnoComponent },
    { path: 'calificaciones/maestro', component: CalificacionesMaestroComponent },
    { path: 'editor', 
      component: EditorComponent, 
      children: [
        {path:'', redirectTo:'multimedia', pathMatch:'full'},
        {
            path:'multimedia', 
            component: MultimediaComponent,
            children: [
                {path: '', redirectTo:'video', pathMatch:'full'},
                {path:'video', component: MultimediaVideoComponent},
                {path:'podcast', component: MultimediaPodcastComponent},
                {path:'oda', component: MultimediaOdaComponent},
                {path:'apuntes', component: MultimediaApuntesComponent}
            ]
        },
        { path:'asignacion', component: AsignacionComponent },
        { path:'edicion', component: EdicionComponent }
      ]
    },
    { path: 'disenador', component: DisenadorComponent },
    { path: 'disenador/cronograma', component: CronogramaDisenadorComponent },
    { path: '**', component: IestdeskComponent } 
];