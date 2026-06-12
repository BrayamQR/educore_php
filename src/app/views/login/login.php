<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../../../css/main.css">
    <link rel="shortcut icon" href="../../../../public/logo2.png">
    <title>Iniciar Sesión | Educore</title>
</head>

<body>
    <main>
        <div
            class="bg-gray-200 w-full min-h-screen relative flex items-center justify-center">
            <section
                class="bg-white px-8 py-10 rounded-2xl shadow-lg w-full max-w-sm relative">
                <div class="flex justify-center mb-15">
                    <img
                        src="../../../../public/logo.png"
                        alt="Logo"
                        class="h-40 w-auto bg-white" />
                </div>
                <form id="formLogin" novalidate>
                    <custom-text-field
                        class="mb-8"
                        label="Usuario"
                        name="usuUsuario"
                        required></custom-text-field>

                    <custom-text-field
                        class="mb-8"
                        label="Contraseña"
                        name="passUsuario"
                        type="password"
                        icon-show-password="bi bi-eye-fill "
                        icon-hide-password="bi bi-eye-slash-fill"
                        required></custom-text-field>

                    <custom-button
                        id="btnlogin"
                        type="submit"
                        label="Iniciar Sesión"
                        btn-class="w-full bg-blue-900 text-white hover:bg-blue-950"></custom-button>
                </form>
            </section>
        </div>
    </main>
    <?php
    include("../../../shared/global/global_scripts.php")
    ?>
    <script type="module" src="./login.js"></script>
</body>

</html>