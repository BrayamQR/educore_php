class CustomDatepicker extends HTMLElement {
  static counter = 0;

  static get observedAttributes() {
    return [
      "name",
      "range",
      "required",
      "label",
      "icon",
      "min-date",
      "max-date",
      "disable-saturdays",
      "disable-sundays",
      "name-inicio",
      "name-fin",
      "error-required",
      "disabled",
    ];
  }

  constructor() {
    super();
    this._settingValue = false;
    this._initialized = false;
    this._disabled = false;

    this._rebuildScheduled = false;
    this._pendingValorPrevio = undefined;

    this._touched = false;
  }

  connectedCallback() {
    let name = this.getAttribute("name") || "";
    if (!name) {
      CustomDatepicker.counter++;
      name = `datepicker-${CustomDatepicker.counter}`;
      this.setAttribute("name", name);
    }
    this.fieldName = name;
    this.msgRequired =
      this.getAttribute("error-required") || "Este campo es obligatorio";
    this.isRange = this.hasAttribute("range");

    this._buildComponent();
    this._initialized = true;
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if (!this._initialized) return;

    if (attrName === "min-date") {
      this.setMinDate(newValue || null);
      return;
    }
    if (attrName === "max-date") {
      this.setMaxDate(newValue || null);
      return;
    }

    if (attrName === "name") {
      const newName = newValue || this.fieldName;
      if (newName === this.fieldName) return;

      this.fieldName = newName;

      this._queueRebuild();
      return;
    }

    if (attrName === "error-required") {
      this.msgRequired = newValue || "Este campo es obligatorio";

      const targetInput =
        this.fp && this.fp.altInput ? this.fp.altInput : this.input;
      if (targetInput && targetInput.classList.contains("error")) {
        this.message.textContent = this.msgRequired;
      }
      return;
    }

    if (attrName === "label") {
      this._applyLabel(newValue || "");
      return;
    }
    if (attrName === "icon") {
      this._applyIcon(newValue || "");
      return;
    }
    if (attrName === "required") {
      this._applyRequired(newValue !== null);
      return;
    }
    if (attrName === "disabled") {
      this._applyDisabled(newValue !== null);
      return;
    }

    if (attrName === "range") {
      const activo = newValue !== null;
      if (this.isRange === activo) return;

      const valorPrevio = this.getValue();
      this.isRange = activo;
      this._queueRebuild(valorPrevio);
      return;
    }

    if (attrName === "disable-saturdays" || attrName === "disable-sundays") {
      this._applyDisableDays();
      return;
    }

    if (attrName === "name-inicio") {
      this._applyNameInicio(newValue);
      return;
    }
    if (attrName === "name-fin") {
      this._applyNameFin(newValue);
      return;
    }

    this._queueRebuild();
  }

  _queueRebuild(valorPrevioOverride) {
    if (this._rebuildScheduled) return;

    this._pendingValorPrevio =
      valorPrevioOverride !== undefined ? valorPrevioOverride : this.getValue();
    this._rebuildScheduled = true;

    queueMicrotask(() => {
      this._rebuildScheduled = false;
      const valorPrevio = this._pendingValorPrevio;
      this._pendingValorPrevio = undefined;

      if (!this.isConnected) return;

      this._buildComponent(valorPrevio);
    });
  }

  disconnectedCallback() {
    if (this.fp) {
      this.fp.destroy();
      this.fp = null;
    }
  }

  _buildComponent(valorPrevioOverride) {
    const name = this.fieldName;
    const required = this.hasAttribute("required");
    const iconValue = this.getAttribute("icon") || "bi bi-calendar";
    const label = this.getAttribute("label") || "";
    const altId = `${name}-visible`;

    const nameInicio = this.getAttribute("name-inicio") || `${name}Inicio`;
    const nameFin = this.getAttribute("name-fin") || `${name}Fin`;

    const valorPrevio =
      valorPrevioOverride !== undefined
        ? valorPrevioOverride
        : this._initialized
          ? this.getValue()
          : null;

    if (this.fp) {
      this.fp.destroy();
      this.fp = null;
    }

    this.innerHTML = `
    <div class="custom-component">
      <div class="input-container">
        <input 
          class="input-datepicker"
          type="text" 
          id="${name}" 
          ${!this.isRange ? `name="${name}"` : ""}
          placeholder=" "
          autocomplete="off"
          ${required ? "required" : ""}
          readonly>
        <label for="${altId}">${label}${
          required ? '<span class="required-asterisk">*</span>' : ""
        }</label>
        <span class="validation-icon"></span>
      </div>
      <span class="validation-message"></span>
      ${
        this.isRange
          ? `<input type="hidden" name="${nameInicio}" id="${nameInicio}">
             <input type="hidden" name="${nameFin}" id="${nameFin}">`
          : ""
      }
    </div>
  `;

    this.input = this.querySelector(".input-datepicker");
    this.label = this.querySelector("label");
    this.icon = this.querySelector(".validation-icon");
    this.message = this.querySelector(".validation-message");
    this.hiddenInicio = this.isRange
      ? this.querySelector(`#${CSS.escape(nameInicio)}`)
      : null;
    this.hiddenFin = this.isRange
      ? this.querySelector(`#${CSS.escape(nameFin)}`)
      : null;

    this._applyIcon(iconValue);

    this.fp = flatpickr(this.input, {
      altInput: true,
      mode: this.isRange ? "range" : "single",
      enableTime: false,
      altFormat: "d/m/Y",
      dateFormat: "Y-m-d",
      disableMobile: true,
      allowInput: false,
      locale: {
        ...flatpickr.l10ns.es,
        firstDayOfWeek: 0,
      },
      minDate: this.getAttribute("min-date") || null,
      maxDate: this.getAttribute("max-date") || null,
      disable: [
        this.hasAttribute("disable-saturdays")
          ? (date) => date.getDay() === 6
          : null,
        this.hasAttribute("disable-sundays")
          ? (date) => date.getDay() === 0
          : null,
      ].filter(Boolean),
      onChange: (selectedDates, dateStr, instance) => {
        if (this.isRange) {
          const [inicio, fin] = selectedDates;
          if (this.hiddenInicio) {
            this.hiddenInicio.value = inicio
              ? instance.formatDate(inicio, "Y-m-d")
              : "";
          }
          if (this.hiddenFin) {
            this.hiddenFin.value = fin ? instance.formatDate(fin, "Y-m-d") : "";
          }
        }

        if (!this._settingValue) {
          this._touched = true;
        }

        this.validate();

        if (!this._settingValue) {
          this.dispatchEvent(
            new CustomEvent("change", {
              detail: this.isRange
                ? {
                    inicio: this.hiddenInicio?.value || "",
                    fin: this.hiddenFin?.value || "",
                  }
                : { value: dateStr },
              bubbles: true,
            }),
          );
        }
      },
    });

    this.input.addEventListener("change", (e) => e.stopPropagation());
    this.input.addEventListener("input", (e) => e.stopPropagation());

    if (this.fp.altInput) {
      this.fp.altInput.id = altId;
      this.fp.altInput.addEventListener("change", (e) => e.stopPropagation());
      this.fp.altInput.addEventListener("blur", () => {
        this._touched = true;
        this.validate();
      });
      this.fp.altInput.addEventListener("input", (e) => {
        e.stopPropagation();
        this._touched = true;
        this.validate();
      });
    }

    this._applyDisabled(this.hasAttribute("disabled"));

    if (valorPrevio) {
      this.setValue(valorPrevio);
    } else {
      this.resetValidation();
    }
  }

  _applyLabel(labelText) {
    if (!this.label) return;
    const required = this.hasAttribute("required");
    this.label.innerHTML = `${labelText}${
      required ? '<span class="required-asterisk">*</span>' : ""
    }`;
  }

  _applyIcon(iconValue) {
    const container = this.querySelector(".input-container");
    if (!container || !this.icon) return;

    const existing = container.querySelector(".input-icon");
    if (existing) existing.remove();

    if (iconValue) {
      const span = document.createElement("span");
      span.classList.add("input-icon");
      const i = document.createElement("i");
      i.className = iconValue;
      span.appendChild(i);
      container.appendChild(span);
      this.icon.style.right = "32px";
    } else {
      this.icon.style.right = "";
    }
  }

  _applyRequired(required) {
    if (!this.input) return;
    this.input.toggleAttribute("required", required);
    this._applyLabel(this.getAttribute("label") || "");

    this.validate();
  }

  _applyDisabled(disabled) {
    this._disabled = disabled;

    if (this.input) this.input.disabled = disabled;
    if (this.fp && this.fp.altInput) this.fp.altInput.disabled = disabled;
    if (this.hiddenInicio) this.hiddenInicio.disabled = disabled;
    if (this.hiddenFin) this.hiddenFin.disabled = disabled;

    this.classList.toggle("is-disabled", disabled);

    if (disabled && this.fp && typeof this.fp.close === "function") {
      this.fp.close();
    }
  }

  _applyDisableDays() {
    if (!this.fp) return;
    this.fp.set(
      "disable",
      [
        this.hasAttribute("disable-saturdays")
          ? (date) => date.getDay() === 6
          : null,
        this.hasAttribute("disable-sundays")
          ? (date) => date.getDay() === 0
          : null,
      ].filter(Boolean),
    );
  }

  _applyNameInicio(newValue) {
    if (!this.hiddenInicio) return;
    const nuevoNombre = newValue || `${this.fieldName}Inicio`;
    this.hiddenInicio.name = nuevoNombre;
    this.hiddenInicio.id = nuevoNombre;
  }

  _applyNameFin(newValue) {
    if (!this.hiddenFin) return;
    const nuevoNombre = newValue || `${this.fieldName}Fin`;
    this.hiddenFin.name = nuevoNombre;
    this.hiddenFin.id = nuevoNombre;
  }

  validate(forceShow = false) {
    if (!this.input) return true;
    const showErrors = forceShow || this._touched;

    if (this.isRange) {
      const inicio = this.hiddenInicio?.value || "";
      const fin = this.hiddenFin?.value || "";

      if (!this.hasAttribute("required") && !inicio && !fin) {
        this.resetValidation();
        return true;
      }
      if (this.hasAttribute("required") && (!inicio || !fin)) {
        if (showErrors) this.setError(this.msgRequired);
        else this.resetValidation();
        return false;
      }
      this.clearError();
      return true;
    }

    const value =
      this.fp && this.fp.altInput
        ? this.fp.altInput.value.trim()
        : this.input.value.trim();

    if (!this.hasAttribute("required") && !value) {
      this.resetValidation();
      return true;
    }
    if (this.hasAttribute("required") && !value) {
      if (showErrors) this.setError(this.msgRequired);
      else this.resetValidation();
      return false;
    }
    this.clearError();
    return true;
  }

  checkValidity() {
    this._touched = true;
    return this.validate(true);
  }

  setError(msg) {
    if (!this.input) return;
    const targetInput =
      this.fp && this.fp.altInput ? this.fp.altInput : this.input;
    targetInput.classList.remove("valid");
    this.label.classList.remove("valid");
    this.icon.classList.remove("valid");
    targetInput.classList.add("error");
    this.label.classList.add("error");
    this.icon.classList.add("error");
    this.icon.innerHTML = "<i class='bi bi-x-lg'></i>";
    this.message.textContent = msg;
  }

  clearError() {
    if (!this.input) return;
    const targetInput =
      this.fp && this.fp.altInput ? this.fp.altInput : this.input;
    targetInput.classList.remove("error");
    this.label.classList.remove("error");
    this.icon.classList.remove("error");
    targetInput.classList.add("valid");
    this.label.classList.add("valid");
    this.icon.classList.add("valid");
    this.icon.innerHTML = "<i class='bi bi-check-lg'></i>";
    this.message.textContent = "";
  }

  resetValidation() {
    if (!this.input) return;
    const targetInput =
      this.fp && this.fp.altInput ? this.fp.altInput : this.input;
    targetInput.classList.remove("error", "valid");
    this.label.classList.remove("error", "valid");
    this.icon.classList.remove("error", "valid");
    this.icon.innerHTML = "";
    this.message.textContent = "";
  }

  initInput() {
    if (this.fp) this.fp.clear();
    if (this.input) this.input.value = "";
    if (this.hiddenInicio) this.hiddenInicio.value = "";
    if (this.hiddenFin) this.hiddenFin.value = "";
    this._touched = false;
    this.resetValidation();
  }

  getValue() {
    if (this.isRange) {
      return {
        inicio: this.hiddenInicio?.value || "",
        fin: this.hiddenFin?.value || "",
      };
    }
    return this.fp ? this.fp.input.value : "";
  }

  setValue(value, { forceShow = false } = {}) {
    if (!this.fp) return;

    this._settingValue = true;

    if (this.isRange) {
      let inicio = "";
      let fin = "";

      if (typeof value === "string") {
        inicio = value;
      } else if (Array.isArray(value)) {
        [inicio = "", fin = ""] = value;
      } else if (value) {
        inicio = value.inicio || "";
        fin = value.fin || "";
      }

      const fechas = inicio && fin ? [inicio, fin] : inicio ? [inicio] : [];

      this.fp.setDate(fechas, true);
      if (this.hiddenInicio) this.hiddenInicio.value = inicio;
      if (this.hiddenFin) this.hiddenFin.value = fin;
    } else {
      const single =
        typeof value === "string" ? value : value?.inicio || value?.[0] || "";
      this.fp.setDate(single, true);
    }

    this._settingValue = false;

    if (forceShow) {
      this._touched = true;
      this.validate(true);
    } else {
      this.validate();
    }
  }

  setMinDate(date) {
    if (this.fp) this.fp.set("minDate", date);
  }

  setMaxDate(date) {
    if (this.fp) this.fp.set("maxDate", date);
  }

  setDisabled(disabled) {
    if (disabled) this.setAttribute("disabled", "");
    else this.removeAttribute("disabled");
  }

  get disabled() {
    return this._disabled;
  }

  setRequired(required) {
    if (required) this.setAttribute("required", "");
    else this.removeAttribute("required");
  }

  get required() {
    return this.hasAttribute("required");
  }

  setName(name) {
    if (name) this.setAttribute("name", name);
  }

  setLabel(text) {
    if (text) this.setAttribute("label", text);
    else this.removeAttribute("label");
  }

  setRange(isRange) {
    if (isRange) this.setAttribute("range", "");
    else this.removeAttribute("range");
  }

  setNameInicio(name) {
    if (name) this.setAttribute("name-inicio", name);
    else this.removeAttribute("name-inicio");
  }

  setNameFin(name) {
    if (name) this.setAttribute("name-fin", name);
    else this.removeAttribute("name-fin");
  }
}

customElements.define("custom-datepicker", CustomDatepicker);
