# Blockchain Certificate Validator

A blockchain-based certificate management system with a **React** frontend and a **Node.js/Express** backend powered by **Solidity** smart contracts on a local Hardhat network.

## Project Structure

```
public_blockchain/
├── certificate-validator-frontend/   # React + Vite + Tailwind CSS
└── certificate-validator-simple/     # Express API + Hardhat + Solidity
```

## Prerequisites

- **Node.js** v18+ and **npm**

## Quick Start

You need **3 terminals** to run the full stack.

### Terminal 1 — Local Blockchain

```bash
cd certificate-validator-simple
npm install
npm run node
```

This starts a Hardhat blockchain at `http://127.0.0.1:8545`. Keep this terminal running.

### Terminal 2 — Deploy Contract & Start API Server

```bash
cd certificate-validator-simple
npm run compile
npm run deploy
```

Copy the deployed contract address from the output, then create a `.env` file:

```env
PORT=8001
ETH_RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CONTRACT_ADDRESS=<paste the address from deploy output>
```

Then start the API:

```bash
npm start
```

Backend is now running at `http://localhost:8001`.

### Terminal 3 — Frontend

```bash
cd certificate-validator-frontend
npm install
npm run dev
```

Frontend is now running at `http://localhost:5173`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/api/certificate` | Create a certificate |
| GET | `/api/certificate/:id` | Get a certificate by ID |
| POST | `/api/certificate/verify` | Verify a certificate |
| PATCH | `/api/certificate/:id` | Update a certificate |
| DELETE | `/api/certificate/:id` | Revoke a certificate |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express, ethers.js |
| Blockchain | Solidity, Hardhat (local network) |

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Connection refused on port 8545 | Make sure `npm run node` is running in Terminal 1 |
| Contract call errors after restarting the node | Re-deploy (`npm run deploy`) and update `CONTRACT_ADDRESS` in `.env` |
| Frontend can't reach API | Ensure the backend is running on port 8001 |
