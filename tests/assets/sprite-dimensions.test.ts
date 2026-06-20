import { describe, expect, it } from "vitest";
import { textureSpecs } from "../../src/utils/textureFactory";

describe("sprite dimension validation", () => {
  it("keeps key graybox textures at expected dimensions", () => {
    expect(textureSpecs["player-cultivator"]).toEqual({ width: 32, height: 32 });
    expect(textureSpecs["flying-sword"]).toEqual({ width: 32, height: 32 });
    expect(textureSpecs["qi-bolt"]).toEqual({ width: 28, height: 20 });
    expect(textureSpecs["metal-wave"]).toEqual({ width: 56, height: 24 });
    expect(textureSpecs["aura-blade"]).toEqual({ width: 14, height: 16 });
    expect(textureSpecs.lingcao).toEqual({ width: 32, height: 32 });
  });
});
