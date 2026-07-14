import { mountRunShell } from "./runShell";
import "./runShell.css";

const container = document.getElementById("app");

if (!container) {
  throw new Error("Missing #app container");
}

mountRunShell(container);
