<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../../../css/main.css">
    <link rel="shortcut icon" href="../../../../public/logo2.png">
    <title>Docente | Educore</title>
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
                            <i class="bi bi-file-person text-blue-600 text-2xl"></i>
                        </div>
                        <div class="flex flex-col">
                            <h2 class="text-2xl font-bold text-gray-900">Docentes</h2>
                            <span class="text-sm text-gray-500">Gestión del docente</span>
                        </div>
                    </div>
                    <div>
                        <custom-button
                            id="btnNuevo"
                            btn-class="bg-blue-500 hover:bg-blue-900 text-white "
                            label="Nuevo"
                            icon="bi bi-plus-lg"
                            onclick="openModalForm()">
                        </custom-button>
                    </div>
                </div>
                <div>
                    <custom-text-field
                        class=""
                        label="Buscar docente..."
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

    <dialog-modal id="DialogFormTeacher" size="max-w-lg">
        <div slot="header" class="flex gap-3 items-center">
            <div class="bg-green-100 w-10 h-10 rounded-md flex items-center justify-center">
                <i class="bi bi-file-person text-green-600 text-xl"></i>
            </div>

            <div>
                <h3 class="font-bold">Formulario del docente</h3>
                <p class="text-sm text-neutral-500">Registra o edita un docente</p>
            </div>
        </div>
        <div slot="body">
            <form action="" id="formTeacher" novalidate>
                <input type="hidden" name="idDocente" id="idDocente">
                <section class="flex flex-col gap-5">
                    <custom-select
                        label="Tipo de documento"
                        name="idTipoDocumento"
                        required>
                        <option value="1">D.N.I.</option>
                        <option value="2">CARNET DE EXTRANJERIA</option>
                    </custom-select>
                    <custom-text-field
                        label="Doc. de identidad"
                        name="docDocente"
                        required>
                    </custom-text-field>
                    <custom-text-field
                        label="Nombre"
                        name="nomDocente"
                        required>
                    </custom-text-field>
                    <custom-select
                        label="Cargo"
                        name="idCargo"
                        required>
                        <option value="1">DOCENTE DE AULA</option>
                        <option value="2">AUXILIAR DE AULA</option>
                    </custom-select>
                    <custom-select
                        label="Tipo contrato"
                        name="idTipoContrato"
                        required>
                        <option value="1">NOMBRADO</option>
                        <option value="2">CONTRATADO</option>
                    </custom-select>
                    <custom-text-field
                        label="Dirección"
                        name="dirDocente"
                        required>
                    </custom-text-field>
                    <custom-text-field
                        label="Teléfono"
                        name="telDocente"
                        required>
                    </custom-text-field>
                    <custom-text-field
                        label="Correo electrónico"
                        name="emailDocente"
                        required>
                    </custom-text-field>
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
                btn-class="bg-sky-500 hover:bg-sky-900 text-white"
                form="formTeacher"
                label="Grabar">
            </custom-button>
        </div>
    </dialog-modal>
    <dialog-modal id="DialogInfoTeacher" size="max-w-lg">
        <div slot="header" class="flex gap-3 items-center">
            <div class="bg-sky-100 w-10 h-10 rounded-lg flex items-center justify-center">
                <i class="bi bi-person-lines-fill text-sky-600 text-xl"></i>
            </div>
            <div>
                <h3 class="font-bold text-gray-800">Detalles del docente</h3>
                <p class="text-sm text-gray-500">Información del docente</p>
            </div>
        </div>
        <div slot="body" class="flex flex-col gap-6">
            <section class="bg-linear-to-r from-blue-50 to-sky-50 p-5 rounded-xl border border-blue-100">
                <h2 class="font-bold text-lg mb-4 text-center">Datos personales</h2>
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                            <i class="bi bi-person-fill text-white text-2xl"></i>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">Nombre del docente</p>
                            <h2 id="teacherName" class="text-xl font-bold text-gray-800"></h2>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col gap-3">
                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                        <i class="bi bi-person-video text-blue-600 w-8 h-8 bg-blue-100 text-lg items-center flex justify-center rounded-full"></i>
                        <div class="flex flex-col">
                            <span class="text-xs">Tipo de documento</span>
                            <span id="tipoDocumentoDocente" class="font-medium "></span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                        <i class="bi bi-person-vcard text-blue-600 w-8 h-8 bg-blue-100 text-lg items-center flex justify-center rounded-full"></i>
                        <div class="flex flex-col">
                            <span class="text-xs">Nro. de documento</span>
                            <span id="numDocumento" class="font-medium "></span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                        <i class="bi bi-at text-blue-600 w-8 h-8 bg-blue-100 text-lg items-center flex justify-center rounded-full"></i>
                        <div class="flex flex-col">
                            <span class="text-xs">Correo electrónico</span>
                            <span id="correoDocente" class="font-medium "></span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                        <i class="bi bi-telephone text-blue-600 w-8 h-8 bg-blue-100 text-lg items-center flex justify-center rounded-full"></i>
                        <div class="flex flex-col">
                            <span class="text-xs">Teléfono</span>
                            <span id="telefonoDocente" class="font-medium "></span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                        <i class="bi bi-geo-alt text-blue-600 w-8 h-8 bg-blue-100 text-lg items-center flex justify-center rounded-full"></i>
                        <div class="flex flex-col">
                            <span class="text-xs">Dirección</span>
                            <span id="direccionDocente" class="font-medium "></span>
                        </div>
                    </div>
                </div>
            </section>
            <section class="bg-linear-to-r from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-100">
                <h2 class="font-bold text-lg mb-4 text-center">Datos laborales</h2>

                <div class="flex flex-col gap-3">
                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                        <i class="bi bi-person-rolodex text-purple-600 w-8 h-8 bg-purple-100 text-lg items-center flex justify-center rounded-full"></i>
                        <div class="flex flex-col">
                            <span class="text-xs">Cargo</span>
                            <span id="cargoDocente" class="font-medium "></span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                        <i class="bi bi-file-earmark-person text-purple-600 w-8 h-8 bg-purple-100 text-lg items-center flex justify-center rounded-full"></i>
                        <div class="flex flex-col">
                            <span class="text-xs">Tipo de contrato</span>
                            <span id="tipoContratoDocente" class="font-medium "></span>
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
    <script type="module" src="./teacher.js"></script>
</body>

</html>