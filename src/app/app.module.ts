import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injectable } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//import { HttpModule } from '@angular/http';
import { AppRoutingModule } from './app.routing.module';
import { HttpClientModule} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from 'ngx-spinner';
import { DataTablesModule } from 'angular-datatables';

//Material Design
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { DragDropModule } from '@angular/cdk/drag-drop';
// Componentes
import { AppComponent } from './app.component';

// Navs
import { PrimerNavComponent } from './navs/primerNav.component';
import { SegundoNavComponent } from './navs/segundoNav.component';
import { InfoCursoNavComponent } from './navs/infoCursoNav.component';

// Opciones en las navs
import { BibliotecaVirtualComponent } from './bibliotecaVitual/bibliotecaVirtual.component';
import { ConfiguracionesComponent } from './configuraciones/configuraciones.component';

// Archivos
import { AdjuntarArchivosComponent } from './archivos/adjuntarArchivos.component';
import { AdjuntaUnArchivoComponent } from './archivos/adjuntarUnArchivo.component';

// Links
import { LinksComponent } from './links/links.component';
import { DocsLinkComponent } from './links/docsLink.component';
import { VideoLinkComponent } from './links/videoLink.component';

// Audio
import { RecordingComponent } from './audio/audio.component';

// Inicio
import { IestdeskComponent } from './inicio/iestdesk.component';
import { ClaseComponent } from './clase/clase.component';
import { AltaAvisosComponent } from './clase/altaAvisos.component';
import { MesComponent } from './clase/mes.component';
import { SemanaComponent } from './clase/semana.component';

