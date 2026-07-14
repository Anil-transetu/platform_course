"use client";

if (typeof window !== "undefined") {
  const origError = console.error;
  console.error = function (...args) {
    if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) return;
    if (typeof args[0] === "string" && args[0].includes("Encountered two children with the same key")) return;
    origError.apply(console, args);
  };
}

export function SuppressWarning() {
  return null;
}
