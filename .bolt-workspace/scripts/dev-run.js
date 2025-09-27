import { execa } from "execa";

async function run() {
  // kill any existing node
  try { await execa("powershell", ["-NoProfile","-Command","Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue"]); } catch {}
  // start server
  const child = execa("node", ["../src/server.js"], { stdio: "inherit" });
  console.log("started");
}
run();
