/* ============================================================
   PRESSINGSANA — BACKEND PATCH
   Ce fichier surcharge les fonctions in-memory du app.js
   original pour les connecter à l'API Node.js.
   Chargé APRÈS app.js.
   ============================================================ */

/* ── CAISSE : validateOrder réelle ─────────────────────────── */
Caisse.validateOrder = async function () {
  // accès aux vars privées via les méthodes exposées
  const cart = Caisse._cart;
  const selectedClient = Caisse._selectedClient;
  if (!cart || !cart.length) { UI.toast('Le panier est vide', true); return; }
  if (!selectedClient) { UI.toast('Veuillez sélectionner un client', true); return; }
  try {
    const rendezvousDateInput = document.getElementById('orderRendezvousDate')?.value;
    const rendezvousDate = rendezvousDateInput ? new Date(`${rendezvousDateInput}T00:00:00`).getTime() : null;
    const items = cart.map(i => ({
      name: i.name,
      qty: i.qty,
      unit_price: i.unitPrice
    }));
    const order = await DB.createOrder({
      client_id: selectedClient.id,
      client_name: selectedClient.name,
      items,
      rendezvous_date: rendezvousDate,
      rendezvousDate
    });
    Caisse._resetCart();
    SubSidebar.render('commandes');
    UI.toast(`Commande ${order.ref} créée !`);
    setTimeout(() => Router.go('order-detail', order.id), 600);
  } catch (e) { UI.toast(e.message, true); }
};

/* ── ORDERS : advanceStatus et deleteOrder réels ─────────────── */
OrdersView.advanceStatus = async function (orderId) {
  const flow = ['en_attente','collectee','en_cours','prete','livree'];
  const order = DB.find(DB.orders, orderId);
  if (!order) return;
  const idx = flow.indexOf(order.status);
  if (idx === -1 || idx === flow.length - 1) { UI.toast('Statut déjà final', true); return; }
  const next = flow[idx + 1];
  try {
    await DB.updateOrderStatus(orderId, next);
    SubSidebar.render('commandes');
    UI.toast(`→ ${next.replace('_',' ')}`);
    Router.go('order-detail', orderId);
  } catch (e) { UI.toast(e.message, true); }
};

OrdersView.deleteOrder = function (orderId) {
  UI.confirm('Supprimer cette commande ?', 'Cette action est irréversible.', async () => {
    try {
      await DB.deleteOrder(orderId);
      SubSidebar.render('commandes');
      UI.toast('Commande supprimée');
      Router.go('orders-list');
    } catch (e) { UI.toast(e.message, true); }
  });
};

/* ── ARTICLE FORM : submit réel ─────────────────────────────── */
ArticleForm.submit = async function (id) {
  const name  = document.getElementById('artName')?.value?.trim();
  const desc  = document.getElementById('artDesc')?.value?.trim();
  const aEl   = document.getElementById('artActiveToggle');
  const active = aEl ? aEl.dataset.on === 'true' : true;
  const icon  = ArticleForm._selectedIcon;
  if (!name) { UI.toast('Le nom est obligatoire', true); return; }
  if (!icon) { UI.toast("Choisissez une icône dans l'onglet Médias", true); ArticleForm.setTab('medias'); return; }
  const tariffs = (ArticleForm._tariffs || []).map(t => ({
    service_id: t.service_id || t.serviceId,
    unit_price: t.unit_price || t.unitPrice || 0,
    kg_price: t.kg_price || t.kgPrice || null,
    express_unit_impact: t.express_unit_impact || t.expressUnitImpact || null
  }));
  const data = { name, description: desc || '', active, icon, category: ArticleForm._selectedCategory, tariffs };
  try {
    if (id) {
      await DB.updateArticle(id, data);
      UI.showSuccess('Article modifié !', `"${name}" mis à jour.`, null, null);
    } else {
      const created = await DB.createArticle(data);
      UI.showSuccess('Article créé !', `"${name}" disponible.`, null, 'article-new');
    }
  } catch (e) { UI.toast(e.message, true); }
};

