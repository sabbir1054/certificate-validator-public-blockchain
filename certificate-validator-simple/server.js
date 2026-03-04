require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");

const app = express();
app.use(cors());
app.use(express.json());

// ─── Blockchain Connection ───────────────────────────────────────────

const { PRIVATE_KEY, ETH_RPC_URL, CONTRACT_ADDRESS, PORT = 8001 } = process.env;

if (!PRIVATE_KEY || !CONTRACT_ADDRESS) {
  console.error("Missing PRIVATE_KEY or CONTRACT_ADDRESS in .env");
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(ETH_RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Load ABI from compiled artifacts
const { abi } = require("./artifacts/contracts/CertificateContract.sol/CertificateContract.json");
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

// ─── Helper: Generate certificate hash ──────────────────────────────

function generateHash({ certificateID, studentName, university, department, course, cgpa, issueDate }) {
  const scaledCgpa = Math.round(cgpa * 100);
  return ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["string", "string", "string", "string", "string", "uint256", "string"],
      [certificateID, studentName, university, department, course, scaledCgpa, issueDate]
    )
  );
}

// ─── Routes ─────────────────────────────────────────────────────────

app.get("/", (req, res) => {
  res.json({ message: "Certificate Validator API is running" });
});

// Create certificate
app.post("/api/certificate", async (req, res) => {
  try {
    const { certificateID, studentName, university, department, course, cgpa, issueDate } = req.body;

    if (!certificateID || !studentName || !university || !department || !course || !cgpa || !issueDate) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const scaledCgpa = Math.round(cgpa * 100);
    const hash = generateHash(req.body);

    const tx = await contract.createCertificate(
      certificateID, studentName, university, department, course, scaledCgpa, issueDate, hash
    );
    await tx.wait();

    res.status(201).json({
      message: "Certificate created",
      transactionHash: tx.hash,
      certificateHash: hash,
    });
  } catch (err) {
    res.status(500).json({ error: err.reason || err.message });
  }
});

// Get single certificate
app.get("/api/certificate/:id", async (req, res) => {
  try {
    const cert = await contract.readCertificate(req.params.id);

    res.json({
      certificateID: cert.certificateID,
      studentName: cert.studentName,
      university: cert.university,
      department: cert.department,
      course: cert.course,
      cgpa: Number(cert.cgpa) / 100,
      issueDate: cert.issueDate,
      hash: cert.hash,
      status: cert.status,
    });
  } catch (err) {
    res.status(404).json({ error: err.reason || "Certificate not found" });
  }
});

// Verify certificate
app.post("/api/certificate/verify", async (req, res) => {
  try {
    const { certificateID, studentName, university, department, course, cgpa, issueDate } = req.body;

    if (!certificateID) {
      return res.status(400).json({ error: "certificateID is required" });
    }

    const hash = generateHash(req.body);
    const isValid = await contract.verifyCertificate(certificateID, hash);

    res.json({ certificateID, verified: isValid });
  } catch (err) {
    res.status(500).json({ error: err.reason || err.message });
  }
});

// Update certificate
app.patch("/api/certificate/:id", async (req, res) => {
  try {
    const certificateID = req.params.id;
    const { course = "", department = "", cgpa = 0, studentName = "" } = req.body;

    // Read current cert to rebuild hash
    const current = await contract.readCertificate(certificateID);
    const merged = {
      certificateID,
      studentName: studentName || current.studentName,
      university: current.university,
      department: department || current.department,
      course: course || current.course,
      cgpa: cgpa || Number(current.cgpa) / 100,
      issueDate: current.issueDate,
    };

    const hash = generateHash(merged);
    const scaledCgpa = cgpa ? Math.round(cgpa * 100) : 0;

    const tx = await contract.updateCertificate(certificateID, hash, course, department, scaledCgpa, studentName);
    await tx.wait();

    res.json({ message: "Certificate updated", transactionHash: tx.hash });
  } catch (err) {
    res.status(500).json({ error: err.reason || err.message });
  }
});

// Revoke certificate
app.delete("/api/certificate/:id", async (req, res) => {
  try {
    const tx = await contract.revokeCertificate(req.params.id);
    await tx.wait();

    res.json({ message: "Certificate revoked", transactionHash: tx.hash });
  } catch (err) {
    res.status(500).json({ error: err.reason || err.message });
  }
});

// ─── Start Server ───────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
