/**
 * Servicio de alertas usando SweetAlert2
 * Proporciona métodos reutilizables para mostrar notificaciones
 */
export const AlertService = {
  /**
   * Muestra una alerta de éxito
   * @param {string} title - Título de la alerta
   * @param {string} text - Mensaje de la alerta
   */
  success(title, text) {
    Swal.fire({
      title,
      theme: "auto",
      text,
      icon: "success",
      confirmButtonText: "Aceptar",
    });
  },

  /**
   * Muestra una alerta de error
   * @param {string} title - Título de la alerta
   * @param {string} text - Mensaje de error
   */
  error(title, text) {
    Swal.fire({
      title,
      theme: "auto",
      text,
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  },

  /**
   * Muestra una alerta informativa
   * @param {string} title - Título de la alerta
   * @param {string} text - Mensaje informativo
   */
  info(title, text) {
    Swal.fire({
      title,
      theme: "auto",
      text,
      icon: "info",
      confirmButtonText: "Aceptar",
    });
  },

  /**
   * Muestra una alerta de advertencia
   * @param {string} title - Título de la alerta
   * @param {string} text - Mensaje de advertencia
   */
  warning(title, text) {
    Swal.fire({
      title,
      theme: "auto",
      text,
      icon: "warning",
      confirmButtonText: "Aceptar",
    });
  },

  /**
   * Muestra un diálogo de confirmación
   * @param {string} title - Título de la alerta
   * @param {string} text - Mensaje de confirmación
   * @returns {Promise<boolean>} - True si confirma, False si cancela
   */
  async confirm(title, text) {
    const result = await Swal.fire({
      title,
      theme: "auto",
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "Cancelar",
    });

    return result.isConfirmed;
  },
};
