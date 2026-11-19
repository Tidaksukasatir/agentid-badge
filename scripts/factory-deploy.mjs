import { readFileSync, writeFileSync } from 'fs';
import { ethers } from 'ethers';

const artifact = JSON.parse(readFileSync('./artifacts/contracts/AgentIDPioneerBadge.sol/AgentIDPioneerBadge.json', 'utf8'));
const FACTORY = "0x4e59b44847b379578588920ca78fbf26c0b4956c";
const OWNER = "0xd389094460D34827d0d2818271952681433f34A9"; // Beam's Binance Agentic Wallet (BSC)
const baseURI = "https://tidaksukasatir.github.io/agentid-badge/metadata.json";

// Unique salt for this deployment
const salt = ethers.keccak256(ethers.toUtf8Bytes("AgentIDPioneerBadge-blame.ai-v1"));
console.log("salt:", salt);

const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode);
const deployTx = await factory.getDeployTransaction(baseURI, OWNER);
const initCode = deployTx.data;
console.log("init code bytes:", (initCode.length - 2) / 2);

// CREATE2 address: keccak256(0xff || factory || salt || keccak256(initCode))[12:]
const predicted = ethers.getCreate2Address(FACTORY, salt, ethers.keccak256(initCode));
console.log("predicted contract address:", predicted);

// Factory calldata = salt (32 bytes) + init code
const factoryCalldata = salt + initCode.slice(2);
console.log("factory calldata bytes:", (factoryCalldata.length - 2) / 2);
writeFileSync('./factory-calldata.txt', factoryCalldata);
writeFileSync('./predicted-address.txt', predicted);
writeFileSync('./salt.txt', salt);
console.log("written: factory-calldata.txt, predicted-address.txt, salt.txt");
