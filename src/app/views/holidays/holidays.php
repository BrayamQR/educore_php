<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../../../css/main.css">
    <link rel="shortcut icon" href="../../../../public/logo2.png">
    <title>Días no lectivos | Educore</title>
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
                            <i class="bi bi-calendar-x text-blue-600 text-2xl"></i>
                        </div>
                        <div class="flex flex-col">
                            <h2 class="text-2xl font-bold text-gray-900">Días no lectivos</h2>
                            <span class="text-sm text-gray-500">Administración de feriados y fechas no lectivas</span>
                        </div>
                    </div>
                    <div>
                        <custom-button
                            id="btnNuevo"
                            btn-class="bg-blue-500 hover:bg-blue-900 text-white"
                            label="Nuevo"
                            icon="bi bi-plus-lg"
                            onclick="openModalForm()">
                        </custom-button>
                    </div>
                </div>
                <div class="flex flex-col gap-4">
                    <custom-text-field
                        class=""
                        label="Buscar feriado..."
                        name="searchText"
                        icon="bi bi-search"
                        clearable>
                    </custom-text-field>
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
                                label="Tipo de feriado"
                                name="filtroTipoFeriado">
                                <option value="1">Feriado nacional</option>
                                <option value="2">Feriado institucional</option>
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
            <div class="bg-white rounded-lg shadow-md flex flex-col  divide-neutral-200 divide-y overflow-y-auto lg:max-h-[calc(100vh-450px)] md:max-h-[calc(100vh-450px)]  scrollbar-thin scrollbar-track-gray-white scrollbar-thumb-neutral-400" id="contentList">

            </div>
            <data-paginator id="paginatorList" items-per-page="20"></data-paginator>
        </div>
    </main>
    <dialog-modal id="DialogFormHoliday" size="max-w-lg">
        <div slot="header" class="flex gap-3 items-center">
            <div class="bg-green-100 w-10 h-10 rounded-md flex items-center justify-center">
                <i class="bi bi-calendar2-event text-green-600 text-xl"></i>
            </div>

            <div>
                <h3 class="font-bold">Formulario del feriado</h3>
                <p class="text-sm text-neutral-500">Registra o edita un feriado</p>
            </div>
        </div>
        <div slot="body">
            <form action="" id="formHoliday" novalidate>
                <input type="hidden" name="idFeriado" id="idFeriado">
                <section class="flex flex-col gap-5">
                    <custom-text-field
                        label="Nombre del feriado"
                        name="nomFeriado"
                        required>
                    </custom-text-field>
                    <custom-textarea
                        label="Descripción del feriado"
                        name="descFeriado">
                    </custom-textarea>
                    <custom-datepicker
                        label="Fecha del feriado"
                        name="fechaFeriado"
                        required>
                    </custom-datepicker>
                    <custom-select
                        label="Tipo de feriado"
                        name="idTipoFeriado"
                        required>
                        <option value="1">Feriado nacional</option>
                        <option value="2">Feriado institucional</option>
                    </custom-select>
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
                form="formHoliday"
                label="Grabar">
            </custom-button>
        </div>
    </dialog-modal>
    <dialog-modal id="DialogInfoHoliday" size="max-w-lg">
        <div slot="header" class="flex gap-3 items-center">
            <div class="bg-sky-100 w-10 h-10 rounded-lg flex items-center justify-center">
                <i class="bi bi-calendar-event text-sky-600 text-xl"></i>
            </div>
            <div>
                <h3 class="font-bold text-gray-800">Detalles del feriado</h3>
                <p class="text-sm text-gray-500">Información del feriado</p>
            </div>
        </div>
        <div slot="body" class="flex flex-col gap-6">
            <section class="bg-linear-to-r from-blue-50 to-sky-50 p-5 rounded-xl border border-blue-100">
                <h2 class="font-bold text-lg mb-4 text-center">Datos del feriado</h2>
                <div class="flex flex-col gap-3">
                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                        <i class="bi bi-calendar-heart text-sky-600 w-8 h-8 bg-sky-100 text-lg items-center flex justify-center rounded-full"></i>
                        <div class="flex flex-col">
                            <span class="text-xs">Nombre</span>
                            <span id="nomFeriadoInfo" class="font-medium"></span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                        <i class="bi bi-calendar-date text-sky-600 w-8 h-8 bg-sky-100 text-lg items-center flex justify-center rounded-full"></i>
                        <div class="flex flex-col">
                            <span class="text-xs">Fecha</span>
                            <span id="fechaFeriadoInfo" class="font-medium"></span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                        <i class="bi bi-tag text-sky-600 w-8 h-8 bg-sky-100 text-lg items-center flex justify-center rounded-full"></i>
                        <div class="flex flex-col">
                            <span class="text-xs">Tipo de feriado</span>
                            <span id="tipoFeriadoInfo" class="font-medium"></span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                        <i class="bi bi-card-text text-sky-600 w-8 h-8 bg-sky-100 text-lg items-center flex justify-center rounded-full"></i>
                        <div class="flex flex-col">
                            <span class="text-xs">Descripción</span>
                            <span id="descFeriadoInfo" class="font-medium"></span>
                        </div>
                    </div>
                </div>
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
    <script type="module" src="./holidays.js"></script>
</body>

</html>