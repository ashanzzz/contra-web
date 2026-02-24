export class KeyboardInput {
  constructor() {
    this.keys = new Set();
    this.jumpBuffered = false;
    this.pauseBuffered = false;
    this.muteBuffered = false;

    window.addEventListener("keydown", (event) => {
      const code = event.code;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "KeyW", "KeyA", "KeyS", "KeyD", "KeyJ", "KeyK", "KeyP", "KeyM", "Escape"].includes(code)) {
        event.preventDefault();
      }

      if (code === "Space" || code === "KeyK" || code === "ArrowUp" || code === "KeyW") {
        if (!this.keys.has(code)) {
          this.jumpBuffered = true;
        }
      }

      if ((code === "KeyP" || code === "Escape") && !this.keys.has(code)) {
        this.pauseBuffered = true;
      }

      if (code === "KeyM" && !this.keys.has(code)) {
        this.muteBuffered = true;
      }

      this.keys.add(code);
    });

    window.addEventListener("keyup", (event) => {
      this.keys.delete(event.code);
    });
  }

  getState() {
    const left = this.keys.has("ArrowLeft") || this.keys.has("KeyA");
    const right = this.keys.has("ArrowRight") || this.keys.has("KeyD");
    const down = this.keys.has("ArrowDown") || this.keys.has("KeyS");
    const fire = this.keys.has("KeyJ");

    const jumpPressed = this.jumpBuffered;
    const pausePressed = this.pauseBuffered;
    const mutePressed = this.muteBuffered;

    this.jumpBuffered = false;
    this.pauseBuffered = false;
    this.muteBuffered = false;

    return { left, right, down, fire, jumpPressed, pausePressed, mutePressed };
  }
}
