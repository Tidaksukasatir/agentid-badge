import { readFileSync, writeFileSync } from 'fs';
import { ethers } from 'ethers';

const artifact = JSON.parse(readFileSync('./artifacts/contracts/AgentIDPioneerBadge.sol/AgentIDPioneerBadge.json', 'utf8'));
const baseURI = "https://tidaksukasatir.github.io/agentid-badge/metadata/";
const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode);
const deployTx = await factory.getDeployTransaction(baseURI);
console.log("deploy data length (bytes):", (deployTx.data.length - 2) / 2);
console.log("deploy data (first 100 chars):", deployTx.data.slice(0, 102));
writeFileSync('./deploy-data.txt', deployTx.data);
console.log("written to deploy-data.txt");