/* ── SERVICE FORM : submit réel ─────────────────────────────── */
ServiceForm.submitCreate = async function () {
  const name = document.getElementById('svcName')?.value?.trim();
  const desc = document.getElementById('svcDesc')?.value?.trim();
  const excl = document.getElementById('svcExclusivityLabel')?.textContent || 'Traitement';
  if (!name) { UI.toast('Le nom est obligatoire', true); return; }
  try {
    await DB.createService({ name, description: desc || '', exclusivity_group: excl, unit_price: 500, kg_pricing_enabled: false, kg_price: null, express_unit_impact: null, active: true });
    UI.showSuccess('Service créé !', `"${name}" disponible.`, null, 'service-new');
  } catch (e) { UI.toast(e.message, true); }
};

ServiceEdit.submit = async function (id) {
  const name       = document.getElementById('svcEditName')?.value?.trim();
  const desc       = document.getElementById('svcEditDesc')?.value?.trim();
  const unitPrice  = parseInt(document.getElementById('svcUnitPrice')?.value) || 0;
  const kgPrice    = parseInt(document.getElementById('svcKgPrice')?.value) || null;
  const expImpact  = parseInt(document.getElementById('svcExpressUnit')?.value) || null;
  const kgEl       = document.getElementById('svcKgEnabled');
  const kgEnabled  = kgEl && kgEl.style.borderColor.includes('218');
  if (!name) { UI.toast('Le nom est obligatoire', true); return; }
  try {
    const svc = DB.find(DB.services, id);
    await DB.updateService(id, {
      name, description: desc || '',
      exclusivity_group: svc?.exclusivity_group || 'Traitement',
      unit_price: unitPrice, kg_pricing_enabled: kgEnabled,
      kg_price: kgPrice, express_unit_impact: expImpact,
      active: svc?.active !== false
    });
    UI.showSuccess('Service modifié !', `"${name}" mis à jour.`, null, null);
  } catch (e) { UI.toast(e.message, true); }
};

/* ── FORFAIT FORM : submit réel ─────────────────────────────── */
ForfaitForm.submit = async function () {
  const name           = document.getElementById('fftName')?.value?.trim();
  const price          = parseInt(document.getElementById('fftPrice')?.value) || 0;
  const note           = document.getElementById('fftNote')?.value?.trim() || '';
  const validityDays   = parseInt(document.getElementById('fftValidity')?.value) || 30;
  const deliveryLimit  = parseInt(document.getElementById('fftDeliveryLimit')?.value) || null;
  const pickupLimit    = parseInt(document.getElementById('fftPickupLimit')?.value) || null;
  const quantityLimit  = parseInt(document.getElementById('fftQty')?.value) || 0;
  const aEl            = document.getElementById('fftActiveToggle');
  const active         = aEl ? aEl.dataset.on === 'true' : true;

  if (!name)  { UI.toast('Le nom est obligatoire', true); ForfaitForm.setTab('infos'); return; }
  if (!price) { UI.toast('Le prix est obligatoire', true); ForfaitForm.setTab('infos'); return; }
  if (!ForfaitForm._selectedArticleId) { UI.toast('Sélectionnez un article', true); ForfaitForm.setTab('article'); return; }
  if (!ForfaitForm._selectedServiceIds.length) { UI.toast('Sélectionnez au moins un service', true); ForfaitForm.setTab('article'); return; }
  if (!quantityLimit) { UI.toast('Limite de quantité obligatoire', true); ForfaitForm.setTab('article'); return; }

  try {
    const created = await DB.createForfait({
      name, active, price, note,
      validity_days: validityDays,
      quantity_limit: quantityLimit,
      delivery_limit: deliveryLimit,
      pickup_limit: pickupLimit,
      main_article_id: ForfaitForm._selectedArticleId,
      measure_type: ForfaitForm._measure || 'quantite',
      serviceIds: [...ForfaitForm._selectedServiceIds]
    });
    window._lastCreatedForfaitId = created.id;
    UI.showSuccess('Forfait créé !', `"${name}" disponible.`, 'forfait-details', 'forfait-new');
  } catch (e) { UI.toast(e.message, true); }
};

