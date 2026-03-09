
// app.js — Lógica principal PWA Inspecciones Sanitarias
import { DB }                  from "./db.js";
import { Api }                 from "./api.js";
import { getSchema, TIPOLOGIAS } from "./schema.js";

// ─── Estado ───────────────────────────────────────────────
const S = {
  session:   null,
  insp:      [],          // lista local
  inspId:    null,
  tipologia: null,
  schema:    [],
  secIdx:    0,
  form:      {},          // datos del formulario en curso
  pendCount: 0,
};

// ─── DOM helpers ──────────────────────────────────────────
const $   = id => document.getElementById(id);
const on  = (id, ev, fn) => $(id)?.addEventListener(ev, fn);
const txt = (id, t) => { if ($(id)) $(id).textContent = t; };

let _loadingVisible = false;
function showLoading(msg = "Cargando...") {
  _loadingVisible = true;
  txt("loading-msg", msg);
  $("overlay").classList.remove("hidden");
}
function hideLoading() {
  _loadingVisible = false;
  $("overlay").classList.add("hidden");
}

let _toastTimer;
function toast(msg, type = "") {
  const el = $("toast");
  el.textContent = msg;
  el.className = "toast show " + type;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.className = "toast", 3000);
}

// ─── Pantallas ────────────────────────────────────────────
let _screen = "login";
function nav(to, direction = "forward") {
  document.querySelectorAll(".screen").forEach(s => {
    const id = s.id.replace("scr-", "");
    s.classList.toggle("active",   id === to);
    s.classList.toggle("offRight", id !== to && direction === "forward"  && id !== _screen);
    s.classList.toggle("offLeft",  id !== to && direction === "backward" && id !== _screen);
  });
  _screen = to;
}

// ─── INICIO ───────────────────────────────────────────────
async function init() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }

  // Poblar tipologías
  const sel = $("sel-tip");
  TIPOLOGIAS.forEach(t => {
    const o = document.createElement("option");
    o.value = t.v; o.textContent = t.l;
    sel.appendChild(o);
  });

  // Conectividad
  updateDot();
  window.addEventListener("online",  () => { updateDot(); autoSync(); });
  window.addEventListener("offline", () => updateDot());

  // Sesión guardada
  S.session = await DB.getConfig("session");
  if (S.session) {
    showDashboard();
  } else {
    await loadSelInspectores();
    hideLoading();
  }

  S.pendCount = (await DB.getPendientes()).length;
  renderSyncBadge();
}

function updateDot() {
  const dot = $("conn-dot");
  if (!dot) return;
  dot.className = "dot " + (navigator.onLine ? "online" : "offline");
  dot.title = navigator.onLine ? "En línea" : "Sin conexión";
}

// ─── LOGIN ────────────────────────────────────────────────
async function loadSelInspectores() {
  showLoading("Cargando inspectores...");
  try {
    const list = await Api.getInspectores();
    const sel  = $("sel-insp");
    (Array.isArray(list) ? list : []).forEach(i => {
      const o = document.createElement("option");
      o.value = i.nombre; o.textContent = i.nombre;
      sel.appendChild(o);
    });
  } catch {
    toast("Sin conexión. Reintentá más tarde.", "error");
  }
  hideLoading();
}

async function doLogin() {
  const nombre = $("sel-insp").value;
  const dni    = $("inp-dni").value.trim();
  if (!nombre) { toast("Seleccioná un inspector", "error"); return; }
  if (!dni)    { toast("Ingresá tu DNI",           "error"); return; }
  showLoading("Verificando...");
  try {
    const r = await Api.login(nombre, dni);
    if (r.ok) {
      S.session = { nombre };
      await DB.setConfig("session", S.session);
      showDashboard();
    } else {
      hideLoading();
      toast("DNI incorrecto", "error");
    }
  } catch {
    hideLoading();
    toast("Sin conexión — no se puede iniciar sesión", "error");
  }
}

async function doLogout() {
  if (!confirm("¿Cerrar sesión?")) return;
  await DB.delConfig("session");
  S.session = null;
  $("sel-insp").value = "";
  $("inp-dni").value  = "";
  $("header").classList.add("hidden");
  nav("login");
}

// ─── DASHBOARD ────────────────────────────────────────────
async function showDashboard() {
  $("header").classList.remove("hidden");
  $("hdr-title").textContent = S.session.nombre;
  $("btn-back").classList.add("hidden");
  $("btn-save").classList.add("hidden");
  nav("dashboard");
  await refreshList();
  hideLoading();
}

async function refreshList() {
  S.insp = await DB.getAllInsp();
  renderList();
  if (navigator.onLine) pullInsp();
}