// Temario
import { TemarioComponent } from './temario/temario.component';
import { AltaTemaComponent } from './temario/altaTema.component';
import { OrdenTemasComponent } from './temario/ordenTemas.component';
import { OrdenElementosComponent } from './temario/ordenElementos.component'
import { TareasComponent } from './tareas/tareas.component';
import { AltaTareasComponent } from './tareas/altaTareas.component';
import { ReutilizarTareaComponent } from './tareas/reutilizarTarea.component';
import { VistaTareaComponent } from './tareas/vistaTarea.component';
import { EntregaTareaComponent } from './tareas/entregaTarea.component';
import { RevisionTareaComponent } from './tareas/revisionTarea.component';
import { GeneraEquiposComponent } from './equipos/generaEquipos.component';
import { EquipoAsignadoComponent } from  './equipos/equipoAsignado.component';
import { ReutilizarEquipoComponent } from './equipos/reutilizarEquipo.component';
import { ForoDiscusionComponent } from './foroDiscusion/foroDiscusion.component';
import { AltaForoDiscusionComponent } from './foroDiscusion/altaForoDiscusion.component';
import { ReutilizarForoDiscusionComponent } from './foroDiscusion/reutilizarForoDiscusion.component';
import { VistaForoDiscComponent } from './foroDiscusion/vistaForoDisc.component';
import { InfoForoDiscComponent } from './foroDiscusion/infoForoDiscusion.component';
import { ComentariosForoDiscComponent } from './foroDiscusion/comentariosForoDiscusion.component';
import { RevisionForoDiscComponent } from './foroDiscusion/revisionForo.component';
import { ApuntesComponent } from './apuntes/apuntes.component';
import { AltaApuntesComponent } from './apuntes/altaApuntes.component';
import { VistaApunteComponent } from './apuntes/vistaApunte.component';
import { ReutilizarApunteComponent } from './apuntes/reutilizarApunte.component';
import { ActividadesClaseComponent } from './actClase/actividadesClase.component';
import { AltaActividadesComponent } from './actClase/altaActividad.component';
import { AltaActividadLibreComponent } from './actClase/libre/altaLibre.component';
import { VistaActividadLibreComponent } from './actClase/libre/vistaActLibre.component';
import { EntregaActividadLibreComponent } from './actClase/libre/entregaLibre.component';
import { RevisionActividadLibreComponent } from './actClase/libre/revisionLibre.component';
import { ReutilizarActividadLibreComponent } from './actClase/libre/reutilizarLibre.component';
import { AltaJeopardyComponent } from './actClase/jeopardy/altaJeopardy.component';
import { AltaRuletaComponent } from './actClase/ruleta/altaRuleta.component';
import { MaestroActividadComponent } from './actClase/maestroActividad.component';
import { AlumnoActividadComponent } from './actClase/alumnoActividad.component';
import { ForoDudasComponent } from './foroDudas/foroDudas.component';
import { InformacionCursoComponent } from './informacionCurso/informacionCurso.component';
import { FormInfoCursoComponent } from './informacionCurso/formInfoCurso.component';
import { ObjetivosCompetenciasComponent } from './informacionCurso/objetivosCompetencias.component';
import { BibliografiaComponent } from './informacionCurso/bibliografia/bibliografia.component';
import { AltaBibliografiaComponent } from './informacionCurso/bibliografia/altaBibliografia.component';
import { ReutilizarBibliografiaComponent } from './informacionCurso/bibliografia/reutilizarBibliografia.component';
import { CartaDescriptivaComponent } from './informacionCurso/cartaDescriptiva.component';
import { CriteriosEvaluacionComponent } from './criteriosEvaluacion/criterios.component';
import { CriteriosPersonalizadosComponent } from './criteriosEvaluacion/criteriosPersonalizados.component';
import { VistaCriteriosComponent } from './criteriosEvaluacion/vistaCriterios.component';
import { ReportesComponent } from './reportes/reportes.component';
import { ReporteAvancexTemaComponent } from './reportes/avancextema.component';
import { ReporteAvancexTemaDetalleComponent } from './reportes/avancextema_detalle.component';
import { CronogramaComponent } from './cronograma/cronograma.component';
import { MuroComponent } from './muro/muro.component';
import { VinculosComponent } from './vinculos/vinculos.component';
import { AltaVinculoComponent } from './vinculos/altaVinculo.component';
import { VistaVinculoComponent } from './vinculos/vistaVinculo.component';
import { ReutilizarVinculoComponent } from './vinculos/reutilizarVinculo.component';
import { ExamenesComponent } from './examenes/examenes.component';
import { AltaExamenComponent } from './examenes/altaExamen.component';
import { OpcionMultipleComponent } from './banco/opcion-multiple/opcion-multiple.component';
import { RubricasComponent } from './rubricas/rubricas.component';
import { VistaRubricaComponent } from './rubricas/vistaRubrica.component';
import { AltaRubricasComponent } from './rubricas/altaRubrica.component';
import { RubricaExistenteComponent } from './rubricas/rubricaExistente.component';
import { RevisionRubricaComponent } from './rubricas/revisionRubrica.component';
import { GlosarioComponent } from './glosario/glosario.component';
import { VideoconferenciasComponent } from './videoconferencias/videoconf.component';
import { VideoconferenciasAltaComponent } from './videoconferencias/altaVideoconf.component';
import { VideoconferenciasVistaComponent } from './videoconferencias/vistaVideoconf.component';
import { ListadoAlumnosComponent } from './listadoAlumnos/listado.component';
import { ConfirmaEliminaComponent } from './dialogs/confirmaElimina.component';
import { ConfirmacionDialogoComponent } from './dialogs/confirmacionDialogo.component';
import { InfoDialogoComponent } from './dialogs/infoDialog.component';
import { ReabrirActividadComponent } from './shared/reabrir/reabrirActividad.component';
import { VistaArchivosComponent } from './archivos/vistaArchivos.component';
import { VistaEquiposComponent } from './equipos/vistaEquipos.component';
import { EquiposDragDrop } from './shared/equipos-dragdrop/equiposDragdrop.component';
import { ModalAltaReactivoComponent } from './banco/modal-alta-reactivos.component';
import { CalificacionesAlumnoComponent } from './calificaciones/calificacionesAlumno.component';
import { CalificacionesMaestroComponent } from './calificaciones/calificacionesMaestro.component';
import { VistaImagenComponent } from './imagenes/vistaImagen.component';
import { VistaContenidoWebComponent } from './contenidoweb/vistaContenidoWeb.component';
import { VistaVideoComponent } from './videos/vistaVideo.component';
import { VistaPodcastComponent } from './podcast/vistaPodcast.component';
import { VistaOdaComponent } from './oda/vistaOda.component';
import { AltaContenidoWebComponent } from './contenidoweb/altaContenidoWeb.component';
import { AltaImagenesComponent } from './imagenes/altaImagenes.component';
import { AltaPodcastComponent } from './podcast/altaPodcast.component';
import { AltaVideosComponent } from './videos/altaVideos.component';
import { ErrorNavegacionComponent } from './error-navegacion/error-navegacion.component';

// Base URL
import { baseURL } from "./shared/baseurl";

