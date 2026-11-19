import { readFileSync, readdirSync } from 'fs';

// Load build-info input (the exact standard JSON used for compilation)
const files = readdirSync('./artifacts/build-info/');
const biFile = files.find(f => f.endsWith('.json') && !f.endsWith('.output.json'));
const bi = JSON.parse(readFileSync('./artifacts/build-info/' + biFile, 'utf8'));
const stdJson = bi.input;

// Sourcify v2 verify: POST /v2/verify with the standard JSON
const ADDRESS = "0x3E182eC2698Aee0229281417D1410F65A66AF237";
const CHAIN_ID = "56";

// Build multipart form data
const boundary = "----sourcify-" + Date.now();
const stdJsonStr = JSON.stringify(stdJson);
let body = "";
body += `--${boundary}\r\nContent-Disposition: form-data; name="chainId"\r\n\r\n${CHAIN_ID}\r\n`;
body += `--${boundary}\r\nContent-Disposition: form-data; name="address"\r\n\r\n${ADDRESS}\r\n`;
body += `--${boundary}\r\nContent-Disposition: form-data; name="files"; filename="standard.json"\r\nContent-Type: application/json\r\n\r\n${stdJsonStr}\r\n`;
body += `--${boundary}--\r\n`;

const res = await fetch("https://sourcify.dev/server/v2/verify", {
  method: "POST",
  headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
  body,
});
const text = await res.text();
console.log("HTTP", res.status);
console.log(text.slice(0, 2000));