async function pullInsp() {
  try {
    const list = await Api.getInspecciones(S.session.nombre);
    if (Array.isArray(list)) {
      for (const i of list) await DB.putInsp(i);
      S.insp = await DB.getAllInsp();
      renderList();
    }
  } catch { /* silencioso */ }
}

function renderList() {
  const q      = ($("inp-buscar").value || "").toLowerCase();
  const estado = $("sel-estado").value;

  const mine = S.insp.filter(i => i.inspector === S.session.nombre);
  txt("stat-t", mine.length);
  txt("stat-b", mine.filter(i => i.estado === "Borrador").length);
  txt("stat-g", mine.filter(i => i.estado === "Generada").length);

  const filtered = mine.filter(i => {
    const mq = !q || [i.establecimiento, i.localidad, i.nro_expediente].some(v => (v||"").toLowerCase().includes(q));
    const me = !estado || i.estado === estado;
    return mq && me;
  });

  const list  = $("insp-list");
  const empty = $("empty-state");

  if (!filtered.length) {
    list.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  list.innerHTML = filtered.map(i => {
    const d     = i.created_at ? new Date(i.created_at).toLocaleDateString("es-AR") : "";
    const badge = i.estado === "Generada"
      ? `<span class="badge bg">Generada</span>`
      : `<span class="badge bb">Borrador</span>`;
    return `<div class="card" data-id="${i.id}">
      <div class="card-top">
        <span class="card-name">${i.establecimiento || "Sin nombre"}</span>
        ${badge}
      </div>
      <div class="card-sub">${i.localidad||""}${i.nro_expediente ? " · Exp: "+i.nro_expediente : ""}</div>
      <div class="card-tip">${i.tipologia||""}</div>
      <div class="card-date">${d}${i._offline ? " · 📵 pendiente sync" : ""}</div>
    </div>`;
  }).join("");

  list.querySelectorAll(".card").forEach(c =>
    c.addEventListener("click", () => openDetalle(c.dataset.id))
  );
}

// ─── NUEVA INSPECCIÓN ─────────────────────────────────────
function showNueva() {
  $("btn-back").classList.remove("hidden");
  $("btn-save").classList.add("hidden");
  $("hdr-title").textContent = "Nueva Inspección";
  $("inp-estab").value     = "";
  $("inp-localidad").value = "";
  $("inp-exp").value       = "";
  $("sel-tip").value       = "";
  nav("nueva");
}

async function crearInspeccion() {
  const tip   = $("sel-tip").value;
  const estab = $("inp-estab").value.trim();
  const loc   = $("inp-localidad").value.trim();
  const exp   = $("inp-exp").value.trim();

  if (!tip)   { toast("Seleccioná una tipología",   "error"); return; }
  if (!estab) { toast("Ingresá el establecimiento", "error"); return; }
  if (!loc)   { toast("Ingresá la localidad",       "error"); return; }

  const now  = new Date().toISOString();
  const id   = "INS_" + Date.now();
  const insp = {
    id, created_at: now, updated_at: now,
    inspector: S.session.nombre,
    establecimiento: estab, localidad: loc,
    tipologia: tip, nro_expediente: exp,
    estado: "Borrador", doc_id: "", doc_url: "",
    _offline: true,
  };

  await DB.putInsp(insp);
  S.insp.unshift(insp);

  if (navigator.onLine) {
    try {
      const r = await Api.crearInspeccion({ inspector: S.session.nombre, tipologia: tip, establecimiento: estab, localidad: loc, nro_expediente: exp });
      if (r.ok) {
        insp._serverId = r.id;
        insp._offline  = false;
        await DB.putInsp(insp);
      }
    } catch {
      await DB.addPendiente({ type: "crear", data: { ...insp } });
      S.pendCount++;
      renderSyncBadge();
    }
  } else {
    await DB.addPendiente({ type: "crear", data: { ...insp } });
    S.pendCount++;
    renderSyncBadge();
  }

  S.inspId   = id;
  S.tipologia = tip;
  openFormulario();
}

// ─── FORMULARIO ───────────────────────────────────────────
async function openFormulario() {
  S.schema = getSchema(S.tipologia);
  S.secIdx = 0;
  S.form   = await DB.getFormData(S.inspId);

  $("hdr-title").textContent = "Formulario";
  $("btn-back").classList.remove("hidden");
  $("btn-save").classList.remove("hidden");

  buildChips();
  buildFormBody();
  nav("form");
}

function buildChips() {
  const el = $("chips");
  el.innerHTML = S.schema.map((s, i) =>
    `<button class="chip${i===0?" active":""}" data-i="${i}">${s.titulo}</button>`
  ).join("");
  el.querySelectorAll(".chip").forEach(c =>
    c.addEventListener("click", () => goSec(+c.dataset.i))
  );
}

function buildFormBody() {
  $("form-body").innerHTML = S.schema.map((s, i) =>
    `<div class="sec${i===0?" active":""}" id="sec${i}">
      <div class="sec-title">${s.titulo}</div>
      ${s.campos.map(f => renderField(f)).join("")}
    </div>`
  ).join("");
  bindFields();
  updateNav();
}

function renderField(f) {
  const val = S.form[f.id] ?? "";
  if (f.t === "yn" || f.t === "ync") {
    const si = val === "SI" ? " active-si" : "";
    const no = val === "NO" ? " active-no" : "";
    const dot = f.t === "ync" ? `<span class="cond-hint">◦ activa anexo en el acta</span>` : "";
    return `<div class="yn-row${f.t==="ync"?" yn-cond":""}">
      <span class="yn-label">${f.label}</span>
      <div class="yn-btns">
        <button class="yn-btn${si}" data-fid="${f.id}" data-v="SI">SI</button>
        <button class="yn-btn${no}" data-fid="${f.id}" data-v="NO">NO</button>
      </div>
      ${dot}
    </div>`;
  }
  if (f.t === "area") return `<div class="fg">
    <label class="lbl">${f.label}</label>
    <textarea class="inp" data-fid="${f.id}" rows="4">${val}</textarea>
  </div>`;
  const type = f.t === "num" ? "number" : f.t === "date" ? "date" : "text";
  const mode = f.t === "num" ? `inputmode="numeric"` : "";
  return `<div class="fg">
    <label class="lbl">${f.label}</label>
    <input type="${type}" ${mode} class="inp" data-fid="${f.id}" value="${val}">
  </div>`;
}

function bindFields() {
  $("form-body").querySelectorAll(".yn-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const fid = btn.dataset.fid;
      const val = btn.dataset.v;
      btn.closest(".yn-btns").querySelectorAll(".yn-btn").forEach(b => b.className = "yn-btn");
      btn.classList.add(val === "SI" ? "active-si" : "active-no");
      S.form[fid] = val;
      scheduleAutoSave();
    });
  });
  $("form-body").querySelectorAll("[data-fid]").forEach(el => {
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      el.addEventListener("input", () => {
        S.form[el.dataset.fid] = el.value;
        scheduleAutoSave();
      });
    }
  });
}

