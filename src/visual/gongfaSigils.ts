import Phaser from "phaser";
import type { GongfaId } from "../data/gongfa";
import { getGongfaVisualIdentity } from "./gongfaVisualIdentity";

export function createGongfaSigil(
  scene: Phaser.Scene,
  x: number,
  y: number,
  gongfaId: GongfaId,
  radius: number,
  alpha = 1
): Phaser.GameObjects.Graphics {
  const identity = getGongfaVisualIdentity(gongfaId);
  const graphic = scene.add.graphics().setPosition(x, y).setAlpha(alpha);
  graphic.lineStyle(2, identity.accent, 0.86);
  graphic.fillStyle(identity.secondary, 0.13);
  const point = (angle: number, distance = radius) => ({ x: Math.cos(angle) * distance, y: Math.sin(angle) * distance });

  switch (identity.geometry) {
    case "sword-seal":
      graphic.strokeCircle(0, 0, radius * 0.62);
      for (let i = 0; i < identity.spokes; i += 1) {
        const angle = (Math.PI * 2 * i) / identity.spokes - Math.PI / 2;
        const inner = point(angle, radius * 0.2);
        const outer = point(angle, radius);
        graphic.lineBetween(inner.x, inner.y, outer.x, outer.y);
        const left = point(angle + 0.13, radius * 0.72);
        const right = point(angle - 0.13, radius * 0.72);
        graphic.lineBetween(left.x, left.y, outer.x, outer.y).lineBetween(right.x, right.y, outer.x, outer.y);
      }
      break;
    case "corridor":
      for (let i = -1; i <= 1; i += 1) graphic.lineBetween(-radius, i * 9, radius, i * 9);
      graphic.lineBetween(radius * 0.45, -radius * 0.38, radius, 0).lineBetween(radius, 0, radius * 0.45, radius * 0.38);
      break;
    case "facets":
    case "lotus":
    case "bloom":
      for (let i = 0; i < identity.spokes; i += 1) {
        const angle = (Math.PI * 2 * i) / identity.spokes;
        const center = point(angle, radius * 0.56);
        const left = point(angle - 0.28, radius * 0.28);
        const right = point(angle + 0.28, radius * 0.28);
        const tip = point(angle, radius);
        graphic.fillTriangle(left.x, left.y, tip.x, tip.y, right.x, right.y);
        graphic.lineBetween(left.x, left.y, tip.x, tip.y).lineBetween(tip.x, tip.y, right.x, right.y);
        if (identity.geometry === "facets") graphic.strokeCircle(center.x, center.y, 2);
      }
      graphic.strokeCircle(0, 0, radius * (identity.geometry === "bloom" ? 0.42 : 0.25));
      break;
    case "furnace":
      graphic.strokeRect(-radius * 0.55, -radius * 0.55, radius * 1.1, radius * 1.1);
      graphic.strokeCircle(0, 0, radius * 0.38);
      for (let i = 0; i < 4; i += 1) {
        const inner = point((Math.PI / 2) * i, radius * 0.38);
        const outer = point((Math.PI / 2) * i, radius * 0.82);
        graphic.lineBetween(inner.x, inner.y, outer.x, outer.y);
      }
      break;
    case "wings":
      for (const side of [-1, 1]) {
        for (let i = 0; i < identity.spokes; i += 1) {
          const lift = i / Math.max(1, identity.spokes - 1);
          graphic.lineBetween(side * radius * 0.12, 0, side * radius * (0.45 + lift * 0.55), -radius * (0.1 + lift * 0.62));
        }
      }
      break;
    case "solar":
      graphic.strokeCircle(0, 0, radius * 0.58).strokeCircle(0, 0, radius * 0.82);
      for (let i = 0; i < identity.spokes; i += 1) {
        const a = point((Math.PI * 2 * i) / identity.spokes, radius * 0.82);
        const b = point((Math.PI * 2 * i) / identity.spokes, radius);
        graphic.lineBetween(a.x, a.y, b.x, b.y);
      }
      break;
    case "crescent":
      graphic.beginPath().arc(-radius * 0.15, 0, radius * 0.78, -1.1, 1.1).strokePath();
      graphic.beginPath().arc(radius * 0.15, 0, radius * 0.78, Math.PI - 1.1, Math.PI + 1.1).strokePath();
      break;
    case "constellation":
      for (let i = 0; i < identity.spokes; i += 1) {
        const a = point((Math.PI * 2 * i) / identity.spokes, radius * (i % 2 ? 0.62 : 0.92));
        const b = point((Math.PI * 2 * (i + 1)) / identity.spokes, radius * ((i + 1) % 2 ? 0.62 : 0.92));
        graphic.strokeCircle(a.x, a.y, 3).lineBetween(a.x, a.y, b.x, b.y);
      }
      break;
    case "tide":
      for (let i = -1; i <= 1; i += 1) graphic.beginPath().arc(0, i * 7, radius * (0.48 + (i + 1) * 0.16), Math.PI * 0.12, Math.PI * 0.88).strokePath();
      break;
    case "roots":
      for (let i = 0; i < identity.spokes; i += 1) {
        const angle = (Math.PI * 2 * i) / identity.spokes;
        const mid = point(angle, radius * 0.5);
        const tip = point(angle + (i % 2 ? 0.22 : -0.22), radius);
        graphic.lineBetween(0, 0, mid.x, mid.y).lineBetween(mid.x, mid.y, tip.x, tip.y);
      }
      break;
    case "rings":
      for (let i = 1; i <= 3; i += 1) graphic.strokeRect(-radius * i / 3, -radius * i / 5, radius * i * 2 / 3, radius * i * 2 / 5);
      for (let i = 0; i < identity.spokes; i += 1) {
        const a = point((Math.PI * 2 * i) / identity.spokes, radius * 0.7);
        const b = point((Math.PI * 2 * i) / identity.spokes, radius);
        graphic.lineBetween(a.x, a.y, b.x, b.y);
      }
      break;
  }
  return graphic;
}
