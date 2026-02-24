export class TouchInput {
  constructor(rootElement) {
    this.active = new Set();
    this.jumpBuffered = false;
    this.pauseBuffered = false;
    this.enabled = false;

    if (!rootElement) return;

    const buttons = rootElement.querySelectorAll("[data-control]");
    if (!buttons.length) return;

    this.enabled = true;

    buttons.forEach((button) => {
      const control = button.dataset.control;

      const press = (event) => {
        event.preventDefault();

        if (control === "jump") {
          this.jumpBuffered = true;
        }

        if (control === "pause") {
          this.pauseBuffered = true;
          return;
        }

        this.active.add(control);
      };

      const release = (event) => {
        event.preventDefault();
        this.active.delete(control);
      };

      button.addEventListener("touchstart", press, { passive: false });
      button.addEventListener("pointerdown", press);

      button.addEventListener("touchend", release);
      button.addEventListener("touchcancel", release);
      button.addEventListener("pointerup", release);
      button.addEventListener("pointercancel", release);
      button.addEventListener("pointerleave", release);
    });
  }

  getState() {
    if (!this.enabled) {
      return {
        left: false,
        right: false,
        down: false,
        fire: false,
        jumpPressed: false,
        pausePressed: false,
        mutePressed: false,
      };
    }

    const jumpPressed = this.jumpBuffered;
    const pausePressed = this.pauseBuffered;
    this.jumpBuffered = false;
    this.pauseBuffered = false;

    return {
      left: this.active.has("left"),
      right: this.active.has("right"),
      down: this.active.has("down"),
      fire: this.active.has("fire"),
      jumpPressed,
      pausePressed,
      mutePressed: false,
    };
  }
}
