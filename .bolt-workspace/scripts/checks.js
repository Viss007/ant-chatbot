import { execa } from "execa";

async function httpGet(url){ const {stdout} = await execa("curl.exe", ["-s", url]); return stdout.trim(); }
async function postChat() {
  const body = JSON.stringify({question:"hello", session_identifier:"bolt-123"});
  const {stdout} = await execa("powershell", ["-NoProfile","-Command", `Invoke-RestMethod -Method POST "http://localhost:3000/api/chat" -ContentType "application/json" -Body '${body}' | ConvertTo-Json -Compress`]);
  return stdout;
}
async function getHist() {
  const {stdout} = await execa("powershell", ["-NoProfile","-Command", `Invoke-RestMethod -Method GET "http://localhost:3000/api/history?session_identifier=bolt-123" | ConvertTo-Json -Compress`]);
  return stdout;
}

(async () => {
  const h = await httpGet("http://localhost:3000/healthz");
  console.log("HEALTHZ:", h);
  const chat = await postChat();
  console.log("CHAT:", chat);
  const hist = await getHist();
  console.log("HISTORY:", hist);
})();
