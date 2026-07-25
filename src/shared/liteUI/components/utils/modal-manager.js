/**
 * ModalManager
 * Única fuente de verdad para: stack de modales, z-index, scroll del body,
 * tecla ESC (solo cierra el que está encima), foco (trap + restauración)
 * y atenuado visual de los modales que quedan detrás.
 *
 * Se expone en window.ModalManager para usarse sin imports en cualquier
 * script cargado después de este archivo.
 */
class ModalManagerClass {
  constructor() {
    this.stack = [];
    this.baseZIndex = 1000;
    this.zIndexStep = 10;

    this._handleKeydown = this._handleKeydown.bind(this);
    this._handleModalClose = this._handleModalClose.bind(this);

    document.addEventListener("keydown", this._handleKeydown);
    document.addEventListener("modal:close", this._handleModalClose);
  }

  open(modalEl, data = null) {
    return new Promise((resolve) => {
      if (this.stack.some((entry) => entry.el === modalEl)) {
        console.warn(
          `[ModalManager] El modal "${modalEl.id || "(sin id)"}" ya está abierto.`,
        );
        resolve(null);
        return;
      }

      const previousFocus = document.activeElement;
      const zIndex = this.baseZIndex + this.stack.length * this.zIndexStep;
      modalEl.style.zIndex = zIndex;

      this.stack.push({ el: modalEl, resolve, previousFocus });

      this._updateBodyScroll();
      this._updateDimming();
      modalEl.open(data);

      requestAnimationFrame(() => {
        const focusable = this._getFocusable(modalEl)[0];
        (focusable || modalEl.querySelector(".modal"))?.focus?.();
      });
    });
  }

  close(modalEl, result = null) {
    modalEl.close(result);
  }

  closeTop(result = null) {
    const top = this.topModal;
    if (top) top.close(result);
  }

  closeAll() {
    [...this.stack].reverse().forEach((entry) => entry.el.close());
  }

  get topModal() {
    return this.stack.length ? this.stack[this.stack.length - 1].el : null;
  }

  _handleModalClose(e) {
    const modalEl = e.target;
    const index = this.stack.findIndex((entry) => entry.el === modalEl);
    if (index === -1) return;

    const [entry] = this.stack.splice(index, 1);
    modalEl.style.zIndex = "";
    modalEl.classList.remove("modal-dimmed");

    this._updateBodyScroll();
    this._updateDimming();
    entry.previousFocus?.focus?.();
    entry.resolve(e.detail?.result ?? null);
  }

  _handleKeydown(e) {
    if (this.stack.length === 0) return;
    const top = this.topModal;

    if (e.key === "Escape") {
      top.close();
      return;
    }

    if (e.key === "Tab") {
      this._trapFocus(e, top);
    }
  }

  _trapFocus(e, modalEl) {
    const focusable = this._getFocusable(modalEl);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  _getFocusable(modalEl) {
    const selector =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    return Array.from(modalEl.querySelectorAll(selector)).filter(
      (el) => el.offsetParent !== null,
    );
  }

  _updateBodyScroll() {
    document.body.style.overflow = this.stack.length > 0 ? "hidden" : "";
  }

  _updateDimming() {
    const lastIndex = this.stack.length - 1;
    this.stack.forEach((entry, index) => {
      entry.el.classList.toggle("modal-dimmed", index !== lastIndex);
    });
  }
}

window.ModalManager = new ModalManagerClass();