/* ── DETAILS VIEW : toggleActive et delete réels ─────────────── */
DetailsView.toggleForfaitActive = async function (id, toggleEl) {
  UI.flipToggle(toggleEl);
  const on = toggleEl.dataset.on === 'true';
  try {
    const f = DB.find(DB.forfaits, id);
    await DB.updateForfait(id, { ...f, serviceIds: f.serviceIds || [], active: on });
    UI.toast(on ? 'Forfait activé' : 'Forfait désactivé');
  } catch (e) { UI.toast(e.message, true); }
};

DetailsView.deleteForfait = function (id) {
  UI.confirm('Supprimer ce forfait ?', 'Les abonnements existants ne seront pas affectés.', async () => {
    try {
      await DB.deleteForfait(id);
      UI.toast('Forfait supprimé');
      Router.go('forfaits-list');
    } catch (e) { UI.toast(e.message, true); }
  });
};

/* ── LIST VIEW : deleteItem réel ─────────────────────────────── */
ListView.deleteItem = function (id, type) {
  UI.confirm('Supprimer cet élément ?', 'Cette action est irréversible.', async () => {
    try {
      if (type === 'articles' || type === 'article') await DB.deleteArticle(id);
      else if (type === 'services' || type === 'service') await DB.deleteService(id);
      else if (type === 'forfaits' || type === 'forfait') await DB.deleteForfait(id);
      if (type.includes('article')) ListView.mountArticles();
      else if (type.includes('service')) ListView.mountServices();
      else if (type.includes('forfait')) ListView.mountForfaits();
      UI.toast('Élément supprimé');
    } catch (e) { UI.toast(e.message, true); }
  });
};

/* ── CLIENTS VIEW : CRUD réel ────────────────────────────────── */
ClientsView.confirmAddClient = async function () {
  const name   = document.getElementById('newClientName')?.value?.trim();
  const phone  = document.getElementById('newClientPhone')?.value?.trim();
  const email  = document.getElementById('newClientEmail')?.value?.trim();
  const modal  = document.getElementById('addClientModal');
  const editId = modal?.dataset?.editId;
  if (!name || !phone) { UI.toast('Nom et téléphone obligatoires', true); return; }
  try {
    if (editId) {
      await DB.updateClient(editId, { name, phone, email: email || '' });
      UI.toast('Client modifié');
    } else {
      await DB.createClient({ name, phone, email: email || '' });
      UI.toast('Client ajouté');
    }
    Picker.close('addClientModal');
    ClientsView.render();
  } catch (e) { UI.toast(e.message, true); }
};

ClientsView.deleteClient = function (id) {
  UI.confirm('Supprimer ce client ?', "L'historique sera conservé.", async () => {
    try { await DB.deleteClient(id); UI.toast('Client supprimé'); ClientsView.render(); }
    catch (e) { UI.toast(e.message, true); }
  });
};

/* ── ABONNEMENTS VIEW : CRUD réel ───────────────────────────── */
AbonnementsView.confirmNew = async function () {
  const clientId  = document.getElementById('aboClientSel')?.value;
  const forfaitId = document.getElementById('aboForfaitSel')?.value;
  if (!clientId || !forfaitId) { UI.toast('Client et forfait obligatoires', true); return; }
  try {
    await DB.createAbonnement({ client_id: clientId, forfait_id: forfaitId });
    Picker.close('newAbonnementModal');
    UI.toast('Abonnement créé');
    AbonnementsView.mount();
  } catch (e) { UI.toast(e.message, true); }
};

AbonnementsView.deleteAbo = function (id) {
  UI.confirm('Supprimer cet abonnement ?', "Le client n'aura plus accès au forfait.", async () => {
    try { await DB.deleteAbonnement(id); UI.toast('Abonnement supprimé'); AbonnementsView.mount(); }
    catch (e) { UI.toast(e.message, true); }
  });
};

/* ── PROMOTIONS : CRUD réel ─────────────────────────────────── */
PromotionForm.submit = async function () {
  const name     = document.getElementById('promoName')?.value?.trim();
  const type     = document.getElementById('promoType')?.value || 'percent';
  const value    = parseInt(document.getElementById('promoValue')?.value) || 0;
  const expiresStr = document.getElementById('promoExpires')?.value;
  const expires_at = expiresStr ? new Date(expiresStr).getTime() : null;
  if (!name || !value) { UI.toast('Nom et valeur obligatoires', true); return; }
  try {
    await DB.createPromotion({ name, type, value, expires_at });
    UI.toast('Promotion créée');
    Router.go('promotions-list');
  } catch (e) { UI.toast(e.message, true); }
};

