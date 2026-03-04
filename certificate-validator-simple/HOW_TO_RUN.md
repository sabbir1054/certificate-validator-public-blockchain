# How to Run - Certificate Validator Simple

A blockchain-based certificate management system using Solidity smart contracts and a Node.js Express REST API.

## Prerequisites

- **Node.js** (v18 or higher) and **npm** installed
- A terminal / command prompt

## Installation

```bash
npm install
```

This installs all dependencies: Express, ethers.js, cors, dotenv, Hardhat, and the Hardhat toolbox.

## Step-by-Step Setup

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

The API is now ready at `http://localhost:8001`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/api/certificate` | Create a certificate |
| GET | `/api/certificate/:id` | Read a certificate by ID |
| POST | `/api/certificate/verify` | Verify a certificate |
| PATCH | `/api/certificate/:id` | Update a certificate |
| DELETE | `/api/certificate/:id` | Revoke a certificate |

## Testing the API

### Create a Certificate

```bash
curl -X POST http://localhost:8001/api/certificate \
  -H "Content-Type: application/json" \
  -d '{
    "certificateID": "CERT001",
    "studentName": "John Doe",
    "university": "MIT",
    "department": "Computer Science",
    "course": "Blockchain Fundamentals",
    "cgpa": 3.85,
    "issueDate": "2024-01-15"
  }'
```

**Response (201):**

```json
{
  "message": "Certificate created",
  "transactionHash": "0x...",
  "certificateHash": "0x..."
}
```

### Read a Certificate

```bash
curl http://localhost:8001/api/certificate/CERT001
```

**Response (200):**

```json
{
  "certificateID": "CERT001",
  "studentName": "John Doe",
  "university": "MIT",
  "department": "Computer Science",
  "course": "Blockchain Fundamentals",
  "cgpa": 3.85,
  "issueDate": "2024-01-15",
  "hash": "0x...",
  "status": "valid"
}
```

### Verify a Certificate

```bash
curl -X POST http://localhost:8001/api/certificate/verify \
  -H "Content-Type: application/json" \
  -d '{
    "certificateID": "CERT001",
    "studentName": "John Doe",
    "university": "MIT",
    "department": "Computer Science",
    "course": "Blockchain Fundamentals",
    "cgpa": 3.85,
    "issueDate": "2024-01-15"
  }'
```

**Response (200):**

```json
{
  "certificateID": "CERT001",
  "verified": true
}
```

### Update a Certificate

```bash
curl -X PATCH http://localhost:8001/api/certificate/CERT001 \
  -H "Content-Type: application/json" \
  -d '{
    "cgpa": 3.90
  }'
```

**Response (200):**

```json
{
  "message": "Certificate updated",
  "transactionHash": "0x..."
}
```

### Revoke a Certificate

```bash
curl -X DELETE http://localhost:8001/api/certificate/CERT001
```

**Response (200):**

```json
{
  "message": "Certificate revoked",
  "transactionHash": "0x..."
}
```

## Quick Start Summary

```bash
# Terminal 1 - keep running
npm run node

# Terminal 2
npm run compile
npm run deploy
# Update .env with the CONTRACT_ADDRESS from deploy output
npm start
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `PRIVATE_KEY not found in .env` | Make sure the `.env` file exists and contains all required variables |
| `CONTRACT_ADDRESS not found in .env` | Run `npm run deploy` and copy the address to `.env` |
| Connection refused on port 8545 | Make sure `npm run node` is running in another terminal |
| Contract call errors after restarting the node | Re-deploy the contract (`npm run deploy`) and update `CONTRACT_ADDRESS` in `.env` |
| Certificate not found (404) | The certificate ID does not exist - create it first |
| Verification returns false | Ensure you provide the **exact same data** used during creation |
