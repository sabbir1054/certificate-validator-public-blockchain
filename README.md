# Blockchain Certificate Validator

A blockchain-based certificate management system with a **React** frontend and a **Node.js/Express** backend powered by **Solidity** smart contracts on a local Hardhat network.

## Project Structure

```
public_blockchain/
├── certificate-validator-frontend/   # React + Vite + Tailwind CSS
└── certificate-validator-simple/     # Express API + Hardhat + Solidity
```

## Prerequisites

- **Node.js** v22.10 and **npm**

## Quick Start

You need **3 terminals** to run the full stack.

### 1. Start the Local Blockchain

Open a terminal and run:

```bash
npm run node
```

This starts a local Hardhat blockchain node at `http://127.0.0.1:8545`. It will display a list of test accounts with their private keys. **Keep this terminal running.**

### 2. Compile the Smart Contract

Open a **second terminal** and run:

```bash
npm run compile
```

This compiles `contracts/CertificateContract.sol` and generates the ABI artifacts in the `artifacts/` folder.

### 3. Deploy the Smart Contract

In the same second terminal:

```bash
npm run deploy
```

This deploys the contract to your local blockchain. The output will show the deployed contract address, e.g.:

```
CertificateContract deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 4. Configure Environment Variables

Create or update the `.env` file in the project root:

```env
PORT=8001
ETH_RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

- **PORT** - The port the API server will listen on
- **ETH_RPC_URL** - The blockchain RPC endpoint (local Hardhat node)
- **PRIVATE_KEY** - A private key from the Hardhat test accounts (the first one is used by default)
- **CONTRACT_ADDRESS** - The address from the deploy step output

### 5. Start the API Server

```bash
npm start
```

You should see:

```
Server running on port 8001
```

### Terminal 3 — Frontend

```bash
cd certificate-validator-frontend
npm install
npm run dev
```

Frontend is now running at `http://localhost:5173`.

## Tech Stack

| Layer      | Technology                        |
| ---------- | --------------------------------- |
| Frontend   | React, Vite, Tailwind CSS         |
| Backend    | Node.js, Express, ethers.js       |
| Blockchain | Solidity, Hardhat (local network) |

## Troubleshooting

| Problem                                        | Solution                                                             |
| ---------------------------------------------- | -------------------------------------------------------------------- |
| Connection refused on port 8545                | Make sure `npm run node` is running in Terminal 1                    |
| Contract call errors after restarting the node | Re-deploy (`npm run deploy`) and update `CONTRACT_ADDRESS` in `.env` |
| Frontend can't reach API                       | Ensure the backend is running on port 8001                           |
