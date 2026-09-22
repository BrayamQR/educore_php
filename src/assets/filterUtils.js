/**
 * Crea un controlador de filtros que evita disparar la función de búsqueda
 * cuando el valor de un campo no cambió realmente (por ejemplo, al hacer
 * setValue()/initInput() de forma programática durante un reset).
 */
function crearControladorFiltros(callback) {
  const valoresAnteriores = new WeakMap();

  function normalizar(valor) {
    if (valor === null || valor === undefined) return "";
    if (typeof valor === "object") return JSON.stringify(valor);
    return String(valor);
  }

  function registrar(elemento, eventoNombre, obtenerValor) {
    if (!elemento) return;

    valoresAnteriores.set(elemento, normalizar(obtenerValor(elemento)));

    elemento.addEventListener(eventoNombre, () => {
      const valorActual = normalizar(obtenerValor(elemento));
      if (valorActual === valoresAnteriores.get(elemento)) return;
      valoresAnteriores.set(elemento, valorActual);
      callback();
    });
  }

  function sincronizar(elemento, valor) {
    if (!elemento) return;
    valoresAnteriores.set(elemento, normalizar(valor));
  }

  return { registrar, sincronizar };
}

/**
 * Crea un gestor de filtros reutilizable: cachea los elementos del DOM,
 * registra los eventos (con control de cambios reales vía
 * crearControladorFiltros), expone los valores actuales y sabe limpiarse.
 *
 * Uso típico:
 *   const FILTROS_CONFIG = [
 *     { key: "searchText",  selector: "custom-text-field[name='searchText']", event: "input",  getValue: (el) => el.getValue()?.trim() || "" },
 *     { key: "anioLectivo", selector: "custom-select[name='filtroAnioLectivo']", event: "change", getValue: (el) => el.getValue() || "" },
 *   ];
 *
 *   const gestorFiltros = crearGestorFiltros(FILTROS_CONFIG, Filtrar);
 *
 *   function initFiltros() { gestorFiltros.inicializar(); }
 *
 *   async function Filtrar() {
 *     const { searchText, anioLectivo } = gestorFiltros.obtenerValores();
 *     if (!gestorFiltros.hayFiltrosActivos()) { Listar(); return; }
 *     ...
 *   }
 *
 *   window.LimpiarFiltros = () => {
 *     gestorFiltros.limpiar({ anioLectivo: ultimoAnio?.id_aniolectivo || "" });
 *     Listar();
 *   };
 *
 *   // Si seteas un valor de filtro de forma programática (fuera de un evento
 *   // del usuario, ej. al poblar el select con un valor por defecto),
 *   // sincroniza el controlador para que ese cambio no dispare Filtrar():
 *   anioLectivoSelect.setValue(ultimoAnio.id_aniolectivo);
 *   gestorFiltros.controlador.sincronizar(anioLectivoSelect, ultimoAnio.id_aniolectivo);
 */
export function crearGestorFiltros(definiciones, callback) {
  const controlador = crearControladorFiltros(callback);
  const elementos = {};

  function inicializar() {
    definiciones.forEach(({ key, selector, event, getValue }) => {
      const el = document.querySelector(selector);
      elementos[key] = el;
      controlador.registrar(el, event, getValue);
    });
  }

  function obtenerValores() {
    const valores = {};
    definiciones.forEach(({ key, getValue }) => {
      const el = elementos[key];
      valores[key] = el ? getValue(el) || "" : "";
    });
    return valores;
  }

  function hayFiltrosActivos() {
    return Object.values(obtenerValores()).some((v) => !!v);
  }

  function limpiar(valoresReset = {}) {
    definiciones.forEach(({ key }) => {
      const el = elementos[key];
      if (!el) return;
      const valorReset = valoresReset[key] ?? "";
      controlador.sincronizar(el, valorReset);
      if (valorReset && typeof el.setValue === "function") {
        el.setValue(valorReset);
      } else if (typeof el.initInput === "function") {
        el.initInput();
      }
    });
  }

  return {
    elementos,
    controlador,
    inicializar,
    obtenerValores,
    hayFiltrosActivos,
    limpiar,
  };
}