PromotionsView.toggle = async function (id, current) {
  try {
    const p = DB.find(DB.promotions, id);
    await DB.updatePromotion(id, { ...p, active: !current });
    PromotionsView.mount();
    UI.toast(!current ? 'Promotion activée' : 'Promotion désactivée');
  } catch (e) { UI.toast(e.message, true); }
};

PromotionsView.delete = function (id) {
  UI.confirm('Supprimer cette promotion ?', 'Cette action est irréversible.', async () => {
    try { await DB.deletePromotion(id); UI.toast('Promotion supprimée'); PromotionsView.mount(); }
    catch (e) { UI.toast(e.message, true); }
  });
};

/* ── ZONES VIEW : CRUD réel ─────────────────────────────────── */
ZonesView.openNew = function () {
  const name = prompt('Nom de la zone :');
  if (!name) return;
  const cap = parseInt(prompt('Capacité (articles) :', '100')) || 100;
  DB.createStockZone({ name, capacity: cap })
    .then(() => { UI.toast('Zone créée'); ZonesView.mount(); })
    .catch(e => UI.toast(e.message, true));
};

ZonesView.edit = function (id) {
  const z = DB.find(DB.stockZones, id);
  if (!z) return;
  const used = parseInt(prompt(`Articles dans "${z.name}" :`, z.used));
  if (isNaN(used)) return;
  DB.updateStockZone(id, { name: z.name, capacity: z.capacity, used })
    .then(() => { UI.toast('Zone mise à jour'); ZonesView.mount(); })
    .catch(e => UI.toast(e.message, true));
};

ZonesView.delete = function (id) {
  UI.confirm('Supprimer cette zone ?', 'Irréversible.', async () => {
    try { await DB.deleteStockZone(id); UI.toast('Zone supprimée'); ZonesView.mount(); }
    catch (e) { UI.toast(e.message, true); }
  });
};

/* ── CATEGORIES VIEW : CRUD réel ───────────────────────────── */
CategoriesView.openNew = function () {
  const name = prompt('Nom de la catégorie :');
  if (!name) return;
  DB.createCategory({ name, type: 'article' })
    .then(() => { UI.toast('Catégorie créée'); CategoriesView.mount(); })
    .catch(e => UI.toast(e.message, true));
};

CategoriesView.delete = function (id) {
  UI.confirm('Supprimer cette catégorie ?', 'Les articles associés ne seront pas supprimés.', async () => {
    try { await DB.deleteCategory(id); UI.toast('Catégorie supprimée'); CategoriesView.mount(); }
    catch (e) { UI.toast(e.message, true); }
  });
};

/* ── SETTINGS VIEW : load et save réels ────────────────────── */
SettingsView.mount = async function () {
  try {
    const settings = await fetch('/api/settings').then(r => r.json());
    ['org_name','org_phone','org_email','org_address','tva_rate'].forEach(k => {
      const el = document.getElementById('set_' + k);
      if (el) el.value = settings[k] || '';
    });
  } catch (e) { console.error('Settings load error:', e); }
};

SettingsView.save = async function () {
  const data = {};
  ['org_name','org_phone','org_email','org_address','tva_rate'].forEach(k => {
    const el = document.getElementById('set_' + k);
    if (el) data[k] = el.value;
  });
  try {
    await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    UI.toast('Paramètres enregistrés');
  } catch (e) { UI.toast(e.message, true); }
};

