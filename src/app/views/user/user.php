<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../../../css/main.css">
    <link rel="shortcut icon" href="../../../../public/logo2.png">
    <title>Usuarios | Educore</title>
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
                            <i class="bi bi-people text-blue-600 text-2xl"></i>
                        </div>
                        <div class="flex flex-col">
                            <h2 class="text-2xl font-bold text-gray-900">Usuarios</h2>
                            <span class="text-sm text-gray-500">Gestión de usuarios</span>
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
                        label="Buscar usuario..."
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
    <dialog-modal id="DialogFormUser" size="max-w-2xl">
        <div slot="header" class="flex gap-3 items-center">
            <div class="bg-green-100 w-10 h-10 rounded-md flex items-center justify-center">
                <i class="bi bi-person text-green-600 text-xl"></i>
            </div>
            <div>
                <h3 class="font-bold">Formulario del usuario</h3>
                <p class="text-sm text-neutral-500">Registra o edita un usuario</p>
            </div>
        </div>
        <div slot="body">
            <form action="" id="formUser" novalidate>
                <input type="hidden" name="idUsuario" id="idUsuario">
                <section class="flex flex-col gap-5">
                    <div>
                        <div class="mb-4">
                            <h3 class="text-base font-semibold text-gray-900 mb-2">Información Personal</h3>
                            <div class="h-0.5 w-16 bg-linear-to-r from-green-500 to-green-300 rounded-full"></div>
                        </div>
                        <div class="flex flex-col gap-5">
                            <div class="grid lg:grid-cols-2 grid-cols-1 gap-5">
                                <custom-text-field
                                    label="Doc. de indentidad"
                                    name="codUsuario"
                                    required>
                                </custom-text-field>
                                <custom-text-field
                                    label="Nombre del usuario"
                                    name="nomUsuario"
                                    required>
                                </custom-text-field>
                                <custom-text-field
                                    label="Teléfono"
                                    name="telUsuario"
                                    required>
                                </custom-text-field>
                                <custom-text-field
                                    type="email"
                                    label="Correo Electronico"
                                    name="emailUsuario"
                                    required>
                                </custom-text-field>
                            </div>
                            <custom-text-field
                                label="Dirección"
                                name="dirUsuario"
                                required>
                            </custom-text-field>
                        </div>

                    </div>
                    <div>
                        <div class="mb-4">
                            <h3 class="text-base font-semibold text-gray-900 mb-2">Datos de Acceso</h3>
                            <div class="h-0.5 w-16 bg-linear-to-r from-green-500 to-green-300 rounded-full"></div>
                        </div>
                        <div class="grid lg:grid-cols-2 grid-cols-1 gap-5">
                            <custom-text-field
                                label="Usuario"
                                name="usuUsuario"
                                required>
                            </custom-text-field>
                            <div id="passFields" class="contents">
                                <custom-text-field
                                    type="password"
                                    label="Contraseña"
                                    name="passUsuario"
                                    required>
                                </custom-text-field>
                                <custom-text-field
                                    type="password"
                                    label="Confirmar contraseña"
                                    name="confPassword"
                                    match="passUsuario"
                                    error-match="Las contraseñas no coinciden"
                                    required>
                                </custom-text-field>
                            </div>
                            <custom-select
                                label="Perfil"
                                name="idPerfil"
                                required>
                            </custom-select>
                        </div>
                    </div>
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
                form="formUser">
            </custom-button>
        </div>
    </dialog-modal>
    <dialog-modal id="DialogInfoUser" size="max-w-lg">
        <div slot="header" class="flex gap-3 items-center">
            <div class="bg-sky-100 w-10 h-10 rounded-lg flex items-center justify-center">
                <i class="bi bi-person text-sky-600 text-xl"></i>
            </div>
            <div>
                <h3 class="font-bold text-gray-800">Detalles del usuario</h3>
                <p class="text-sm text-gray-500">Información del usuario</p>
            </div>
        </div>
        <div slot="body" class="flex flex-col gap-6">
            <section class="bg-linear-to-r from-blue-50 to-sky-50 p-5 rounded-xl border border-blue-100">
                <h2 class="font-bold text-lg mb-4 text-center">Información Personal</h2>
                <div class="flex flex-col gap-3">
                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                        <i class="bi bi-person-fill text-sky-600 w-8 h-8 bg-sky-100 text-lg items-center flex justify-center rounded-full"></i>
                        <div class="flex flex-col">
                            <span class="text-xs">Nombre</span>
                            <span id="nomUsuarioInfo" class="font-medium"></span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                        <i class="bi bi-person-vcard text-sky-600 w-8 h-8 bg-sky-100 text-lg items-center flex justify-center rounded-full"></i>
                        <div class="flex flex-col">
                            <span class="text-xs">Código de usuario</span>
                            <span id="codUsuarioInfo" class="font-medium"></span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                        <i class="bi bi-telephone text-sky-600 w-8 h-8 bg-sky-100 text-lg items-center flex justify-center rounded-full"></i>
                        <div class="flex flex-col">
                            <span class="text-xs">Teléfono</span>
                            <span id="telUsuarioInfo" class="font-medium"></span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                        <i class="bi bi-envelope text-sky-600 w-8 h-8 bg-sky-100 text-lg items-center flex justify-center rounded-full"></i>
                        <div class="flex flex-col">
                            <span class="text-xs">Correo electrónico</span>
                            <span id="emailUsuarioInfo" class="font-medium"></span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                        <i class="bi bi-geo-alt text-sky-600 w-8 h-8 bg-sky-100 text-lg items-center flex justify-center rounded-full"></i>
                        <div class="flex flex-col">
                            <span class="text-xs">Dirección</span>
                            <span id="dirUsuarioInfo" class="font-medium"></span>
                        </div>
                    </div>
                </div>
            </section>

            <section class="bg-linear-to-r from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-100">
                <h2 class="font-bold text-lg mb-4 text-center">Datos de Acceso</h2>
                <div class="flex flex-col gap-3">
                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                        <i class="bi bi-person-badge text-purple-600 w-8 h-8 bg-purple-100 text-lg items-center flex justify-center rounded-full"></i>
                        <div class="flex flex-col">
                            <span class="text-xs">Usuario</span>
                            <span id="usuUsuarioInfo" class="font-medium"></span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                        <i class="bi bi-shield-check text-purple-600 w-8 h-8 bg-purple-100 text-lg items-center flex justify-center rounded-full"></i>
                        <div class="flex flex-col">
                            <span class="text-xs">Perfil</span>
                            <span id="nomPerfilInfo" class="font-medium"></span>
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
    <script type="module" src="./user.js"></script>
</body>

</html>