function goSec(idx) {
  S.secIdx = idx;
  document.querySelectorAll(".chip").forEach((c, i) => c.classList.toggle("active", i === idx));
  document.querySelectorAll(".sec") .forEach((s, i) => s.classList.toggle("active", i === idx));
  document.querySelector(`.chip[data-i="${idx}"]`)?.scrollIntoView({ inline: "center", block: "nearest" });
  updateNav();
}

function updateNav() {
  $("btn-prev").disabled = S.secIdx === 0;
  txt("form-pg", `${S.secIdx + 1} / ${S.schema.length}`);
  const isLast = S.secIdx === S.schema.length - 1;
  $("btn-next").textContent = isLast ? "Finalizar ✓" : "Siguiente →";
  $("btn-next").onclick     = isLast ? () => saveDraft(true) : () => goSec(S.secIdx + 1);
}

let _saveTimer;
function scheduleAutoSave() {
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => DB.putFormData(S.inspId, S.form), 800);
}

async function saveDraft(final = false) {
  showLoading("Guardando...");
  await DB.putFormData(S.inspId, S.form);

  const syncData = { inspId: S.inspId, formData: S.form };
  if (navigator.onLine) {
    try {
      await Api.guardarFormData(S.inspId, S.form);
    } catch {
      await DB.addPendiente({ type: "guardar", data: syncData });
      S.pendCount++;
      renderSyncBadge();
    }
  } else {
    await DB.addPendiente({ type: "guardar", data: syncData });
    S.pendCount++;
    renderSyncBadge();
  }

  // Actualizar establecimiento en la ficha local
  const insp = await DB.getInsp(S.inspId);
  if (insp) {
    if (S.form.NOMBRE_ESTABLECIMIENTO)    insp.establecimiento = S.form.NOMBRE_ESTABLECIMIENTO;
    if (S.form.LOCALIDAD_ESTABLECIMIENTO) insp.localidad       = S.form.LOCALIDAD_ESTABLECIMIENTO;
    if (S.form.NRO_EXPEDIENTE)            insp.nro_expediente  = S.form.NRO_EXPEDIENTE;
    insp.updated_at = new Date().toISOString();
    await DB.putInsp(insp);
  }

  hideLoading();
  toast("Guardado ✓", "success");
  if (final) openDetalle(S.inspId);
}

