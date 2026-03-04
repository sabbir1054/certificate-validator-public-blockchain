# Code Explanation - Certificate Validator Simple

This document explains how the code works across all files in the project.

## Architecture Overview

```
┌──────────────────────────────────────────┐
│           Client (curl / frontend)       │
└──────────────┬───────────────────────────┘
               │ HTTP Requests
┌──────────────▼───────────────────────────┐
│          server.js (Express API)         │
│  - REST endpoints (CRUD + verify)        │
│  - Hash generation (keccak256)           │
│  - ethers.js blockchain interaction      │
└──────────────┬───────────────────────────┘
               │ JSON-RPC calls via ethers.js
┌──────────────▼───────────────────────────┐
│      Hardhat Local Blockchain Node       │
│  (http://127.0.0.1:8545)                │
└──────────────┬───────────────────────────┘
               │
┌──────────────▼───────────────────────────┐
│   CertificateContract.sol (on-chain)     │
│  - Certificate storage (mappings)        │
│  - Create / Read / Update / Revoke       │
│  - Hash-based verification               │
└──────────────────────────────────────────┘
```

---

## 1. Smart Contract — `contracts/CertificateContract.sol`

This is the on-chain logic. Once deployed, it lives on the blockchain and stores all certificate data immutably.

### Data Structure

```solidity
struct Certificate {
    string certificateID;
    string studentName;
    string university;
    string department;
    string course;
    uint256 cgpa;         // Stored as integer (3.85 → 385)
    string issueDate;
    string hash;          // keccak256 hash of all fields
    string status;        // "valid" or "revoked"
}
```

CGPA is stored as a `uint256` (unsigned integer) because Solidity does not support floating-point numbers. The API multiplies the CGPA by 100 before sending it on-chain (e.g., `3.85` becomes `385`).

### Storage

```solidity
mapping(string => Certificate) private certificates;
mapping(string => bool) private certificateExists;
```

- `certificates` maps a certificate ID (string) to its full `Certificate` struct.
- `certificateExists` is a quick lookup to check if a certificate ID has been used.

Both are `private`, meaning other contracts cannot read them directly — only through the contract's public functions.

### Functions

#### `createCertificate(...)`

```solidity
function createCertificate(
    string memory _certificateID,
    string memory _studentName,
    string memory _university,
    string memory _department,
    string memory _course,
    uint256 _cgpa,
    string memory _issueDate,
    string memory _hash
) public
```

**How it works:**
1. Checks that a certificate with this ID doesn't already exist using `require(!certificateExists[_certificateID])`.
2. Creates a new `Certificate` struct and stores it in the `certificates` mapping.
3. Sets `certificateExists[_certificateID] = true`.
4. Sets the initial `status` to `"valid"`.
5. Emits a `CertificateCreated` event for off-chain indexing / logging.

#### `readCertificate(string _certificateID)`

```solidity
function readCertificate(string memory _certificateID)
    public view returns (string memory, string memory, string memory,
    string memory, string memory, uint256, string memory, string memory, string memory)
```

**How it works:**
1. Loads the certificate from the mapping.
2. Checks `bytes(cert.studentName).length > 0` to verify the certificate exists (an uninitialized struct would have empty strings).
3. Returns all 9 fields as a tuple.

This is a `view` function — it reads data without modifying state, so it costs no gas.

#### `updateCertificate(...)`

```solidity
function updateCertificate(
    string memory _certificateID,
    string memory _hash,
    string memory _course,
    string memory _department,
    uint256 _cgpa,
    string memory _studentName
) public
```

**How it works:**
1. Gets a reference to the stored certificate using `storage` (not `memory`), which allows direct modification.
2. Always updates the hash.
3. Conditionally updates each field only if a non-empty value is provided (checks `bytes(...).length > 0` for strings, `> 0` for cgpa).
4. Emits a `CertificateUpdated` event.

The `storage` keyword is critical here — using `memory` would create a copy that is discarded after the function ends.

#### `verifyCertificate(string _certificateID, string _hash)`

```solidity
function verifyCertificate(string memory _certificateID, string memory _hash)
    public view returns (bool)
```

