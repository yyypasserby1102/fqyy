import { describe, expect, it, vi } from "vitest";
import { createGrayboxTextures, textureSpecs } from "../../src/utils/textureFactory";

function createGraphicsSpy() {
  return {
    fillStyle: vi.fn(),
    fillCircle: vi.fn(),
    fillTriangle: vi.fn(),
    fillEllipse: vi.fn(),
    fillRect: vi.fn(),
    fillRoundedRect: vi.fn(),
    generateTexture: vi.fn(),
    clear: vi.fn(),
    destroy: vi.fn()
  };
}

describe("graybox texture factory", () => {
  it("generates every declared texture once at its declared dimensions", () => {
    const graphics = createGraphicsSpy();
    const scene = {
      add: {
        graphics: vi.fn(() => graphics)
      }
    };

    createGrayboxTextures(scene as never);

    expect(scene.add.graphics).toHaveBeenCalledOnce();
    expect(graphics.generateTexture).toHaveBeenCalledTimes(
      Object.keys(textureSpecs).length
    );
    Object.entries(textureSpecs).forEach(([textureId, spec]) => {
      expect(graphics.generateTexture).toHaveBeenCalledWith(
        textureId,
        spec.width,
        spec.height
      );
    });
    expect(graphics.destroy).toHaveBeenCalledOnce();
  });
});
