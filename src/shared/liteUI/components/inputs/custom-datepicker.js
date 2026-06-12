class CustomDatepicker extends HTMLElement {
  static counter = 0;

  constructor() {
    super();
    this._settingValue = false;
  }

  connectedCallback() {
    const label = this.getAttribute("label") || "";
    let name = this.getAttribute("name") || "";
    const required = this.hasAttribute("required");
    const iconValue = this.getAttribute("icon") || "";

    if (!name) {
      CustomDatepicker.counter++;
      name = `datepicker-${CustomDatepicker.counter}`;
      this.setAttribute("name", name);
    }

    this.msgRequired =
      this.getAttribute("error-required") || "Este campo es obligatorio";

    const altId = `${name}-visible`;

    this.innerHTML = `
      <div class="custom-component">
        <div class="input-container">
          <input 
            class="input-datepicker"
            type="text" 
            id="${name}" 
            name="${name}" 
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
      </div>
    `;

    this.input = this.querySelector(".input-datepicker");
    this.label = this.querySelector("label");
    this.icon = this.querySelector(".validation-icon");
    this.message = this.querySelector(".validation-message");

    if (this.input) {
      this.fp = flatpickr(this.input, {
        altInput: true,
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
        // ✅ Usar los parámetros del callback en lugar de this.fp.input.value
        onChange: (selectedDates, dateStr, instance) => {
          this.checkValidity();
          if (!this._settingValue) {
            this.dispatchEvent(
              new CustomEvent("change", {
                detail: { value: dateStr },
                bubbles: true,
              }),
            );
          }
        },
      });

      if (iconValue) {
        const span = document.createElement("span");
        span.classList.add("input-icon");
        const i = document.createElement("i");
        i.className = iconValue;
        span.appendChild(i);
        this.querySelector(".input-container").appendChild(span);
        this.icon.style.right = "32px";
      }

      if (this.fp.altInput) {
        this.fp.altInput.id = altId;
        this.fp.altInput.addEventListener("blur", () => this.checkValidity());
        this.fp.altInput.addEventListener("input", () => this.checkValidity());
      }
    }
  }

  checkValidity() {
    if (!this.input) return true;
    const value =
      this.fp && this.fp.altInput
        ? this.fp.altInput.value.trim()
        : this.input.value.trim();

    if (!this.hasAttribute("required") && !value) {
      this.resetValidation();
      return true;
    }
    if (this.hasAttribute("required") && !value) {
      this.setError(this.msgRequired);
      return false;
    }
    this.clearError();
    return true;
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
    this.resetValidation();
  }

  getValue() {
    return this.fp ? this.fp.input.value : "";
  }

  setValue(dateStr) {
    if (this.fp) {
      this._settingValue = true;
      this.fp.setDate(dateStr, true);
      this._settingValue = false;
    }
    this.checkValidity();
  }

  setMinDate(date) {
    if (this.fp) this.fp.set("minDate", date);
  }

  setMaxDate(date) {
    if (this.fp) this.fp.set("maxDate", date);
  }
}

customElements.define("custom-datepicker", CustomDatepicker);