/* ── ADMIN VIEW : users et activity réels ───────────────────── */
AdminView.mount = async function () {
  try {
    const [users, activity] = await Promise.all([
      fetch('/api/users').then(r => r.json()),
      fetch('/api/activity').then(r => r.json())
    ]);
      AdminView.users = users;
    const usersEl = document.getElementById('usersListEl');
    if (usersEl) {
      usersEl.innerHTML = users.map(u => `
        <div class="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-accent2 text-[10px] font-semibold">${initials(u.name)}</div>
            <div>
              <div class="text-white text-[12.5px]">${esc(u.name)}</div>
              <div class="text-white/40 text-[10px]">${esc(u.email)} · ${esc(u.role)}</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="AdminView.editUser('${u.id}')" class="text-white/30 hover:text-accent2 text-[11px]"><i class="bi bi-pencil"></i></button>
            ${u.role !== 'admin' ? `<button onclick="AdminView.deleteUser('${u.id}')" class="text-white/30 hover:text-rose-400 text-[11px]"><i class="bi bi-trash"></i></button>` : '<span class="text-white/20 text-[10px]">Admin</span>'}
          </div>
        </div>`).join('');
    }
    const actEl = document.getElementById('activityLogEl');
    if (actEl && activity.length) {
      actEl.innerHTML = activity.slice(0, 10).map(a =>
        `<div class="flex items-center gap-2 text-white/50 text-[11.5px] py-1.5 border-b border-white/5 last:border-0">
          <i class="bi bi-dot text-accent2 text-lg leading-none"></i>
          <span>${esc(a.user_name || 'Système')} ${esc(a.action || '')} <span class="text-white/25">— ${DB.timeAgo(a.created_at)}</span></span>
        </div>`).join('');
    } else if (actEl) {
      actEl.innerHTML = '<p class="text-white/30 text-[12px] py-4 text-center">Aucune activité enregistrée</p>';
    }
  } catch (e) { console.error('Admin mount error:', e); }
};

AdminView.openInvite = function () {
  const name  = prompt('Nom complet :');
  if (!name) return;
  const email = prompt('Adresse email :');
  if (!email) return;
  const role  = prompt('Rôle (admin / caissier / logisticien) :', 'caissier') || 'caissier';
  const password = prompt('Mot de passe temporaire :', 'password123') || 'password123';
  fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, role, password }) })
    .then(r => r.json())
    .then(u => { if (u.error) throw new Error(u.error); UI.toast(`Utilisateur créé · MDP: ${password}`); AdminView.mount(); })
    .catch(e => UI.toast(e.message, true));
};

