class CustomNumberField extends HTMLElement {
  static instances = {};
  connectedCallback() {
    const label = this.getAttribute("label") || "";
    const name = this.getAttribute("name") || "";
    const required = this.hasAttribute("required");
    const iconValue = this.getAttribute("icon") || "";
    this.msgRequired =
      this.getAttribute("error-required") || "Este campo es obligatorio";
    this.msgMin = this.getAttribute("error-min") || "El valor es muy bajo";
    this.msgMax = this.getAttribute("error-max") || "El valor es muy alto";

    this.min = this.getAttribute("min");
    this.max = this.getAttribute("max");
    const decimals = this.getAttribute("decimals");

    this.innerHTML = `
      <div class="custom-component">
        <div class="input-container">
          <input 
            type="number" 
            id="${name}" 
            name="${name}" 
            placeholder=" "
            autocomplete="off"
            ${required ? "required" : ""}
            ${this.min ? `min="${this.min}"` : ""}
            ${this.max ? `max="${this.max}"` : ""}>
          <label for="${name}">${label}${
      required ? '<span class="required-asterisk">*</span>' : ""
    }</label>
          <span class="validation-icon"></span>
        </div>
        <span class="validation-message"></span>
      </div>
    `;

    this.input = this.querySelector("input");
    this.label = this.querySelector("label");
    this.message = this.querySelector(".validation-message");
    this.icon = this.querySelector(".validation-icon");
    this.decimals = decimals ? parseInt(decimals) : null;

    if (iconValue) {
      const span = document.createElement("span");
      span.classList.add("input-icon");

      const i = document.createElement("i");
      i.className = iconValue;
      span.appendChild(i);

      this.querySelector(".input-container").appendChild(span);
      this.iconStart = span;
      this.icon.style.right = "32px";
    }

    if (this.input) {
      this.input.addEventListener("blur", () => {
        if (this.decimals !== null && this.input.value.trim() !== "") {
          let num = parseFloat(this.input.value);
          if (!isNaN(num)) {
            this.input.value = num.toFixed(this.decimals);
          }
        }
        this.checkValidity();
      });
    }

    if (name) CustomNumberField.instances[name] = this;
  }

  disconnectedCallback() {
    const name = this.getAttribute("name") || "";
    if (name && CustomNumberField.instances[name] === this) {
      delete CustomNumberField.instances[name];
    }
  }

  static get(name) {
    return CustomNumberField.instances[name] || null;
  }

  setValue(value) {
    if (!this.input) return;
    if (!isNaN(value) && this.decimals > 0) {
      value = parseFloat(value).toFixed(this.decimals);
    }
    this.input.value = value;
    this.checkValidity();
  }

  getValue() {
    return this.input ? this.input.value : "";
  }

  checkValidity() {
    if (!this.input) return true;

    const value = this.input.value.trim();

    if (!this.hasAttribute("required") && !value) {
      this.input.classList.remove("error", "valid");
      this.label.classList.remove("error", "valid");
      this.icon.classList.remove("error", "valid");
      this.icon.innerHTML = "";
      this.message.textContent = "";
      return true;
    }

    if (this.hasAttribute("required") && !value) {
      this.setError(this.msgRequired);
      return false;
    }

    const numValue = Number(value);

    if (this.min !== null && numValue < Number(this.min)) {
      this.setError(this.msgMin);
      return false;
    }

    if (this.max !== null && numValue > Number(this.max)) {
      this.setError(this.msgMax);
      return false;
    }

    this.clearError();
    return true;
  }

  setError(msg) {
    if (!this.input) return;
    this.input.classList.remove("valid");
    this.label.classList.remove("valid");
    this.icon.classList.remove("valid");
    this.input.classList.add("error");
    this.label.classList.add("error");
    this.icon.classList.add("error");
    this.icon.innerHTML = "<i class='bi bi-x-lg'></i>";
    this.message.textContent = msg;
  }

  clearError() {
    if (!this.input) return;
    this.input.classList.remove("error");
    this.label.classList.remove("error");
    this.icon.classList.remove("error");
    this.input.classList.add("valid");
    this.label.classList.add("valid");
    this.icon.classList.add("valid");
    this.icon.innerHTML = "<i class='bi bi-check-lg'></i>";
    this.message.textContent = "";
  }

  initInput() {
    this.input.classList.remove("error");
    this.label.classList.remove("error");
    this.icon.classList.remove("error");
    this.input.classList.remove("valid");
    this.label.classList.remove("valid");
    this.icon.classList.remove("valid");
    this.icon.innerHTML = "";
    this.message.textContent = "";
    this.input.value = "";
  }
}

customElements.define("custom-number-field", CustomNumberField);
