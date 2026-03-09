
// db.js — IndexedDB wrapper (offline-first)
const DB_NAME = "insp_db", DB_VER = 1;
let _db = null;

async function openDB() {
  if (_db) return _db;
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("inspecciones")) {
        db.createObjectStore("inspecciones", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("formdata")) {
        const s = db.createObjectStore("formdata", { keyPath: ["inspId", "clave"] });
        s.createIndex("byInsp", "inspId");
      }
      if (!db.objectStoreNames.contains("pendientes")) {
        db.createObjectStore("pendientes", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("config")) {
        db.createObjectStore("config", { keyPath: "k" });
      }
    };
    req.onsuccess = e => { _db = e.target.result; res(_db); };
    req.onerror   = e => rej(e.target.error);
  });
}

function tx(store, mode, fn) {
  return openDB().then(db => new Promise((res, rej) => {
    const t = db.transaction(store, mode);
    const s = t.objectStore(store);
    const r = fn(s);
    if (r) {
      r.onsuccess = e => res(e.target.result);
      r.onerror   = e => rej(e.target.error);
    } else {
      t.oncomplete = () => res(true);
      t.onerror    = e => rej(e.target.error);
    }
  }));
}

function getAll(store, indexName, key) {
  return openDB().then(db => new Promise((res, rej) => {
    const t = db.transaction(store, "readonly");
    const s = t.objectStore(store);
    const r = indexName ? s.index(indexName).getAll(key) : s.getAll();
    r.onsuccess = e => res(e.target.result);
    r.onerror   = e => rej(e.target.error);
  }));
}

export const DB = {
  // Config / sesión
  getConfig: k        => tx("config", "readonly",  s => s.get(k)).then(r => r?.value ?? null),
  setConfig: (k, v)   => tx("config", "readwrite", s => s.put({ k, value: v })),
  delConfig: k        => tx("config", "readwrite", s => s.delete(k)),

  // Inspecciones
  getAllInsp: ()       => getAll("inspecciones").then(r => r.sort((a,b) => new Date(b.created_at) - new Date(a.created_at))),
  getInsp:   id       => tx("inspecciones", "readonly",  s => s.get(id)).then(r => r ?? null),
  putInsp:   insp     => tx("inspecciones", "readwrite", s => s.put(insp)),
  delInsp:   id       => tx("inspecciones", "readwrite", s => s.delete(id)),

  // FormData
  getFormData: async inspId => {
    const rows = await getAll("formdata", "byInsp", inspId);
    return Object.fromEntries(rows.map(r => [r.clave, r.valor]));
  },
  putFormData: async (inspId, map) => {
    const db = await openDB();
    await new Promise((res, rej) => {
      const t = db.transaction("formdata", "readwrite");
      const s = t.objectStore("formdata");
      for (const [clave, valor] of Object.entries(map)) {
        s.put({ inspId, clave, valor: valor == null ? "" : String(valor) });
      }
      t.oncomplete = () => res();
      t.onerror    = e => rej(e.target.error);
    });
  },

  // Pendientes
  getPendientes:   ()  => getAll("pendientes"),
  addPendiente:    op  => tx("pendientes", "readwrite", s => s.add({ ...op, ts: Date.now() })),
  delPendiente:    id  => tx("pendientes", "readwrite", s => s.delete(id)),
  clearPendientes: ()  => tx("pendientes", "readwrite", s => { s.clear(); return null; }),
};
