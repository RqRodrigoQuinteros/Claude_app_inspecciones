
// api.js — Llamadas al backend Apps Script
// ⚠️  Reemplazá esta URL con la de tu Web App publicada
export const API_URL = "https://script.google.com/macros/s/AKfycbym55Ip18F84jBZZUf3kXfPpYwcwK-AdHNO6RdXE4PUYb_i7kXvjgNHZ_J3uQFYKdY/exec";

const TIMEOUT_MS = 20000;

async function call(action, payload = {}, method = "POST") {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    let res;
    if (method === "GET") {
      const qs = new URLSearchParams({ action, ...payload }).toString();
      res = await fetch(`${API_URL}?${qs}`, { signal: ctrl.signal });
    } else {
      res = await fetch(API_URL, {
        method: "POST",
        signal: ctrl.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
    }
    clearTimeout(timer);
    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    throw err.name === "AbortError" ? new Error("Tiempo de espera agotado") : err;
  }
}

export const Api = {
  getInspectores:   ()                    => call("getInspectores",   {},          "GET"),
  login:            (nombre, dni)          => call("login",            { nombre, dni }),
  crearInspeccion:  (data)                 => call("crearInspeccion",  data),
  getInspecciones:  (inspector)            => call("getInspecciones",  { inspector }, "GET"),
  guardarFormData:  (inspId, formData)     => call("guardarFormData",  { inspId, formData }),
  generarActa:      (inspId)               => call("generarActa",      { inspId }),
  eliminarInspeccion:(inspId)              => call("eliminarInspeccion",{ inspId }),

  // Sync de pendientes
  async syncPendientes(pending, onStep) {
    let ok = 0;
    for (const op of pending) {
      try {
        let r;
        if      (op.type === "crear")   r = await this.crearInspeccion(op.data);
        else if (op.type === "guardar") r = await this.guardarFormData(op.data.inspId, op.data.formData);
        if (r?.ok) { ok++; if (onStep) onStep(op.id); }
      } catch { /* reintentará después */ }
    }
    return ok;
  }
};
