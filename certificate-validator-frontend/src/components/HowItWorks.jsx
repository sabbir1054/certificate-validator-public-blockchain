import { useState, useEffect } from "react";

// Simple hash function for demo (mimics keccak256 behavior visually)
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  // Make it look like a real hash
  return "0x" + hex.repeat(8).slice(0, 64);
}

// ─── Section Wrapper ─────────────────────────────────────────────────
function Section({ number, title, children }) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-4">
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">
          {number}
        </span>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── Flow Diagram ────────────────────────────────────────────────────
function FlowDiagram() {
  const steps = [
    { icon: "\u{1F4DD}", label: "Certificate Data", desc: "Name, University, CGPA..." },
    { icon: "\u{1F504}", label: "Hash Function", desc: "keccak256 algorithm" },
    { icon: "\u{1F512}", label: "Unique Hash", desc: "0x7a3f...b2c1" },
    { icon: "\u26D3", label: "Blockchain", desc: "Stored permanently" },
    { icon: "\u2705", label: "Verifiable", desc: "Anyone can check" },
  ];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[600px]">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center">
            <div className="text-center w-28">
              <div className="text-3xl mb-2">{step.icon}</div>
              <p className="text-sm font-medium text-white">{step.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
            </div>
            {i < steps.length - 1 && (
              <div className="text-gray-600 text-xl mx-2">&rarr;</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Live Hash Demo ──────────────────────────────────────────────────
function LiveHashDemo() {
  const [input, setInput] = useState("John Doe - MIT - Computer Science - 3.85");
  const [hash, setHash] = useState("");

  useEffect(() => {
    setHash(simpleHash(input));
  }, [input]);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <p className="text-sm text-gray-400 mb-4">
        Type anything below and watch the hash change instantly. Even a tiny change produces a completely different hash.
      </p>
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Input Data</label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl animate-pulse">&#x2193;</div>
            <p className="text-xs text-gray-500">keccak256</p>
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Output Hash</label>
          <div className="bg-gray-800 border border-indigo-700 rounded-lg px-3 py-2.5 font-mono text-sm text-indigo-400 break-all">
            {hash}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tamper Detection Demo ───────────────────────────────────────────
function TamperDemo() {
  const original = { name: "John Doe", university: "MIT", cgpa: "3.85" };
  const [tampered, setTampered] = useState({ ...original });
  const originalHash = simpleHash(JSON.stringify(original));
  const tamperedHash = simpleHash(JSON.stringify(tampered));
  const isMatch = originalHash === tamperedHash;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <p className="text-sm text-gray-400 mb-4">
        Try modifying any field below. The system detects even the smallest change because the hash won't match.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
            Original (on blockchain)
          </p>
          <div className="space-y-2 bg-gray-800/50 rounded-lg p-3">
            <Row label="Name" value={original.name} />
            <Row label="University" value={original.university} />
            <Row label="CGPA" value={original.cgpa} />
          </div>
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-1">Stored Hash</p>
            <p className="font-mono text-xs text-green-400 break-all bg-gray-800/50 rounded p-2">{originalHash}</p>
          </div>
        </div>

        {/* Tampered */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full inline-block ${isMatch ? "bg-green-500" : "bg-red-500"}`}></span>
            Submitted for Verification (editable)
          </p>
          <div className="space-y-2">
            <EditRow label="Name" value={tampered.name} onChange={(v) => setTampered({ ...tampered, name: v })} />
            <EditRow label="University" value={tampered.university} onChange={(v) => setTampered({ ...tampered, university: v })} />
            <EditRow label="CGPA" value={tampered.cgpa} onChange={(v) => setTampered({ ...tampered, cgpa: v })} />
          </div>
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-1">Regenerated Hash</p>
            <p className={`font-mono text-xs break-all rounded p-2 bg-gray-800/50 ${isMatch ? "text-green-400" : "text-red-400"}`}>
              {tamperedHash}
            </p>
          </div>
        </div>
      </div>

      {/* Result */}
      <div className={`mt-6 rounded-lg p-4 text-center border ${isMatch ? "bg-green-900/20 border-green-800" : "bg-red-900/20 border-red-800"}`}>
        <p className={`text-lg font-semibold ${isMatch ? "text-green-400" : "text-red-400"}`}>
          {isMatch ? "\u2713 Hashes Match — Certificate is Valid" : "\u2716 Hashes Don't Match — Tampering Detected!"}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {isMatch
            ? "The submitted data produces the same hash as the blockchain record."
            : "Even a small change completely changes the hash, making fraud impossible to hide."}
        </p>
      </div>

      <button
        onClick={() => setTampered({ ...original })}
        className="mt-3 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
      >
        &#x21BA; Reset to original
      </button>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm px-2">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-200">{value}</span>
    </div>
  );
}

function EditRow({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 w-20">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
    </div>
  );
}

// ─── Blockchain Visualization ────────────────────────────────────────
function BlockchainVisualization() {
  const blocks = [
    { id: 0, label: "Genesis Block", hash: "0x0000...0000", data: "Network initialized" },
    { id: 1, label: "Block #1", hash: "0x7a3f...e2b1", data: "CERT-001 created (John Doe)" },
    { id: 2, label: "Block #2", hash: "0xb2c1...f4a8", data: "CERT-002 created (Jane Smith)" },
    { id: 3, label: "Block #3", hash: "0xd5e9...1c3b", data: "CERT-001 updated (CGPA changed)" },
    { id: 4, label: "Block #4", hash: "0xf1a7...8d2e", data: "CERT-003 created (Bob Wilson)" },
  ];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 overflow-x-auto">
      <div className="flex items-stretch gap-3 min-w-[700px]">
        {blocks.map((block, i) => (
          <div key={block.id} className="flex items-center">
            <div className={`border rounded-lg p-3 w-40 ${i === 0 ? "border-amber-700 bg-amber-950/20" : "border-gray-700 bg-gray-800/50"}`}>
              <p className={`text-xs font-semibold mb-1.5 ${i === 0 ? "text-amber-400" : "text-indigo-400"}`}>
                {block.label}
              </p>
              <p className="text-xs text-gray-400 mb-1">{block.data}</p>
              <p className="font-mono text-xs text-gray-500 truncate">{block.hash}</p>
              {i > 0 && (
                <p className="font-mono text-xs text-gray-600 mt-1 truncate">
                  prev: {blocks[i - 1].hash}
                </p>
              )}
            </div>
            {i < blocks.length - 1 && (
              <div className="text-gray-600 mx-1 text-sm">&rarr;</div>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-4">
        Each block references the previous block's hash, forming an unbreakable chain.
        Changing any block would invalidate all blocks after it.
      </p>
    </div>
  );
}

// ─── Step-by-Step Process ────────────────────────────────────────────
function StepByStep() {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Student Submits Certificate Data",
      desc: "The university enters the student's certificate information: name, university, department, course, CGPA, and issue date.",
      visual: (
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-1.5 text-sm">
          <p><span className="text-gray-500">Name:</span> <span className="text-gray-200">John Doe</span></p>
          <p><span className="text-gray-500">University:</span> <span className="text-gray-200">MIT</span></p>
          <p><span className="text-gray-500">Course:</span> <span className="text-gray-200">Blockchain</span></p>
          <p><span className="text-gray-500">CGPA:</span> <span className="text-gray-200">3.85</span></p>
        </div>
      ),
    },
    {
      title: "Hash is Generated",
      desc: "All the data is combined and passed through the keccak256 hash function. This creates a unique digital fingerprint — like a DNA for the certificate.",
      visual: (
        <div className="text-center space-y-3">
          <div className="bg-gray-800/50 rounded-lg p-3 text-sm text-gray-300">
            "John Doe" + "MIT" + "Blockchain" + "385" + ...
          </div>
          <div className="text-indigo-400 text-xl">&#x2193; keccak256()</div>
          <div className="bg-indigo-950/50 border border-indigo-800 rounded-lg p-3 font-mono text-xs text-indigo-400 break-all">
            0x7a3f9b2c1d4e5f6a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1
          </div>
        </div>
      ),
    },
    {
      title: "Transaction Sent to Blockchain",
      desc: "The certificate data and its hash are sent as a transaction to the smart contract on the Ethereum blockchain. This costs 'gas' (transaction fees).",
      visual: (
        <div className="bg-gray-800/50 rounded-lg p-4 text-sm space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-yellow-500">&#9889;</span>
            <span className="text-gray-300">Transaction submitted...</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-500">&#x23F3;</span>
            <span className="text-gray-300">Waiting for confirmation...</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">&#x2713;</span>
            <span className="text-gray-300">Mined in Block #12847</span>
          </div>
          <p className="font-mono text-xs text-gray-500 mt-2">TX: 0xabc123...def456</p>
        </div>
      ),
    },
    {
      title: "Data Stored On-Chain Forever",
      desc: "The smart contract stores the certificate in the blockchain. No one can modify or delete it — not even the original creator. The data is permanent and transparent.",
      visual: (
        <div className="bg-gray-800/50 rounded-lg p-4 text-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Smart Contract Storage</p>
          <div className="font-mono text-xs space-y-1 text-gray-400">
            <p>certificates["CERT-001"] = &#123;</p>
            <p className="pl-4">studentName: "John Doe",</p>
            <p className="pl-4">hash: "0x7a3f...0f1",</p>
            <p className="pl-4">status: "valid"</p>
            <p>&#125;</p>
          </div>
        </div>
      ),
    },
    {
      title: "Anyone Can Verify",
      desc: "To verify, someone provides the same certificate data. The system regenerates the hash and compares it with the one stored on the blockchain. If they match, the certificate is authentic.",
      visual: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-green-950/30 border border-green-800 rounded-lg p-3 text-center">
              <p className="text-gray-500 mb-1">Stored Hash</p>
              <p className="font-mono text-green-400">0x7a3f...0f1</p>
            </div>
            <div className="bg-green-950/30 border border-green-800 rounded-lg p-3 text-center">
              <p className="text-gray-500 mb-1">Regenerated Hash</p>
              <p className="font-mono text-green-400">0x7a3f...0f1</p>
            </div>
          </div>
          <div className="text-center text-green-400 font-semibold">&#x2713; Match! Certificate is Valid</div>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      {/* Progress bar */}
      <div className="flex gap-1 mb-6">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors cursor-pointer ${
              i <= step ? "bg-indigo-500" : "bg-gray-700"
            }`}
            onClick={() => setStep(i)}
          />
        ))}
      </div>

      <div className="min-h-[280px]">
        <p className="text-xs text-indigo-400 uppercase tracking-wider mb-1">Step {step + 1} of {steps.length}</p>
        <h4 className="text-white font-semibold mb-2">{steps[step].title}</h4>
        <p className="text-sm text-gray-400 mb-4">{steps[step].desc}</p>
        {steps[step].visual}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="text-sm text-gray-400 hover:text-white disabled:text-gray-700 disabled:cursor-not-allowed transition-colors"
        >
          &larr; Previous
        </button>
        <button
          onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
          disabled={step === steps.length - 1}
          className="text-sm text-indigo-400 hover:text-indigo-300 disabled:text-gray-700 disabled:cursor-not-allowed transition-colors"
        >
          Next &rarr;
        </button>
      </div>
    </div>
  );
}

// ─── Traditional vs Blockchain Comparison ────────────────────────────
function Comparison() {
  const rows = [
    { aspect: "Storage", traditional: "University database (single server)", blockchain: "Distributed across thousands of nodes" },
    { aspect: "Tampering", traditional: "Admin can modify records", blockchain: "No one can alter stored data" },
    { aspect: "Verification", traditional: "Contact university, wait days", blockchain: "Instant, anyone can verify" },
    { aspect: "Single Point of Failure", traditional: "Server crash = data lost", blockchain: "No single point of failure" },
    { aspect: "Trust", traditional: "Trust the university", blockchain: "Trust the math (cryptography)" },
    { aspect: "Transparency", traditional: "Only university can access", blockchain: "Publicly auditable" },
  ];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="grid grid-cols-3 text-xs uppercase tracking-wider font-semibold border-b border-gray-800">
        <div className="p-3 text-gray-500"></div>
        <div className="p-3 text-red-400 text-center bg-red-950/10">Traditional</div>
        <div className="p-3 text-green-400 text-center bg-green-950/10">Blockchain</div>
      </div>
      {rows.map((row, i) => (
        <div key={i} className={`grid grid-cols-3 text-sm ${i < rows.length - 1 ? "border-b border-gray-800/50" : ""}`}>
          <div className="p-3 text-gray-400 font-medium">{row.aspect}</div>
          <div className="p-3 text-gray-400 text-center bg-red-950/5">{row.traditional}</div>
          <div className="p-3 text-gray-300 text-center bg-green-950/5">{row.blockchain}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────
export default function HowItWorks() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">How Blockchain Verification Works</h2>
      <p className="text-sm text-gray-400 mb-8">
        An interactive guide to understand how this system uses blockchain to make certificates tamper-proof and verifiable.
      </p>

      <Section number={1} title="The Big Picture">
        <FlowDiagram />
      </Section>

      <Section number={2} title="Step-by-Step: Certificate Lifecycle">
        <StepByStep />
      </Section>

      <Section number={3} title="Try It: Live Hash Generation">
        <LiveHashDemo />
      </Section>

      <Section number={4} title="Try It: Tamper Detection">
        <TamperDemo />
      </Section>

      <Section number={5} title="The Blockchain: A Chain of Blocks">
        <BlockchainVisualization />
      </Section>

      <Section number={6} title="Why Blockchain? Traditional vs Blockchain">
        <Comparison />
      </Section>

      {/* Key Concepts */}
      <Section number={7} title="Key Concepts">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Concept
            icon="&#x1F9E9;"
            title="Hash Function"
            desc="A mathematical function that converts any data into a fixed-size string. The same input always produces the same output, but you can't reverse it to get the original data."
          />
          <Concept
            icon="&#x1F4DC;"
            title="Smart Contract"
            desc="A program that lives on the blockchain. It automatically executes rules (like storing and verifying certificates) without needing a middleman."
          />
          <Concept
            icon="&#x26D3;"
            title="Immutability"
            desc="Once data is written to the blockchain, it cannot be changed or deleted. This is what makes certificates tamper-proof."
          />
          <Concept
            icon="&#x1F310;"
            title="Decentralization"
            desc="The blockchain runs on thousands of computers worldwide. There's no single authority that controls the data — everyone has a copy."
          />
        </div>
      </Section>
    </div>
  );
}

function Concept({ icon, title, desc }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <p className="text-xl mb-2">{icon}</p>
      <p className="font-medium text-white text-sm mb-1">{title}</p>
      <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}