**How it works:**
1. Loads the certificate.
2. Verifies the certificate exists (checks `studentName` length).
3. Compares the provided hash with the stored hash using `keccak256(abi.encodePacked(...))` — this is the standard way to compare strings in Solidity since `==` doesn't work for strings.
4. Checks that `status` equals `"valid"`.
5. Returns `true` only if both the hash matches AND the status is valid.

#### `revokeCertificate(string _certificateID)`

```solidity
function revokeCertificate(string memory _certificateID) public
```

**How it works:**
1. Gets a `storage` reference to the certificate.
2. Changes `status` from `"valid"` to `"revoked"`.
3. Emits a `CertificateRevoked` event.

After revocation, `verifyCertificate` will always return `false` for this certificate.

### Events

```solidity
event CertificateCreated(string certificateID, string studentName);
event CertificateUpdated(string certificateID);
event CertificateRevoked(string certificateID);
```

Events are logged on-chain and can be listened to by off-chain applications. They don't cost much gas and provide an audit trail.

---

## 2. API Server — `server.js`

This is the Node.js backend that exposes REST endpoints and interacts with the smart contract.

### Initialization

```javascript
require("dotenv").config();
const express = require("express");
const { ethers } = require("ethers");
const cors = require("cors");
```

1. **dotenv** loads variables from `.env` into `process.env`.
2. **express** provides the HTTP server framework.
3. **ethers** is the library for blockchain interaction.
4. **cors** allows cross-origin requests from browsers.

### Blockchain Connection Setup

```javascript
const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractABI = require("./artifacts/contracts/CertificateContract.sol/CertificateContract.json").abi;
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);
```

**How this chain works:**
1. **Provider** connects to the blockchain node (Hardhat at `localhost:8545`) via JSON-RPC.
2. **Wallet** wraps a private key + provider — it can sign transactions.
3. **ABI** (Application Binary Interface) is loaded from the compiled contract artifacts. It tells ethers.js what functions exist on the contract and how to encode/decode calls.
4. **Contract** instance combines the deployed address + ABI + wallet. You call methods on this object, and ethers.js handles encoding the call, sending the transaction, and decoding the response.

### Hash Generation

```javascript
function generateHash({ certificateID, studentName, university, department, course, cgpa, issueDate }) {
  const scaledCgpa = Math.round(cgpa * 100);
  const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
    ["string", "string", "string", "string", "string", "uint256", "string"],
    [certificateID, studentName, university, department, course, scaledCgpa, issueDate]
  );
  return ethers.keccak256(encoded);
}
```

**How it works:**
1. Scales the CGPA by 100 to match the on-chain integer format.
2. ABI-encodes all certificate fields into a single byte array using the same types the contract expects.
3. Hashes the encoded bytes with **keccak256** (the same hashing algorithm used internally by Ethereum).
4. Returns a `0x`-prefixed 32-byte hex string.

**Why this matters:** Verification works by regenerating this hash from the same input data. If even one character differs, the hash will be completely different (avalanche effect), and verification fails. This guarantees data integrity.

### Endpoint: `POST /api/certificate` (Create)

```javascript
app.post("/api/certificate", async (req, res) => { ... });
```

**Flow:**
1. Extracts all fields from `req.body`.
2. Validates that all 7 required fields are present — returns `400` if any are missing.
3. Scales CGPA: `Math.round(cgpa * 100)`.
4. Generates the certificate hash using `generateHash()`.
5. Calls `contract.createCertificate(...)` — this sends a **transaction** to the blockchain.
6. `await tx.wait()` pauses until the transaction is mined (included in a block).
7. Returns `201` with the transaction hash and certificate hash.

If the contract `require` fails (e.g., certificate already exists), ethers.js throws an error caught by the `catch` block.

### Endpoint: `GET /api/certificate/:id` (Read)

```javascript
app.get("/api/certificate/:id", async (req, res) => { ... });
```

**Flow:**
1. Calls `contract.readCertificate(id)` — this is a **call** (not a transaction), so it's free and instant.
2. The result comes back as an array matching the Solidity return types.
3. Destructures the array into named variables.
4. Checks if `studentName` is empty — if so, the certificate doesn't exist (returns `404`).
5. Converts CGPA back to decimal: `Number(cgpa) / 100`.
6. Returns the certificate as a JSON object.

