/**
 * Crea un controlador de filtros que evita disparar la función de búsqueda
 * cuando el valor de un campo no cambió realmente (por ejemplo, al hacer
 * setValue()/initInput() de forma programática durante un reset).
 *
 * Uso típico:
 *   const filtros = crearControladorFiltros(Filtrar);
 *   filtros.registrar(searchText, "input", (el) => el.getValue()?.trim() || "");
 *   filtros.registrar(anioLectivo, "change", (el) => el.getValue() || "");
 *
 *   // al limpiar:
 *   filtros.sincronizar(anioLectivo, valorReset);
 *   anioLectivo.setValue(valorReset);
 */
export function crearControladorFiltros(callback) {
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
