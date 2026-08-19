<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../../../css/main.css">
    <link rel="shortcut icon" href="../../../../public/logo2.png">
    <title>Aulas | Educore</title>
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
                            <i class="bi bi-person-workspace text-blue-600 text-2xl"></i>
                        </div>
                        <div class="flex flex-col">
                            <h2 class="text-2xl font-bold text-gray-900">Aulas</h2>
                            <span class="text-sm text-gray-500">Gestión de aulas y secciones</span>
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
                <div>
                    <custom-text-field
                        class=""
                        label="Buscar aula..."
                        name="searchText"
                        icon="bi bi-search"
                        clearable>
                    </custom-text-field>
                </div>
            </div>
            <div class="bg-white rounded-lg shadow-md flex flex-col  divide-neutral-200 divide-y overflow-y-auto lg:max-h-[calc(100vh-380px)] md:max-h-[calc(100vh-450px)]  scrollbar-thin scrollbar-track-gray-white scrollbar-thumb-neutral-400" id="contentList">

            </div>
            <data-paginator id="paginatorList" items-per-page="20"></data-paginator>
        </div>
    </main>

    <dialog-modal id="DialogFormClassroom" size="max-w-lg">
        <div slot="header" class="flex gap-3 items-center">
            <div class="bg-green-100 w-10 h-10 rounded-md flex items-center justify-center">
                <i class="bi bi-person-workspace text-green-600 text-xl"></i>
            </div>

            <div>
                <h3 class="font-bold">Formulario del aula</h3>
                <p class="text-sm text-neutral-500">Registra o edita un aula</p>
            </div>
        </div>
        <div slot="body">
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
                <custom-button
                    id="btnBuscarAula"
                    btn-class="w-full bg-sky-500 hover:bg-sky-900 text-gray-700 text-white"
                    label="Buscar aula"
                    onclick="openModalBuscarAula()"
                    icon=" bi bi-search">
                </custom-button>

                <form action="" id="formClassroom" novalidate>
                    <input type="hidden" name="idAulaLectiva" id="idAulaLectiva">
                    <input type="hidden" name="idAula" id="idAula">
                    <section class="flex flex-col gap-5">
                        <custom-select
                            label="Nivel académico"
                            name="idNivel"
                            disabled
                            required>
                        </custom-select>
                        <custom-select
                            label="Grado"
                            name="idGrado"
                            disabled
                            required>
                        </custom-select>
                        <custom-text-field
                            label="Sección"
                            name="seccionAula"
                            disabled
                            required>
                        </custom-text-field>
                        <custom-autocomplete
                            label="Docente a cargo"
                            name="idDocente"
                            disabled
                            required>
                        </custom-autocomplete>
                        <custom-select
                            label="Turno"
                            name="idTurno"
                            disabled
                            required>
                        </custom-select>
                    </section>
                </form>
            </section>
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
                form="formClassroom"
                label="Grabar">
            </custom-button>
        </div>
    </dialog-modal>
    <dialog-modal id="DialogInfoClassroom" size="max-w-lg">
        <div slot="header" class="flex gap-3 items-center">
            <div class="bg-sky-100 w-10 h-10 rounded-lg flex items-center justify-center">
                <i class="bi bi-person-workspace text-sky-600 text-xl"></i>
            </div>
            <div>
                <h3 class="font-bold text-gray-800">Detalles del aula</h3>
                <p class="text-sm text-gray-500">Información del aula</p>
            </div>
        </div>
        <div slot="body" class="flex flex-col gap-6">
            <section class="bg-linear-to-r from-blue-50 to-sky-50 p-5 rounded-xl border border-blue-100">
                <h2 class="font-bold text-lg mb-4 text-center">Datos del aula</h2>
                <div class="flex flex-col gap-3">
                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                        <i class="bi bi-mortarboard text-sky-600 w-8 h-8 bg-sky-100 text-lg items-center flex justify-center rounded-full"></i>
                        <div class="flex flex-col">
                            <span class="text-xs">Grado</span>
                            <span id="descGradoAula" class="font-medium"></span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                        <i class="bi bi-door-open text-sky-600 w-8 h-8 bg-sky-100 text-lg items-center flex justify-center rounded-full"></i>
                        <div class="flex flex-col">
                            <span class="text-xs">Sección</span>
                            <span id="seccAula" class="font-medium"></span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                        <i class="bi bi-building text-sky-600 w-8 h-8 bg-sky-100 text-lg items-center flex justify-center rounded-full"></i>
                        <div class="flex flex-col">
                            <span class="text-xs">Nivel académico</span>
                            <span id="descNivelAula" class="font-medium"></span>
                        </div>
                    </div>
                </div>
            </section>

            <section class="bg-linear-to-r from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-100">
                <h2 class="font-bold text-lg mb-4 text-center">Tutor del aula</h2>
                <div class="flex flex-col gap-3">
                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                        <i class="bi bi-person-badge text-purple-600 w-8 h-8 bg-purple-100 text-lg items-center flex justify-center rounded-full"></i>
                        <div class="flex flex-col">
                            <span class="text-xs">Nombre del tutor</span>
                            <span id="nomDocenteAula" class="font-medium"></span>
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

    <dialog-modal id="DialogBuscarAula" size="max-w-md">
        <div slot="header" class="flex gap-3 items-center justify-between w-full">
            <div class="flex gap-3 items-center">
                <div class="bg-sky-100 w-10 h-10 rounded-md flex items-center justify-center">
                    <i class="bi bi-door-open text-sky-600 text-xl"></i>
                </div>
                <div>

                    <h3 class="font-bold text-gray-800">Aulas disponibles</h3>
                    <p class="text-sm text-gray-500">Selecciona una existente o registra una nueva</p>
                </div>
            </div>
        </div>
        <div slot="body">

            <div class="relative">
                <i class="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                    type="text"
                    id="searchAula"
                    placeholder="Buscar aula..."
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none" />
            </div>

            <div id="listAulasDisponibles" class="flex flex-col gap-2 mt-4 max-h-80 overflow-y-auto scrollbar-thin scrollbar-track-gray-white scrollbar-thumb-neutral-400">
                <!-- Aquí se generarán dinámicamente los elementos de aula -->
            </div>

            <div id="emptyAulasMsg" class="hidden text-center text-neutral-400 py-6">
                <i class="bi bi-inbox text-3xl mb-2 block"></i>
                <p class="text-sm">No se encontraron aulas disponibles</p>
            </div>
        </div>
        <div slot="footer" class="flex justify-between items-center gap-3">
            <p class="text-xs text-neutral-400" id="countAulasDisponibles"></p>
            <custom-button
                id="btnRegistrarNueva"
                btn-class="bg-green-500 hover:bg-green-900 text-white"
                label="Registrar aula"
                icon="bi bi-plus-lg"
                onclick="registrarAulaNueva()">
            </custom-button>
        </div>
    </dialog-modal>
    <?php
    include("../../../shared/global/global_scripts.php")
    ?>
    <script type="module" src="./classroom.js"></script>
</body>

</html>