### Endpoint: `POST /api/certificate/verify` (Verify)

```javascript
app.post("/api/certificate/verify", async (req, res) => { ... });
```

**Flow:**
1. Extracts fields from `req.body`.
2. Validates `certificateID` is present.
3. Regenerates the hash from the provided data using `generateHash()`.
4. Calls `contract.verifyCertificate(certificateID, hash)` — returns a boolean.
5. Returns `{ certificateID, verified: true/false }`.

**Key insight:** The caller must provide the **exact same data** used during creation. The server regenerates the hash and the contract compares it with the stored hash. This proves the data hasn't been tampered with.

### Endpoint: `PATCH /api/certificate/:id` (Update)

```javascript
app.patch("/api/certificate/:id", async (req, res) => { ... });
```

**Flow:**
1. Reads the current certificate from the blockchain to get existing values.
2. Merges provided fields with current values (uses the new value if provided, otherwise keeps the old one).
3. Generates a new hash from the merged data.
4. Calls `contract.updateCertificate(...)` with the new hash and changed fields.
5. Waits for the transaction to be mined.

This merge strategy allows partial updates — you can update just the CGPA without re-providing all other fields.

### Endpoint: `DELETE /api/certificate/:id` (Revoke)

```javascript
app.delete("/api/certificate/:id", async (req, res) => { ... });
```

**Flow:**
1. Calls `contract.revokeCertificate(id)` — sends a transaction.
2. Waits for transaction confirmation.
3. Returns success message with transaction hash.

Note: The certificate data is NOT deleted from the blockchain (blockchain data is immutable). The `status` field is changed to `"revoked"`, and future verification calls will return `false`.

---

## 3. Deployment Script — `scripts/deploy.js`

```javascript
const hre = require("hardhat");

async function main() {
  const CertificateContract = await hre.ethers.getContractFactory("CertificateContract");
  const contract = await CertificateContract.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log("CertificateContract deployed to:", address);
}
```

**How it works:**
1. `getContractFactory` loads the compiled contract bytecode and ABI from the `artifacts/` folder.
2. `.deploy()` sends a **deployment transaction** containing the contract bytecode. This is a special transaction with no "to" address — the blockchain creates a new contract account.
3. `.waitForDeployment()` waits until the transaction is mined.
4. `.getAddress()` returns the address where the contract now lives.
5. You then paste this address into `.env` as `CONTRACT_ADDRESS`.

---

## 4. Hardhat Config — `hardhat.config.js`

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
    },
  },
};
```

- **Solidity 0.8.28** — recent stable version with built-in overflow protection.
- **Optimizer enabled, 200 runs** — optimizes the bytecode for a balance between deployment cost and execution cost. 200 runs means it optimizes assuming each function will be called ~200 times.
- **viaIR: true** — uses the Yul intermediate representation pipeline for better optimization.

No network configuration is defined, so it defaults to the Hardhat built-in network for `npx hardhat node`.

---

## 5. Verification Flow (End-to-End)

This is the core value of the system:

```
CREATION:
  Input Data → generateHash() → keccak256 hash → stored on blockchain

VERIFICATION:
  Same Input Data → generateHash() → keccak256 hash → compared with stored hash
                                                          ↓
                                                    Match? → true
                                                    No match? → false
                                                    Revoked? → false
```

If anyone modifies even a single field (e.g., changes CGPA from 3.85 to 3.90), the regenerated hash will be completely different from the stored hash, and verification fails. This is how blockchain ensures **data integrity** without needing to trust any single party.

---

## 6. Key Design Decisions

| Decision | Reason |
|----------|--------|
| CGPA scaled by 100 | Solidity has no floating-point types |
| Hash generated off-chain | Reduces gas cost; hash comparison on-chain is cheap |
| String comparison via keccak256 | Solidity `==` doesn't work for strings |
| `storage` keyword in updates | Directly modifies blockchain state instead of a memory copy |
| Status field instead of deletion | Blockchain data is immutable; can't truly delete |
| No access control | Simplified for demonstration; production needs role-based access |
| Events on state changes | Enables off-chain monitoring and audit trails |
