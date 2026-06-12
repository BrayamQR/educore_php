<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../../../css/main.css">
    <link rel="shortcut icon" href="../../../../public/logo2.png">
    <title>Historial de asistencias | Educore</title>
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
                            <i class="bi bi-clipboard2-check-fill text-blue-600 text-2xl"></i>
                        </div>
                        <div class="flex flex-col">
                            <h2 class="text-2xl font-bold text-gray-900">Historial</h2>
                            <span class="text-sm text-gray-500">Hitorial de asistencias anual</span>
                        </div>
                    </div>
                    <div class="flex flex-wrap gap-5">
                        <custom-button
                            btn-class="bg-violet-500 hover:bg-violet-900 text-white"
                            label="Justificar faltas"
                            icon="bi bi-patch-check"
                            onclick="openModalJustificar()">
                        </custom-button>
                        <custom-button
                            btn-class="bg-blue-500 hover:bg-blue-900 text-white"
                            label="Generar reporte"
                            icon="bi bi-file-earmark-pdf"
                            onclick="openModalReportes()">
                        </custom-button>
                    </div>
                </div>
                <div class="flex flex-col gap-4">
                    <!-- Buscador en su propia fila -->
                    <custom-text-field
                        label="Buscar estudiante.."
                        name="searchText"
                        icon="bi bi-search"
                        clearable>
                    </custom-text-field>
                    <!-- Filtros secundarios en una fila -->
                    <div class="flex flex-col lg:flex-row gap-4">
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
                                label="Estado"
                                name="filtroEstado">
                                <option value="1">Asistió</option>
                                <option value="2">Tarde</option>
                                <option value="3">Falta</option>
                                <option value="4">Justificado</option>
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
            <div id="bannerCierre" class="hidden"></div>
            <div class="bg-white rounded-lg shadow-md flex flex-col  divide-neutral-200 divide-y overflow-y-auto lg:max-h-[calc(100vh-450px)] md:max-h-[calc(100vh-450px)]  scrollbar-thin scrollbar-track-gray-white scrollbar-thumb-neutral-400" id="contentList">

            </div>
            <data-paginator id="paginatorList" items-per-page="20"></data-paginator>
        </div>
    </main>

    <dialog-modal id="DialogCierreDia" size="max-w-2xl">
        <div slot="header" class="flex gap-3 items-center">
            <div class="bg-rose-100 w-10 h-10 rounded-md flex items-center justify-center">
                <i class="bi bi-calendar-check text-rose-600 text-xl"></i>
            </div>
            <div>
                <h3 class="font-bold">Cierre del día</h3>
                <p class="text-sm text-neutral-500">Fechas pendientes de cierre de asistencia</p>
            </div>
        </div>
        <div slot="body">
            <section class="flex flex-col gap-4">
                <!-- Acciones -->
                <div class="flex items-center justify-between flex-wrap">
                    <h4 class="text-sm font-medium text-gray-700">Fechas pendientes</h4>
                    <div class="flex flex-wrap gap-3">
                        <button type="button"
                            class="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                            onclick="seleccionarPaginaCierre()">
                            Seleccionar página
                        </button>
                        <button type="button"
                            class="text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                            onclick="seleccionarTodasFechas()">
                            Seleccionar todas
                        </button>
                        <button type="button"
                            class="text-xs text-gray-600 hover:text-gray-700 font-medium cursor-pointer"
                            onclick="limpiarSeleccionFechas()">
                            Limpiar
                        </button>
                    </div>
                </div>

                <!-- Lista de fechas -->
                <div class="border border-gray-200 rounded-lg overflow-hidden">
                    <div class="overflow-y-auto lg:max-h-108 divide-y divide-gray-200 scrollbar-thin scrollbar-track-gray-white scrollbar-thumb-neutral-400"
                        id="contentListCierre">
                    </div>
                </div>
                <data-paginator id="paginatorCierre" items-per-page="10"></data-paginator>

                <!-- Contador -->
                <div class="flex items-center justify-between text-sm">
                    <div class="flex items-center gap-2 text-gray-600">
                        <i class="bi bi-info-circle"></i>
                        <span>
                            <span id="countSelectedCierre" class="font-semibold text-rose-600">0</span>
                            fechas seleccionadas
                        </span>
                    </div>
                    <div class="text-gray-500">
                        Total pendientes: <span id="totalCierre" class="font-semibold">0</span>
                    </div>
                </div>
            </section>
        </div>
        <div slot="footer" class="flex justify-end gap-3">
            <custom-button
                btn-class="hover:bg-gray-200 text-gray-700"
                label="Cerrar"
                onclick="closeModalCierre()">
            </custom-button>
            <custom-button
                btn-class="bg-rose-500 hover:bg-rose-900 text-white"
                label="Realizar cierre"
                icon="bi bi-check-lg"
                onclick="realizarCierre()">
            </custom-button>
        </div>
    </dialog-modal>

    <dialog-modal id="DialogJustificarFaltas" size="max-w-2xl">
        <div slot="header" class="flex gap-3 items-center">
            <div class="bg-violet-100 w-10 h-10 rounded-md flex items-center justify-center">
                <i class="bi bi-patch-check text-violet-600 text-xl"></i>
            </div>
            <div>
                <h3 class="font-bold">Justificar faltas</h3>
                <p class="text-sm text-neutral-500">Selecciona las faltas a justificar</p>
            </div>
        </div>
        <div slot="body">
            <section class="flex flex-col gap-4">
                <div class="relative">
                    <i class="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                        type="text"
                        id="searchTextJustificar"
                        placeholder="Buscar estudiante..."
                        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none" />
                </div>

                <div class="flex items-center justify-between flex-wrap">
                    <h4 class="text-sm font-medium text-gray-700">Faltas registradas</h4>
                    <div class="flex flex-wrap gap-3">
                        <button type="button"
                            class="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                            onclick="seleccionarPaginaJustificar()">
                            Seleccionar página
                        </button>
                        <button type="button"
                            class="text-xs text-violet-600 hover:text-violet-700 font-medium cursor-pointer"
                            onclick="seleccionarTodasJustificar()">
                            Seleccionar todas
                        </button>
                        <button type="button"
                            class="text-xs text-gray-600 hover:text-gray-700 font-medium cursor-pointer"
                            onclick="limpiarSeleccionJustificar()">
                            Limpiar
                        </button>
                    </div>
                </div>

                <div class="border border-gray-200 rounded-lg overflow-hidden">
                    <div class="overflow-y-auto lg:max-h-108 divide-y divide-gray-200 scrollbar-thin scrollbar-track-gray-white scrollbar-thumb-neutral-400"
                        id="contentListJustificar">
                    </div>
                </div>
                <data-paginator id="paginatorJustificar" items-per-page="10"></data-paginator>

                <div class="flex items-center justify-between text-sm">
                    <div class="flex items-center gap-2 text-gray-600">
                        <i class="bi bi-info-circle"></i>
                        <span>
                            <span id="countSelectedJustificar" class="font-semibold text-violet-600">0</span>
                            faltas seleccionadas
                        </span>
                    </div>
                    <div class="text-gray-500">
                        Total faltas: <span id="totalJustificar" class="font-semibold">0</span>
                    </div>
                </div>
            </section>
        </div>
        <div slot="footer" class="flex justify-end gap-3">
            <custom-button
                btn-class="hover:bg-gray-200 text-gray-700"
                label="Cerrar"
                onclick="closeModalJustificar()">
            </custom-button>
            <custom-button
                btn-class="bg-violet-500 hover:bg-violet-900 text-white"
                label="Justificar"
                icon="bi bi-check-lg"
                onclick="justificarFaltas()">
            </custom-button>
        </div>
    </dialog-modal>

    <dialog-modal id="DialogReportes" size="max-w-2xl">
        <div slot="header" class="flex gap-3 items-center">
            <div class="bg-sky-100 w-10 h-10 rounded-md flex items-center justify-center">
                <i class="bi bi-file-earmark-pdf text-sky-600 text-xl"></i>
            </div>
            <div>
                <h3 class="font-bold">Generar reportes</h3>
                <p class="text-sm text-neutral-500">Selecciona el tipo de reporte a generar</p>
            </div>
        </div>
        <div slot="body">
            <section class="flex flex-col gap-5">

                <!-- Tipos de reporte -->
                <div class="flex flex-col gap-2">
                    <h4 class="text-sm font-medium text-gray-700">Tipo de reporte</h4>
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        <label class="reporte-card cursor-pointer h-full">
                            <input type="radio" name="tipoReporte" value="estudiante" class="reporte-radio hidden">
                            <div class="border-2 border-gray-200 rounded-lg p-4 flex flex-col gap-2 hover:border-sky-400 hover:bg-sky-50 duration-200 reporte-card-inner h-full">
                                <div class="w-9 h-9 bg-sky-100 rounded-lg flex items-center justify-center">
                                    <i class="bi bi-person-lines-fill text-sky-600"></i>
                                </div>
                                <p class="font-semibold text-gray-700 text-sm">Por estudiante</p>
                                <p class="text-xs text-gray-500">Historial individual de asistencias</p>
                            </div>
                        </label>
                        <label class="reporte-card cursor-pointer h-full">
                            <input type="radio" name="tipoReporte" value="fecha" class="reporte-radio hidden">
                            <div class="border-2 border-gray-200 rounded-lg p-4 flex flex-col gap-2 hover:border-violet-400 hover:bg-violet-50 duration-200 reporte-card-inner h-full">
                                <div class="w-9 h-9 bg-violet-100 rounded-lg flex items-center justify-center">
                                    <i class="bi bi-calendar-date text-violet-600"></i>
                                </div>
                                <p class="font-semibold text-gray-700 text-sm">Por fecha</p>
                                <p class="text-xs text-gray-500">Asistencia de un día específico</p>
                            </div>
                        </label>
                        <label class="reporte-card cursor-pointer h-full">
                            <input type="radio" name="tipoReporte" value="resumen" class="reporte-radio hidden">
                            <div class="border-2 border-gray-200 rounded-lg p-4 flex flex-col gap-2 hover:border-emerald-400 hover:bg-emerald-50 duration-200 reporte-card-inner h-full">
                                <div class="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <i class="bi bi-bar-chart-line text-emerald-600"></i>
                                </div>
                                <p class="font-semibold text-gray-700 text-sm">Resumen por periodo</p>
                                <p class="text-xs text-gray-500">Consolidado de asistencias por alumno</p>
                            </div>
                        </label>
                    </div>
                </div>
                <form id="formReporte" novalidate>
                    <div id="camposReporte" class="hidden flex flex-col gap-4  pt-4">
                        <div class="campo-reporte hidden" data-campo="estudiante">
                            <custom-autocomplete label="Estudiante" name="reporteEstudiante"></custom-autocomplete>
                        </div>

                        <div class="campo-reporte hidden" data-campo="fechaEspecifica">
                            <custom-datepicker label="Fecha" name="reporteFechaEspecifica"></custom-datepicker>
                        </div>

                        <div class="campo-reporte hidden flex flex-col lg:flex-row gap-4" data-campo="rangoFechas">
                            <div class="flex-1">
                                <custom-datepicker label="Fecha inicio" name="reporteFechaInicio"></custom-datepicker>
                            </div>
                            <div class="flex-1">
                                <custom-datepicker label="Fecha fin" name="reporteFechaFin"></custom-datepicker>
                            </div>
                        </div>
                        <!-- Campo: Aula (para "por fecha" y "resumen") -->
                        <div class="campo-reporte hidden" data-campo="aula">
                            <custom-autocomplete label="Grado y sección" name="reporteAula"></custom-autocomplete>
                        </div>
                        <!-- Campo: Estado (todos los tipos) -->
                        <div class="campo-reporte hidden" data-campo="estado">
                            <custom-select label="Estado" name="reporteEstado">
                                <option value="1">Asistió</option>
                                <option value="2">Tarde</option>
                                <option value="3">Falta</option>
                                <option value="4">Justificado</option>
                            </custom-select>
                        </div>
                    </div>
                </form>
            </section>
        </div>
        <div slot="footer" class="flex items-center justify-between gap-3 flex-wrap">
            <button
                type="button"
                class="text-sm text-gray-500 hover:text-rose-500 flex items-center gap-1 cursor-pointer transition-colors duration-200"
                onclick="limpiarReporte()">
                <i class="bi bi-arrow-counterclockwise"></i>
                Limpiar
            </button>
            <div class="flex gap-3 ml-auto">
                <custom-button
                    btn-class="hover:bg-gray-200 text-gray-700"
                    label="Cerrar"
                    onclick="closeModalReportes()">
                </custom-button>
                <custom-button
                    type="submit"
                    btn-class="bg-sky-500 hover:bg-sky-700 text-white"
                    label="Generar PDF"
                    icon="bi bi-file-earmark-pdf"
                    form="formReporte">
                </custom-button>
            </div>
        </div>
    </dialog-modal>

    <?php
    include("../../../shared/global/global_scripts.php")
    ?>
    <script type="module" src="./historyatten.js"></script>
</body>

</html>