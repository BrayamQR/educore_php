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
            <form action="" id="formClassroom" novalidate>
                <input type="hidden" name="idAula" id="idAula">
                <section class="flex flex-col gap-5">
                    <custom-select
                        label="Nivel academico"
                        name="idNivel"
                        required>
                        <option value="1">INICIAL</option>
                        <option value="2">PRIMARIA</option>
                    </custom-select>
                    <custom-select
                        label="Grado"
                        name="idGrado"
                        required>
                        <option value="1">3 AÑITOS</option>
                        <option value="2">4 AÑITOS</option>
                        <option value="3">5 AÑITOS</option>
                        <option value="4">PRIMERO</option>
                        <option value="5">SEGUNDO</option>
                        <option value="6">TERCERO</option>
                        <option value="7">CUARTO</option>
                        <option value="8">QUINTO</option>
                        <option value="9">SEXTO</option>
                    </custom-select>
                    <custom-text-field
                        label="Sección"
                        name="seccionAula"
                        default-value="UNICA"
                        required>
                    </custom-text-field>
                    <custom-autocomplete
                        label="Docente a cargo"
                        name="idDocente"
                        required>
                    </custom-autocomplete>
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
    <script type="module" src="./classroom.js"></script>
</body>

</html>