// ─── DETALLE ──────────────────────────────────────────────
async function openDetalle(inspId) {
  S.inspId = inspId;
  const insp = await DB.getInsp(inspId);
  if (!insp) return;
  S.tipologia = insp.tipologia;

  $("hdr-title").textContent = "Detalle";
  $("btn-back").classList.remove("hidden");
  $("btn-save").classList.add("hidden");

  txt("det-nombre", insp.establecimiento || "Sin nombre");
  txt("det-meta",   `${insp.localidad || ""} · ${insp.tipologia || ""}`);
  txt("det-exp",    insp.nro_expediente ? "Exp: " + insp.nro_expediente : "");
  $("det-badge").innerHTML = insp.estado === "Generada"
    ? `<span class="badge bg">Generada</span>`
    : `<span class="badge bb">Borrador</span>`;

  // Link acta
  const docBox = $("doc-box");
  if (insp.doc_url) {
    docBox.classList.remove("hidden");
    $("doc-link").href = insp.doc_url;
  } else {
    docBox.classList.add("hidden");
  }

  // Resumen de campos completados
  S.form = await DB.getFormData(inspId);
  const entries = Object.entries(S.form);
  const total   = entries.length;
  const si      = entries.filter(([,v]) => v === "SI").length;
  const no      = entries.filter(([,v]) => v === "NO").length;
  txt("det-resumen", `${total} campos · ✓ ${si} SI · ✗ ${no} NO`);

  nav("detalle");
}

async function generarActa() {
  if (!navigator.onLine) {
    toast("Necesitás conexión para generar el acta", "error");
    return;
  }
  if (!confirm("¿Generar acta? Se creará un Google Doc en Drive.")) return;

  showLoading("Generando acta...");
  try {
    // Asegurar que los datos estén en el servidor antes de generar
    await Api.guardarFormData(S.inspId, S.form);
    const r = await Api.generarActa(S.inspId);
    if (r.ok) {
      const insp = await DB.getInsp(S.inspId);
      if (insp) {
        insp.estado  = "Generada";
        insp.doc_url = r.docUrl;
        insp.doc_id  = r.docId;
        await DB.putInsp(insp);
      }
      $("doc-box").classList.remove("hidden");
      $("doc-link").href = r.docUrl;
      $("det-badge").innerHTML = `<span class="badge bg">Generada</span>`;
      hideLoading();
      toast("Acta generada ✓", "success");
    } else {
      hideLoading();
      toast("Error: " + (r.error || "desconocido"), "error");
    }
  } catch (e) {
    hideLoading();
    toast("Error al generar: " + e.message, "error");
  }
}

// ─── SYNC ─────────────────────────────────────────────────
function renderSyncBadge() {
  const b = $("sync-badge");
  if (!b) return;
  b.textContent = S.pendCount || "";
  b.classList.toggle("hidden", S.pendCount === 0);
}

async function autoSync() {
  const pends = await DB.getPendientes();
  if (!pends.length) return;
  txt("conn-dot", ""); // reset
  updateDot();
  $("conn-dot").className = "dot syncing";
  try {
    const synced = await Api.syncPendientes(pends, async id => {
      await DB.delPendiente(id);
      S.pendCount = Math.max(0, S.pendCount - 1);
      renderSyncBadge();
    });
    if (synced > 0) {
      toast(`✓ Sincronizados ${synced} registros`, "success");
      await pullInsp();
    }
  } catch { /* silencioso */ }
  updateDot();
}

// ─── BACK ─────────────────────────────────────────────────
function goBack() {
  if (_screen === "nueva" || _screen === "form" || _screen === "detalle") {
    showDashboard();
  }
}

// ─── Wire eventos ─────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  on("btn-login",   "click", doLogin);
  on("inp-dni",     "keydown", e => { if (e.key === "Enter") doLogin(); });
  on("btn-logout",  "click", doLogout);
  on("btn-back",    "click", goBack);
  on("btn-save",    "click", () => saveDraft(false));
  on("btn-nueva",   "click", showNueva);
  on("btn-crear",   "click", crearInspeccion);
  on("inp-buscar",  "input",  renderList);
  on("sel-estado",  "change", renderList);
  on("btn-sync",    "click", autoSync);
  on("btn-prev",    "click", () => goSec(S.secIdx - 1));
  on("btn-editar",  "click", openFormulario);
  on("btn-generar", "click", generarActa);
  init();
});
