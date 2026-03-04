const API_BASE = "http://localhost:8001";

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export function createCertificate(data) {
  return request("/api/certificate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getCertificate(id) {
  return request(`/api/certificate/${encodeURIComponent(id)}`);
}

export function verifyCertificate(data) {
  return request("/api/certificate/verify", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCertificate(id, data) {
  return request(`/api/certificate/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function revokeCertificate(id) {
  return request(`/api/certificate/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
