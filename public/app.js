/* ============================================================
   PRESSINGSANA — APP LOGIC (app.js)
   ============================================================ */

// ---------------------------------------------------------------
// NAV CONFIG
// ---------------------------------------------------------------
const NAV_SECTIONS = [
  { key:'dashboard',   label:'Tableau d...', fullLabel:'Tableau de bord', icon:'bi-grid-1x2-fill',     defaultRoute:'dashboard' },
  { key:'commandes',   label:'Commandes',    fullLabel:'Commandes',        icon:'bi-receipt',            defaultRoute:'caisse' },
  { key:'logistique',  label:'Logistique',   fullLabel:'Logistique',       icon:'bi-truck',              defaultRoute:'logistique' },
  { key:'abonnements', label:'Abonnem...',   fullLabel:'Abonnements',      icon:'bi-arrow-repeat',       defaultRoute:'abonnements' },
  { key:'compta',      label:'Comptabilité', fullLabel:'Comptabilité',     icon:'bi-journal-text',       defaultRoute:'comptabilite' },
  { key:'clients',     label:'Clients',      fullLabel:'Clients',          icon:'bi-person-fill',        defaultRoute:'clients-list' },
  { key:'parametres',  label:'Paramètres',   fullLabel:'Paramètres',       icon:'bi-gear-fill',          defaultRoute:'articles-list' },
  { key:'admin',       label:'Administr...', fullLabel:'Administration',   icon:'bi-shield-fill-check',  defaultRoute:'admin' },
];

// ---------------------------------------------------------------
// ROUTES
// ---------------------------------------------------------------
const ROUTES = {
  'dashboard':     { section:'dashboard',   title:'Tableau de bord',       crumb:'Accueil',                                  topbtn:null,     render:()=>Views.dashboard() },
  'caisse':        { section:'commandes',   title:'Caisse',                crumb:'Accueil > Commandes > Caisse',             topbtn:null,     render:()=>Views.caisse(),          after:()=>Caisse.mount() },
  'orders-list':   { section:'commandes',   title:'Toutes les commandes',  crumb:'Accueil > Commandes > Toutes',            topbtn:null,     render:()=>Views.ordersList(),      after:()=>OrdersView.mount() },
  'order-detail':  { section:'commandes',   title:'Détail commande',       crumb:'Accueil > Commandes > Détail',            topbtn:null,     render:(id)=>{ const o=DB.find(DB.orders,id); return o?Views.orderDetail(o):Views.empty('Commande introuvable.'); } },
  'logistique':    { section:'logistique',  title:'Logistique',            crumb:'Accueil > Logistique',                    topbtn:null,     render:()=>Views.logistique() },
  'abonnements':   { section:'abonnements', title:'Abonnements',           crumb:'Accueil > Abonnements',                   topbtn:null,     render:()=>Views.abonnements(), after:()=>AbonnementsView.mount() },
  'promotions-list':{ section:'parametres', title:'Promotions',            crumb:'Accueil > Paramètres > Promotions',      topbtn:null,     render:()=>Views.promotions(),  after:()=>PromotionsView.mount() },
  'promotion-new': { section:'parametres', title:'Nouvelle promotion',     crumb:'Accueil > Paramètres > Promotions > Nouveau', topbtn:null, render:()=>Views.promotionForm() },
  'categories-list':{ section:'parametres', title:'Catégories',           crumb:'Accueil > Paramètres > Catégories',      topbtn:null,     render:()=>Views.categoriesList(), after:()=>CategoriesView.mount() },
  'zones-list':    { section:'parametres', title:'Zones de stockage',     crumb:'Accueil > Paramètres > Zones de stockage',topbtn:null,     render:()=>Views.zonesList(),      after:()=>ZonesView.mount() },
  'settings':      { section:'parametres', title:'Paramètres',            crumb:'Accueil > Paramètres > Paramètres',      topbtn:null,     render:()=>Views.settings(),     after:()=>SettingsView.mount() },
  'templates':     { section:'parametres', title:'Modèles',               crumb:'Accueil > Paramètres > Modèles',         topbtn:null,     render:()=>Views.templates(), after:()=>TemplatesView.mount() },
  'comptabilite':            { section:'compta', title:'Journal comptable', crumb:'Accueil > Comptabilité > Journal',  topbtn:null, render:()=>Views.comptabilite(), after:()=>ComptabiliteView.mount() },
  'comptabilite-expenses':   { section:'compta', title:'Dépenses',          crumb:'Accueil > Comptabilité > Dépenses', topbtn:'add', render:()=>Views.comptabilite(), after:()=>ComptabiliteView.mount() },
  'comptabilite-credits':    { section:'compta', title:'Crédits',           crumb:'Accueil > Comptabilité > Crédits',  topbtn:'add', render:()=>Views.comptabilite(), after:()=>ComptabiliteView.mount() },
  'clients-list':  { section:'clients',     title:'Clients',               crumb:'Accueil > Clients',                       topbtn:null,     render:()=>Views.clientsList(),     after:()=>ClientsView.mount() },
  'articles-list': { section:'parametres',  title:'Tous les articles',     crumb:'Accueil > Paramètres > Articles',         topbtn:'add',    render:()=>Views.genericList({}),   after:()=>ListView.mountArticles() },
  'article-new':   { section:'parametres',  title:'Nouvel article',        crumb:'Accueil > Paramètres > Articles > Nouveau',topbtn:'add',   render:()=>wrapFormTitle('Créer un nouvel article')+Views.articleForm(null), after:()=>ArticleForm.mount(null) },
  'article-edit':  { section:'parametres',  title:"Modifier l'article",    crumb:'Accueil > Paramètres > Articles > Modifier',topbtn:'add',  render:(id)=>{ const a=DB.find(DB.articles,id); return wrapFormTitle("Modifier l'article")+Views.articleForm(a); }, after:(id)=>ArticleForm.mount(DB.find(DB.articles,id)) },
  'services-list': { section:'parametres',  title:'Tous les services',     crumb:'Accueil > Paramètres > Services',         topbtn:'add',    render:()=>Views.genericList({}),   after:()=>ListView.mountServices() },
  'service-new':   { section:'parametres',  title:'Nouveau service',       crumb:'Accueil > Paramètres > Services > Nouveau',topbtn:'add',   render:()=>wrapFormTitle('Créer un nouveau service')+Views.serviceFormCreate(), after:()=>ServiceForm.mount() },
  'service-edit':  { section:'parametres',  title:'Modifier le service',   crumb:'Accueil > Paramètres > Services > Modifier',topbtn:'add',  render:(id)=>{ const s=DB.find(DB.services,id); return wrapFormTitle('Modifier le service')+Views.serviceFormEdit(s); }, after:(id)=>ServiceEdit.mount(DB.find(DB.services,id)) },
  'forfaits-list': { section:'parametres',  title:'Tous les forfaits',     crumb:'Accueil > Paramètres > Forfaits',         topbtn:'add',    render:()=>Views.genericList({}),   after:()=>ListView.mountForfaits() },
  'forfait-new':   { section:'parametres',  title:'Nouveau forfait',       crumb:'Accueil > Paramètres > Forfaits > Nouveau',topbtn:'add',   render:()=>wrapFormTitle('Créer un nouveau forfait')+Views.forfaitForm(), after:()=>ForfaitForm.mount() },
  'forfait-details':{ section:'parametres', title:'Détails du forfait',    crumb:'Accueil > Paramètres > Forfaits > Détails',topbtn:'add',   render:(id)=>{ const f=DB.find(DB.forfaits,id); return f?Views.forfaitDetails(f):Views.empty('Forfait introuvable.'); }, after:()=>DetailsView.mount() },
  'admin':         { section:'admin',       title:'Administration',        crumb:'Accueil > Administration',                topbtn:null,     render:()=>Views.admin(), after:()=>AdminView.mount() },
  'account':       { section:null,          title:'Mon compte',            crumb:'Accueil > Compte',                        topbtn:null,     render:()=>Views.account(), after:()=>AccountView.mount() },
  'login':         { section:null,          title:'Connexion',             crumb:'',                                       topbtn:null,     render:()=>Views.login() },
};

function wrapFormTitle(t){ return `<h2 class="text-white text-[17px] font-semibold mb-3">${t}</h2>`; }

// BREADCRUMB MAPPER: Maps breadcrumb patterns to routes
const BREADCRUMB_MAP = {
  'Accueil': 'dashboard',
  'Accueil|Commandes': 'orders-list',
  'Accueil|Commandes|Caisse': 'caisse',
  'Accueil|Logistique': 'logistique',
  'Accueil|Abonnements': 'abonnements',
  'Accueil|Comptabilité|Journal': 'comptabilite',
  'Accueil|Comptabilité|Dépenses': 'comptabilite-expenses',
  'Accueil|Comptabilité|Crédits': 'comptabilite-credits',
  'Accueil|Clients': 'clients-list',
  'Accueil|Paramètres|Articles': 'articles-list',
  'Accueil|Paramètres|Services': 'services-list',
  'Accueil|Paramètres|Forfaits': 'forfaits-list',
  'Accueil|Paramètres|Promotions': 'promotions-list',
  'Accueil|Paramètres|Catégories': 'categories-list',
  'Accueil|Paramètres|Zones de stockage': 'zones-list',
  'Accueil|Paramètres|Paramètres': 'settings',
  'Accueil|Paramètres|Modèles': 'templates',
  'Accueil|Administration': 'admin',
  'Accueil|Compte': 'account',
};

function renderBreadcrumb(crumbStr){
  if(!crumbStr) return '';
  const parts = crumbStr.split(' > ');
  const html = parts.map((part, i) => {
    // Build the key for this breadcrumb level
    const pathKey = parts.slice(0, i+1).join('|');
    const route = BREADCRUMB_MAP[pathKey];
    
    // Last item is not clickable
    if(i === parts.length - 1){
      return `<span class="text-white/35">${part}</span>`;
    }
    
    // Make intermediate items clickable
    if(route){
      return `<button onclick="Router.go('${route}')" class="text-white/50 hover:text-accent transition font-medium">${part}</button>`;
    } else {
      return `<span class="text-white/35">${part}</span>`;
    }
  }).join('<span class="text-white/25 mx-1">/</span>');
  
  return html;
}

const PUBLIC_ROUTES = ['login'];

const Auth = (function(){
  let _user = null;

  function getToken(){ return localStorage.getItem('pressingsana_token'); }
  async function load(){
    const token = getToken();
    if(!token) return null;
    try {
      const res = await fetch('/api/me', { headers: { 'Authorization': 'Bearer ' + token } });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error || 'Session invalide');
      _user = { ...data, token };
      return _user;
    } catch (e) {
      logout();
      return null;
    }
  }

  async function login(email, password){
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.error || 'Échec de la connexion');
    if(!data.token) throw new Error('Jeton manquant');
    _user = { ...data };
    localStorage.setItem('pressingsana_token', data.token);
    return _user;
  }

  function logout(){
    _user = null;
    localStorage.removeItem('pressingsana_token');
    Router.go('login');
  }

  function isAdmin(){ return _user?.role === 'admin'; }
  function isAuthenticated(){ return !!_user; }
  function user(){ return _user; }

  async function performLogin(){
    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    if(!email || !password){ UI.toast('Email et mot de passe requis', true); return; }
    try {
      await login(email, password);
      UI.toast('Connexion réussie');
      await DB.loadAll();
      Router.go('dashboard');
    } catch (e) {
      UI.toast(e.message, true);
    }
  }

  return { load, login, logout, isAdmin, isAuthenticated, user, performLogin };
})();

// Comptabilité is rendered through ComptabiliteView directly

// ---------------------------------------------------------------
// ROUTER
// ---------------------------------------------------------------
const Router = (function(){
  let current = { route:'dashboard', param:null };
  const history = [];

  function go(route, param){
    if(route === 'login' && Auth.isAuthenticated()) {
      route = 'dashboard';
      param = null;
    }
    if(route !== 'login' && !Auth.isAuthenticated()) {
      route = 'login';
      param = null;
    }
    if(route === 'admin' && Auth.isAuthenticated() && !Auth.isAdmin()) {
      UI.toast('Accès réservé aux administrateurs', true);
      route = 'dashboard';
      param = null;
    }

    history.push({...current});
    if(history.length>40) history.shift();
    current = {route, param};
    render();
  }

  function back(){
    if(!history.length) return;
    current = history.pop();
    render(false);
  }

  function render(scrollTop=true){
    const def = ROUTES[current.route];
    if(!def){ console.warn('Route inconnue:', current.route); return; }

    setActiveSection(def.section);
    SubSidebar.render(def.section, current.route);

    document.getElementById('pageTitle').textContent = def.title;
    document.getElementById('pageBreadcrumb').innerHTML = renderBreadcrumb(def.crumb)||'';
    renderTopBtn(def.topbtn);

    const vp = document.getElementById('viewport');
    vp.innerHTML = def.render(current.param);
    if(scrollTop) vp.scrollTop=0;
    if(def.after) def.after(current.param);

    closeMobileNavIfOpen();
  }

  function renderTopBtn(kind){
    const btn = document.getElementById('topRightBtn');
    if(kind==='add'){
      btn.classList.remove('hidden');
      btn.innerHTML = '<i class="bi bi-plus-lg text-[11px]"></i> Ajouter';
      btn.onclick = ()=>{
        const r = current.route;
        if(r==='articles-list'||r==='article-new'||r==='article-edit') Router.go('article-new');
        else if(r==='services-list'||r==='service-new'||r==='service-edit') Router.go('service-new');
        else Router.go('forfait-new');
      };
    } else if(kind==='add'){
      btn.classList.remove('hidden');
      btn.innerHTML = '<i class="bi bi-plus-lg text-[11px]"></i> Ajouter';
      btn.onclick = ()=>{
        const r = current.route;
        if(r==='articles-list'||r==='article-new'||r==='article-edit') Router.go('article-new');
        else if(r==='services-list'||r==='service-new'||r==='service-edit') Router.go('service-new');
        else if(r==='comptabilite-expenses') ComptabiliteView.openExpenseModal();
        else if(r==='comptabilite-credits') ComptabiliteView.openCreditModal();
        else if(r==='forfaits-list'||r==='forfait-new'||r==='forfait-details') Router.go('forfait-new');
        else btn.classList.add('hidden');
      };
    } else {
      btn.classList.add('hidden');
    }
  }

  function setActiveSection(key){
    document.querySelectorAll('[data-navkey]').forEach(el=>{
      const active = el.dataset.navkey===key;
      el.style.background = active ? 'rgba(77,187,248,0.15)' : '';
      el.style.color = active ? '#70D4FF' : 'rgba(255,255,255,0.45)';
    });
  }

  return { go, back, render, get current(){ return current; } };
})();