AdminView.editUser = function (id) {
  const user = AdminView.users?.find(u => u.id === id);
  if (!user) return;
  const name = prompt('Nom complet :', user.name);
  if (!name) return;
  const email = prompt('Adresse email :', user.email);
  if (!email) return;
  const role = prompt('Rôle (admin / caissier / logisticien) :', user.role || 'caissier') || 'caissier';
  const password = prompt('Nouveau mot de passe (laisser vide pour conserver le mot de passe actuel) :', '');
  const payload = { name, email, role };
  if (password) payload.password = password;
  fetch(`/api/users/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    .then(r => r.json())
    .then(u => { if (u.error) throw new Error(u.error); UI.toast('Utilisateur mis à jour'); AdminView.mount(); })
    .catch(e => UI.toast(e.message, true));
};

AdminView.deleteUser = function (id) {
  UI.confirm('Supprimer cet utilisateur ?', 'Irréversible.', async () => {
    try {
      const r = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      UI.toast('Utilisateur supprimé');
      AdminView.mount();
    } catch (e) { UI.toast(e.message, true); }
  });
};

/* ── DASHBOARD VIEW : stats réelles ─────────────────────────── */
DashboardView.mount = async function () {
  try {
    const data = await fetch('/api/dashboard').then(r => r.json());
    // Cartes statistiques
    const map = {
      'revenue':    el => el.textContent = DB.fmtFCFA(data.totalRevenue),
      'pending':    el => el.textContent = data.pending,
      'inProgress': el => el.textContent = data.inProgress,
      'ready':      el => el.textContent = data.ready,
      'collected':  el => el.textContent = data.collected,
      'delivered':  el => el.textContent = data.delivered,
      'unpaid':     el => el.textContent = data.unpaid,
      'clients':    el => el.textContent = data.clientCount,
      'orders':     el => el.textContent = data.totalOrders,
    };
    document.querySelectorAll('[data-dash]').forEach(el => {
      const fn = map[el.dataset.dash];
      if (fn) fn(el);
    });
    // Top articles
    const topEl = document.getElementById('topArticlesEl');
    if (topEl && data.topArticles && data.topArticles.length) {
      const max = data.topArticles[0]?.total || 1;
      topEl.innerHTML = data.topArticles.map(a => `
        <div>
          <div class="flex items-center justify-between text-[11.5px] mb-1">
            <span class="text-white/70">${esc(a.name)}</span>
            <span class="text-white/40">${a.total}</span>
          </div>
          <div class="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-accent to-accent2 rounded-full" style="width:${Math.round(a.total/max*100)}%"></div>
          </div>
        </div>`).join('');
    }
    // Commandes récentes
    const recentEl = document.getElementById('recentOrdersEl');
    if (recentEl && data.recentOrders && data.recentOrders.length) {
      recentEl.innerHTML = data.recentOrders.map(o => `
        <div onclick="Router.go('order-detail','${o.id}')" class="flex items-center gap-3 px-3.5 py-2.5 hover:bg-white/[0.03] cursor-pointer transition border-b border-white/5 last:border-0">
          <div class="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center shrink-0 text-accent2 text-[9px] font-semibold">${initials(o.client_name)}</div>
          <div class="flex-1 min-w-0">
            <div class="text-white text-[12px] font-medium">${esc(o.ref)}</div>
            <div class="text-white/35 text-[10.5px] truncate">${esc(o.client_name)}</div>
          </div>
          <div class="text-right shrink-0">
            <div class="text-white text-[12px]">${DB.fmtFCFA(o.total)}</div>
            ${statusBadge(o.status)}
          </div>
        </div>`).join('');
    }
  } catch (e) { console.error('Dashboard error:', e); }
};

/* ── RECHERCHE GLOBALE : via API ────────────────────────────── */
window.runGlobalSearch = async function () {
  const q   = document.getElementById('globalSearchInput')?.value?.trim();
  const res = document.getElementById('globalSearchResults');
  if (!q || q.length < 2) { res.innerHTML = ''; return; }
  clearTimeout(window._searchTimeout);
  window._searchTimeout = setTimeout(async () => {
    try {
      const data = await DB.search(q);
      const results = [];
      (data.orders || []).forEach(o => results.push(
        `<div onclick="Router.go('order-detail','${o.id}');closeSearch()" class="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-white/5">
          <i class="bi bi-receipt text-accent2 text-[13px]"></i>
          <div><div class="text-white text-[12.5px]">${esc(o.ref)} — ${esc(o.client_name)}</div><div class="text-white/30 text-[10.5px]">${DB.fmtFCFA(o.total)}</div></div>
        </div>`));
      (data.clients || []).forEach(c => results.push(
        `<div onclick="Router.go('clients-list');closeSearch()" class="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-white/5">
          <i class="bi bi-person-fill text-accent2 text-[13px]"></i>
          <div><div class="text-white text-[12.5px]">${esc(c.name)}</div><div class="text-white/30 text-[10.5px]">${c.phone}</div></div>
        </div>`));
      (data.articles || []).forEach(a => results.push(
        `<div onclick="Router.go('articles-list');closeSearch()" class="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-white/5">
          <i class="bi ${a.icon || 'bi-handbag'} text-accent2 text-[13px]"></i>
          <div><div class="text-white text-[12.5px]">${esc(a.name)}</div><div class="text-white/30 text-[10.5px]">Article</div></div>
        </div>`));
      res.innerHTML = results.length
        ? results.join('')
        : `<div class="text-center py-8 text-white/30 text-[12px]">Aucun résultat pour "${esc(q)}"</div>`;
    } catch (e) { res.innerHTML = '<div class="text-center py-8 text-rose-400 text-[12px]">Erreur de recherche</div>'; }
  }, 300);
};

/* ── BOOT : remplace le DOMContentLoaded original ──────────── */
// Surcharge du boot pour loader les données réelles
(function () {
  // Annule l'ancien listener en redéfinissant juste après son exécution
  // (les deux coexistent, mais celui-ci s'exécute après)
  window.addEventListener('DOMContentLoaded', async () => {
    // L'ancien boot a déjà tourné (renderMainNav, initModals)
    // On lui laisse juste le chargement des données
  });
})();
