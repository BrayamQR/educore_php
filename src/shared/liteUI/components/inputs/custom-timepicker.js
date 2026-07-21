class CustomTimepicker extends HTMLElement {
  static counter = 0;

  static get observedAttributes() {
    return [
      "label",
      "required",
      "disabled",
      "error-required",
      "min-time",
      "max-time",
    ];
  }

  constructor() {
    super();
    this._settingValue = false;
    this._value24 = null;
    this._minTime = null;
    this._maxTime = null;
    this._open = false;
    this._step = "hour";
    this._draft = { h12: 12, m: 0, meridiem: "a.m." };
    this._dragging = false;
    this._initialized = false;
    this._disabled = false;

    this._touched = false;
  }

  connectedCallback() {
    const label = this.getAttribute("label") || "";
    let name = this.getAttribute("name") || "";
    const required = this.hasAttribute("required");
    const iconValue = this.getAttribute("icon") || "bi bi-clock";

    if (!name) {
      CustomTimepicker.counter++;
      name = `timepicker-${CustomTimepicker.counter}`;
      this.setAttribute("name", name);
    }

    this.msgRequired =
      this.getAttribute("error-required") || "Este campo es obligatorio";

    this.minuteIncrement = parseInt(
      this.getAttribute("minute-increment") || "5",
      10,
    );

    this._minTime = this.getAttribute("min-time") || null;
    this._maxTime = this.getAttribute("max-time") || null;

    const visibleId = `${name}_display`;

    this.innerHTML = `
      <div class="custom-component">
        <div class="input-container">
          <input type="hidden" name="${name}" id="${name}">
          <input
            class="input-timepicker"
            type="text"
            id="${visibleId}"
            placeholder=" "
            autocomplete="off"
            ${required ? "required" : ""}
            readonly>
          <label for="${visibleId}">${label}${
            required ? '<span class="required-asterisk">*</span>' : ""
          }</label>
          <span class="validation-icon"></span>
        </div>
        <span class="validation-message"></span>
      </div>
    `;

    this.hiddenInput = this.querySelector("input[type='hidden']");
    this.input = this.querySelector(".input-timepicker");
    this.label = this.querySelector("label");
    this.icon = this.querySelector(".validation-icon");
    this.message = this.querySelector(".validation-message");
    this.container = this.querySelector(".input-container");

    if (iconValue) {
      const span = document.createElement("span");
      span.classList.add("input-icon");
      const i = document.createElement("i");
      i.className = iconValue;
      span.appendChild(i);
      this.container.appendChild(span);
      this.icon.style.right = "32px";
    }

    this._buildPanel();
    this._bindEvents();

    this._applyDisabled(this.hasAttribute("disabled"));

    this._initialized = true;
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if (!this._initialized) return;

    if (attrName === "disabled") {
      this._applyDisabled(newValue !== null);
      return;
    }
    if (attrName === "label") {
      this._applyLabel(newValue || "");
      return;
    }
    if (attrName === "required") {
      this._applyRequired(newValue !== null);
      return;
    }
    if (attrName === "error-required") {
      this.msgRequired = newValue || "Este campo es obligatorio";
      return;
    }
    if (attrName === "min-time") {
      this.setMinTime(newValue || null);
      return;
    }
    if (attrName === "max-time") {
      this.setMaxTime(newValue || null);
      return;
    }
  }

  _applyLabel(labelText) {
    if (!this.label) return;
    const required = this.hasAttribute("required");
    this.label.innerHTML = `${labelText}${
      required ? '<span class="required-asterisk">*</span>' : ""
    }`;
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
    if (this.hiddenInput) this.hiddenInput.disabled = disabled;

    this.classList.toggle("is-disabled", disabled);

    if (disabled && this._open) {
      this.close();
    }
  }

  _buildPanel() {
    const containerId = `ctp-panel-${this.getAttribute("name") || Math.random().toString(36).substr(2, 9)}`;
    const existing = document.getElementById(containerId);
    if (existing) existing.remove();

    this.panel = document.createElement("div");
    this.panel.id = containerId;
    this.panel.className = "ctp-panel";
    this.panel.innerHTML = `
      <div class="ctp-panel-inner">
        <div class="ctp-header">
          <div class="ctp-display">
            <span class="ctp-display-hour" data-step="hour">12</span>
            <span class="ctp-display-sep">:</span>
            <span class="ctp-display-minute" data-step="minute">00</span>
            <div class="ctp-meridiem-toggle">
              <button type="button" class="ctp-meridiem-btn" data-value="a.m.">AM</button>
              <button type="button" class="ctp-meridiem-btn" data-value="p.m.">PM</button>
            </div>
          </div>
        </div>
        <div class="ctp-clock">
          <svg class="ctp-clock-svg" viewBox="0 0 220 220">
            <circle class="ctp-clock-face" cx="110" cy="110" r="100"></circle>
            <line class="ctp-clock-hand" x1="110" y1="110" x2="110" y2="110"></line>
            <circle class="ctp-clock-knob" cx="110" cy="110" r="16"></circle>
            <circle class="ctp-clock-center" cx="110" cy="110" r="3"></circle>
            <g class="ctp-clock-numbers"></g>
          </svg>
        </div>
        <div class="ctp-footer">
          <button type="button" class="ctp-now-btn">Ahora</button>
          <div class="ctp-footer-actions">
            <button type="button" class="ctp-cancel-btn">Cancelar</button>
            <button type="button" class="ctp-done-btn">Aceptar</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(this.panel);
    this._panelId = containerId;

    this._renderClockNumbers("hour");
  }

  _renderClockNumbers(step) {
    const g = this.panel.querySelector(".ctp-clock-numbers");
    g.innerHTML = "";
    const cx = 110,
      cy = 110,
      r = 80;

    const items =
      step === "hour"
        ? Array.from({ length: 12 }, (_, i) => ({
            label: i === 0 ? "12" : String(i),
            value: i === 0 ? 12 : i,
          }))
        : Array.from({ length: 12 }, (_, i) => ({
            label: String(i * 5).padStart(2, "0"),
            value: i * 5,
          }));

    items.forEach((it, i) => {
      const angle = (i * 30 * Math.PI) / 180;
      const x = cx + r * Math.sin(angle);
      const y = cy - r * Math.cos(angle);
      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      text.setAttribute("x", x);
      text.setAttribute("y", y);
      text.setAttribute("dy", ".35em");
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("class", "ctp-clock-number");
      text.dataset.value = it.value;
      text.textContent = it.label;
      g.appendChild(text);
    });
  }

  _updateClockHand(step, value) {
    const cx = 110,
      cy = 110,
      r = 80;
    let angle;

    if (step === "hour") {
      const index = value === 12 ? 0 : value;
      angle = (index * 30 * Math.PI) / 180;
    } else {
      angle = (value / 60) * 2 * Math.PI;
    }

    const x = cx + r * Math.sin(angle);
    const y = cy - r * Math.cos(angle);

    this.panel.querySelector(".ctp-clock-hand").setAttribute("x2", x);
    this.panel.querySelector(".ctp-clock-hand").setAttribute("y2", y);
    this.panel.querySelector(".ctp-clock-knob").setAttribute("cx", x);
    this.panel.querySelector(".ctp-clock-knob").setAttribute("cy", y);

    this.panel.querySelectorAll(".ctp-clock-number").forEach((n) => {
      const isMatch =
        step === "hour"
          ? String(n.dataset.value) === String(value)
          : Number(n.dataset.value) === value;
      n.classList.toggle("ctp-clock-number-selected", isMatch);
    });
  }

  _goToStep(step) {
    this._step = step;
    this._renderClockNumbers(step);
    this._updateClockHand(
      step,
      step === "hour" ? this._draft.h12 : this._draft.m,
    );
    this.panel.querySelectorAll("[data-step]").forEach((el) => {
      el.classList.toggle("ctp-display-active", el.dataset.step === step);
    });
  }

  _renderDisplay() {
    this.panel.querySelector(".ctp-display-hour").textContent = String(
      this._draft.h12,
    ).padStart(2, "0");
    this.panel.querySelector(".ctp-display-minute").textContent = String(
      this._draft.m,
    ).padStart(2, "0");
    this.panel.querySelectorAll(".ctp-meridiem-btn").forEach((btn) => {
      btn.classList.toggle(
        "ctp-meridiem-active",
        btn.dataset.value === this._draft.meridiem,
      );
    });
  }

  _getSvgPoint(clientX, clientY) {
    const svg = this.panel.querySelector(".ctp-clock-svg");
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 220,
      y: ((clientY - rect.top) / rect.height) * 220,
    };
  }

  _angleToIndex(x, y) {
    const cx = 110,
      cy = 110;
    let angle = Math.atan2(x - cx, -(y - cy));
    if (angle < 0) angle += 2 * Math.PI;
    return Math.round(angle / (Math.PI / 6)) % 12;
  }

  _angleToMinute(x, y) {
    const cx = 110,
      cy = 110;
    let angle = Math.atan2(x - cx, -(y - cy));
    if (angle < 0) angle += 2 * Math.PI;
    const rawMinute = (angle / (2 * Math.PI)) * 60;
    return Math.round(rawMinute) % 60;
  }

  _snapMinute(m) {
    const inc = this.minuteIncrement || 5;
    const snapped = Math.round(m / inc) * inc;
    return ((snapped % 60) + 60) % 60;
  }

  _handleClockPointer(e) {
    const point = this._getSvgPoint(e.clientX, e.clientY);
    if (!this._isInsideClockFace(point.x, point.y)) return;

    if (this._step === "hour") {
      const index = this._angleToIndex(point.x, point.y);
      this._draft.h12 = index === 0 ? 12 : index;
    } else {
      this._draft.m = this._angleToMinute(point.x, point.y);
    }

    this._renderDisplay();
    this._updateClockHand(
      this._step,
      this._step === "hour" ? this._draft.h12 : this._draft.m,
    );
  }

  _bindClockEvents() {
    const svg = this.panel.querySelector(".ctp-clock-svg");

    const onPointerMove = (e) => {
      if (this._dragging) this._handleClockPointer(e);
    };
    const onPointerUp = () => {
      if (!this._dragging) return;
      this._dragging = false;
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      if (this._step === "hour") this._goToStep("minute");
    };

    svg.addEventListener("pointerdown", (e) => {
      if (this._disabled) return;

      const point = this._getSvgPoint(e.clientX, e.clientY);

      if (!this._isInsideClockFace(point.x, point.y)) return;

      if (this._editing) {
        const editingEl = this.panel.querySelector(
          ".ctp-display-hour.ctp-display-editing, .ctp-display-minute.ctp-display-editing",
        );
        if (editingEl) editingEl.blur();
      }

      this._dragging = true;
      this._handleClockPointer(e);
      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp);
    });
  }

  _bindEvents() {
    this.input.addEventListener("click", () => {
      if (this._disabled) return;
      this.open();
    });

    this._bindClockEvents();

    this.panel
      .querySelector(".ctp-display-hour")
      .addEventListener("click", () => {
        if (this._step === "hour" && !this._editing)
          this._enterEditMode("hour");
        else if (!this._editing) this._goToStep("hour");
      });

    this.panel
      .querySelector(".ctp-display-minute")
      .addEventListener("click", () => {
        if (this._step === "minute" && !this._editing)
          this._enterEditMode("minute");
        else if (!this._editing) this._goToStep("minute");
      });

    this.panel.querySelectorAll(".ctp-meridiem-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this._draft.meridiem = btn.dataset.value;
        this._renderDisplay();
      });
    });

    this.panel.querySelector(".ctp-now-btn").addEventListener("click", () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes() - (now.getMinutes() % this.minuteIncrement);
      const {
        h12,
        m: mm,
        meridiem,
      } = this._to12(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
      );
      this._draft = { h12, m: mm, meridiem };
      this._renderDisplay();
      this._goToStep("hour");
    });

    this.panel
      .querySelector(".ctp-cancel-btn")
      .addEventListener("click", () => this.close());

    this.panel.querySelector(".ctp-done-btn").addEventListener("click", () => {
      const h24 = this._from12(this._draft.h12, this._draft.meridiem);
      this._commit(
        `${String(h24).padStart(2, "0")}:${String(this._draft.m).padStart(2, "0")}`,
      );
      this.close();
    });
  }

  _commit(value24) {
    value24 = this._clamp(value24);
    this._value24 = value24;
    this._renderInput();

    if (!this._settingValue) {
      this._touched = true;
    }

    this.validate();
    if (!this._settingValue) {
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: { value: value24 },
          bubbles: true,
        }),
      );
    }
  }

  _renderInput() {
    if (!this._value24) {
      this.input.value = "";
      this.hiddenInput.value = "";
      return;
    }
    const { h12, m, meridiem } = this._to12(this._value24);
    this.input.value = `${h12}:${String(m).padStart(2, "0")} ${meridiem}`;

    this.hiddenInput.value = this._value24;
  }

  _to12(value24) {
    const [hStr, mStr] = value24.split(":");
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    const meridiem = h >= 12 ? "p.m." : "a.m.";
    let h12 = h % 12;
    if (h12 === 0) h12 = 12;
    return { h12, m, meridiem };
  }

  _from12(h12, meridiem) {
    let h = h12 % 12;
    if (meridiem === "p.m." || meridiem === "PM") h += 12;
    return h;
  }

  _clamp(value24) {
    const toMinutes = (v) => {
      const [h, m] = v.split(":").map(Number);
      return h * 60 + m;
    };
    const val = toMinutes(value24);
    if (this._minTime && val < toMinutes(this._minTime)) return this._minTime;
    if (this._maxTime && val > toMinutes(this._maxTime)) return this._maxTime;
    return value24;
  }

  _updatePanelPosition = () => {
    if (!this.panel || !this.input) return;

    const rect = this.input.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const maxPanelHeight = 420;
    const panelHeight = Math.min(this.panel.scrollHeight, maxPanelHeight);

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const gap = 5;

    let top;
    let shouldOpenUpward = false;

    if (
      spaceBelow < panelHeight &&
      spaceAbove > panelHeight &&
      spaceAbove > spaceBelow + 50
    ) {
      top = rect.top - panelHeight - gap;
      shouldOpenUpward = true;
    } else {
      top = rect.bottom + gap;
    }

    if (top < 0) top = gap;
    if (top + panelHeight > viewportHeight)
      top = viewportHeight - panelHeight - gap;

    const panelWidth = this.panel.offsetWidth;
    let left = rect.left;
    if (left + panelWidth > viewportWidth)
      left = viewportWidth - panelWidth - gap;
    if (left < 0) left = gap;

    this.panel.style.top = `${top}px`;
    this.panel.style.left = `${left}px`;

    if (shouldOpenUpward) {
      this.panel.classList.add("ctp-open-upward");
    } else {
      this.panel.classList.remove("ctp-open-upward");
    }
  };

  _handleOutsideClick = (e) => {
    if (
      this._open &&
      !this.container.contains(e.target) &&
      !this.panel.contains(e.target)
    ) {
      this.close();
    }
  };

  _handleEscape = (e) => {
    if (this._open && e.key === "Escape") this.close();
  };

  _handleResize = () => {
    if (this._open) this._updatePanelPosition();
  };

  _handleWindowBlur = () => {
    if (this._open) this.close();
  };

  _checkIfInputIsObscured() {
    if (!this._open) return;

    const rect = this.input.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const elementAtPoint = document.elementFromPoint(centerX, centerY);

    if (
      elementAtPoint &&
      !this.contains(elementAtPoint) &&
      !this.panel.contains(elementAtPoint) &&
      elementAtPoint !== this.input
    ) {
      this.close();
    }
  }

  _startVisibilityCheck() {
    this._visibilityInterval = setInterval(() => {
      if (!this._open) {
        clearInterval(this._visibilityInterval);
        return;
      }
      const rect = this.input.getBoundingClientRect();
      if (
        rect.width === 0 ||
        rect.height === 0 ||
        rect.top < -100 ||
        rect.bottom > window.innerHeight + 100 ||
        rect.left < -100 ||
        rect.right > window.innerWidth + 100
      ) {
        this.close();
        return;
      }
      const computedStyle = window.getComputedStyle(this.input);
      if (
        computedStyle.display === "none" ||
        computedStyle.visibility === "hidden" ||
        computedStyle.opacity === "0"
      ) {
        this.close();
        return;
      }
      this._checkIfInputIsObscured();
    }, 500);
  }

  _attachGlobalListeners() {
    window.addEventListener("scroll", this._updatePanelPosition, true);
    window.addEventListener("resize", this._handleResize);
    window.addEventListener("blur", this._handleWindowBlur);
    document.addEventListener("mousedown", this._handleOutsideClick, true);
    document.addEventListener("touchstart", this._handleOutsideClick, true);
    document.addEventListener("keydown", this._handleEscape);
    this._startVisibilityCheck();
  }

  _detachGlobalListeners() {
    window.removeEventListener("scroll", this._updatePanelPosition, true);
    window.removeEventListener("resize", this._handleResize);
    window.removeEventListener("blur", this._handleWindowBlur);
    document.removeEventListener("mousedown", this._handleOutsideClick, true);
    document.removeEventListener("touchstart", this._handleOutsideClick, true);
    document.removeEventListener("keydown", this._handleEscape);
    if (this._visibilityInterval) {
      clearInterval(this._visibilityInterval);
      this._visibilityInterval = null;
    }
  }

  open() {
    if (this._disabled) return;

    this._open = true;
    this.container.classList.add("ctp-open");
    this._updatePanelPosition();
    this.panel.classList.add("ctp-panel-open");

    this._draft = this._value24
      ? this._to12(this._value24)
      : { h12: 12, m: 0, meridiem: "a.m." };
    this._renderDisplay();
    this._goToStep("hour");

    this._attachGlobalListeners();
  }

  close() {
    this._open = false;
    this.container.classList.remove("ctp-open");
    this.panel.classList.remove("ctp-panel-open");
    this._detachGlobalListeners();
    this._touched = true;
    this.validate();
  }

  validate(forceShow = false) {
    if (!this.input) return true;
    const showErrors = forceShow || this._touched;

    const value = this.input.value.trim();
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

  resetValidation() {
    if (!this.input) return;
    this.input.classList.remove("error", "valid");
    this.label.classList.remove("error", "valid");
    this.icon.classList.remove("error", "valid");
    this.icon.innerHTML = "";
    this.message.textContent = "";
  }

  initInput() {
    this._value24 = null;
    if (this.input) this.input.value = "";
    if (this.hiddenInput) this.hiddenInput.value = "";
    this._touched = false;
    this.resetValidation();
  }

  getValue() {
    return this._value24 || "";
  }

  setValue(timeStr, { validate = false } = {}) {
    this._settingValue = true;

    if (!timeStr) {
      this._value24 = null;
      this._renderInput();
    } else {
      this._commit(timeStr);
    }

    this._settingValue = false;

    if (validate) {
      this._touched = true;
      this.validate(true);
    } else {
      this.validate();
    }
  }

  setMinTime(time) {
    this._minTime = time || null;
  }

  setMaxTime(time) {
    this._maxTime = time || null;
  }

  disconnectedCallback() {
    this._detachGlobalListeners();
    if (this.panel && this.panel.parentNode) {
      this.panel.parentNode.removeChild(this.panel);
    }
  }
  _enterEditMode(step) {
    if (this._disabled) return;

    const el = this.panel.querySelector(
      step === "hour" ? ".ctp-display-hour" : ".ctp-display-minute",
    );
    this._editing = true;
    el.contentEditable = "true";
    el.classList.add("ctp-display-editing");
    el.focus();
    this._selectAllText(el);

    const commit = () => {
      const fallback = step === "hour" ? this._draft.h12 : this._draft.m;
      let val = parseInt(el.textContent.replace(/\D/g, ""), 10);
      if (isNaN(val)) val = fallback;

      if (step === "hour") {
        val = Math.min(12, Math.max(1, val));
        this._draft.h12 = val;
      } else {
        val = Math.min(59, Math.max(0, val));
        this._draft.m = val;
      }

      el.contentEditable = "false";
      el.classList.remove("ctp-display-editing");
      this._editing = false;
      this._renderDisplay();
      this._updateClockHand(
        step,
        step === "hour" ? this._draft.h12 : this._draft.m,
      );
      el.removeEventListener("keydown", onKeydown);
    };

    const onKeydown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        el.blur();
        return;
      }
      if (
        !/[0-9]/.test(e.key) &&
        !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(
          e.key,
        )
      ) {
        e.preventDefault();
      }
    };

    el.addEventListener("keydown", onKeydown);
    el.addEventListener("blur", commit, { once: true });
  }

  _selectAllText(el) {
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  _isInsideClockFace(x, y) {
    const cx = 110,
      cy = 110;
    const radius = 100;
    const dx = x - cx;
    const dy = y - cy;
    return Math.sqrt(dx * dx + dy * dy) <= radius;
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
}

customElements.define("custom-timepicker", CustomTimepicker);