// ---------------------------------------------------------------
// SUB-SIDEBAR
// ---------------------------------------------------------------
const SubSidebar = (function(){
  function link(route, icon, label){
    const active = Router.current.route===route;
    const ac = active ? 'style="background:rgba(77,187,248,0.15);color:#70D4FF"' : 'style="color:rgba(255,255,255,0.55)"';
    return `<a onclick="Router.go('${route}')" ${ac} class="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition text-[11.5px] hover:bg-white/5 hover:text-white"><i class="bi ${icon} text-[12px]"></i> ${label}</a>`;
  }
  function group(t){
    return `<div class="px-3.5 pt-3 pb-1.5 text-white/30 text-[10px] font-semibold uppercase tracking-wide">${t}</div>`;
  }
  function countLink(route, icon, label, count){
    const active = Router.current.route===route;
    const ac = active ? 'style="background:rgba(77,187,248,0.15);color:#70D4FF"' : 'style="color:rgba(255,255,255,0.55)"';
    return `<a onclick="Router.go('${route}')" ${ac} class="flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition text-[11.5px] hover:bg-white/5 hover:text-white"><span class="flex items-center gap-2"><i class="bi ${icon} text-[12px]"></i> ${label}</span><span style="color:rgba(255,255,255,0.25)">${count}</span></a>`;
  }
  function ghostLink(label, icon){
    return `<a onclick="UI.toast('Non simulé dans ce prototype')" class="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition text-[11.5px] hover:bg-white/5 hover:text-white" style="color:rgba(255,255,255,0.55)"><i class="bi ${icon} text-[12px]"></i> ${label}</a>`;
  }

  const builders = {
    dashboard: ()=>`
      <div class="px-1.5 pt-2">${link('dashboard','bi-grid-1x2-fill',"Vue d'ensemble")}</div>
      ${group('Raccourcis')}
      <div class="px-1.5 pb-2">
        ${link('caisse','bi-cash-register','Ouvrir la caisse')}
        ${link('orders-list','bi-receipt','Commandes')}
        ${link('clients-list','bi-person-fill','Clients')}
      </div>`,

    commandes: ()=>`
      <div class="px-1.5 pt-2">${link('caisse','bi-cash-register','Caisse')}</div>
      <div class="px-1.5 pt-1">${countLink('orders-list','bi-list-ul','Toutes les commandes',DB.orders.length)}</div>
      ${group('Segments')}
      <div class="px-1.5">
        ${countLink('orders-list','bi-hourglass-split','En attente',DB.orders.filter(o=>o.status==='en_attente').length)}
        ${countLink('orders-list','bi-box-seam','Collectées',DB.orders.filter(o=>o.status==='collectee').length)}
        ${countLink('orders-list','bi-arrow-repeat','En cours',DB.orders.filter(o=>o.status==='en_cours').length)}
        ${countLink('orders-list','bi-check2','Prêtes',DB.orders.filter(o=>o.status==='prete').length)}
        ${countLink('orders-list','bi-truck','Livrées',DB.orders.filter(o=>o.status==='livree').length)}
      </div>
      ${group('Finance')}
      <div class="px-1.5 pb-2">
        ${countLink('orders-list','bi-exclamation-circle','Impayées',DB.orders.filter(o=>o.status==='impayee').length)}
        ${countLink('orders-list','bi-check-circle','Payées',DB.orders.filter(o=>o.status==='livree'||o.status==='prete').length)}
      </div>`,

    logistique: ()=>`
      <div class="px-1.5 pt-2 pb-2">
        ${link('logistique','bi-truck',"Vue d'ensemble")}
        ${link('logistique','bi-geo-alt','Zones de stockage')}
      </div>`,

    abonnements: ()=>`
      <div class="px-1.5 pt-2 pb-2">
        ${link('abonnements','bi-arrow-repeat','Tous les abonnements')}
        ${link('forfaits-list','bi-box2-heart','Forfaits disponibles')}
      </div>`,

    compta: ()=>`
      <div class="px-1.5 pt-2 pb-2">
        ${link('comptabilite','bi-journal-text','Journal')}
        ${link('comptabilite-expenses','bi-wallet2','Dépenses')}
        ${link('comptabilite-credits','bi-bank2','Crédits')}
      </div>`,

    clients: ()=>`
      <div class="px-1.5 pt-2 pb-2">${link('clients-list','bi-person-fill','Tous les clients')}</div>`,

    admin: ()=>`
      <div class="px-1.5 pt-2 pb-2">${link('admin','bi-shield-fill-check',"Vue d'ensemble")}</div>`,

    parametres: ()=>`
      ${group('Organisation')}
      <div class="px-1.5">${link('settings','bi-building','Infos organisation')}</div>
      ${group('Facturation')}
      <div class="px-1.5">
        ${link('settings','bi-receipt-cutoff','Taxes')}
        ${link('settings','bi-bank','Fournisseur fiscal')}
        ${link('settings','bi-sliders2','Configuration')}
      </div>
      ${group('Services')}
      <div class="px-1.5">
        ${link('services-list','bi-grid','Tous les services')}
        ${link('service-new','bi-plus-lg','Ajouter un service')}
      </div>
      ${group('Articles')}
      <div class="px-1.5">
        ${link('articles-list','bi-grid','Tous les articles')}
        ${link('article-new','bi-plus-lg','Ajouter un article')}
      </div>
      ${group('Catégories')}
      <div class="px-1.5">
        ${link('categories-list','bi-grid','Toutes les catégories')}
        <a onclick="CategoriesView.openNew()" class="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition text-[11.5px] hover:bg-white/5 hover:text-white" style="color:rgba(255,255,255,0.55)"><i class="bi bi-plus-lg text-[12px]"></i> Ajouter une catégorie</a>
      </div>
      ${group('Forfaits')}
      <div class="px-1.5">
        ${link('forfaits-list','bi-grid','Tous les forfaits')}
        ${link('forfait-new','bi-plus-lg','Ajouter un forfait')}
      </div>
      ${group('Promotions')}
      <div class="px-1.5">
        ${link('promotions-list','bi-percent','Toutes les promotions')}
        ${link('promotion-new','bi-plus-lg','Ajouter une promotion')}
      </div>
      ${group('Zones de stockage')}
      <div class="px-1.5">
        ${link('zones-list','bi-geo-alt','Toutes les zones')}
        <a onclick="ZonesView.openNew()" class="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition text-[11.5px] hover:bg-white/5 hover:text-white" style="color:rgba(255,255,255,0.55)"><i class="bi bi-plus-lg text-[12px]"></i> Ajouter une zone</a>
      </div>
      ${group('Communications')}
      <div class="px-1.5 pb-2">${link('templates','bi-chat-dots','Tous les modèles')}</div>`,
  };

  function render(sectionKey){
    const body = document.getElementById('subSidebarBody');
    const builder = builders[sectionKey];
    body.innerHTML = builder ? builder() : `<div class="flex flex-col items-center justify-center text-center py-14 px-4 gap-2"><i class="bi bi-cone-striped text-2xl" style="color:rgba(255,255,255,0.15)"></i><p class="text-[11px]" style="color:rgba(255,255,255,0.3)">Aucun sous-menu.</p></div>`;
    const mobileBody = document.getElementById('mobileSubNav');
    mobileBody.innerHTML = builder ? builder() : '';
  }

  return { render };
})();

// ---------------------------------------------------------------
// MAIN NAV RENDER
// ---------------------------------------------------------------
function renderMainNav(){
  const nav = document.getElementById('mainNav');
  nav.innerHTML = NAV_SECTIONS.map(s=>`
    <button onclick="navigateSection('${s.key}')" data-navkey="${s.key}"
      class="group flex flex-col items-center gap-1 w-[64px] py-2.5 rounded-lg hover:text-white transition"
      style="color:rgba(255,255,255,0.45)">
      <i class="bi ${s.icon} text-base"></i>
      <span class="text-[9.5px] leading-tight text-center">${s.label}</span>
    </button>
  `).join('');

  const mobileNav = document.getElementById('mobileMainNav');
  mobileNav.innerHTML = NAV_SECTIONS.map(s=>`
    <button onclick="navigateSection('${s.key}')" data-navkey-mobile="${s.key}"
      class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition text-[13px]">
      <i class="bi ${s.icon} text-[15px] w-5"></i> ${s.fullLabel}
    </button>
  `).join('');
}

function navigateSection(key){
  const s = NAV_SECTIONS.find(s=>s.key===key);
  if(s) Router.go(s.defaultRoute);
}

// ---------------------------------------------------------------
// MOBILE NAV
// ---------------------------------------------------------------
function toggleMobileNav(){
  const overlay = document.getElementById('mobileNavOverlay');
  const drawer  = document.getElementById('mobileNavDrawer');
  const open = drawer.classList.contains('hidden');
  overlay.classList.toggle('hidden', !open);
  drawer.classList.toggle('hidden', !open);
  if(open) drawer.style.display='flex'; else drawer.style.display='none';
}
function closeMobileNavIfOpen(){
  document.getElementById('mobileNavOverlay').classList.add('hidden');
  document.getElementById('mobileNavDrawer').classList.add('hidden');
  document.getElementById('mobileNavDrawer').style.display='none';
}

// ---------------------------------------------------------------
// CLOCK
// ---------------------------------------------------------------
function updateClock(){
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');
  const days = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  const months = ['jan.','fév.','mars','avr.','mai','juin','juil.','août','sep.','oct.','nov.','déc.'];
  const el = document.getElementById('clockTime');
  const de = document.getElementById('clockDate');
  if(el) el.textContent = `${h}:${m}`;
  if(de) de.textContent = `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]}`;
}

// ---------------------------------------------------------------
// SEARCH
// ---------------------------------------------------------------
function openSearch(){
  const m = document.getElementById('searchModal');
  m.classList.remove('hidden');
  m.style.display='flex';
  setTimeout(()=>document.getElementById('globalSearchInput')?.focus(),50);
}
function closeSearch(){
  const m = document.getElementById('searchModal');
  m.classList.add('hidden');
  m.style.display='none';
  document.getElementById('globalSearchInput').value='';
  document.getElementById('globalSearchResults').innerHTML='';
}
function runGlobalSearch(){
  const q = document.getElementById('globalSearchInput').value.toLowerCase().trim();
  const res = document.getElementById('globalSearchResults');
  if(!q){ res.innerHTML=''; return; }

  const results = [];
  DB.orders.filter(o=>o.ref.toLowerCase().includes(q)||o.clientName.toLowerCase().includes(q)).forEach(o=>{
    results.push(`<div onclick="Router.go('order-detail','${o.id}');closeSearch()" class="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-white/5">
      <i class="bi bi-receipt text-accent2 text-[13px]"></i>
      <div><div class="text-white text-[12.5px]">${esc(o.ref)} — ${esc(o.clientName)}</div><div class="text-white/30 text-[10.5px]">${DB.fmtFCFA(o.total)}</div></div>
    </div>`);
  });
  DB.clients.filter(c=>c.name.toLowerCase().includes(q)||c.phone.includes(q)).forEach(c=>{
    results.push(`<div onclick="Router.go('clients-list');closeSearch()" class="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-white/5">
      <i class="bi bi-person-fill text-accent2 text-[13px]"></i>
      <div><div class="text-white text-[12.5px]">${esc(c.name)}</div><div class="text-white/30 text-[10.5px]">${c.phone}</div></div>
    </div>`);
  });
  DB.articles.filter(a=>a.name.toLowerCase().includes(q)).forEach(a=>{
    results.push(`<div onclick="Router.go('articles-list');closeSearch()" class="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-white/5">
      <i class="bi ${a.icon||'bi-handbag'} text-accent2 text-[13px]"></i>
      <div><div class="text-white text-[12.5px]">${esc(a.name)}</div><div class="text-white/30 text-[10.5px]">Article</div></div>
    </div>`);
  });

  res.innerHTML = results.length ? results.join('') : `<div class="text-center py-8 text-white/30 text-[12px]">Aucun résultat pour "${esc(q)}"</div>`;
}

// ---------------------------------------------------------------
// NOTIF
// ---------------------------------------------------------------
function toggleNotifPanel(){
  const p = document.getElementById('notifPanel');
  const hidden = p.classList.contains('hidden');
  p.classList.toggle('hidden', !hidden);
  p.style.display = hidden ? 'block' : 'none';
}

// ---------------------------------------------------------------
// LANG
// ---------------------------------------------------------------
function setLang(lang){
  document.getElementById('langEnBtn').className = lang==='en' ? 'text-[9px] px-1.5 py-0.5 rounded bg-accent text-white font-semibold flex items-center gap-1 transition' : 'text-[9px] px-1.5 py-0.5 rounded text-white/60 flex items-center gap-1 transition';
  document.getElementById('langFrBtn').className = lang==='fr' ? 'text-[9px] px-1.5 py-0.5 rounded bg-accent text-white font-semibold flex items-center gap-1 transition' : 'text-[9px] px-1.5 py-0.5 rounded text-white/60 flex items-center gap-1 transition';
  UI.toast(`Langue : ${lang==='fr'?'Français':'English'}`);
}
function toggleTheme(){
  const isDark = document.body.classList.contains('light-mode');
  if(isDark){
    document.body.classList.remove('light-mode');
    localStorage.setItem('theme','dark');
    UI.toast('Mode sombre activé');
  } else {
    document.body.classList.add('light-mode');
    localStorage.setItem('theme','light');
    UI.toast('Mode clair activé');
  }
}

// ---------------------------------------------------------------
// UI UTILITIES
// ---------------------------------------------------------------
const UI = (function(){
  let toastTimer = null;
  let _successCallback = null;
  let _successRoute = null;
  let _confirmCallback = null;

  function toast(msg, isError=false){
    const el = document.getElementById('toast');
    const txt = document.getElementById('toastText');
    const icon = el.querySelector('i');
    txt.textContent = msg;
    const lightMode = document.body.classList.contains('light-mode');
    if(isError){
      el.style.background = lightMode ? '#ffffff' : '#1e1d2b';
      el.style.borderColor = 'rgba(239,68,68,0.3)';
      el.style.color = lightMode ? '#1d1d1f' : '#ffffff';
      icon.className = 'bi bi-x-circle-fill text-red-400';
    } else {
      el.style.background = lightMode ? '#eff6ff' : '#0c1f3d';
      el.style.borderColor = 'rgba(77,187,248,0.35)';
      el.style.color = lightMode ? '#0f172a' : '#ffffff';
      icon.className = 'bi bi-check-circle-fill text-accent';
    }
    el.classList.remove('hidden');
    el.style.display='flex';
    if(toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>{ el.classList.add('hidden'); el.style.display='none'; }, 2800);
  }

  function flipToggle(el){
    const on = el.dataset.on !== 'true';
    el.dataset.on = on;
    el.style.background = on ? '#4DBBF8' : 'rgba(255,255,255,0.15)';
    const knob = el.querySelector('.toggle-knob');
    if(knob) knob.style.left = on ? '1rem' : '0.125rem';
  }

  function showSuccess(title, subtitle, detailsRoute, anotherRoute){
    _successRoute = { details: detailsRoute, another: anotherRoute };
    document.getElementById('successTitle').textContent = title;
    document.getElementById('successSubtitle').textContent = subtitle;
    const m = document.getElementById('successModal');
    m.classList.remove('hidden');
    m.style.display='flex';
  }

  function successAction(action){
    const m = document.getElementById('successModal');
    m.classList.add('hidden'); m.style.display='none';
    if(!_successRoute) return;
    if(action==='details' && _successRoute.details) Router.go(_successRoute.details);
    else if(action==='another' && _successRoute.another) Router.go(_successRoute.another);
    else if(action==='list'){
      const r = Router.current.route;
      if(r.includes('article')) Router.go('articles-list');
      else if(r.includes('service')) Router.go('services-list');
      else Router.go('forfaits-list');
    }
  }

  function confirm(title, subtitle, cb){
    _confirmCallback = cb;
    document.getElementById('confirmTitle').textContent = title||'Confirmer ?';
    document.getElementById('confirmSubtitle').textContent = subtitle||'Cette action est irréversible.';
    const m = document.getElementById('confirmModal');
    m.classList.remove('hidden'); m.style.display='flex';
  }

  function confirmYes(){
    const m = document.getElementById('confirmModal');
    m.classList.add('hidden'); m.style.display='none';
    if(_confirmCallback) _confirmCallback();
  }

  function confirmNo(){
    const m = document.getElementById('confirmModal');
    m.classList.add('hidden'); m.style.display='none';
  }

  return { toast, flipToggle, showSuccess, successAction, confirm, confirmYes, confirmNo };
})();

// ---------------------------------------------------------------
// PICKER (helper générique pour modaux de sélection)
// ---------------------------------------------------------------
const Picker = {
  open(modalId){
    const m = document.getElementById(modalId);
    if(m){ 
      m.classList.remove('hidden'); 
      m.style.display='flex';
      // Trigger animation
      requestAnimationFrame(() => m.style.opacity='1');
    }
  },
  close(modalId){
    const m = document.getElementById(modalId);
    if(m){ 
      m.style.opacity='0';
      setTimeout(() => {
        m.classList.add('hidden'); 
        m.style.display='none';
        m.style.opacity='1';
      }, 150);
    }
  }
};