// Servicios
import { Iestdesk } from './services/iestdesk.service';
import { Archivos } from './services/archivos.service';
import { Links } from './services/links.service';
import { Recordings } from './services/recording.service';
import { Temario } from './services/temario.service';
import { Avisos } from './services/avisos.service';
import { Calendario } from './services/calendario.service';
import { Tareas } from './services/tareas.service';
import { Rubricas } from './services/rubricas.service';
import { Equipos } from './services/equipos.service';
import { ForoDiscusion } from './services/foroDiscusion.service';
import { Apuntes } from './services/apuntes.service';
import { ActividadesClase } from './services/actividadesClase.service';
import { ForoDudas } from './services/foroDudas.service';
import { InformacionCurso } from './services/infoCurso.service';
import { CriteriosEvaluacion } from './services/criterios.service';
import { Vinculos } from './services/vinculos.service';
import { Examenes } from './services/examenes.service';
import { Videoconferencia } from './services/videoconferencia.service';
import { GoogleUserService } from './services/googleUser.service';
import { ActividadesClaseAlumnoService } from './services/actividadesClaseAlumno.service';
import { CursosService } from './services/cursos.service';
import { Cronograma } from './services/cronograma.service';
import { Calificaciones } from './services/calificaciones.service';
import { AdjuntarCarpetasService } from './services/adjuntarCarpetasService.service';
import { DisenadorService } from './services/disenador.service';
import { ContenidoWebService } from './services/contenidoweb.service';
import { VideosService } from './services/videos.service';
import { PodcastService } from './services/podcast.service';
import { ImagenesService } from './services/imagenes.service';

//import { GoogleApiClase } from './shared/googleApi/googleApi';

