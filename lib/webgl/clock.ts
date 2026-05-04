type Tick = (elapsedSeconds: number) => void;

export class Clock {
  private startTime = 0;
  private rafId: number | null = null;

  constructor(private readonly tick: Tick) {}

  start() {
    if (this.rafId !== null) return;
    this.startTime = performance.now();
    const loop = (now: number) => {
      this.tick((now - this.startTime) / 1000);
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
