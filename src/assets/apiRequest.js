/**
 * api.js
 * Centraliza las llamadas a los endpoints de /app/routes/.
 * Ubicación esperada: src/assets/api.js
 *
 * La ruta se calcula en base a la ubicación de ESTE archivo
 * (import.meta.url), no en base a quién lo importa. Por eso
 * funciona sin importar la profundidad del módulo que llama,
 * mientras api.js viva siempre en src/assets/api.js.
 */

// Ubicación de este archivo: .../src/assets/api.js
// Subimos 1 nivel (assets/ -> src/) y de ahí entramos a app/routes/
const ROUTES_PATH = new URL("../app/routes/", import.meta.url).href;

/**
 * Llama a un endpoint de la carpeta /app/routes/
 *
 * @param {string} archivo - nombre del route, ej: "menu.route.php"
 * @param {string} op - valor del query param "op", ej: "listarByPerfil"
 * @param {Object|FormData|null} data - datos a enviar (si es null, hace GET)
 * @param {Object} options - opciones extra { method, ...fetchOptions }
 * @returns {Promise<{status: boolean, data: any, msg?: string}>}
 */
export async function apiRequest(archivo, op, data = null, options = {}) {
  const url = `${ROUTES_PATH}${archivo}?op=${op}`;
  const method = options.method || (data ? "POST" : "GET");

  const fetchConfig = {
    method,
    mode: "cors",
    cache: "no-cache",
    ...options,
  };

  if (data) {
    if (data instanceof FormData) {
      fetchConfig.body = data;
    } else {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
      fetchConfig.body = formData;
    }
  }

  try {
    const resp = await fetch(url, fetchConfig);

    if (!resp.ok) {
      console.error(`Error HTTP ${resp.status} en ${archivo}?op=${op}`);
      return { status: false, data: null, msg: `Error HTTP ${resp.status}` };
    }

    return await resp.json();
  } catch (error) {
    console.error(`Error de red en ${archivo}?op=${op}:`, error);
    return { status: false, data: null, msg: "Error de conexión" };
  }
}