// Complementos
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { NgbModule, NgbDateParserFormatter, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { UiSwitchModule } from 'ngx-ui-switch';
import { FileUploadModule } from 'ng2-file-upload';
import { NgDragDropModule } from 'ng-drag-drop';
import { DragulaModule } from 'ng2-dragula';
import { GoogleApiModule, GoogleApiService, GoogleAuthService,  NgGapiClientConfig, NG_GAPI_CONFIG, GoogleApiConfig } from "ng-gapi";
import { OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { OwlMomentDateTimeModule } from 'ng-pick-datetime-moment';
import { NumberPickerModule } from 'ng-number-picker';
import { ScrollToModule } from 'ng2-scroll-to-el';
import { ToastrModule, ToastContainerModule  } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import { TagInputModule } from 'ngx-chips';

// Pipes y Directivas
import { SafeHtmlPipe } from './shared/pipes/safehtml.pipe';
import { SafeUrlPipe } from './shared/pipes/safeUrl.pipe';
import { SearchFilterPipe } from './shared/pipes/searchFilter.pipe';
import { ThumbnailDirective } from './shared/directives/thumbnail.directive';
import { OnlyNumberDirective } from './shared/directives/onlyNumbers.directive';
import { FocusDirective } from './shared/directives/focus.directive';

// Editor
import { MultimediaComponent } from './editor/multimedia/multimedia.component';
import { EditorNavComponent } from './navs/editor-nav.component';
import { MultimediaVideoComponent } from './editor/multimedia/multimedia-video/multimedia-video.component';
import { ModalFormComponent } from './editor/modal-form/modal-form.component';
import { MultimediaNavComponent } from './editor/multimedia/multimedia-nav/multimedia-nav.component';
import { MultimediaPodcastComponent } from './editor/multimedia/multimedia-podcast/multimedia-podcast.component';
import { MultimediaOdaComponent } from './editor/multimedia/multimedia-oda/multimedia-oda.component';
import { MultimediaApuntesComponent } from './editor/multimedia/multimedia-apuntes/multimedia-apuntes.component';
import { AsignacionComponent } from './editor/asignacion/asignacion.component';
import { EdicionComponent } from './editor/edicion/edicion.component';
import { EditorComponent } from './editor/editor.component';
import { AdjuntarCarpetasComponent } from './shared/adjuntar-carpetas/adjuntar-carpetas.component';
import { TagInputComponent } from './shared/tag-input/tag-input.component';
import { VistaMateriasComponent } from './editor/asignacion/vista-materias/vista-materias.component';
import { OdaComponent } from './oda/oda.component';
import { BancoMultimediaComponent } from './editor/banco-multimedia/banco-multimedia.component';
import { ModalAsignacionComponent } from './editor/asignacion/modal/modal-asignacion.component';
import { ListadoClonesComponent } from './editor/asignacion/clones/clones.component';
import { VistaClonesComponent } from './editor/asignacion/clones/vista-clones.component';
import { EditorService } from './services/editorService.service';

// Diseñador
import { DisenadorNavComponent } from './disenador/navs/disenadorNav.component';
import { DisenadorComponent } from './disenador/disenador.component';
import { CronogramaDisenadorComponent } from './disenador/cronograma/cronogramaDisenador.component';
import { SupervisionComponent } from './disenador/supervision/supervision.component';
import { ConsultaTemasComponent } from './disenador/reportes/temasConsulta.component';
import { ReporteContenidoComponent } from './disenador/reportes/contenido.component';
import { ReporteInteraccionElementoMaestroComponent } from './disenador/reportes/interaccionElementoMaestro.component';
import { ReporteInteraccionElementoAlumnoComponent } from './disenador/reportes/interaccionElementoAlumno.component';
import { ReporteAvanceComponent } from './disenador/reportes/reporteAvance.component';
import { ReporteIngresoCierreComponent } from './disenador/reportes/ingresoCierre.component';

// Google API
let gapiClientConfig: NgGapiClientConfig = {
  client_id: "992683699084-e6q96ourtqqvi55fm4ej83ffvjoc8jne.apps.googleusercontent.com",
  discoveryDocs: ["https://analyticsreporting.googleapis.com/$discovery/rest?version=v4"],
    scope: [
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/spreadsheets.readonly",
        "https://www.googleapis.com/auth/drive.appdata",
        "https://www.googleapis.com/auth/drive.apps.readonly",
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/drive.metadata",
        "https://www.googleapis.com/auth/drive.metadata.readonly",
        "https://www.googleapis.com/auth/drive.photos.readonly",
        //"https://www.googleapis.com/auth/drive.docs.readonly", marca error ._.
        "https://www.googleapis.com/auth/drive.readonly"
    ].join(" ")
};

@NgModule({
  declarations: [
    AppComponent,

    PrimerNavComponent,
    SegundoNavComponent,
    InfoCursoNavComponent,
    BibliotecaVirtualComponent,
    ConfiguracionesComponent,

    AdjuntarArchivosComponent,
    AdjuntaUnArchivoComponent,
    VistaArchivosComponent,
    LinksComponent,
    DocsLinkComponent,
    VideoLinkComponent,
    RecordingComponent,
    IestdeskComponent,
    ClaseComponent,
    SemanaComponent,
    MesComponent,
    AltaAvisosComponent,
    AltaTemaComponent,
    TemarioComponent,
    OrdenTemasComponent,
    OrdenElementosComponent,
    TareasComponent,
    AltaTareasComponent,
    ReutilizarTareaComponent,
    VistaTareaComponent,
    EntregaTareaComponent,
	  RevisionTareaComponent,
    GeneraEquiposComponent,
    EquipoAsignadoComponent,
	  ReutilizarEquipoComponent,
    VistaEquiposComponent,
    ForoDiscusionComponent,
    AltaForoDiscusionComponent,
    ReutilizarForoDiscusionComponent,
    VistaForoDiscComponent,
    InfoForoDiscComponent,
    ComentariosForoDiscComponent,
    RevisionForoDiscComponent,
    ApuntesComponent,
    AltaApuntesComponent,
    VistaApunteComponent,
    ReutilizarApunteComponent,
    ActividadesClaseComponent,
    MaestroActividadComponent,
    AlumnoActividadComponent,
    AltaActividadesComponent,
    AltaActividadLibreComponent,
    VistaActividadLibreComponent,
    EntregaActividadLibreComponent,
    RevisionActividadLibreComponent,
    ReutilizarActividadLibreComponent,
    AltaRuletaComponent,
    AltaJeopardyComponent,
	  ReabrirActividadComponent,
  	EquiposDragDrop,
    OpcionMultipleComponent,
    ModalAltaReactivoComponent,
    ForoDudasComponent,
    InformacionCursoComponent,
    FormInfoCursoComponent,
    ObjetivosCompetenciasComponent,
    BibliografiaComponent,
    AltaBibliografiaComponent,
    ReutilizarBibliografiaComponent,
    CartaDescriptivaComponent,
    CriteriosEvaluacionComponent,
    CriteriosPersonalizadosComponent,
    VistaCriteriosComponent,
    ReportesComponent,
    ReporteAvancexTemaComponent,
    ReporteAvancexTemaDetalleComponent,
    CronogramaComponent,
    MuroComponent,
    VinculosComponent,
    AltaVinculoComponent,
    VistaVinculoComponent,
    ReutilizarVinculoComponent,
    ExamenesComponent,
    AltaExamenComponent,
    RubricasComponent,
    AltaRubricasComponent,
    VistaRubricaComponent,
    RubricaExistenteComponent,
    RevisionRubricaComponent,
    GlosarioComponent,
    VideoconferenciasComponent,
    VideoconferenciasAltaComponent,
    VideoconferenciasVistaComponent,
    ListadoAlumnosComponent,
    ConfirmaEliminaComponent,
    ConfirmacionDialogoComponent,
    InfoDialogoComponent,
	  CalificacionesAlumnoComponent,
    CalificacionesMaestroComponent,
    
    AltaContenidoWebComponent,
    AltaImagenesComponent,
    AltaPodcastComponent,
    AltaVideosComponent,
    VistaImagenComponent,
    VistaContenidoWebComponent,
    VistaVideoComponent,
    VistaPodcastComponent,
    VistaOdaComponent,
    MultimediaComponent,
    EditorNavComponent,
    MultimediaVideoComponent,
    ModalFormComponent,
    MultimediaNavComponent,
    MultimediaPodcastComponent,
    MultimediaOdaComponent,
    MultimediaApuntesComponent,
    AsignacionComponent,
    EdicionComponent,
    EditorComponent,
    AdjuntarCarpetasComponent,
    TagInputComponent,
    ErrorNavegacionComponent,
    VistaMateriasComponent,
    OdaComponent,
    BancoMultimediaComponent,
    ModalAsignacionComponent,
    ListadoClonesComponent,
    VistaClonesComponent,

	  DisenadorNavComponent,
    DisenadorComponent,
    CronogramaDisenadorComponent,
    SupervisionComponent,
    ConsultaTemasComponent,
    ReporteContenidoComponent,
    ReporteInteraccionElementoMaestroComponent,
    ReporteInteraccionElementoAlumnoComponent,
    ReporteAvanceComponent,
    ReporteIngresoCierreComponent,

	  SafeHtmlPipe,
    SafeUrlPipe,
    SearchFilterPipe,

    ThumbnailDirective,
    OnlyNumberDirective,
    FocusDirective,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    NgbModule.forRoot(),
    FroalaEditorModule.forRoot(), 
    FroalaViewModule.forRoot(),
    NgxSmartModalModule.forRoot(),
    UiSwitchModule,
    FileUploadModule,
    NgDragDropModule.forRoot(),
    DragulaModule,
    NgxPaginationModule,
    GoogleApiModule.forRoot({
      provide: NG_GAPI_CONFIG,
      useValue: gapiClientConfig
    }), 
    OwlDateTimeModule, 
    OwlNativeDateTimeModule,
    NumberPickerModule,
    NgxSpinnerModule,
    ScrollToModule.forRoot(),
    DataTablesModule,
    ToastrModule.forRoot({
        autoDismiss:true,
        maxOpened: 1
    }),
    ToastContainerModule,
    TagInputModule,
    MatTableModule,
    MatIconModule,
    DragDropModule
  ],
  providers: [ 
    { provide: 'BaseURL', useValue: baseURL },
    //appRoutingProviders,
    Iestdesk,
    Archivos,
    Links,
    Temario,
    Avisos,
    Calendario,
    Tareas,
    Rubricas,
    ForoDiscusion,
    ActividadesClase,
    ForoDudas,
    InformacionCurso,
	  CriteriosEvaluacion,
    Cronograma,
    Vinculos,
    Apuntes,
    Equipos,
    Examenes,
    Videoconferencia,
    Recordings,
    Calendario,
	  Calificaciones,
    ActividadesClaseAlumnoService,
    CursosService,
    ContenidoWebService,
    PodcastService,
    VideosService,
    ImagenesService,
    AdjuntarCarpetasService,
    DisenadorService,
    EditorService,
	//GoogleApiClase,
    /*{ provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
    I18n,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },*/
    GoogleUserService,
    { provide: OWL_DATE_TIME_LOCALE, useValue: 'es' }
  ],
  entryComponents:[
    ModalAltaReactivoComponent,
    BibliotecaVirtualComponent,
    ConfiguracionesComponent,
    AltaTemaComponent,
    ModalFormComponent,
	  ModalAsignacionComponent,
    BancoMultimediaComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