// ---------------------------------------------------------------
// CAISSE
// ---------------------------------------------------------------
const Caisse = (function(){
  let cart = [];
  let selectedClient = null;
  let selectedService = null;

  function mount(){
    renderGrid(DB.articles);
    renderCart();
    // Sélection de service par défaut = premier service actif
    if(DB.services.length) selectedService = DB.services[0];
  }

  function renderGrid(articles){
    const grid = document.getElementById('caisseGrid');
    if(!grid) return;
    if(!articles.length){
      grid.innerHTML=`<div class="col-span-5 text-center py-12 text-white/30 text-[12px]">Aucun article trouvé</div>`;
      return;
    }
    grid.innerHTML = articles.map(a=>`
      <button onclick="Caisse.addToCart('${a.id}')" class="bg-white/[0.03] border border-white/10 rounded-xl p-3 flex flex-col items-center gap-2 hover:border-accent/40 hover:bg-white/[0.06] transition text-center group">
        <div class="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition">
          <i class="bi ${a.icon||'bi-handbag'} text-accent2 text-lg"></i>
        </div>
        <span class="text-white text-[11px] font-medium leading-tight">${esc(a.name)}</span>
        <span class="text-white/40 text-[10px]">${getPriceDisplay(a)}</span>
      </button>
    `).join('');
  }

  function getPriceDisplay(article){
    if(!article.tariffs || !article.tariffs.length) return '— FCFA';
    const t = article.tariffs[0];
    return DB.fmtFCFA(t.unitPrice||t.kgPrice||0);
  }

  function filterArticles(q){
    const filtered = DB.articles.filter(a=>a.name.toLowerCase().includes(q.toLowerCase()));
    renderGrid(filtered);
  }

  function addToCart(articleId){
    const article = DB.find(DB.articles, articleId);
    if(!article) return;
    const existing = cart.find(i=>i.articleId===articleId);
    if(existing){
      existing.qty++;
    } else {
      const price = article.tariffs && article.tariffs[0] ? (article.tariffs[0].unitPrice||0) : 0;
      cart.push({ articleId, name: article.name, icon: article.icon||'bi-handbag', qty:1, unitPrice: price });
    }
    renderCart();
  }

  function removeFromCart(articleId){
    cart = cart.filter(i=>i.articleId!==articleId);
    renderCart();
  }

  function updateQty(articleId, delta){
    const item = cart.find(i=>i.articleId===articleId);
    if(!item) return;
    item.qty = Math.max(1, item.qty + delta);
    renderCart();
  }

  function renderCart(){
    const body = document.getElementById('cartBody');
    const subTotalEl = document.getElementById('subTotal');
    const totalEl = document.getElementById('cartTotal');
    const validateBtn = document.getElementById('validateOrderBtn');
    if(!body) return;

    const total = cart.reduce((s,i)=>s+i.qty*i.unitPrice, 0);

    if(!cart.length){
      body.innerHTML=`<div class="flex flex-col items-center justify-center text-center px-6 gap-2 py-10">
        <i class="bi bi-cart3 text-3xl text-white/15"></i>
        <p class="text-white/30 text-[11.5px]">Panier vide</p>
        <p class="text-white/20 text-[10.5px]">Cliquez sur un article pour l'ajouter</p>
      </div>`;
    } else {
      body.innerHTML = `<div class="w-full divide-y divide-white/5">` + cart.map(i=>`
        <div class="flex items-center gap-2 px-3.5 py-2.5">
          <div class="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
            <i class="bi ${i.icon} text-accent2 text-[11px]"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-white text-[11.5px] font-medium truncate">${esc(i.name)}</div>
            <div class="text-white/35 text-[10px]">${DB.fmtFCFA(i.unitPrice)} / unité</div>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <button onclick="Caisse.updateQty('${i.articleId}',-1)" class="w-5 h-5 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 text-xs transition">-</button>
            <span class="text-white text-[11px] w-5 text-center">${i.qty}</span>
            <button onclick="Caisse.updateQty('${i.articleId}',1)" class="w-5 h-5 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 text-xs transition">+</button>
            <button onclick="Caisse.removeFromCart('${i.articleId}')" class="w-5 h-5 rounded flex items-center justify-center text-rose-400/60 hover:text-rose-400 hover:bg-rose-400/10 text-xs ml-1 transition"><i class="bi bi-x"></i></button>
          </div>
        </div>
      `).join('') + `</div>`;
    }

    if(subTotalEl) subTotalEl.textContent = DB.fmtFCFA(total);
    if(totalEl) totalEl.textContent = DB.fmtFCFA(total);

    if(validateBtn){
      const canValidate = cart.length > 0 && selectedClient;
      validateBtn.style.opacity = canValidate ? '1' : '0.4';
      validateBtn.style.cursor = canValidate ? 'pointer' : 'not-allowed';
    }
  }

  function openClientPicker(){
    filterClientPicker('');
    Picker.open('clientPickModal');
  }

  function filterClientPicker(q){
    const list = document.getElementById('clientPickList');
    if(!list) return;
    const clients = DB.clients.filter(c=>!q || c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q));
    list.innerHTML = clients.map(c=>`
      <div onclick="Caisse.selectClient('${c.id}')" class="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-white/5">
        <div class="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-accent2 text-[10px] font-semibold shrink-0">${initials(c.name)}</div>
        <div>
          <div class="text-white text-[12.5px]">${esc(c.name)}</div>
          <div class="text-white/35 text-[10.5px]">${c.phone}</div>
        </div>
      </div>
    `).join('') || `<div class="text-center py-6 text-white/30 text-[12px]">Aucun client trouvé</div>`;
  }

  function selectClient(clientId){
    const client = DB.find(DB.clients, clientId);
    if(!client) return;
    selectedClient = client;
    const lbl = document.getElementById('ticketClientLabel');
    if(lbl){
      lbl.textContent = client.name;
      lbl.style.color = 'white';
    }
    Picker.close('clientPickModal');
    renderCart();
  }

  async function validateOrder(){
    if(!cart.length || !selectedClient){
      if(!selectedClient) UI.toast('Veuillez sélectionner un client', true);
      else UI.toast('Le panier est vide', true);
      return;
    }
    const rendezvousDateInput = document.getElementById('orderRendezvousDate')?.value;
    const rendezvousDate = rendezvousDateInput ? new Date(`${rendezvousDateInput}T00:00:00`).getTime() : null;
    const items = cart.map(i => ({ name:i.name, qty:i.qty, unit_price:i.unitPrice }));
    try {
      const order = await DB.createOrder({
        client_id: selectedClient.id,
        client_name: selectedClient.name,
        items,
        rendezvous_date: rendezvousDate,
        rendezvousDate
      });
      _resetCart();
      renderGrid(DB.articles);
      UI.toast(`Commande ${order.ref} créée avec succès !`);
      setTimeout(()=>Router.go('order-detail', order.id), 800);
    } catch (e) { UI.toast(e.message, true); }
  }

  function _resetCart(){
    cart = [];
    selectedClient = null;
    const lbl = document.getElementById('ticketClientLabel');
    if(lbl){ lbl.textContent='Sélectionner un client'; lbl.style.color=''; }
    const dateEl = document.getElementById('orderRendezvousDate');
    if(dateEl) dateEl.value = '';
    renderCart();
  }

  return {
    mount,
    filterArticles,
    addToCart,
    removeFromCart,
    updateQty,
    openClientPicker,
    filterClientPicker,
    selectClient,
    validateOrder,
    get _cart(){ return cart; },
    get _selectedClient(){ return selectedClient; },
    _resetCart
  };
})();

// ---------------------------------------------------------------
// ORDERS VIEW
// ---------------------------------------------------------------
const OrdersView = (function(){
  let _filter = '';

  function mount(){
    render();
  }

  function filter(q){
    _filter = q.toLowerCase();
    render();
  }

  function render(){
    const wrap = document.getElementById('ordersTableWrap');
    if(!wrap) return;
    const orders = DB.orders.filter(o=>
      !_filter || o.ref.toLowerCase().includes(_filter) || o.clientName.toLowerCase().includes(_filter)
    );
    if(!orders.length){
      wrap.innerHTML=`<div class="text-center py-12 text-white/30 text-[12px]">Aucune commande trouvée</div>`;
      return;
    }
    wrap.innerHTML = `
      <div class="flex items-center px-4 py-2.5 border-b border-white/5 text-white/35 text-[10.5px] font-semibold uppercase tracking-wide">
        <div class="flex-1">Référence / Client</div>
        <div class="hidden sm:block w-32 flex-shrink-0 text-right mr-4">Montant</div>
        <div class="hidden md:block w-28 flex-shrink-0 text-right mr-4">Créée</div>
        <div class="hidden lg:block w-32 flex-shrink-0 text-right mr-4">Rendez-vous</div>
        <div class="w-24 flex-shrink-0 text-right">Statut</div>
        <div class="w-32 flex-shrink-0 text-right">Actions</div>
      </div>
      ${orders.map(o=>`
        <div class="table-row-ui">
          <div onclick="Router.go('order-detail','${o.id}')" class="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer">
            <div class="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center shrink-0 text-accent2 text-[10px] font-semibold">${initials(o.clientName)}</div>
            <div class="min-w-0">
              <div class="text-white text-[12.5px] font-medium">${esc(o.ref)}</div>
              <div class="text-white/35 text-[10.5px] truncate">${esc(o.clientName)}</div>
            </div>
          </div>
          <div class="hidden sm:block w-32 flex-shrink-0 text-right text-white text-[12.5px] font-medium mr-4">${DB.fmtFCFA(o.total)}</div>
          <div class="hidden md:block w-28 flex-shrink-0 text-right text-white/35 text-[10.5px] mr-4">${DB.timeAgo(o.createdAt)}</div>
          <div class="hidden lg:block w-32 flex-shrink-0 text-right text-white text-[12.5px] font-medium mr-4">${DB.fmtDate(o.rendezvousDate || o.rendezvous_date) || '—'}</div>
          <div class="w-24 flex-shrink-0 text-right">${statusBadge(o.status)}</div>
          <div class="w-32 flex-shrink-0 text-right flex items-center justify-end gap-1.5">
            <button onclick="PDF.generateLabel('${o.id}')" class="text-white/50 hover:text-accent2 transition text-[11px]" title="Générer étiquette"><i class="bi bi-tag-fill"></i></button>
            <button onclick="PDF.generateInvoice('${o.id}')" class="text-white/50 hover:text-accent2 transition text-[11px]" title="Générer facture"><i class="bi bi-file-earmark-pdf-fill"></i></button>
          </div>
        </div>
      `).join('')}
    `;
  }

  async function advanceStatus(orderId){
    const statusFlow = ['en_attente','collectee','en_cours','prete','livree'];
    const order = DB.find(DB.orders, orderId);
    if(!order) return;
    const idx = statusFlow.indexOf(order.status);
    if(idx===-1 || idx===statusFlow.length-1){ UI.toast('Statut déjà au maximum', true); return; }
    const next = statusFlow[idx+1];
    try {
      await DB.updateOrderStatus(orderId, next);
      UI.toast(`Commande avancée → ${statusBadge(next).replace(/<[^>]+>/g,'')} `);
      Router.go('order-detail', orderId);
    } catch (e) { UI.toast(e.message, true); }
  }

  return { mount, filter, advanceStatus };
})();

const AccountView = (function(){
  async function mount(){
    const user = Auth.user();
    if (!user) return;
    const nameEl = document.getElementById('accountName');
    const emailEl = document.getElementById('accountEmail');
    const passwordEl = document.getElementById('accountPassword');
    const confirmEl = document.getElementById('accountPasswordConfirm');
    if (nameEl) nameEl.value = user.name || '';
    if (emailEl) emailEl.value = user.email || '';
    if (passwordEl) passwordEl.value = '';
    if (confirmEl) confirmEl.value = '';
  }

  async function save(){
    const user = Auth.user();
    if (!user) return;
    const name = document.getElementById('accountName')?.value.trim();
    const email = document.getElementById('accountEmail')?.value.trim();
    const password = document.getElementById('accountPassword')?.value;
    const confirm = document.getElementById('accountPasswordConfirm')?.value;
    if (!name || !email) { UI.toast('Nom et email requis', true); return; }
    if (password && password !== confirm) { UI.toast('Les mots de passe ne correspondent pas', true); return; }
    const payload = { name, email };
    if (password) payload.password = password;
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Impossible de mettre à jour le profil');
      await Auth.load();
      UI.toast('Profil mis à jour');
      Router.go('account');
    } catch (e) { UI.toast(e.message, true); }
  }

  return { mount, save };
})();

