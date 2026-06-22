/* ============================================================
   PRESSINGSANA — API CLIENT (remplace le DB in-memory)
   Toutes les méthodes retournent des Promises
   ============================================================ */

const DB = (function () {

  // Collections en cache local (chargées au démarrage)
  let services   = [];
  let articles   = [];
  let forfaits   = [];
  let categories = [];
  let clients    = [];
  let orders     = [];
  let transactions = [];
  let stockZones = [];
  let promotions = [];
  let abonnements = [];

  /* ── UTILS ─────────────────────────────────────────────── */
  function toCamelCase(key) {
    return key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  function normalizeObject(value) {
    if (Array.isArray(value)) return value.map(normalizeObject);
    if (!value || typeof value !== 'object') return value;
    const normalized = {};
    Object.entries(value).forEach(([key, val]) => {
      normalized[toCamelCase(key)] = normalizeObject(val);
    });
    return normalized;
  }

  function normalizeResponse(data) {
    return normalizeObject(data);
  }

  async function api(method, path, body) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    const token = localStorage.getItem('pressingsana_token');
    if (token) {
      opts.headers.Authorization = 'Bearer ' + token;
    }
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(path, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur serveur');
    return normalizeResponse(data);
  }

  function find(collection, id) {
    return collection.find(x => x.id === id) || null;
  }

  function fmtFCFA(n) {
    if (n === null || n === undefined || n === '') return '—';
    return Number(n).toLocaleString('fr-FR') + ' FCFA';
  }

  function timeAgo(ts) {
    if (!ts) return '—';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60)    return "il y a moins d'une minute";
    if (diff < 3600)  return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
    return `il y a ${Math.floor(diff / 86400)} jour${Math.floor(diff / 86400) > 1 ? 's' : ''}`;
  }

  function fmtDate(ts) {
    if (!ts) return '—';
    return new Date(ts).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  /* ── CHARGEMENT INITIAL ─────────────────────────────────── */
  async function loadAll() {
    services    = normalizeResponse(await api('GET', '/api/services'));
    articles    = normalizeResponse(await api('GET', '/api/articles'));
    forfaits    = normalizeResponse(await api('GET', '/api/forfaits'));
    categories  = normalizeResponse(await api('GET', '/api/categories'));
    clients     = normalizeResponse(await api('GET', '/api/clients'));
    orders      = normalizeResponse(await api('GET', '/api/orders'));
    transactions = normalizeResponse(await api('GET', '/api/transactions'));
    stockZones  = normalizeResponse(await api('GET', '/api/zones'));
    promotions  = normalizeResponse(await api('GET', '/api/promotions'));
    abonnements = normalizeResponse(await api('GET', '/api/abonnements'));
  }

  /* ── SEARCH ─────────────────────────────────────────────── */
  async function search(q) {
    return api('GET', `/api/search?q=${encodeURIComponent(q)}`);
  }

  /* ── SERVICES ───────────────────────────────────────────── */
  async function createService(data) {
    const s = normalizeResponse(await api('POST', '/api/services', data));
    services.push(s); return s;
  }
  async function updateService(id, data) {
    const s = normalizeResponse(await api('PUT', `/api/services/${id}`, data));
    const idx = services.findIndex(x => x.id === id);
    if (idx >= 0) services[idx] = s; return s;
  }
  async function deleteService(id) {
    await api('DELETE', `/api/services/${id}`);
    services = services.filter(x => x.id !== id);
  }

  /* ── ARTICLES ───────────────────────────────────────────── */
  async function createArticle(data) {
    const a = normalizeResponse(await api('POST', '/api/articles', data));
    articles.push(a); return a;
  }
  async function updateArticle(id, data) {
    const a = normalizeResponse(await api('PUT', `/api/articles/${id}`, data));
    const idx = articles.findIndex(x => x.id === id);
    if (idx >= 0) articles[idx] = a; return a;
  }
  async function deleteArticle(id) {
    await api('DELETE', `/api/articles/${id}`);
    articles = articles.filter(x => x.id !== id);
  }

  /* ── CATEGORIES ─────────────────────────────────────────── */
  async function createCategory(data) {
    const c = await api('POST', '/api/categories', data);
    categories.push(c); return c;
  }
  async function deleteCategory(id) {
    await api('DELETE', `/api/categories/${id}`);
    categories = categories.filter(x => x.id !== id);
  }

  /* ── CLIENTS ────────────────────────────────────────────── */
  async function createClient(data) {
    const c = normalizeResponse(await api('POST', '/api/clients', data));
    clients.push(c); return c;
  }
  async function updateClient(id, data) {
    const c = normalizeResponse(await api('PUT', `/api/clients/${id}`, data));
    const idx = clients.findIndex(x => x.id === id);
    if (idx >= 0) clients[idx] = c; return c;
  }
  async function deleteClient(id) {
    await api('DELETE', `/api/clients/${id}`);
    clients = clients.filter(x => x.id !== id);
  }

  /* ── ORDERS ─────────────────────────────────────────────── */
  async function createOrder(data) {
    const o = normalizeResponse(await api('POST', '/api/orders', data));
    orders.unshift(o);
    // Update client cache
    const cl = clients.find(c => c.id === data.client_id);
    if (cl) {
      cl.ordersCount = (cl.ordersCount || 0) + 1;
      cl.totalSpent = (cl.totalSpent || 0) + o.total;
    }
    return o;
  }
  async function updateOrderStatus(id, status) {
    const o = normalizeResponse(await api('PUT', `/api/orders/${id}/status`, { status }));
    const idx = orders.findIndex(x => x.id === id);
    if (idx >= 0) {
      if (!o.items && orders[idx].items) o.items = orders[idx].items;
      orders[idx] = o;
    }
    return o;
  }
  async function deleteOrder(id) {
    await api('DELETE', `/api/orders/${id}`);
    orders = orders.filter(x => x.id !== id);
  }

  /* ── TRANSACTIONS ────────────────────────────────────────── */
  async function createTransaction(data) {
    const t = normalizeResponse(await api('POST', '/api/transactions', data));
    transactions.unshift(t); return t;
  }
  async function deleteTransaction(id) {
    await api('DELETE', `/api/transactions/${id}`);
    transactions = transactions.filter(x => x.id !== id);
  }

  /* ── FORFAITS ───────────────────────────────────────────── */
  async function createForfait(data) {
    const f = normalizeResponse(await api('POST', '/api/forfaits', data));
    forfaits.push(f); return f;
  }
  async function updateForfait(id, data) {
    const f = normalizeResponse(await api('PUT', `/api/forfaits/${id}`, data));
    const idx = forfaits.findIndex(x => x.id === id);
    if (idx >= 0) forfaits[idx] = f; return f;
  }
  async function deleteForfait(id) {
    await api('DELETE', `/api/forfaits/${id}`);
    forfaits = forfaits.filter(x => x.id !== id);
  }

  /* ── ABONNEMENTS ────────────────────────────────────────── */
  async function createAbonnement(data) {
    const a = await api('POST', '/api/abonnements', data);
    abonnements.push(a); return a;
  }
  async function deleteAbonnement(id) {
    await api('DELETE', `/api/abonnements/${id}`);
    abonnements = abonnements.filter(x => x.id !== id);
  }

  /* ── PROMOTIONS ─────────────────────────────────────────── */
  async function createPromotion(data) {
    const p = await api('POST', '/api/promotions', data);
    promotions.push(p); return p;
  }
  async function updatePromotion(id, data) {
    const p = await api('PUT', `/api/promotions/${id}`, data);
    const idx = promotions.findIndex(x => x.id === id);
    if (idx >= 0) promotions[idx] = p; return p;
  }
  async function deletePromotion(id) {
    await api('DELETE', `/api/promotions/${id}`);
    promotions = promotions.filter(x => x.id !== id);
  }

  /* ── STOCK ZONES ────────────────────────────────────────── */
  async function createStockZone(data) {
    const z = await api('POST', '/api/zones', data);
    stockZones.push(z); return z;
  }
  async function updateStockZone(id, data) {
    const z = await api('PUT', `/api/zones/${id}`, data);
    const idx = stockZones.findIndex(x => x.id === id);
    if (idx >= 0) stockZones[idx] = z; return z;
  }
  async function deleteStockZone(id) {
    await api('DELETE', `/api/zones/${id}`);
    stockZones = stockZones.filter(x => x.id !== id);
  }

  /* ── EXPORT PUBLIC ──────────────────────────────────────── */
  return {
    // Getters collections (accès lecture directe comme l'ancien DB.*)
    get services()    { return services; },
    get articles()    { return articles; },
    get forfaits()    { return forfaits; },
    get categories()  { return categories; },
    get clients()     { return clients; },
    get orders()      { return orders; },
    get stockZones()  { return stockZones; },
    get promotions()  { return promotions; },
    get abonnements() { return abonnements; },
    get transactions(){ return transactions; },

    // Méthodes utilitaires
    find, fmtFCFA, timeAgo, fmtDate, loadAll, search,

    // CRUD async
    createService, updateService, deleteService,
    createArticle, updateArticle, deleteArticle,
    createCategory, deleteCategory,
    createClient, updateClient, deleteClient,
    createOrder, updateOrderStatus, deleteOrder,
    createTransaction, deleteTransaction,
    createForfait, updateForfait, deleteForfait,
    createAbonnement, deleteAbonnement,
    createPromotion, updatePromotion, deletePromotion,
    createStockZone, updateStockZone, deleteStockZone,
  };
})();
