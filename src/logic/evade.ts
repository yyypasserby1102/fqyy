export interface EvadeDirection {
  x: number;
  y: number;
}

export interface EvadeState {
  active: boolean;
  invulnerable: boolean;
  direction: EvadeDirection;
  speed: number;
  cooldownRemainingMs: number;
}

const EVADE_SPEED = 600;
const EVADE_DURATION_MS = 200;
const EVADE_COOLDOWN_MS = 1_200;

export class Evade {
  private activeRemainingMs = 0;
  private cooldownRemainingMs = 0;
  private direction: EvadeDirection = { x: 0, y: 0 };

  get state(): EvadeState {
    const active = this.activeRemainingMs > 0;
    return {
      active,
      invulnerable: active,
      direction: { ...this.direction },
      speed: EVADE_SPEED,
      cooldownRemainingMs: this.cooldownRemainingMs
    };
  }

  tryStart(direction: EvadeDirection): boolean {
    if (this.cooldownRemainingMs > 0) {
      return false;
    }

    const magnitude = Math.hypot(direction.x, direction.y);
    if (magnitude === 0) {
      return false;
    }

    this.direction = {
      x: direction.x / magnitude,
      y: direction.y / magnitude
    };
    this.activeRemainingMs = EVADE_DURATION_MS;
    this.cooldownRemainingMs = EVADE_COOLDOWN_MS;
    return true;
  }

  advance(deltaMs: number): void {
    this.activeRemainingMs = Math.max(0, this.activeRemainingMs - deltaMs);
    this.cooldownRemainingMs = Math.max(0, this.cooldownRemainingMs - deltaMs);
  }
}
