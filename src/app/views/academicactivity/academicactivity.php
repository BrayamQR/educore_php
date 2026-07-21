<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../../../css/main.css">
    <link rel="shortcut icon" href="../../../../public/logo2.png">
    <title>Activiades académicas | Educore</title>
</head>

<body>
    <?php
    include("../../../shared/global/global_loading.php");
    ?>
    <main class="bg-gray-200  min-h-[calc(100vh-60px)]">

        <div class="lg:ml-[350px] mt-[60px] p-5 flex flex-col gap-5">
            <div class="bg-white p-5 rounded-lg shadow-md">
                <div class="flex lg:flex-row gap-5 flex-col lg:items-center lg:justify-between mb-5">
                    <div class="flex gap-4 items-center">
                        <div class="w-12 h-12 bg-sky-300/40 rounded-xl flex items-center justify-center">
                            <i class="bi bi-calendar-heart text-blue-600 text-2xl"></i>
                        </div>
                        <div class="flex flex-col">
                            <h2 class="text-2xl font-bold text-gray-900">Actividad académica</h2>
                            <span class="text-sm text-gray-500">Gestión de actividades académicas</span>
                        </div>
                    </div>
                    <div class="flex flex-wrap items-center gap-2 justify-between">
                        <custom-button
                            id="btnNuevo"
                            btn-class="bg-blue-500 hover:bg-blue-900 text-white"
                            label="Nuevo"
                            icon="bi bi-plus-lg"
                            onclick="openModalForm()">
                        </custom-button>
                        <custom-button
                            id="btnToggleFiltros"
                            onclick="toggleFiltros()"
                            icon="bi bi-sliders"
                            label="Más filtros"
                            btn-class="lg:hidden hover:bg-gray-200 text-gray-700">
                        </custom-button>
                    </div>
                </div>
                <div class="flex flex-col gap-4">
                    <custom-text-field
                        class=""
                        label="Buscar actividad..."
                        name="searchText"
                        icon="bi bi-search"
                        clearable>
                    </custom-text-field>
                    <div id="panelFiltros" class="hidden lg:flex flex-col lg:flex-row gap-4">
                        <div class="flex-1">
                            <custom-datepicker
                                label="Fecha inicio"
                                name="fechaInicio">
                            </custom-datepicker>
                        </div>
                        <div class="flex-1">
                            <custom-datepicker
                                label="Fecha fin"
                                name="fechaFin">
                            </custom-datepicker>
                        </div>
                        <div class="flex-1">
                            <custom-select
                                label="Tipo de actividad"
                                name="filtroTipoActividad">
                            </custom-select>
                        </div>
                        <div class="flex-1">
                            <custom-select
                                label="Año lectivo"
                                name="filtroAnioLectivo">
                            </custom-select>
                        </div>
                        <div class="shrink-0 flex items-center">
                            <custom-button
                                btn-class="hover:bg-gray-200 text-gray-700"
                                label="Limpiar"
                                icon="bi bi-x-circle"
                                onclick="LimpiarFiltros()">
                            </custom-button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-lg shadow-md flex flex-col  divide-neutral-200 divide-y overflow-y-auto lg:max-h-[calc(100vh-380px)] md:max-h-[calc(100vh-450px)]  scrollbar-thin scrollbar-track-gray-white scrollbar-thumb-neutral-400" id="contentList">

            </div>
            <data-paginator id="paginatorList" items-per-page="20"></data-paginator>
        </div>
    </main>
    <dialog-modal id="DialogFormAcademicActivity" size="max-w-xl">
        <div slot="header" class="flex gap-3 items-center">
            <div class="bg-green-100 w-10 h-10 rounded-md flex items-center justify-center">
                <i class="bi bi-calendar-heart text-green-600 text-xl"></i>
            </div>

            <div>
                <h3 class="font-bold">Formulario - Actividad académica</h3>
                <p class="text-sm text-neutral-500">Registro o edita una actividad académica</p>
            </div>
        </div>
        <div slot="body">
            <form action="" id="formAcademicActivity" novalidate>
                <section class="flex flex-col gap-5">
                    <div class="flex items-center gap-3 bg-green-700 rounded-lg px-4 py-2.5 text-sm">
                        <i class="bi bi-calendar-check text-white text-lg"></i>
                        <div class="flex flex-col  gap-2 flex-wrap">
                            <div class="flex gap-2">
                                <span class="text-white/70">Año lectivo:</span>
                                <span id="infoAnioActivo" class="font-bold text-white"></span>
                            </div>
                            <div class="flex gap-2">
                                <span class="text-white/70">Vigencia:</span>
                                <span id="infoVigenciaActiva" class="font-semibold text-white"></span>
                            </div>

                        </div>
                    </div>
                    <input type="hidden" name="idActividad" id="idActividad">
                    <section class="flex flex-col gap-5">
                        <custom-text-field
                            label="Nombre de la actividad"
                            name="nomActividad"
                            required>
                        </custom-text-field>
                        <div class="flex items-center gap-2">
                            <input type="checkbox"
                                class="w-4 h-4 text-sky-600 rounded focus:ring-sky-500 cursor-pointer"
                                id="chkRangoFechas">
                            <label for="chkRangoFechas" class="text-sm text-gray-700 cursor-pointer">
                                ¿Actividad de varios días?
                            </label>
                        </div>

                        <div class="grid lg:grid-cols-2 grid-cols-1 gap-5">
                            <div id="fechaInicioField" class="lg:col-span-2">
                                <custom-datepicker
                                    label="Fecha de inicio"
                                    name="fechaInicio"
                                    required>
                                </custom-datepicker>
                            </div>
                            <div id="fechaFinField" class="hidden">
                                <custom-datepicker
                                    label="Fecha de fin"
                                    name="fechaFin"
                                    required>
                                </custom-datepicker>
                            </div>
                        </div>
                        <div class="grid lg:grid-cols-2 grid-cols-1 gap-5">
                            <custom-timepicker
                                label="Hora de ingreso"
                                name="horaIngreso"
                                required>
                            </custom-timepicker>
                            <custom-timepicker
                                label="Hora de salida"
                                name="horaSalida"
                                required>
                            </custom-timepicker>
                        </div>
                        <custom-select
                            label="Tipo de actividad"
                            name="idTipoActividad"
                            required>
                        </custom-select>
                        <custom-text-field
                            label="Lugar"
                            name="lugar"
                            required>
                        </custom-text-field>
                        <custom-textarea
                            label="Descripción"
                            name="descActividad"
                            required>
                        </custom-textarea>
                        <div class="flex flex-wrap lg:gap-10  gap-5 items-center justify-center">
                            <div class="flex items-center gap-2">
                                <input type="checkbox" class="w-4 h-4 text-sky-600 rounded focus:ring-sky-500 cursor-pointer" name="registraAsistencia" id="registraAsistencia" value="1">
                                <label for="registraAsistencia" class="text-sm text-gray-700 cursor-pointer">Registra asistencia</label>
                            </div>
                            <div class="flex items-center gap-2">
                                <input type="checkbox" class="w-4 h-4 text-sky-600 rounded focus:ring-sky-500 cursor-pointer" name="suspendeClases" id="suspendeClases" value="1">
                                <label for="suspendeClases" class="text-sm text-gray-700 cursor-pointer">Suspende clases</label>
                            </div>
                        </div>
                        <fieldset class="border border-gray-200 rounded-lg p-4" id="fielsetParticipantes">
                            <legend class="text-sm font-medium text-gray-700 px-1" id="fieldsetLegentParticipante">
                                Participantes
                            </legend>
                            <div id="participantesContainer"
                                class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4 mt-1">
                            </div>
                        </fieldset>
                        <p id="participantesError" class="text-sm text-red-700 -mt-3 hidden">
                            Debes seleccionar al menos un participante
                        </p>
                    </section>
                </section>
            </form>
        </div>
        <div slot="footer" class="flex justify-end gap-3">
            <custom-button
                id="btnCerrar"
                btn-class="hover:bg-gray-200 text-gray-700"
                label="Cerrar"
                onclick="closeModalForm()">
            </custom-button>
            <custom-button
                id="btnGrabar"
                type="submit"
                btn-class="bg-green-500 hover:bg-green-900 text-white"
                label="Grabar"
                form="formAcademicActivity">
            </custom-button>
        </div>
    </dialog-modal>

    <dialog-modal id="DialogInfoAcademicActivity" size="max-w-xl">
        <div slot="header" class="flex gap-3 items-center">
            <div class="bg-sky-100 w-10 h-10 rounded-lg flex items-center justify-center">
                <i class="bi bi-calendar2-heart text-sky-600 text-xl"></i>
            </div>
            <div>
                <h3 class="font-bold text-gray-800">Detalles de la actividad</h3>
                <p class="text-sm text-gray-500">Información de la actividad académica</p>
            </div>
        </div>
        <div slot="body" class="flex flex-col gap-6">
            <div class="flex flex-col gap-2">
                <h4 id="nomActividadInfo" class="text-xl font-bold text-gray-800 leading-tight">-</h4>
                <span id="badgeTipoInfo" class="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold">
                    <span id="dotTipoInfo" class="w-2 h-2 rounded-full"></span>
                    <span id="nomTipoInfo">-</span>
                </span>
                <p id="descActividadInfo" class="text-sm text-gray-600 leading-relaxed">-</p>
            </div>

            <section class="bg-linear-to-r from-blue-50 to-sky-50 p-5 rounded-xl border border-blue-100">
                <div class="flex flex-col items-center text-center gap-4">

                    <!-- Hoja de calendario: día único -->
                    <div id="calendarioDiaUnico" class="hidden shrink-0 w-16 h-16 bg-white rounded-xl shadow-sm border border-sky-100 flex-col overflow-hidden">
                        <div class="bg-sky-500 text-white text-[10px] font-bold text-center py-0.5 uppercase" id="mesCortoInfo">-</div>
                        <div class="flex-1 flex items-center justify-center">
                            <span id="diaNumeroInfo" class="text-2xl font-bold text-gray-800">-</span>
                        </div>
                    </div>

                    <!-- Hoja de calendario: rango -->
                    <div id="calendarioRango" class="hidden shrink-0 items-center gap-1">
                        <div class="w-16 h-16 bg-white rounded-xl shadow-sm border border-sky-100 flex flex-col overflow-hidden">
                            <div class="bg-sky-500 text-white text-[10px] font-bold text-center py-0.5 uppercase" id="mesCortoInicioInfo">-</div>
                            <div class="flex-1 flex items-center justify-center">
                                <span id="diaNumeroInicioInfo" class="text-2xl font-bold text-gray-800">-</span>
                            </div>
                        </div>
                        <i class="bi bi-arrow-right text-gray-400 shrink-0"></i>
                        <div class="w-16 h-16 bg-white rounded-xl shadow-sm border border-sky-100 flex flex-col overflow-hidden">
                            <div class="bg-sky-500 text-white text-[10px] font-bold text-center py-0.5 uppercase" id="mesCortoFinInfo">-</div>
                            <div class="flex-1 flex items-center justify-center">
                                <span id="diaNumeroFinInfo" class="text-2xl font-bold text-gray-800">-</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col items-center gap-1">
                        <span id="fechaInfo" class="text-base font-bold text-gray-800">-</span>
                        <span id="diaSemanaInfo" class="text-sm text-gray-500">-</span>
                        <span id="estadoTemporalInfo" class="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold">-</span>
                    </div>

                    <!-- Separador -->
                    <hr class="w-full border-blue-200/60">

                    <!-- Horario -->
                    <div class="flex flex-col items-center gap-1">
                        <span id="horarioInfo" class="text-lg font-bold text-gray-800">-</span>
                    </div>

                </div>
            </section>

            <!-- Información adicional -->
            <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span class="text-xs font-bold text-gray-500 uppercase tracking-wide">Información adicional</span>
                <div class="grid lg:grid-cols-2 grid-cols-1 gap-3 mt-3">

                    <!-- Año lectivo -->
                    <div class="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-100">
                        <div class="bg-purple-100 w-9 h-9 rounded-lg flex items-center justify-center shrink-0">
                            <i class="bi bi-mortarboard text-purple-600"></i>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-xs text-gray-500">Año lectivo</span>
                            <span id="anioLectivoInfo" class="text-sm font-bold text-gray-800">-</span>
                        </div>
                    </div>

                    <!-- Lugar -->
                    <div class="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-100">
                        <div class="bg-sky-100 w-9 h-9 rounded-lg flex items-center justify-center shrink-0">
                            <i class="bi bi-geo-alt text-sky-600"></i>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-xs text-gray-500">Lugar</span>
                            <span id="lugarInfo" class="text-sm font-bold text-gray-800">-</span>
                        </div>
                    </div>

                </div>
            </div>

            <!-- Indicadores: asistencia / suspensión de clases -->
            <div class="flex flex-wrap gap-2">
                <span id="badgeAsistenciaInfo" class="hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold">
                    <i class="bi bi-clipboard-check"></i>
                    <span>Registra asistencia</span>
                </span>
                <span id="badgeSuspensionInfo" class="hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold">
                    <i class="bi bi-exclamation-triangle"></i>
                    <span>Suspende clases</span>
                </span>
            </div>

            <!-- Participantes -->
            <div class="flex flex-col gap-2">
                <span class="text-sm font-semibold text-gray-700">Participantes</span>
                <div id="listaParticipantesInfo" class="flex flex-wrap gap-2">
                    <!-- chips generados por JS -->
                </div>
            </div>
        </div>
        <div slot="footer" class="flex justify-end gap-3">
            <custom-button
                id="btnCerrarInfo"
                btn-class="hover:bg-gray-200 text-gray-700"
                label="Cerrar"
                onclick="closeModalInfo()">
            </custom-button>
        </div>
    </dialog-modal>
    <?php
    include("../../../shared/global/global_scripts.php")
    ?>
    <script type="module" src="./academicactivity.js"></script>
</body>

</html>