import { mountRunShell } from "./runShell";

const container = document.getElementById("app");

if (!container) {
  throw new Error("Missing #app container");
}

mountRunShell(container);
