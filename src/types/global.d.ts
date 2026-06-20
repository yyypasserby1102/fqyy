import type { GameTestHarness } from "./gameTest";

declare global {
  interface Window {
    __gameTest?: GameTestHarness;
  }
}

export {};