const ComptabiliteView = (function(){
  let _dateFrom = '';
  let _dateTo = '';
  let _statusFilter = new Set(['en_attente','collectee','en_cours','prete','livree','impayee']);
  let _transactionType = 'all';
  let _categorySearch = '';
  let _showForm = false;

  function _toTimestamp(value){
    if(!value) return null;
    return new Date(value + 'T00:00:00').getTime();
  }

  const _routePages = {
    'comptabilite': 'journal',
    'comptabilite-expenses': 'expenses',
    'comptabilite-credits': 'credits'
  };

  function _currentPage(){
    return _routePages[Router.current.route] || 'journal';
  }

  function mount(){
    const page = _currentPage();
    if(page==='expenses') _transactionType = 'expense';
    else if(page==='credits') _transactionType = 'credit';
    else _transactionType = 'all';
    _syncInputs();
    _renderSummary();
    _renderCharts();
    _renderTransactions();
    _renderForm();
  }

  function openExpenseModal(){
    _resetTransactionForm();
    Picker.open('comptaExpenseModal');
  }

  function openCreditModal(){
    _resetTransactionForm();
    _populateCreditClients();
    Picker.open('comptaCreditModal');
  }

  function _resetTransactionForm(){
    const expenseCategory = document.getElementById('comptaExpenseCategory');
    const expenseAmount = document.getElementById('comptaExpenseAmount');
    const expenseDescription = document.getElementById('comptaExpenseDescription');
    const creditClient = document.getElementById('comptaCreditClient');
    const creditAmount = document.getElementById('comptaCreditAmount');
    const creditDescription = document.getElementById('comptaCreditDescription');
    if(expenseCategory) expenseCategory.value = '';
    if(expenseAmount) expenseAmount.value = '';
    if(expenseDescription) expenseDescription.value = '';
    if(creditClient) creditClient.value = '';
    if(creditAmount) creditAmount.value = '';
    if(creditDescription) creditDescription.value = '';
  }

  function _populateCreditClients(){
    const select = document.getElementById('comptaCreditClient');
    if(!select) return;
    select.innerHTML = `<option value="">Sélectionner un client</option>` + DB.clients.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
  }

  async function submitExpense(){
    const category = document.getElementById('comptaExpenseCategory')?.value.trim();
    const amount = Number(document.getElementById('comptaExpenseAmount')?.value.trim());
    const description = document.getElementById('comptaExpenseDescription')?.value.trim() || '';
    if(!category || !amount || amount <= 0){ UI.toast('Catégorie et montant valides requis', true); return; }
    try {
      await DB.createTransaction({ type:'expense', category, amount, description });
      Picker.close('comptaExpenseModal');
      UI.toast('Dépense enregistrée');
      mount();
    } catch (e) { UI.toast(e.message, true); }
  }

  async function submitCredit(){
    const clientId = document.getElementById('comptaCreditClient')?.value;
    const amount = Number(document.getElementById('comptaCreditAmount')?.value.trim());
    const description = document.getElementById('comptaCreditDescription')?.value.trim() || '';
    if(!clientId){ UI.toast('Sélectionnez un client', true); return; }
    if(!amount || amount <= 0){ UI.toast('Montant valide requis', true); return; }
    const client = DB.find(DB.clients, clientId);
    const category = client ? `Encaissement ${client.name}` : 'Encaissement client';
    try {
      await DB.createTransaction({ type:'credit', category, amount, description });
      Picker.close('comptaCreditModal');
      UI.toast('Crédit enregistré');
      mount();
    } catch (e) { UI.toast(e.message, true); }
  }

  function _renderForm(){
    const header = document.getElementById('comptaPageHeader');
    if(!header) return;
    const page = _currentPage();
    const currentRoute = Router.current.route;
    const title = page==='journal' ? 'Journal comptable' : page==='expenses' ? 'Dépenses' : 'Crédits';
    const subtitle = page==='journal'
      ? 'Suivez le journal des commandes et flux financiers.'
      : page==='expenses'
        ? 'Enregistrez une dépense pour vos fournisseurs et frais.'
        : 'Enregistrez un crédit client et suivez les encaissements.';
    header.innerHTML = `
      <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div class="space-y-1">
          <h2 class="text-white text-[18px] font-semibold">${title}</h2>
          <p class="text-white/50 text-[12px] max-w-2xl">${subtitle}</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button onclick="Router.go('comptabilite')" class="text-[11px] px-3 py-2 rounded-lg transition ${currentRoute==='comptabilite' ? 'bg-accent text-white' : 'bg-white/5 text-white/70 hover:text-white hover:border-accent border border-white/10'}">Journal</button>
          <button onclick="Router.go('comptabilite-expenses')" class="text-[11px] px-3 py-2 rounded-lg transition ${currentRoute==='comptabilite-expenses' ? 'bg-accent text-white' : 'bg-white/5 text-white/70 hover:text-white hover:border-accent border border-white/10'}">Dépenses</button>
          <button onclick="Router.go('comptabilite-credits')" class="text-[11px] px-3 py-2 rounded-lg transition ${currentRoute==='comptabilite-credits' ? 'bg-accent text-white' : 'bg-white/5 text-white/70 hover:text-white hover:border-accent border border-white/10'}">Crédits</button>
          ${page === 'expenses' ? '<button onclick="ComptabiliteView.openExpenseModal()" class="btn-primary text-[11px] px-4 py-2">Ajouter une dépense</button>' : ''}
          ${page === 'credits' ? '<button onclick="ComptabiliteView.openCreditModal()" class="btn-primary text-[11px] px-4 py-2">Ajouter un crédit</button>' : ''}
        </div>
      </div>
    `;
  }

  function _syncInputs(){
    const from = document.getElementById('comptaDateFrom');
    const to = document.getElementById('comptaDateTo');
    const type = document.getElementById('comptaTransactionType');
    const category = document.getElementById('comptaCategorySearch');
    if(from) from.value = _dateFrom;
    if(to) to.value = _dateTo;
    if(type) type.value = _transactionType;
    if(category) category.value = _categorySearch;
    ['en_attente','collectee','en_cours','prete','livree','impayee'].forEach(status=>{
      const btn = document.getElementById(`comptaStatusBtn_${status}`);
      if(!btn) return;
      const active = _statusFilter.has(status);
      btn.classList.toggle('border-accent', active);
      btn.classList.toggle('text-white', active);
      btn.classList.toggle('bg-white/10', active);
      btn.classList.toggle('text-white/60', !active);
    });
  }

  function _isOrderVisible(o){
    const ts = o.createdAt || 0;
    const start = _toTimestamp(_dateFrom);
    const end = _toTimestamp(_dateTo);
    if(start !== null && ts < start) return false;
    if(end !== null && ts > end + 86399999) return false;
    return _statusFilter.has(o.status);
  }

  function _isTransactionVisible(t){
    const ts = t.createdAt || 0;
    const start = _toTimestamp(_dateFrom);
    const end = _toTimestamp(_dateTo);
    if(start !== null && ts < start) return false;
    if(end !== null && ts > end + 86399999) return false;
    if(_transactionType !== 'all' && t.type !== _transactionType) return false;
    const term = _categorySearch.toLowerCase();
    if(term && !t.category.toLowerCase().includes(term) && !t.description.toLowerCase().includes(term)) return false;
    return true;
  }

  function _orders(){ return DB.orders.filter(_isOrderVisible); }
  function _transactions(){ return DB.transactions.filter(_isTransactionVisible); }

  function setDateFrom(value){ _dateFrom = value; mount(); }
  function setDateTo(value){ _dateTo = value; mount(); }
  function toggleStatus(status){
    if(_statusFilter.has(status)) _statusFilter.delete(status);
    else _statusFilter.add(status);
    mount();
  }
  function setTransactionType(value){ _transactionType = value; mount(); }
  function setCategorySearch(value){ _categorySearch = value || ''; mount(); }

  function setPeriodRange(range){
    const now = new Date();
    let from = null;
    let to = new Date(now);
    if(range === 'today'){
      from = new Date(now);
    } else if(range === '7d'){
      from = new Date(now);
      from.setDate(now.getDate() - 6);
    } else if(range === 'month'){
      from = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if(range === 'quarter'){
      const quarter = Math.floor(now.getMonth() / 3);
      from = new Date(now.getFullYear(), quarter * 3, 1);
    } else if(range === 'year'){
      from = new Date(now.getFullYear(), 0, 1);
    }
    if(from){
      const pad = n => `${n}`.padStart(2,'0');
      _dateFrom = `${from.getFullYear()}-${pad(from.getMonth()+1)}-${pad(from.getDate())}`;
      _dateTo = `${to.getFullYear()}-${pad(to.getMonth()+1)}-${pad(to.getDate())}`;
      mount();
    }
  }

  function deleteTransaction(id){
    UI.confirm('Supprimer ce flux ?', 'Ce mouvement sera supprimé définitivement.', async ()=>{
      try {
        await DB.deleteTransaction(id);
        UI.toast('Flux supprimé');
        mount();
      } catch (e) { UI.toast(e.message, true); }
    });
  }

  function exportTransactions(format){
    const rows = _transactions();
    exportData('transactions', rows, format);
  }

  function exportOrders(format){
    const rows = _orders();
    exportData('orders', rows, format);
  }

  function _renderSummary(){
    const orders = DB.orders;
    const transactions = DB.transactions;
    const revenue = orders.filter(o=>['livree','prete'].includes(o.status)).reduce((s,o)=>s+(o.total||0),0);
    const pending = orders.filter(o=>o.status==='en_attente').reduce((s,o)=>s+(o.total||0),0);
    const inProgress = orders.filter(o=>o.status==='en_cours').reduce((s,o)=>s+(o.total||0),0);
    const unpaid = orders.filter(o=>o.status==='impayee').reduce((s,o)=>s+(o.total||0),0);
    const expenses = transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+(t.amount||0),0);
    const credits = transactions.filter(t=>t.type==='credit').reduce((s,t)=>s+(t.amount||0),0);
    const revenueEl = document.getElementById('comptaCardRevenue');
    const pendingEl = document.getElementById('comptaCardPending');
    const inProgressEl = document.getElementById('comptaCardInProgress');
    const unpaidEl = document.getElementById('comptaCardUnpaid');
    const expensesEl = document.getElementById('comptaCardExpenses');
    const creditsEl = document.getElementById('comptaCardCredits');
    if(revenueEl) revenueEl.textContent = DB.fmtFCFA(revenue);
    if(pendingEl) pendingEl.textContent = DB.fmtFCFA(pending);
    if(inProgressEl) inProgressEl.textContent = DB.fmtFCFA(inProgress);
    if(unpaidEl) unpaidEl.textContent = DB.fmtFCFA(unpaid);
    if(expensesEl) expensesEl.textContent = DB.fmtFCFA(expenses);
    if(creditsEl) creditsEl.textContent = DB.fmtFCFA(credits);
  }

  function _renderCharts(){
    const statusWrap = document.getElementById('comptaStatusChart');
    const flowWrap = document.getElementById('comptaFlowChart');
    if(!statusWrap || !flowWrap) return;
    const orders = _orders();
    const statuses = ['en_attente','collectee','en_cours','prete','livree','impayee'].map(status => ({
      status,
      amount: orders.filter(o=>o.status===status).reduce((s,o)=>s+(o.total||0),0)
    }));
    const statusMax = Math.max(1, ...statuses.map(i=>i.amount));
    statusWrap.innerHTML = statuses.map(item => `
      <div class="space-y-1 text-[12px]">
        <div class="flex justify-between text-white/60"><span>${statusBadge(item.status)}</span><span>${DB.fmtFCFA(item.amount)}</span></div>
        <div class="h-2 rounded-full bg-white/10 overflow-hidden"><div style="width:${Math.round(item.amount/statusMax*100)}%" class="h-full bg-accent"></div></div>
      </div>
    `).join('');

    const transactions = _transactions();
    const flowSeries = [{ label:'Dépenses', type:'expense', color:'bg-rose-500' }, { label:'Crédits', type:'credit', color:'bg-emerald-400' }];
    const flows = flowSeries.map(series => ({
      label: series.label,
      amount: transactions.filter(t=>t.type===series.type).reduce((s,t)=>s+(t.amount||0),0),
      color: series.color
    }));
    const flowMax = Math.max(1, ...flows.map(i=>i.amount));

    const today = new Date();
    const trendDays = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return date;
    });
    const trendLabels = trendDays.map(d => `${d.getDate()}/${d.getMonth()+1}`);
    const dailyExpenses = trendDays.map(day => transactions.filter(t => t.type==='expense' && _sameDay(t.createdAt, day)).reduce((s,t)=>s+(t.amount||0),0));
    const dailyCredits = trendDays.map(day => transactions.filter(t => t.type==='credit' && _sameDay(t.createdAt, day)).reduce((s,t)=>s+(t.amount||0),0));
    const dailyMax = Math.max(1, ...dailyExpenses, ...dailyCredits);

    flowWrap.innerHTML = `
      <div class="space-y-4">
        ${flows.map(item => `
          <div class="space-y-1 text-[12px]">
            <div class="flex justify-between text-white/60"><span>${item.label}</span><span>${DB.fmtFCFA(item.amount)}</span></div>
            <div class="h-2 rounded-full bg-white/10 overflow-hidden"><div style="width:${Math.round(item.amount/flowMax*100)}%" class="h-full ${item.color}"></div></div>
          </div>
        `).join('')}
        <div class="pt-3 border-t border-white/10 text-[12px] text-white/60">
          <div class="flex items-center justify-between mb-2 text-white text-[13px] font-semibold">Tendance 7 derniers jours</div>
          <div class="grid grid-cols-7 gap-1 items-end h-24">
            ${trendLabels.map((label, index) => `
              <div class="flex flex-col items-center gap-2">
                <div class="w-full rounded-t-md bg-rose-500" style="height:${Math.max(4, Math.round(dailyExpenses[index] / dailyMax * 90))}%;"></div>
                <div class="w-full rounded-t-md bg-emerald-400" style="height:${Math.max(4, Math.round(dailyCredits[index] / dailyMax * 90))}%;"></div>
                <div class="text-[10px] text-white/40 text-center">${label}</div>
              </div>
            `).join('')}
          </div>
          <div class="mt-3 flex items-center gap-2 text-[11px] text-white/50">
            <span class="inline-flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-rose-500"></span>Dépenses</span>
            <span class="inline-flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-400"></span>Crédits</span>
          </div>
        </div>
      </div>
    `;
  }

  function _sameDay(value, date){
    const d = new Date(value);
    return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate();
  }

  function _renderTransactions(){
    const wrap = document.getElementById('comptaTransactionsWrap');
    if(!wrap) return;
    const rows = _transactions();
    if(!rows.length){
      wrap.innerHTML = `<div class="text-center py-12 text-white/30 text-[12px]">Aucun flux trouvé avec ces filtres.</div>`;
      return;
    }
    wrap.innerHTML = `
      <div class="flex items-center px-4 py-2.5 border-b border-white/5 text-white/35 text-[10.5px] font-semibold uppercase tracking-wide">
        <div class="flex-1">Type</div>
        <div class="hidden sm:block w-28">Catégorie</div>
        <div class="w-24 text-right">Montant</div>
        <div class="hidden md:block w-28 text-right">Date</div>
        <div class="w-20 text-right">Actions</div>
      </div>
      ${rows.map(r => `
        <div class="table-row-ui">
          <div class="min-w-0">
            <div class="text-white text-[12.5px] font-medium">${r.type==='expense' ? 'Dépense' : 'Crédit'}</div>
            <div class="text-white/35 text-[10px] truncate">${esc(r.description||'—')}</div>
          </div>
          <div class="hidden sm:block w-28 text-white/50 text-[11px] truncate">${esc(r.category)}</div>
          <div class="w-24 text-right text-white font-semibold">${DB.fmtFCFA(r.amount)}</div>
          <div class="hidden md:block w-28 text-right text-white/35 text-[10px]">${DB.fmtDate(r.createdAt)}</div>
          <div class="w-20 text-right"><button onclick="ComptabiliteView.deleteTransaction('${r.id}')" class="text-white/40 hover:text-rose-400 text-[12px]"><i class="bi bi-trash"></i></button></div>
        </div>
      `).join('')}
    `;
  }

  return { mount, setDateFrom, setDateTo, toggleStatus, setTransactionType, setCategorySearch, setPeriodRange, deleteTransaction, exportTransactions, exportOrders, openExpenseModal, openCreditModal, submitExpense, submitCredit };
})();

