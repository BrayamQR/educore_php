<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../../../css/main.css">
    <link rel="shortcut icon" href="../../../../public/logo2.png">
    <title>Turno académico | Educore</title>
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
                            <i class="bi bi-clock text-blue-600 text-2xl"></i>
                        </div>
                        <div class="flex flex-col">
                            <h2 class="text-2xl font-bold text-gray-900">Turno académico</h2>
                            <span class="text-sm text-gray-500">Gestión de turnos académicos</span>
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
                <div class="flex gap-4 lg:flex-row flex-col w-full">

                    <custom-text-field
                        class="w-full lg:flex-1"
                        label="Buscar turno..."
                        name="searchText"
                        icon="bi bi-search"
                        clearable>
                    </custom-text-field>

                    <div id="panelFiltros" class="hidden lg:flex flex-col lg:flex-row gap-4 w-full lg:w-auto">
                        <div class="flex-1 lg:flex-none lg:w-64">
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
    <dialog-modal id="DialogFormAcademicShift" size="max-w-lg">
        <div slot="header" class="flex gap-3 items-center">
            <div class="bg-green-100 w-10 h-10 rounded-md flex items-center justify-center">
                <i class="bi bi-clock text-green-600 text-xl"></i>
            </div>

            <div>
                <h3 class="font-bold">Formulario del turno académico</h3>
                <p class="text-sm text-neutral-500">Registra o edita un turno académico</p>
            </div>
        </div>
        <div slot="body">
            <form action="" id="formAcademicShift" novalidate>
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
                    <input type="hidden" name="idTurno" id="idTurno">
                    <section class="flex flex-col gap-5">
                        <custom-text-field
                            label="Nombre"
                            name="nomTurno"
                            required>
                        </custom-text-field>

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

                        <custom-number-field
                            label="Tolerancia (min.)"
                            name="minTolerancia"
                            icon="bi bi-hourglass-bottom"
                            required>
                        </custom-number-field>

                        <fieldset class="border border-gray-200 rounded-lg p-4">
                            <legend class="text-sm font-medium text-gray-700 px-1">
                                Días de la semana
                            </legend>
                            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-y-3 gap-x-4 mt-1">
                                <div class="flex items-center gap-2">
                                    <input type="checkbox" class="w-4 h-4 text-sky-600 rounded focus:ring-sky-500 cursor-pointer" name="dias[]" id="diaLunes" value="1">
                                    <label for="diaLunes" class="text-sm text-gray-700 cursor-pointer">Lunes</label>
                                </div>
                                <div class="flex items-center gap-2">
                                    <input type="checkbox" class="w-4 h-4 text-sky-600 rounded focus:ring-sky-500 cursor-pointer" name="dias[]" id="diaMartes" value="2">
                                    <label for="diaMartes" class="text-sm text-gray-700 cursor-pointer">Martes</label>
                                </div>
                                <div class="flex items-center gap-2">
                                    <input type="checkbox" class="w-4 h-4 text-sky-600 rounded focus:ring-sky-500 cursor-pointer" name="dias[]" id="diaMiercoles" value="3">
                                    <label for="diaMiercoles" class="text-sm text-gray-700 cursor-pointer">Miércoles</label>
                                </div>
                                <div class="flex items-center gap-2">
                                    <input type="checkbox" class="w-4 h-4 text-sky-600 rounded focus:ring-sky-500 cursor-pointer" name="dias[]" id="diaJueves" value="4">
                                    <label for="diaJueves" class="text-sm text-gray-700 cursor-pointer">Jueves</label>
                                </div>
                                <div class="flex items-center gap-2">
                                    <input type="checkbox" class="w-4 h-4 text-sky-600 rounded focus:ring-sky-500 cursor-pointer" name="dias[]" id="diaViernes" value="5">
                                    <label for="diaViernes" class="text-sm text-gray-700 cursor-pointer">Viernes</label>
                                </div>
                                <div class="flex items-center gap-2">
                                    <input type="checkbox" class="w-4 h-4 text-sky-600 rounded focus:ring-sky-500 cursor-pointer" name="dias[]" id="diaSabado" value="6">
                                    <label for="diaSabado" class="text-sm text-gray-700 cursor-pointer">Sábado</label>
                                </div>
                                <div class="flex items-center gap-2">
                                    <input type="checkbox" class="w-4 h-4 text-sky-600 rounded focus:ring-sky-500 cursor-pointer" name="dias[]" id="diaDomingo" value="7">
                                    <label for="diaDomingo" class="text-sm text-gray-700 cursor-pointer">Domingo</label>
                                </div>
                            </div>
                        </fieldset>
                        <p id="diasError" class="text-sm text-red-800 -mt-3 hidden">
                            Debes seleccionar al menos un día
                        </p>
                        <div class="flex flex-col hidden" id="contDescCambio">
                            <custom-textarea
                                label="Motivo"
                                name="descCambio"
                                required>
                            </custom-textarea>
                        </div>

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
                form="formAcademicShift"
                label="Grabar">
            </custom-button>
        </div>
    </dialog-modal>

    <dialog-modal id="DialogInfoAcademicShift" size="max-w-lg">
        <div slot="header" class="flex gap-3 items-center">
            <div class="bg-sky-100 w-10 h-10 rounded-lg flex items-center justify-center">
                <i class="bi bi-alarm text-sky-600 text-xl"></i>
            </div>
            <div>
                <h3 class="font-bold text-gray-800">Detalles del turno académico</h3>
                <p class="text-sm text-gray-500">Información del turno académico</p>
            </div>
        </div>
        <div slot="body" class="flex flex-col gap-5">
            <div class="flex flex-col gap-2">
                <h4 id="nomTurnoInfo" class="text-xl font-bold text-gray-800 leading-tight">-</h4>
                <span id="badgeEstadoInfo" class="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold">
                    <span id="dotEstadoInfo" class="w-2 h-2 rounded-full"></span>
                    <span id="nomEstadoInfo">-</span>
                </span>
            </div>

            <!-- Sección: Horario general -->
            <section class="bg-linear-to-r from-blue-50 to-sky-50 p-5 rounded-xl border border-blue-100">
                <div class="flex flex-col items-center text-center gap-2">
                    <span id="horarioInfo" class="text-lg font-bold text-gray-800">-</span>
                    <span id="toleranciaInfo" class="text-sm text-gray-500">-</span>
                </div>
            </section>

            <!-- Sección: Información adicional -->
            <section class="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <h5 class="text-xs font-semibold text-gray-500 uppercase mb-3">Información adicional</h5>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-100">
                        <div class="w-9 h-9 bg-violet-100 rounded-lg flex items-center justify-center shrink-0">
                            <i class="bi bi-mortarboard text-violet-600"></i>
                        </div>
                        <div class="flex flex-col min-w-0">
                            <span class="text-xs text-gray-500">Año lectivo</span>
                            <span id="anioLectivoInfo" class="text-sm font-semibold text-gray-700">-</span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Sección: Días de la semana -->
            <section class="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <h5 class="text-xs font-semibold text-gray-500 uppercase mb-3">Días activos</h5>
                <div id="listaDiasInfo" class="flex flex-col gap-2"></div>
            </section>
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
    <script type="module" src="./academicshift.js"></script>
</body>

</html>