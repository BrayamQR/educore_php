class CustomButtonFab extends HTMLElement {
  constructor() {
    super();
    this._showTooltip = this._showTooltip.bind(this);
    this._hideTooltip = this._hideTooltip.bind(this);
    this._updatePosition = this._updatePosition.bind(this);
  }

  connectedCallback() {
    const type = this.getAttribute("type") || "button";
    const icon = this.getAttribute("icon") || "";
    const btnClass = this.getAttribute("btn-class") || "";
    const disabled = this.hasAttribute("disabled") ? "disabled" : "";
    const tooltipText = this.getAttribute("tooltip") || "";

    this.innerHTML = `
      <div class="content-button">
        <button 
          class="custom-button-fab ${btnClass}" 
          type="${type}" 
          ${disabled}
          aria-label="${tooltipText}"
        >
          ${icon ? `<i class="${icon}"></i>` : ""}
        </button>
        ${tooltipText ? `<span class="tooltip">${tooltipText}</span>` : ""}
      </div>
    `;

    this.button = this.querySelector("button");
    this.tooltip = this.querySelector(".tooltip");

    if (this.tooltip) {
      this.button.addEventListener("mouseenter", this._showTooltip);
      this.button.addEventListener("mouseleave", this._hideTooltip);
      window.addEventListener("scroll", this._updatePosition, true);
      window.addEventListener("resize", this._updatePosition);
    }
  }

  disconnectedCallback() {
    if (this.tooltip) {
      this.button.removeEventListener("mouseenter", this._showTooltip);
      this.button.removeEventListener("mouseleave", this._hideTooltip);
      window.removeEventListener("scroll", this._updatePosition, true);
      window.removeEventListener("resize", this._updatePosition);
    }
  }

  _showTooltip() {
    this._updatePosition();
    this.tooltip.classList.add("is-visible");
  }

  _hideTooltip() {
    this.tooltip.classList.remove("is-visible");
  }

  _updatePosition() {
    if (!this.tooltip) return;

    const rect = this.button.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();

    const top = rect.top - tooltipRect.height - 8;
    const left = rect.left + rect.width / 2;

    this.tooltip.style.top = `${top}px`;
    this.tooltip.style.left = `${left}px`;
  }

  set disabled(val) {
    if (val) {
      this.setAttribute("disabled", "");
      if (this.button) this.button.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
      if (this.button) this.button.removeAttribute("disabled");
    }
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }
}

customElements.define("custom-button-fab", CustomButtonFab);