function downloadFile(filename, content, mime){
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function parseCsv(text){
  const lines = text.split(/\r\n|\n/).filter(Boolean);
  return lines.map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for(let i=0;i<line.length;i++){
      const char = line[i];
      if(char==='"'){
        if(inQuotes && line[i+1]==='"'){ current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if(char===',' && !inQuotes){
        values.push(current); current='';
      } else { current += char; }
    }
    values.push(current);
    return values;
  });
}

function exportData(type, rows, format){
  if(!rows.length){ UI.toast(`Aucun ${type} à exporter`, true); return; }
  const mapRow = {
    clients: r => [r.name, r.phone, r.email || '', r.ordersCount || 0, r.totalSpent || 0, DB.fmtDate(r.createdAt)],
    articles: r => [r.name, r.category || '', r.active ? 'Actif' : 'Inactif'],
    services: r => [r.name, r.exclusivityGroup || '', r.unitPrice || 0, r.active ? 'Actif' : 'Inactif'],
    forfaits: r => [r.name, r.price || 0, r.quantityLimit || 0, r.validityDays || 0, r.active ? 'Actif' : 'Inactif'],
    orders: r => [r.ref, r.clientName, r.status, r.total || 0, DB.fmtDate(r.createdAt)],
    transactions: r => [r.type==='expense' ? 'Dépense' : 'Crédit', r.category, r.amount || 0, r.description || '', DB.fmtDate(r.createdAt)]
  }[type];
  const headers = {
    clients: ['Nom','Téléphone','Email','Commandes','Total dépensé','Inscription'],
    articles: ['Nom','Catégorie','Statut'],
    services: ['Nom','Groupe','Prix unitaire','Statut'],
    forfaits: ['Nom','Prix','Limite quantité','Validité','Statut'],
    orders: ['Référence','Client','Statut','Montant','Date'],
    transactions: ['Type','Catégorie','Montant','Description','Date']
  }[type];
  const csvRows = [headers].concat(rows.map(mapRow));
  const csv = csvRows.map(r => r.map(cell => `"${String(cell||'').replace(/"/g,'""')}"`).join(',')).join('\r\n');
  const filename = `${type}-${new Date().toISOString().slice(0,10)}.${format==='excel' ? 'xls' : 'csv'}`;
  const mime = format==='excel' ? 'application/vnd.ms-excel' : 'text/csv;charset=utf-8;';
  downloadFile(filename, csv, mime);
  UI.toast(`Export ${format==='excel' ? 'Excel' : 'CSV'} téléchargé`);
}

// ---------------------------------------------------------------
// LIST VIEW (Articles / Services / Forfaits)
// ---------------------------------------------------------------
const ListView = (function(){
  let _currentData = [];
  let _filter = '';
  let _type = 'articles';

  function filter(q){
    _filter = q.toLowerCase();
    renderTable();
  }

  function toggleAll(el){
    const checked = el.dataset.checked !== 'true';
    el.dataset.checked = checked;
    el.innerHTML = checked ? '<i class="bi bi-check2 text-accent2 text-[10px]"></i>' : '';
    el.style.background = checked ? 'rgba(77,187,248,0.15)' : '';
    el.style.borderColor = checked ? '#4DBBF8' : 'rgba(255,255,255,0.2)';
    document.querySelectorAll('[data-row-checkbox]').forEach(cb=>{
      cb.dataset.checked = checked;
      cb.innerHTML = checked ? '<i class="bi bi-check2 text-accent2 text-[10px]"></i>' : '';
      cb.style.background = checked ? 'rgba(77,187,248,0.15)' : '';
      cb.style.borderColor = checked ? '#4DBBF8' : 'rgba(255,255,255,0.2)';
    });
  }

  function toggleRow(el){
    const checked = el.dataset.checked !== 'true';
    el.dataset.checked = checked;
    el.innerHTML = checked ? '<i class="bi bi-check2 text-accent2 text-[10px]"></i>' : '';
    el.style.background = checked ? 'rgba(77,187,248,0.15)' : '';
    el.style.borderColor = checked ? '#4DBBF8' : 'rgba(255,255,255,0.2)';
  }

  function mountArticles(){
    _type='articles';
    _filter='';
    _currentData = DB.articles;
    renderTable();
  }
  function mountServices(){
    _type='services';
    _filter='';
    _currentData = DB.services;
    renderTable();
  }
  function mountForfaits(){
    _type='forfaits';
    _filter='';
    _currentData = DB.forfaits;
    renderTable();
  }

  function renderTable(){
    const wrap = document.getElementById('genericTableWrap');
    if(!wrap) return;
    const data = _currentData.filter(item=>
      !_filter || (item.name||'').toLowerCase().includes(_filter)
    );
    if(!data.length){
      wrap.innerHTML=`<div class="text-center py-14 text-white/30 text-[12px]">Aucun élément trouvé. <button onclick="Router.go('${_type==='articles'?'article':_type==='services'?'service':'forfait'}-new')" class="text-accent2 hover:underline ml-1">+ Ajouter</button></div>`;
      return;
    }

    if(_type==='articles'){
      wrap.innerHTML = `
        <div class="flex items-center px-4 py-2.5 border-b border-white/5 text-white/35 text-[10.5px] font-semibold uppercase tracking-wide">
          <div class="w-5 mr-3 flex-shrink-0"></div>
          <div class="flex-1">Article</div>
          <div class="hidden sm:block w-28 flex-shrink-0">Catégorie</div>
          <div class="w-20 flex-shrink-0 text-center">Statut</div>
          <div class="w-20 flex-shrink-0 text-right">Actions</div>
        </div>
        ${data.map(a=>`
          <div class="table-row-ui">
            <label class="inline-flex w-5 h-5 rounded border border-white/20 mr-3 shrink-0 cursor-pointer items-center justify-center" data-row-checkbox onclick="ListView.toggleRow(this)" style="width:20px;height:20px"></label>
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0"><i class="bi ${a.icon||'bi-handbag'} text-accent2 text-[13px]"></i></div>
              <div class="min-w-0">
                <div class="text-white text-[12.5px] font-medium truncate">${esc(a.name)}</div>
                <div class="text-white/35 text-[10.5px] truncate">${a.tariffs?.length||0} tarif(s)</div>
              </div>
            </div>
            <div class="hidden sm:block w-28 text-white/50 text-[11px] truncate">${esc(a.category||'—')}</div>
            <div class="w-20 flex-shrink-0 text-center">
              <span class="badge ${a.active?'bg-emerald-500/15 text-emerald-400':'bg-white/10 text-white/40'}">${a.active?'Actif':'Inactif'}</span>
            </div>
            <div class="w-20 text-right flex items-center justify-end gap-2">
              <button onclick="Router.go('article-edit','${a.id}')" class="text-white/40 hover:text-accent2 text-[12px] transition"><i class="bi bi-pencil"></i></button>
              <button onclick="ListView.deleteItem('${a.id}','articles')" class="text-white/40 hover:text-rose-400 text-[12px] transition"><i class="bi bi-trash"></i></button>
            </div>
          </div>
        `).join('')}`;
    } else if(_type==='services'){
      wrap.innerHTML = `
        <div class="flex items-center px-4 py-2.5 border-b border-white/5 text-white/35 text-[10.5px] font-semibold uppercase tracking-wide">
          <div class="w-5 mr-3 flex-shrink-0"></div>
          <div class="flex-1">Service</div>
          <div class="hidden sm:block w-32 flex-shrink-0">Groupe</div>
          <div class="w-28 flex-shrink-0 text-right hidden md:block">Prix unitaire</div>
          <div class="w-20 flex-shrink-0 text-center">Statut</div>
          <div class="w-20 flex-shrink-0 text-right">Actions</div>
        </div>
        ${data.map(s=>`
          <div class="table-row-ui">
            <label class="inline-flex w-5 h-5 rounded border border-white/20 mr-3 shrink-0 cursor-pointer items-center justify-center" data-row-checkbox onclick="ListView.toggleRow(this)" style="width:20px;height:20px"></label>
            <div class="flex-1 min-w-0">
              <div class="text-white text-[12.5px] font-medium truncate">${esc(s.name)}</div>
              <div class="text-white/35 text-[10.5px]">${s.kgPricingEnabled?'Tarification au kg':'Tarification à l\'unité'}</div>
            </div>
            <div class="hidden sm:block w-32 flex-shrink-0 text-white/50 text-[11px]">${esc(s.exclusivityGroup||'—')}</div>
            <div class="w-28 flex-shrink-0 text-right text-white/60 text-[11px] hidden md:block">${DB.fmtFCFA(s.unitPrice)}</div>
            <div class="w-20 flex-shrink-0 text-center">
              <span class="badge ${s.active?'bg-emerald-500/15 text-emerald-400':'bg-white/10 text-white/40'}">${s.active?'Actif':'Inactif'}</span>
            </div>
            <div class="w-20 flex-shrink-0 text-right flex items-center justify-end gap-2">
              <button onclick="Router.go('service-edit','${s.id}')" class="text-white/40 hover:text-accent2 text-[12px] transition"><i class="bi bi-pencil"></i></button>
              <button onclick="ListView.deleteItem('${s.id}','services')" class="text-white/40 hover:text-rose-400 text-[12px] transition"><i class="bi bi-trash"></i></button>
            </div>
          </div>
        `).join('')}`;
    } else {
      wrap.innerHTML = `
        <div class="flex items-center px-4 py-2.5 border-b border-white/5 text-white/35 text-[10.5px] font-semibold uppercase tracking-wide">
          <div class="w-5 mr-3 flex-shrink-0"></div>
          <div class="flex-1">Forfait</div>
          <div class="hidden sm:block w-32 flex-shrink-0 text-right">Prix</div>
          <div class="hidden md:block w-24 flex-shrink-0 text-right">Validité</div>
          <div class="w-20 flex-shrink-0 text-center">Statut</div>
          <div class="w-20 flex-shrink-0 text-right">Actions</div>
        </div>
        ${data.map(f=>`
          <div class="table-row-ui">
            <label class="inline-flex w-5 h-5 rounded border border-white/20 mr-3 shrink-0 cursor-pointer items-center justify-center" data-row-checkbox onclick="ListView.toggleRow(this)" style="width:20px;height:20px"></label>
            <div class="flex items-center gap-2.5 flex-1 min-w-0">
              <div class="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0"><i class="bi bi-box2-heart text-accent2 text-[13px]"></i></div>
              <div class="min-w-0">
                <div class="text-white text-[12.5px] font-medium truncate">${esc(f.name)}</div>
                <div class="text-white/35 text-[10.5px]">Qté: ${f.quantityLimit}</div>
              </div>
            </div>
            <div class="hidden sm:block w-32 flex-shrink-0 text-right text-white/70 text-[12px]">${DB.fmtFCFA(f.price)}</div>
            <div class="hidden md:block w-24 flex-shrink-0 text-right text-white/50 text-[11px]">${f.validityDays} jours</div>
            <div class="w-20 flex-shrink-0 text-center">
              <span class="badge ${f.active?'bg-emerald-500/15 text-emerald-400':'bg-white/10 text-white/40'}">${f.active?'Actif':'Inactif'}</span>
            </div>
            <div class="w-20 flex-shrink-0 text-right flex items-center justify-end gap-2">
              <button onclick="Router.go('forfait-details','${f.id}')" class="text-white/40 hover:text-accent2 text-[12px] transition"><i class="bi bi-eye"></i></button>
              <button onclick="ListView.deleteItem('${f.id}','forfaits')" class="text-white/40 hover:text-rose-400 text-[12px] transition"><i class="bi bi-trash"></i></button>
            </div>
          </div>
        `).join('')}`;
    }
  }

  function deleteItem(id, collectionName){
    UI.confirm('Supprimer cet élément ?', 'Cette action est irréversible.', async ()=>{
      try {
        if(collectionName==='articles') await DB.deleteArticle(id);
        else if(collectionName==='services') await DB.deleteService(id);
        else if(collectionName==='forfaits') await DB.deleteForfait(id);
        _currentData = DB[collectionName];
        renderTable();
        UI.toast('Élément supprimé');
      } catch (e) { UI.toast(e.message, true); }
    });
  }

  async function importCurrent(){
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,application/csv,text/csv';
    input.onchange = async () => {
      const file = input.files?.[0];
      if(!file) return;
      try {
        const text = await file.text();
        const rows = parseCsv(text).filter(r => r.some(cell => cell.trim() !== ''));
        const headers = rows.shift() || [];
        if(!_type) return;
        const fieldMap = headers.map(h => h.trim().toLowerCase());
        for(const row of rows){
          const record = {};
          headers.forEach((h, i)=> record[h.trim().toLowerCase()] = row[i] || '');
          const name = record['nom'] || record['name'];
          if(!name) continue;
          const status = (record['statut'] || '').toLowerCase();
          const active = status.includes('actif') || status.includes('true') || status.includes('yes');

          if(_type==='articles'){
            await DB.createArticle({
              name,
              category: record['catégorie'] || record['categorie'] || record['category'] || '',
              active
            });
          } else if(_type==='services'){
            await DB.createService({
              name,
              description: record['description'] || '',
              exclusivity_group: record['groupe'] || record['group'] || record['exclusivity group'] || '',
              unit_price: parseFloat(record['prix unitaire'] || record['prix'] || '0') || 0,
              kg_pricing_enabled: false,
              kg_price: null,
              express_unit_impact: null,
              active
            });
          } else if(_type==='forfaits'){
            await DB.createForfait({
              name,
              price: parseFloat(record['prix'] || '0') || 0,
              quantity_limit: parseInt(record['limite quantité'] || record['limite quantite'] || record['quantity limit'] || '0', 10) || 0,
              validity_days: parseInt(record['validité'] || record['validite'] || record['validity'] || '0', 10) || 0,
              active
            });
          }
        }
        UI.toast('Import terminé');
        if(_type==='articles') mountArticles();
        else if(_type==='services') mountServices();
        else if(_type==='forfaits') mountForfaits();
      } catch (e) { UI.toast(e.message, true); }
    };
    input.click();
  }

  function exportCurrent(format){
    const rows = _currentData.filter(item => !_filter || (item.name||'').toLowerCase().includes(_filter));
    exportData(_type, rows, format);
  }

  return { filter, toggleAll, toggleRow, mountArticles, mountServices, mountForfaits, deleteItem, importCurrent, exportCurrent };
})();

// ---------------------------------------------------------------
// ARTICLE FORM
// ---------------------------------------------------------------
const ArticleForm = (function(){
  let selectedIcon = null;
  let selectedCategory = null;
  let tariffs = [];
  let selectedTarifServiceId = null;

  function mount(article){
    if(article){
      selectedIcon = article.icon;
      selectedCategory = article.category;
      tariffs = [...(article.tariffs||[])];
    } else {
      selectedIcon = null;
      selectedCategory = null;
      tariffs = [];
    }
    setTab('general');
    renderTarifs();
  }

  function setTab(tab){
    document.querySelectorAll('.art-tab').forEach(el=>{
      const active = el.dataset.artt===tab;
      el.style.borderBottomColor = active ? '#4DBBF8' : 'transparent';
      el.style.color = active ? '#70D4FF' : 'rgba(255,255,255,0.4)';
    });
    document.querySelectorAll('[data-artpane]').forEach(el=>{
      el.classList.toggle('hidden', el.dataset.artpane!==tab);
    });
  }

  function renderTarifs(){
    const list = document.getElementById('tarifsList');
    if(!list) return;
    if(!tariffs.length){
      list.innerHTML=`<p class="text-white/30 text-[11.5px]">Aucun tarif configuré. Cliquez sur "Ajouter".</p>`;
      return;
    }
    list.innerHTML = tariffs.map((t,i)=>{
      const svc = DB.find(DB.services, t.serviceId);
      return `
      <div class="bg-white/[0.03] border border-white/10 rounded-xl p-3 flex items-center gap-3">
        <div class="flex-1 min-w-0">
          <div class="text-white text-[12px] font-medium">${svc?esc(svc.name):'Service inconnu'}</div>
          <div class="text-white/40 text-[10.5px] mt-0.5">${DB.fmtFCFA(t.unitPrice)} / unité</div>
        </div>
        <button onclick="ArticleForm.removeTarif(${i})" class="text-rose-400/60 hover:text-rose-400 text-[13px] transition"><i class="bi bi-x-circle"></i></button>
      </div>`;
    }).join('');
  }

  function openAddTarif(){
    selectedTarifServiceId = null;
    const nameEl = document.getElementById('tarifServiceName');
    if(nameEl) nameEl.textContent = 'Sélectionner un service...';
    // Populate service pick list
    const list = document.getElementById('servicePickList');
    if(list){
      list.innerHTML = DB.services.map(s=>`
        <div onclick="ArticleForm.selectTarifService('${s.id}')" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-white/5">
          <div class="flex-1">
            <div class="text-white text-[12.5px]">${esc(s.name)}</div>
            <div class="text-white/35 text-[10.5px]">${DB.fmtFCFA(s.unitPrice)} / unité</div>
          </div>
        </div>
      `).join('') || `<div class="text-center py-6 text-white/30 text-[12px]">Aucun service disponible</div>`;
    }
    Picker.open('tarifModal');
  }

  function pickTarifService(){
    Picker.close('tarifModal');
    Picker.open('servicePickModal');
  }

  function selectTarifService(serviceId){
    selectedTarifServiceId = serviceId;
    const svc = DB.find(DB.services, serviceId);
    const nameEl = document.getElementById('tarifServiceName');
    if(nameEl) nameEl.textContent = svc ? svc.name : '?';
    Picker.close('servicePickModal');
    Picker.open('tarifModal');
    const priceEl = document.getElementById('tarifPrice');
    if(priceEl && svc) priceEl.value = svc.unitPrice||500;
  }

  function closeTarifModal(){ Picker.close('tarifModal'); }

  function confirmAddTarif(){
    if(!selectedTarifServiceId){ UI.toast('Sélectionnez un service', true); return; }
    const price = parseInt(document.getElementById('tarifPrice').value)||0;
    const existing = tariffs.find(t=>t.serviceId===selectedTarifServiceId);
    if(existing){ UI.toast('Ce service est déjà configuré', true); return; }
    tariffs.push({ serviceId: selectedTarifServiceId, unitPrice: price, kgPrice:null, expressUnitImpact:null, expressKgImpact:null, tiers:[] });
    renderTarifs();
    Picker.close('tarifModal');
    UI.toast('Tarif ajouté');
  }

  function removeTarif(idx){ tariffs.splice(idx,1); renderTarifs(); }

  function pickCategory(){
    const current = document.getElementById('artCategoryLabel')?.textContent;
    const cats = DB.categories.filter(c=>c.type==='article');
    // Simple inline picker using a toast-like approach
    const existing = document.getElementById('catInlinePicker');
    if(existing){ existing.remove(); return; }
    const field = document.getElementById('artCategoryField');
    if(!field) return;
    const picker = document.createElement('div');
    picker.id = 'catInlinePicker';
    picker.className = 'absolute z-30 bg-surface border border-accent/15 rounded-xl shadow-[0_20px_50px_-20px_rgba(77,187,248,0.45)] overflow-hidden mt-1';
    picker.style.minWidth='200px';
    picker.innerHTML = cats.map(c=>`
      <div onclick="ArticleForm._selectCat('${c.name}')" class="px-4 py-2.5 text-white/80 text-[12.5px] hover:bg-accent/10 cursor-pointer">${esc(c.name)}</div>
    `).join('') || '<div class="px-4 py-3 text-white/30 text-[12px]">Aucune catégorie</div>';
    field.style.position='relative';
    field.appendChild(picker);
  }

  function _selectCat(name){
    selectedCategory = name;
    const lbl = document.getElementById('artCategoryLabel');
    if(lbl){ lbl.textContent=name; lbl.style.color='white'; }
    const pk = document.getElementById('catInlinePicker');
    if(pk) pk.remove();
  }

  function reset(){ mount(null); }

  async function submit(id){
    const name = document.getElementById('artName')?.value?.trim();
    const desc = document.getElementById('artDesc')?.value?.trim();
    const activeEl = document.getElementById('artActiveToggle');
    const active = activeEl ? activeEl.dataset.on === 'true' : true;
    if(!name){ UI.toast('Le nom est obligatoire', true); return; }
    if(!selectedIcon){ UI.toast('Veuillez choisir une icône dans l\'onglet Médias', true); setTab('medias'); return; }

    const data = { name, description:desc||'', active, icon:selectedIcon, category:selectedCategory, tariffs:[...tariffs] };

    if(id){
      try {
        await DB.updateArticle(id, data);
        UI.toast('Article modifié avec succès');
        UI.showSuccess('Article modifié !', `"${name}" a été mis à jour.`, null, null);
      } catch (e) { UI.toast(e.message, true); }
    } else {
      try {
        const created = await DB.createArticle(data);
        UI.toast('Article créé avec succès');
        UI.showSuccess('Article créé !', `"${name}" est maintenant disponible.`, null, 'article-new');
      } catch (e) { UI.toast(e.message, true); }
    }
  }

  return { mount, setTab, openAddTarif, pickTarifService, selectTarifService, closeTarifModal, confirmAddTarif, removeTarif, pickCategory, _selectCat, reset, submit };
})();

// ---------------------------------------------------------------
// ICON PICKER
// ---------------------------------------------------------------
const IconPicker = (function(){
  const ICONS = [
    'bi-handbag','bi-basket3-fill','bi-person-standing','bi-suit-heart','bi-square-half',
    'bi-shirt','bi-bag','bi-bag-fill','bi-bag-heart','bi-bag-heart-fill',
    'bi-briefcase','bi-briefcase-fill','bi-layers','bi-layers-fill','bi-archive',
    'bi-box','bi-box-fill','bi-box2','bi-box2-fill','bi-boxes',
    'bi-star','bi-star-fill','bi-heart','bi-heart-fill','bi-diamond',
    'bi-gem','bi-trophy','bi-award','bi-tag','bi-tags',
    'bi-bookmark','bi-bookmark-fill','bi-flag','bi-flag-fill','bi-patch-check',
    'bi-shield','bi-droplet','bi-droplet-fill','bi-water','bi-wind',
    'bi-sun','bi-moon','bi-cloud','bi-snow','bi-flower1',
    'bi-shoe','bi-shoes','bi-slippers','bi-gloves','bi-scarf',
    'bi-hat','bi-vest','bi-jacket','bi-raincoat','bi-coat',
    'bi-cap','bi-sunglasses','bi-pants','bi-dress','bi-skirt',
    'bi-sweater','bi-tshirt','bi-slipper','bi-boot','bi-sandal',
    'bi-tie','bi-belt','bi-backpack','bi-handbag-fill','bi-wallet',
    'bi-scissors','bi-fabric','bi-soap','bi-water-bottle','bi-spray-bottle',
    'bi-hanger','bi-cone-striped','bi-moisture','bi-fire','bi-snowflake',
    'bi-wind','bi-pin','bi-tag-fill','bi-check2-circle','bi-exclamation-triangle',
    'bi-check-circle','bi-x-circle','bi-clock','bi-calendar','bi-person',
    'bi-telephone','bi-geo-alt','bi-geo','bi-map','bi-house',
    'bi-building','bi-shop','bi-cart','bi-credit-card','bi-cash-coin',
  ];
  let selectedIcon = null;

  function open(){
    filter();
    Picker.open('iconModal');
  }
  function close(){ Picker.close('iconModal'); }

  function filter(){
    const q = document.getElementById('iconSearchInput')?.value?.toLowerCase()||'';
    const grid = document.getElementById('iconGrid');
    if(!grid) return;
    const filtered = ICONS.filter(ic=>!q||ic.replace('bi-','').includes(q));
    grid.innerHTML = filtered.map(ic=>`
      <button onclick="IconPicker.select('${ic}')" title="${ic}"
        class="w-full aspect-square flex items-center justify-center rounded-xl border-2 transition hover:border-accent/40 hover:bg-accent/10"
        style="background:rgba(255,255,255,0.03);border-color:${selectedIcon===ic?'#4DBBF8':'rgba(255,255,255,0.08)'}">
        <i class="bi ${ic} text-xl ${selectedIcon===ic?'text-accent2':'text-white/60'}"></i>
      </button>
    `).join('');
  }

  function select(icon){
    selectedIcon = icon;
    // Update article form
    const preview = document.getElementById('iconPreviewBtn');
    if(preview) preview.innerHTML = `<i class="bi ${icon} text-3xl text-white"></i>`;
    ArticleForm._selectedIcon = icon;
    // Expose to ArticleForm
    window._pickedIcon = icon;
    filter(); // refresh selection state
    setTimeout(()=>{ close(); }, 200);
    UI.toast(`Icône sélectionnée`);
  }

  // Expose selected icon to ArticleForm
  Object.defineProperty(ArticleForm, '_selectedIcon', {
    get(){ return selectedIcon; },
    set(v){ selectedIcon = v; }
  });

  return { open, close, filter, select };
})();

// ---------------------------------------------------------------
// Patch ArticleForm.submit to use IconPicker's icon
// ---------------------------------------------------------------
const _origSubmit = ArticleForm.submit;
ArticleForm.submit = function(id){
  // selectedIcon is accessed via ArticleForm._selectedIcon which proxies to IconPicker
  // Re-bind via closure trick:
  _origSubmit.call(this, id);
};

// Make ArticleForm actually use the icon from IconPicker
// Override submit properly
ArticleForm.submit = function(id){
  const name = document.getElementById('artName')?.value?.trim();
  const desc = document.getElementById('artDesc')?.value?.trim();
  const activeEl = document.getElementById('artActiveToggle');
  const active = activeEl ? activeEl.dataset.on === 'true' : true;
  const icon = ArticleForm._selectedIcon;
  if(!name){ UI.toast('Le nom est obligatoire', true); return; }
  if(!icon){ UI.toast('Veuillez choisir une icône dans l\'onglet Médias', true); ArticleForm.setTab('medias'); return; }
  const data = { name, description:desc||'', active, icon, category:ArticleForm._selectedCategory, tariffs:[...(ArticleForm._tariffs||[])] };
  if(id){
    DB.update(DB.articles, id, data);
    UI.showSuccess('Article modifié !', `"${name}" a été mis à jour.`, null, null);
  } else {
    DB.create(DB.articles, data);
    UI.showSuccess('Article créé !', `"${name}" est maintenant disponible.`, null, 'article-new');
  }
};

// ---------------------------------------------------------------
// SERVICE FORM (Create)
// ---------------------------------------------------------------
const ServiceForm = (function(){
  const EXCLUSIVITY_GROUPS = ['Traitement','Finition','Livraison','Express'];
  let _excIdx = 0;

  function mount(){
    _excIdx = 0;
  }

  function cycleExclusivity(){
    _excIdx = (_excIdx+1) % EXCLUSIVITY_GROUPS.length;
    const el = document.getElementById('svcExclusivityLabel');
    if(el) el.textContent = EXCLUSIVITY_GROUPS[_excIdx];
  }

  async function submitCreate(){
    const name = document.getElementById('svcName')?.value?.trim();
    const desc = document.getElementById('svcDesc')?.value?.trim();
    const excl = document.getElementById('svcExclusivityLabel')?.textContent||'Traitement';
    if(!name){ UI.toast('Le nom est obligatoire', true); return; }
    try {
      await DB.createService({ name, description:desc||'', exclusivity_group:excl, unit_price:500, kg_pricing_enabled:false, kg_price:null, express_unit_impact:null, active:true });
      UI.showSuccess('Service créé !', `"${name}" est maintenant disponible.`, null, 'service-new');
    } catch (e) { UI.toast(e.message, true); }
  }

  return { mount, cycleExclusivity, submitCreate };
})();

// ---------------------------------------------------------------
// SERVICE EDIT
// ---------------------------------------------------------------
const ServiceEdit = (function(){
  function mount(svc){
    if(!svc) return;
    setTab('infos');
  }

  function setTab(tab){
    document.querySelectorAll('.svc-tab').forEach(el=>{
      const active = el.dataset.svct===tab;
      el.style.borderBottomColor = active ? '#4DBBF8' : 'transparent';
      el.style.color = active ? '#70D4FF' : 'rgba(255,255,255,0.4)';
    });
    document.querySelectorAll('[data-svcpane]').forEach(el=>{
      el.classList.toggle('hidden', el.dataset.svcpane!==tab);
    });
  }

  function toggleKg(e){
    e.stopPropagation();
    const el = document.getElementById('svcKgEnabled');
    if(!el) return;
    const on = !el.classList.contains('border-accent');
    el.style.borderColor = on ? '#4DBBF8' : 'rgba(255,255,255,0.2)';
    el.style.background = on ? 'rgba(77,187,248,0.2)' : '';
    const check = el.querySelector('i');
    if(check) check.classList.toggle('hidden', !on);
  }

  async function submit(id){
    const name = document.getElementById('svcEditName')?.value?.trim();
    const desc = document.getElementById('svcEditDesc')?.value?.trim();
    const unitPrice = parseInt(document.getElementById('svcUnitPrice')?.value)||0;
    const kgPrice = parseInt(document.getElementById('svcKgPrice')?.value)||null;
    const expressUnitImpact = parseInt(document.getElementById('svcExpressUnit')?.value)||null;
    if(!name){ UI.toast('Le nom est obligatoire', true); return; }
    try {
      const svc = DB.find(DB.services, id);
      await DB.updateService(id, {
        name, description:desc||'',
        exclusivity_group: svc?.exclusivity_group || 'Traitement',
        unit_price: unitPrice, kg_pricing_enabled: svc?.kg_pricing_enabled || false,
        kg_price: kgPrice, express_unit_impact: expressUnitImpact,
        active: svc?.active !== false
      });
      UI.showSuccess('Service modifié !', `"${name}" a été mis à jour.`, null, null);
    } catch (e) { UI.toast(e.message, true); }
  }

  return { mount, setTab, toggleKg, submit };
})();

// ---------------------------------------------------------------
// FORFAIT FORM
// ---------------------------------------------------------------
const ForfaitForm = (function(){
  let _selectedArticleId = null;
  let _selectedServiceIds = [];
  let _measure = 'quantite';

  function mount(){
    _selectedArticleId = null;
    _selectedServiceIds = [];
    _measure = 'quantite';
    setTab('infos');
    setMeasure('quantite');
  }

  function setTab(tab){
    document.querySelectorAll('.fft-tab').forEach(el=>{
      const active = el.dataset.fft===tab;
      el.style.borderBottomColor = active ? '#4DBBF8' : 'transparent';
      el.style.color = active ? '#70D4FF' : 'rgba(255,255,255,0.4)';
    });
    document.querySelectorAll('[data-fftpane]').forEach(el=>{
      el.classList.toggle('hidden', el.dataset.fftpane!==tab);
    });
  }

  function setMeasure(m){
    _measure = m;
    document.querySelectorAll('.measure-opt').forEach(el=>{
      const active = el.dataset.measure===m;
      const dot = el.querySelector('.radio-dot');
      if(dot){
        dot.style.borderColor = active ? '#4DBBF8' : 'rgba(255,255,255,0.3)';
        dot.style.background = active ? '#4DBBF8' : '';
        dot.innerHTML = active ? '<span style="width:6px;height:6px;border-radius:50%;background:white;display:block;margin:auto"></span>' : '';
      }
      el.querySelector('span:last-child') && (el.querySelector('span:last-child').style.color = active ? 'white' : 'rgba(255,255,255,0.7)');
    });
  }

  function pickArticle(){
    const list = document.getElementById('articlePickList');
    if(list){
      list.innerHTML = DB.articles.map(a=>`
        <div onclick="ForfaitForm._selectArticle('${a.id}')" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-white/5">
          <i class="bi ${a.icon||'bi-handbag'} text-accent2 text-[14px]"></i>
          <div class="text-white text-[12.5px]">${esc(a.name)}</div>
        </div>
      `).join('');
    }
    Picker.open('articlePickModal');
  }

  function _selectArticle(id){
    _selectedArticleId = id;
    const a = DB.find(DB.articles, id);
    const el = document.getElementById('fftArticleVal');
    if(el && a){ el.textContent=a.name; el.style.color='white'; }
    Picker.close('articlePickModal');
  }

  function pickService(){
    const list = document.getElementById('servicePickList');
    if(list){
      list.innerHTML = DB.services.map(s=>`
        <div onclick="ForfaitForm._toggleService('${s.id}',this)" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-white/5">
          <span class="w-4 h-4 rounded border border-white/20 flex items-center justify-center shrink-0 ${_selectedServiceIds.includes(s.id)?'bg-accent/20 border-accent':''}">${_selectedServiceIds.includes(s.id)?'<i class="bi bi-check text-accent2 text-[10px]"></i>':''}</span>
          <div class="flex-1"><div class="text-white text-[12.5px]">${esc(s.name)}</div></div>
        </div>
      `).join('');
    }
    Picker.open('servicePickModal');
  }

  function _toggleService(id, el){
    const idx = _selectedServiceIds.indexOf(id);
    if(idx===-1) _selectedServiceIds.push(id);
    else _selectedServiceIds.splice(idx,1);
    const check = el.querySelector('span');
    if(check){
      const on = _selectedServiceIds.includes(id);
      check.style.borderColor = on ? '#4DBBF8' : 'rgba(255,255,255,0.2)';
      check.style.background = on ? 'rgba(77,187,248,0.2)' : '';
      check.innerHTML = on ? '<i class="bi bi-check text-accent2 text-[10px]"></i>' : '';
    }
    const val = document.getElementById('fftServiceVal');
    if(val){
      const names = _selectedServiceIds.map(id=>DB.find(DB.services,id)?.name).filter(Boolean);
      val.textContent = names.length ? names.join(', ') : 'Sélectionner les services...';
      val.style.color = names.length ? 'white' : '';
    }
  }

  function submit(){
    const name = document.getElementById('fftName')?.value?.trim();
    const price = parseInt(document.getElementById('fftPrice')?.value)||0;
    const note = document.getElementById('fftNote')?.value?.trim()||'';
    const validityDays = parseInt(document.getElementById('fftValidity')?.value)||30;
    const deliveryLimit = parseInt(document.getElementById('fftDeliveryLimit')?.value)||null;
    const pickupLimit = parseInt(document.getElementById('fftPickupLimit')?.value)||null;
    const quantityLimit = parseInt(document.getElementById('fftQty')?.value)||0;
    const activeEl = document.getElementById('fftActiveToggle');
    const active = activeEl ? activeEl.dataset.on==='true' : true;

    if(!name){ UI.toast('Le nom est obligatoire', true); setTab('infos'); return; }
    if(!price){ UI.toast('Le prix est obligatoire', true); setTab('infos'); return; }
    if(!_selectedArticleId){ UI.toast('Sélectionnez un article', true); setTab('article'); return; }
    if(!_selectedServiceIds.length){ UI.toast('Sélectionnez au moins un service', true); setTab('article'); return; }
    if(!quantityLimit){ UI.toast('La limite de quantité est obligatoire', true); setTab('article'); return; }

    const created = DB.create(DB.forfaits, {
      name, active, price, note, validityDays, quantityLimit, deliveryLimit, pickupLimit,
      mainArticle:{ articleId:_selectedArticleId, serviceIds:[..._selectedServiceIds], measureType:_measure, quantityLimit },
      specialArticles:[]
    });

    UI.showSuccess('Forfait créé !', `"${name}" est maintenant disponible.`, 'forfait-details', 'forfait-new');
    // Store created id for details redirect
    window._lastCreatedForfaitId = created.id;
  }

  return {
    mount,
    setTab,
    setMeasure,
    pickArticle,
    _selectArticle,
    pickService,
    _toggleService,
    submit,
    get _selectedArticleId() { return _selectedArticleId; },
    get _selectedServiceIds() { return _selectedServiceIds; },
    get _measure() { return _measure; }
  };
})();

// Patch success action for forfait details
const _origSuccessAction = UI.successAction;
UI.successAction = function(action){
  if(action==='details' && window._lastCreatedForfaitId){
    document.getElementById('successModal').classList.add('hidden');
    document.getElementById('successModal').style.display='none';
    Router.go('forfait-details', window._lastCreatedForfaitId);
    window._lastCreatedForfaitId = null;
    return;
  }
  _origSuccessAction.call(this, action);
};

// ---------------------------------------------------------------
// DETAILS VIEW (forfait)
// ---------------------------------------------------------------
const DetailsView = (function(){
  function mount(){
    setForfaitTab('params');
  }

  function setForfaitTab(tab){
    document.querySelectorAll('.fd-tab').forEach(el=>{
      const active = el.dataset.fdt===tab;
      el.style.borderBottomColor = active ? '#4DBBF8' : 'transparent';
      el.style.color = active ? '#70D4FF' : 'rgba(255,255,255,0.4)';
    });
    document.querySelectorAll('[data-fdpane]').forEach(el=>{
      el.classList.toggle('hidden', el.dataset.fdpane!==tab);
    });
  }

  async function toggleForfaitActive(id, toggleEl){
    UI.flipToggle(toggleEl);
    const on = toggleEl.dataset.on==='true';
    try {
      const f = DB.find(DB.forfaits, id);
      await DB.updateForfait(id, { ...f, serviceIds: f.serviceIds || [], active: on });
      UI.toast(on ? 'Forfait activé' : 'Forfait désactivé');
    } catch (e) { UI.toast(e.message, true); }
  }

  function deleteForfait(id){
    UI.confirm('Supprimer ce forfait ?', 'Les abonnements existants ne seront pas affectés.', async ()=>{
      try {
        await DB.deleteForfait(id);
        UI.toast('Forfait supprimé');
        Router.go('forfaits-list');
      } catch (e) { UI.toast(e.message, true); }
    });
  }

  return { mount, setForfaitTab, toggleForfaitActive, deleteForfait };
})();

// ---------------------------------------------------------------
// CLIENTS VIEW
// ---------------------------------------------------------------
const ClientsView = (function(){
  let _filter = '';
  let _dateFrom = '';
  let _dateTo = '';
  let _minSpent = '';
  let _maxSpent = '';
  let _showAll = false;

  function mount(){ render(); }

  function filter(q){ _filter = q.toLowerCase(); render(); }
  function setDateFrom(value){ _dateFrom = value; render(); }
  function setDateTo(value){ _dateTo = value; render(); }
  function setMinSpent(value){ _minSpent = value; render(); }
  function setMaxSpent(value){ _maxSpent = value; render(); }
  function toggleShowAll(){ _showAll = !_showAll; render(); }

  function normalizePhone(phone){
    return (phone || '').replace(/[^\d+]/g, '').replace(/^\+/, '');
  }

  function getWhatsappUrl(phone){
    const digits = normalizePhone(phone);
    if(!digits) return '#';
    const text = encodeURIComponent('Merci pour votre fidélité à Pressing Sana');
    return `https://wa.me/${digits}?text=${text}`;
  }

  function exportClients(format){
    exportData('clients', getFilteredClients(true), format);
  }

  function importClients(){
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,application/csv,text/csv';
    input.onchange = async () => {
      const file = input.files?.[0];
      if(!file) return;
      try {
        const text = await file.text();
        const rows = parseCsv(text);
        const headers = rows.shift() || [];
        for(const row of rows){
          const record = {};
          headers.forEach((h,i)=> record[h.trim().toLowerCase()] = row[i] || '');
          const name = record['nom'] || record['name'];
          const phone = record['téléphone'] || record['telephone'] || record['phone'];
          const email = record['email'] || '';
          if(name && phone){
            await DB.createClient({ name, phone, email });
          }
        }
        UI.toast('Clients importés avec succès');
        render();
      } catch(e){ UI.toast(e.message, true); }
    };
    input.click();
  }

  function getFilteredClients(includeAll){
    const filtered = DB.clients.filter(c => {
      const text = `${c.name||''} ${c.phone||''}`.toLowerCase();
      if(_filter && !text.includes(_filter)) return false;
      if(_dateFrom){
        const fromTs = new Date(_dateFrom).getTime();
        if((c.createdAt||0) < fromTs) return false;
      }
      if(_dateTo){
        const toTs = new Date(_dateTo).getTime() + 86399999;
        if((c.createdAt||0) > toTs) return false;
      }
      if(_minSpent){
        if((c.totalSpent || 0) < Number(_minSpent)) return false;
      }
      if(_maxSpent){
        if((c.totalSpent || 0) > Number(_maxSpent)) return false;
      }
      return true;
    }).sort((a,b)=> (b.createdAt || 0) - (a.createdAt || 0));

    if(includeAll || _showAll) return filtered;
    return filtered.slice(0, 10);
  }

  function render(){
    const wrap = document.getElementById('clientsTableWrap');
    if(!wrap) return;
    const allClients = DB.clients.filter(c => {
      const text = `${c.name||''} ${c.phone||''}`.toLowerCase();
      if(_filter && !text.includes(_filter)) return false;
      if(_dateFrom){
        const fromTs = new Date(_dateFrom).getTime();
        if((c.createdAt||0) < fromTs) return false;
      }
      if(_dateTo){
        const toTs = new Date(_dateTo).getTime() + 86399999;
        if((c.createdAt||0) > toTs) return false;
      }
      if(_minSpent){
        if((c.totalSpent || 0) < Number(_minSpent)) return false;
      }
      if(_maxSpent){
        if((c.totalSpent || 0) > Number(_maxSpent)) return false;
      }
      return true;
    }).sort((a,b)=> (b.createdAt || 0) - (a.createdAt || 0));

    if(!allClients.length){
      wrap.innerHTML = `<div class="text-center py-12 text-white/30 text-[12px]">Aucun client trouvé avec ces critères.</div>`;
      return;
    }

    const clients = _showAll ? allClients : allClients.slice(0, 10);
    const toggleLabel = _showAll ? 'Réduire la liste' : `Voir tous (${allClients.length})`;

    wrap.innerHTML = `
      <div class="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02] text-white/60 text-[12px]">
        <div>${clients.length} client${clients.length>1?'s':''} affiché${clients.length>1?'s':''} — ${allClients.length} trouvé${allClients.length>1?'s':''}</div>
        ${allClients.length > 10 ? `<button onclick="ClientsView.toggleShowAll()" class="btn-ghost text-[12px]">${toggleLabel}</button>` : ''}
      </div>
      <div class="flex items-center px-4 py-2.5 border-b border-white/5 text-white/35 text-[10.5px] font-semibold uppercase tracking-wide">
        <div class="flex-1">Client</div>
        <div class="hidden sm:block w-44 flex-shrink-0">Téléphone</div>
        <div class="hidden md:block w-24 flex-shrink-0 text-right">Commandes</div>
        <div class="hidden lg:block w-32 flex-shrink-0 text-right">Total dépensé</div>
        <div class="hidden xl:block w-32 flex-shrink-0 text-right">Inscription</div>
        <div class="w-20 flex-shrink-0 text-right">Actions</div>
      </div>
      ${clients.map(c=>`
        <div class="table-row-ui">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <div class="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center shrink-0 text-accent2 text-[10px] font-semibold">${(c.name||'').split(' ').map(w=>w[0]).filter(Boolean).slice(0,2).join('').toUpperCase()}</div>
            <div class="min-w-0">
              <div class="text-white text-[12.5px] font-medium truncate">${esc(c.name)}</div>
              <div class="text-white/35 text-[10.5px] truncate">${c.email||'Pas d\'email'}</div>
            </div>
          </div>
          <div class="hidden sm:block w-44 flex-shrink-0 text-white/60 text-[11px]">
            <a href="${getWhatsappUrl(c.phone)}" target="_blank" class="flex items-center gap-2 hover:text-accent2 transition">
              <span>${esc(c.phone)}</span>
              <i class="bi bi-whatsapp text-[14px] text-emerald-400"></i>
            </a>
          </div>
          <div class="hidden md:block w-24 flex-shrink-0 text-right text-white/60 text-[11px]">${c.ordersCount || 0} cmd</div>
          <div class="hidden lg:block w-32 flex-shrink-0 text-right text-white text-[12px] font-medium">${DB.fmtFCFA(c.totalSpent)}</div>
          <div class="hidden xl:block w-32 flex-shrink-0 text-right text-white/60 text-[11px]">${DB.fmtDate(c.createdAt)}</div>
          <div class="w-20 flex-shrink-0 text-right flex items-center justify-end gap-2">
            <button onclick="ClientsView.openAddClient('${c.id}')" class="text-white/40 hover:text-accent2 text-[12px] transition"><i class="bi bi-pencil"></i></button>
            <button onclick="ClientsView.deleteClient('${c.id}')" class="text-white/40 hover:text-rose-400 text-[12px] transition"><i class="bi bi-trash"></i></button>
          </div>
        </div>
      `).join('')}`;
  }

  function openAddClient(editId){
    const modal = document.getElementById('addClientModal');
    if(modal){
      const title = modal.querySelector('h3');
      if(title) title.textContent = editId ? 'Modifier le client' : 'Ajouter un client';
      if(editId){
        const c = DB.find(DB.clients, editId);
        if(c){
          const n=document.getElementById('newClientName'), p=document.getElementById('newClientPhone'), e=document.getElementById('newClientEmail');
          if(n) n.value=c.name; if(p) p.value=c.phone; if(e) e.value=c.email||'';
          modal.dataset.editId=editId;
        }
      } else {
        const n=document.getElementById('newClientName'), p=document.getElementById('newClientPhone'), e=document.getElementById('newClientEmail');
        if(n) n.value=''; if(p) p.value=''; if(e) e.value='';
        delete modal.dataset.editId;
      }
    }
    Picker.open('addClientModal');
  }

  function confirmAddClient(){
    const name = document.getElementById('newClientName')?.value?.trim();
    const phone = document.getElementById('newClientPhone')?.value?.trim();
    const email = document.getElementById('newClientEmail')?.value?.trim();
    const modal = document.getElementById('addClientModal');
    const editId = modal?.dataset?.editId;

    if(!name||!phone){ UI.toast('Nom et téléphone obligatoires', true); return; }

    if(editId){
      DB.update(DB.clients, editId, {name, phone, email:email||''});
      UI.toast('Client modifié');
    } else {
      const newClient = DB.create(DB.clients, {name, phone, email:email||'', ordersCount:0, totalSpent:0, createdAt: Date.now()});
      UI.toast('Client ajouté');
      // If transaction form is open, refresh it so the new client appears and is selectable
      try{ if(window.ComptabiliteView && typeof window.ComptabiliteView.mount === 'function') ComptabiliteView.mount(); }catch(e){}
    }
    Picker.close('addClientModal');
    render();
  }

  function deleteClient(id){
    UI.confirm('Supprimer ce client ?', 'L\'historique des commandes sera conservé.', ()=>{
      DB.remove(DB.clients, id);
      UI.toast('Client supprimé');
      render();
    });
  }

  return { mount, filter, setDateFrom, setDateTo, setMinSpent, setMaxSpent, toggleShowAll, exportClients, importClients, render, openAddClient, confirmAddClient, deleteClient };
})();

const AbonnementsView = (function(){
  let _filter = '';
  function mount(){ render(); }
  function filter(q){ _filter = q.toLowerCase(); render(); }
  function render(){
    const wrap = document.getElementById('abonnementsWrap');
    if(!wrap) return;
    const items = DB.abonnements.filter(a =>
      !_filter || a.clientName.toLowerCase().includes(_filter) || a.forfaitName.toLowerCase().includes(_filter)
    );
    if(!items.length){
      wrap.innerHTML = `<div class="text-center py-14 text-white/30 text-[12px]">Aucun abonnement trouvé.</div>`;
      return;
    }
    wrap.innerHTML = `
      <div class="flex items-center px-4 py-3 border-b border-white/5 text-white/35 text-[10.5px] uppercase tracking-wide">
        <div class="flex-1">Client</div>
        <div class="hidden sm:block w-40">Forfait</div>
        <div class="hidden md:block w-24 text-right">Utilisé</div>
        <div class="w-32 text-right">Expiration</div>
        <div class="w-16 text-right">Actions</div>
      </div>
      ${items.map(a=>`
        <div class="table-row-ui">
          <div class="flex-1 min-w-0">
            <div class="text-white text-[12.5px] font-medium truncate">${esc(a.clientName)}</div>
            <div class="text-white/35 text-[10.5px] truncate">${esc(a.clientId)}</div>
          </div>
          <div class="hidden sm:block w-40 text-white/60 text-[11px] truncate">${esc(a.forfaitName)}</div>
          <div class="hidden md:block w-24 text-right text-white/60 text-[11px]">${a.usedQty}/${a.quantityLimit}</div>
          <div class="w-32 text-right text-white/60 text-[11px]">${DB.fmtDate(a.expiresAt)}</div>
          <div class="w-16 text-right">
            <button onclick="AbonnementsView.deleteAbo('${a.id}')" class="text-white/40 hover:text-rose-400 text-[12px] transition"><i class="bi bi-trash"></i></button>
          </div>
        </div>
      `).join('')}
    `;
  }

  function openNewModal(){
    const clientSel = document.getElementById('aboClientSel');
    const forfaitSel = document.getElementById('aboForfaitSel');
    if(clientSel){
      clientSel.innerHTML = DB.clients.length ? DB.clients.map(c=>`<option value="${c.id}">${esc(c.name)} · ${esc(c.phone)}</option>`).join('') : '<option value="">Aucun client disponible</option>';
    }
    if(forfaitSel){
      forfaitSel.innerHTML = DB.forfaits.length ? DB.forfaits.map(f=>`<option value="${f.id}">${esc(f.name)} (${DB.fmtFCFA(f.price)})</option>`).join('') : '<option value="">Aucun forfait disponible</option>';
    }
    Picker.open('newAbonnementModal');
  }

  return { mount, filter, render, openNewModal };
})();

const PromotionsView = (function(){
  let _filter = '';
  function mount(){ render(); }
  function filter(q){ _filter = q.toLowerCase(); render(); }
  function render(){
    const wrap = document.getElementById('promotionsWrap');
    if(!wrap) return;
    const items = DB.promotions.filter(p =>
      !_filter || p.name.toLowerCase().includes(_filter) || p.type.toLowerCase().includes(_filter)
    );
    if(!items.length){
      wrap.innerHTML = `<div class="text-center py-14 text-white/30 text-[12px]">Aucune promotion trouvée.</div>`;
      return;
    }
    wrap.innerHTML = items.map(p=>`
      <div class="table-row-ui flex-wrap items-center gap-3">
        <div class="flex-1 min-w-0">
          <div class="text-white text-[12.5px] font-medium">${esc(p.name)}</div>
          <div class="text-white/35 text-[11px]">${p.type==='percent' ? p.value+'%' : DB.fmtFCFA(p.value)} · Exp. ${p.expiresAt?DB.fmtDate(p.expiresAt):'—'}</div>
        </div>
        <div class="w-24 text-right text-white/60 text-[11px]">${p.active ? 'Actif' : 'Inactif'}</div>
        <div class="w-24 text-right">
          <button onclick="PromotionsView.toggle('${p.id}', ${p.active})" class="text-white/40 hover:text-accent2 text-[12px] transition">${p.active ? 'Désactiver' : 'Activer'}</button>
        </div>
        <div class="w-16 text-right">
          <button onclick="PromotionsView.delete('${p.id}')" class="text-white/40 hover:text-rose-400 text-[12px] transition"><i class="bi bi-trash"></i></button>
        </div>
      </div>
    `).join('');
  }
  return { mount, filter, render };
})();

const CategoriesView = (function(){
  let _filter = '';
  function mount(){ render(); }
  function filter(q){ _filter = q.toLowerCase(); render(); }
  function render(){
    const wrap = document.getElementById('categoriesWrap');
    if(!wrap) return;
    const items = DB.categories.filter(c =>
      !_filter || c.name.toLowerCase().includes(_filter)
    );
    if(!items.length){
      wrap.innerHTML = `<div class="text-center py-14 text-white/30 text-[12px]">Aucune catégorie trouvée.</div>`;
      return;
    }
    wrap.innerHTML = items.map(c=>`
      <div class="table-row-ui">
        <div class="flex-1 min-w-0">
          <div class="text-white text-[12.5px] font-medium truncate">${esc(c.name)}</div>
          <div class="text-white/35 text-[10.5px] truncate">${esc(c.type)}</div>
        </div>
        <div class="w-16 text-right">
          <button onclick="CategoriesView.delete('${c.id}')" class="text-white/40 hover:text-rose-400 text-[12px] transition"><i class="bi bi-trash"></i></button>
        </div>
      </div>
    `).join('');
  }
  return { mount, filter, render, openNew: function(){ CategoriesView.openNew(); } };
})();

// ---------------------------------------------------------------
// PDF GENERATION — ÉTIQUETTES & FACTURES
// ---------------------------------------------------------------
const PDF = (function(){

  // Configuration entreprise
  const COMPANY = {
    name: 'PressingSana',
    address: 'Adresse de votre entreprise',
    phone: '+221 XXXXXXXXX',
    email: 'contact@pressingsana.com',
    website: 'www.pressingsana.com'
  };

  function generateLabel(orderId){
    const order = DB.find(DB.orders, orderId);
    if(!order) { UI.toast('Commande introuvable', true); return; }

    const html = `
      <div style="width: 10cm; height: 15cm; padding: 8mm; font-family: Arial, sans-serif; border: 1px solid #333;">
        <div style="text-align: center; margin-bottom: 10px; border-bottom: 2px solid #333; padding-bottom: 8px;">
          <div style="font-size: 18px; font-weight: bold; color: #000;">${COMPANY.name}</div>
          <div style="font-size: 9px; color: #666;">${COMPANY.phone}</div>
        </div>
        
        <div style="text-align: center; margin: 15px 0; padding: 10px; background: #f0f0f0; border-radius: 4px;">
          <div style="font-size: 11px; color: #666;">N° Commande</div>
          <div style="font-size: 24px; font-weight: bold; color: #000; letter-spacing: 2px;">${esc(order.ref)}</div>
        </div>

        <div style="margin: 12px 0;">
          <div style="font-size: 10px; color: #666; margin-bottom: 3px;">Client :</div>
          <div style="font-size: 14px; font-weight: bold; color: #000;">${esc(order.clientName)}</div>
          ${order.clientPhone ? `<div style="font-size: 9px; color: #666;">${esc(order.clientPhone)}</div>` : ''}
        </div>

        <div style="background: #f0f0f0; padding: 8px; border-radius: 4px; margin: 10px 0;">
          <div style="font-size: 9px; color: #666; margin-bottom: 2px;">Date :</div>
          <div style="font-size: 11px; font-weight: bold; color: #000;">${DB.fmtDate(order.createdAt)}</div>
          <div style="font-size: 9px; color: #666; margin-top: 4px;">Montant : ${DB.fmtFCFA(order.total)}</div>
        </div>

        <div style="margin-top: 15px; padding-top: 10px; border-top: 2px dashed #999; text-align: center;">
          <div style="font-size: 9px; color: #999;">Conservez cette étiquette</div>
        </div>
      </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = html;
    const opt = {
      margin: 0,
      filename: `etiquette-${order.ref}.pdf`,
      image: { type: 'png', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: [100, 150], orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
    UI.toast('Étiquette générée');
  }

  function generateInvoice(orderId){
    const order = DB.find(DB.orders, orderId);
    if(!order) { UI.toast('Commande introuvable', true); return; }

    const items = order.items || [];
    const today = new Date();
    const invoiceDate = DB.fmtDate(today.getTime());

    const html = `
      <div style="width: 210mm; height: 297mm; padding: 20mm; font-family: 'Arial', sans-serif; background: white; color: #333;">
        <!-- HEADER -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 3px solid #4DBBF8; padding-bottom: 20px;">
          <div>
            <div style="font-size: 32px; font-weight: bold; color: #4DBBF8; margin-bottom: 5px;">${COMPANY.name}</div>
            <div style="font-size: 11px; color: #666; line-height: 1.6;">
              ${COMPANY.address}<br/>
              Tel: ${COMPANY.phone}<br/>
              Email: ${COMPANY.email}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 24px; font-weight: bold; color: #333; margin-bottom: 10px;">FACTURE</div>
            <div style="font-size: 11px; color: #666;">
              <div style="margin-bottom: 3px;"><strong>N° Facture :</strong> ${esc(order.ref)}</div>
              <div style="margin-bottom: 3px;"><strong>Date :</strong> ${invoiceDate}</div>
              ${order.rendezvousDate || order.rendezvous_date ? `<div style="margin-bottom: 3px;"><strong>Rendez-vous :</strong> ${DB.fmtDate(order.rendezvousDate || order.rendezvous_date)}</div>` : ''}
              <div><strong>Statut :</strong> ${order.status === 'livree' ? 'Payée' : 'En attente'}</div>
            </div>
          </div>
        </div>

        <!-- CLIENT INFO -->
        <div style="display: flex; gap: 40px; margin-bottom: 30px;">
          <div>
            <div style="font-size: 12px; font-weight: bold; color: #333; margin-bottom: 8px;">FACTURATION À :</div>
            <div style="font-size: 11px; color: #666; line-height: 1.8;">
              <div style="font-weight: bold; margin-bottom: 5px;">${esc(order.clientName)}</div>
              ${order.clientPhone ? `<div>${esc(order.clientPhone)}</div>` : ''}
              ${order.clientEmail ? `<div>${esc(order.clientEmail)}</div>` : ''}
            </div>
          </div>
          <div style="flex: 1;"></div>
        </div>

        <!-- ITEMS TABLE -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 11px;">
          <thead>
            <tr style="background-color: #f5f5f5; border-bottom: 2px solid #4DBBF8;">
              <th style="padding: 10px; text-align: left; font-weight: bold; color: #333;">Article</th>
              <th style="padding: 10px; text-align: center; font-weight: bold; color: #333; width: 80px;">Qté</th>
              <th style="padding: 10px; text-align: right; font-weight: bold; color: #333; width: 100px;">Prix Unit.</th>
              <th style="padding: 10px; text-align: right; font-weight: bold; color: #333; width: 100px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item, idx) => {
              const unitPrice = item.unitPrice || item.unit_price || 0;
              const itemTotal = item.qty * unitPrice;
              return `
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 10px; text-align: left;">${esc(item.name)}</td>
                  <td style="padding: 10px; text-align: center;">${item.qty}</td>
                  <td style="padding: 10px; text-align: right;">${DB.fmtFCFA(unitPrice)}</td>
                  <td style="padding: 10px; text-align: right; font-weight: bold;">${DB.fmtFCFA(itemTotal)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <!-- TOTALS -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 30px;">
          <div style="width: 300px;">
            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; font-size: 11px;">
              <span>Sous-total :</span>
              <span>${DB.fmtFCFA(order.total)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 2px solid #4DBBF8; font-size: 12px; font-weight: bold; color: #333;">
              <span>TOTAL :</span>
              <span>${DB.fmtFCFA(order.total)}</span>
            </div>
          </div>
        </div>

        <!-- NOTES -->
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin-bottom: 30px;">
          <div style="font-size: 10px; color: #666; line-height: 1.6;">
            <strong>Conditions de paiement :</strong> Paiement à réception<br/>
            <strong>Validité :</strong> Cette facture est valide jusqu'à ${new Date(today.getTime() + 30*24*60*60*1000).toLocaleDateString('fr-FR')}
          </div>
        </div>

        <!-- FOOTER -->
        <div style="border-top: 2px solid #ddd; padding-top: 15px; text-align: center; font-size: 9px; color: #999;">
          <div style="margin-bottom: 5px;">Merci pour votre confiance !</div>
          <div>${COMPANY.website} - ${COMPANY.email}</div>
        </div>
      </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = html;
    element.style.width = '210mm';
    element.style.height = 'auto';
    
    const opt = {
      margin: 0,
      filename: `facture-${order.ref}.pdf`,
      image: { type: 'png', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
    UI.toast('Facture générée');
  }

  return { generateLabel, generateInvoice };
})();

const ZonesView = (function(){
  function mount(){ render(); }
  function render(){
    const wrap = document.getElementById('zonesWrap');
    if(!wrap) return;
    const items = DB.stockZones;
    if(!items.length){
      wrap.innerHTML = `<div class="text-center py-14 text-white/30 text-[12px]">Aucune zone de stockage définie.</div>`;
      return;
    }
    wrap.innerHTML = items.map(z=>`
      <div class="table-row-ui">
        <div class="flex-1 min-w-0">
          <div class="text-white text-[12.5px] font-medium truncate">${esc(z.name)}</div>
          <div class="text-white/35 text-[10.5px] truncate">Capacité ${z.capacity} • Utilisé ${z.used}</div>
        </div>
        <div class="w-24 text-right text-white/60 text-[11px]">${Math.round((z.used/z.capacity)*100)}%</div>
        <div class="w-20 text-right">
          <button onclick="ZonesView.edit('${z.id}')" class="text-white/40 hover:text-accent2 text-[12px] transition"><i class="bi bi-pencil"></i></button>
          <button onclick="ZonesView.delete('${z.id}')" class="text-white/40 hover:text-rose-400 text-[12px] transition ml-2"><i class="bi bi-trash"></i></button>
        </div>
      </div>
    `).join('');
  }
  return { mount, render, openNew: function(){ ZonesView.openNew(); } };
})();

const SettingsView = (function(){
  function mount(){ /* Backend patch will fill the fields */ }
  function save(){ /* Backend patch will implement */ }
  return { mount, save };
})();

const TemplatesView = (function(){
  let templates = [];
  function load(){
    const raw = localStorage.getItem('pressingsana_templates');
    try { templates = raw ? JSON.parse(raw) : null; } catch(e){ templates = null; }
    if(!templates || !templates.length){
      templates = [
        { id:'tmpl-1', title:'Confirmation commande', type:'email', content:'Bonjour {{client}}, votre commande {{ref}} a bien été reçue.' },
        { id:'tmpl-2', title:'Rappel de collecte', type:'sms', content:'Bonjour {{client}}, votre commande est prête à être récupérée.' }
      ];
      save();
    }
  }
  function save(){ localStorage.setItem('pressingsana_templates', JSON.stringify(templates)); }
  function render(){
    const wrap = document.getElementById('templatesWrap');
    if(!wrap) return;
    if(!templates.length){
      wrap.innerHTML = '<div class="text-center py-14 text-white/30 text-[12px]">Aucun modèle défini.</div>';
      return;
    }
    wrap.innerHTML = templates.map(t=>`
      <div class="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex flex-col justify-between">
        <div>
          <div class="text-white text-[13px] font-semibold mb-1">${esc(t.title)}</div>
          <div class="text-white/40 text-[11.5px] mb-3">${t.type.toUpperCase()}</div>
          <div class="text-white/40 text-[11px] leading-relaxed break-words">${esc(t.content)}</div>
        </div>
        <div class="mt-4 flex items-center gap-2">
          <button onclick="TemplatesView.openEditor('${t.id}')" class="btn-ghost text-[12px]">Modifier</button>
          <button onclick="TemplatesView.removeTemplate('${t.id}')" class="btn-ghost text-[12px] text-rose-400">Supprimer</button>
        </div>
      </div>`).join('');
  }
  function mount(){ load(); render(); }
  function openNew(){ openEditor(); }
  function openEditor(id){
    const tmpl = templates.find(t => t.id === id) || { id:'', title:'', type:'email', content:'' };
    document.getElementById('templateId').value = tmpl.id;
    document.getElementById('templateTitle').value = tmpl.title;
    document.getElementById('templateType').value = tmpl.type;
    document.getElementById('templateContent').value = tmpl.content;
    document.getElementById('templateEditorModal') && Picker.open('templateEditorModal');
  }
  function saveTemplate(){
    const id = document.getElementById('templateId').value || `tmpl-${Date.now()}`;
    const title = document.getElementById('templateTitle').value.trim();
    const type = document.getElementById('templateType').value;
    const content = document.getElementById('templateContent').value.trim();
    if(!title || !content){ UI.toast('Titre et contenu obligatoires', true); return; }
    const existing = templates.find(t => t.id === id);
    if(existing){ existing.title = title; existing.type = type; existing.content = content; }
    else templates.unshift({ id, title, type, content });
    save(); render(); Picker.close('templateEditorModal'); UI.toast('Modèle enregistré');
  }
  function removeTemplate(id){
    UI.confirm('Supprimer ce modèle ?', '', async () => {
      templates = templates.filter(t => t.id !== id);
      save(); render();
      UI.toast('Modèle supprimé');
    });
  }
  function deleteTemplate(){
    const id = document.getElementById('templateId').value;
    if(!id){ Picker.close('templateEditorModal'); return; }
    removeTemplate(id);
  }
  return { mount, openNew, openEditor, saveTemplate, removeTemplate, deleteTemplate };
})();

const PromotionForm = (function(){
  function submit(){ UI.toast('Impossible d’envoyer le formulaire.', true); }
  return { submit };
})();

const AdminView = (function(){
  function mount(){ /* Backend patch will override this */ }
  function openInvite(){ /* Backend patch will override this */ }
  function deleteUser(id){ /* Backend patch will override this */ }
  return { mount, openInvite, deleteUser };
})();

// ---------------------------------------------------------------
// INIT MODALS
// ---------------------------------------------------------------
function initModals(){
  const host = document.getElementById('modalsHost');
  host.innerHTML =
    Views.modalIconPicker() +
    Views.modalAddTarif() +
    Views.modalPickService() +
    Views.modalPickArticle() +
    Views.modalPickClient() +
    Views.modalAddClient() +
    Views.modalAddExpense() +
    Views.modalAddCredit() +
    Views.modalNewAbonnement() +
    Views.modalTemplateEditor() +
    Views.modalSuccess() +
    Views.modalConfirm();
}

// ---------------------------------------------------------------
// KEYBOARD SHORTCUTS
// ---------------------------------------------------------------
document.addEventListener('keydown', e=>{
  if((e.ctrlKey||e.metaKey) && e.key==='k'){ e.preventDefault(); openSearch(); }
  if(e.key==='Escape'){
    closeSearch();
    const notif = document.getElementById('notifPanel');
    if(notif && !notif.classList.contains('hidden')){ notif.classList.add('hidden'); notif.style.display='none'; }
    ['iconModal','tarifModal','servicePickModal','articlePickModal','clientPickModal','addClientModal','comptaExpenseModal','comptaCreditModal','successModal','confirmModal'].forEach(id=>{
      Picker.close(id);
    });
  }
});

// Click outside notif
document.addEventListener('click', e=>{
  const notif = document.getElementById('notifPanel');
  const bellBtn = e.target.closest('[onclick="toggleNotifPanel()"]');
  if(notif && !notif.classList.contains('hidden') && !notif.contains(e.target) && !bellBtn){
    notif.classList.add('hidden'); notif.style.display='none';
  }
  const catPicker = document.getElementById('catInlinePicker');
  if(catPicker && !catPicker.contains(e.target) && !e.target.closest('#artCategoryField')){
    catPicker.remove();
  }
  const searchModal = document.getElementById('searchModal');
  if(searchModal && searchModal.style.display==='flex'){
    const inner = searchModal.querySelector('div');
    if(inner && !inner.contains(e.target) && e.target===searchModal){
      closeSearch();
    }
  }
});

// ---------------------------------------------------------------
// BOOT
// ---------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async ()=>{
  renderMainNav();
  initModals();

  // Afficher loading
  document.getElementById('viewport').innerHTML = `
    <div class="flex flex-col items-center justify-center py-32 gap-4">
      <div class="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
      <p class="text-white/40 text-[13px]">Chargement des données...</p>
    </div>`;

  const user = await Auth.load();
  if(user) {
    try {
      await DB.loadAll();
    } catch(e) {
      document.getElementById('viewport').innerHTML = `
        <div class="flex flex-col items-center justify-center py-32 gap-4">
          <i class="bi bi-exclamation-triangle text-3xl text-rose-400"></i>
          <p class="text-rose-400 text-[13px]">Impossible de se connecter au serveur.</p>
          <p class="text-white/30 text-[12px]">Vérifiez que le serveur Node.js est bien démarré (double-cliquez sur START.bat).</p>
          <button onclick="location.reload()" class="btn-primary mt-2">Réessayer</button>
        </div>`;
      return;
    }
  }

  Router.go(user ? 'dashboard' : 'login');
  updateClock();
  setInterval(updateClock, 30000);
});