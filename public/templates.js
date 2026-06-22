/* ============================================================
   PRESSINGSANA — VIEW TEMPLATES
   ============================================================ */

const Views = {};

// ---------------------------------------------------------------
// HELPERS communs
// ---------------------------------------------------------------
function initials(name){
  return (name||'').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
}
function statusBadge(status, big){
  const map = {
    en_attente: {label:'En attente', cls:'bg-amber-500/15 text-amber-400', icon:'bi-hourglass-split'},
    collectee:  {label:'Collectée',  cls:'bg-sky-500/15 text-sky-400',     icon:'bi-box-seam'},
    en_cours:   {label:'En cours',   cls:'bg-indigo-500/15 text-indigo-300',icon:'bi-arrow-repeat'},
    prete:      {label:'Prête',      cls:'bg-emerald-500/15 text-emerald-400',icon:'bi-check2'},
    livree:     {label:'Livrée',     cls:'bg-violet-500/15 text-violet-300',icon:'bi-truck'},
    impayee:    {label:'Impayée',    cls:'bg-rose-500/15 text-rose-400',   icon:'bi-exclamation-circle'},
  };
  const s = map[status] || map.en_attente;
  return `<span class="badge ${s.cls} ${big?'text-[12px] px-3 py-1.5':''}"><i class="bi ${s.icon}"></i> ${s.label}</span>`;
}
function esc(str){
  if(str===null||str===undefined) return '';
  return String(str).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// ---------------------------------------------------------------
// CAISSE
// ---------------------------------------------------------------
Views.caisse = function(){
  return `
  <div class="fade-in flex flex-col xl:flex-row gap-5" style="min-height:calc(100vh - 100px)">
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-4">
        <div class="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/35 text-[12px]">
          <i class="bi bi-search text-[12px]"></i>
          <input oninput="Caisse.filterArticles(this.value)" type="text" placeholder="Rechercher un article..." class="bg-transparent outline-none flex-1 text-white placeholder-white/35">
        </div>
        <button onclick="Router.go('article-new')" class="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition" title="Ajouter un article"><i class="bi bi-plus-lg"></i></button>
      </div>
      <div id="caisseGrid" class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3"></div>
    </div>

    <!-- Ticket -->
    <div class="w-full xl:w-[290px] shrink-0 bg-white/[0.03] border border-white/10 rounded-xl flex flex-col">
      <div class="p-3.5 border-b border-white/10">
        <div class="flex items-center gap-1.5 text-white text-[12.5px] font-semibold mb-2">
          <i class="bi bi-receipt text-[12px]"></i> Ticket de Caisse
        </div>
        <button onclick="Caisse.openClientPicker()" id="ticketClientBtn" class="w-full flex items-center justify-between bg-white/5 hover:bg-white/[0.08] transition rounded-lg px-2.5 py-2 text-white/40 text-[11px]">
          <span id="ticketClientLabel">Sélectionner un client</span>
          <i class="bi bi-plus-lg text-[11px]"></i>
        </button>
        <div class="mt-3">
          <label class="text-white/50 text-[11px] mb-1 block">Date de rendez-vous</label>
          <input id="orderRendezvousDate" type="date" class="input-base w-full bg-black/10 text-white border-white/15">
        </div>
      </div>
      <div id="cartBody" class="flex-1 overflow-y-auto scrollbar-thin min-h-[160px]"></div>
      <div class="p-3.5 border-t border-white/10 space-y-1.5">
        <div class="flex justify-between text-white/45 text-[11.5px]"><span>Sous-total</span><span id="subTotal">0 FCFA</span></div>
        <div class="flex justify-between text-white font-semibold text-[13.5px]"><span>Total</span><span id="cartTotal">0 FCFA</span></div>
        <button onclick="Caisse.validateOrder()" id="validateOrderBtn" class="w-full mt-2 btn-primary flex items-center justify-center gap-2 opacity-40 cursor-not-allowed">
          <i class="bi bi-check2-circle"></i> Valider la commande
        </button>
      </div>
    </div>
  </div>`;
};

// ---------------------------------------------------------------
// LISTE GÉNÉRIQUE
// ---------------------------------------------------------------
Views.genericList = function({addLabel, addRoute}){
  return `
  <div class="fade-in">
    <div class="flex items-center gap-2 mb-4 flex-wrap">
      <label class="w-4 h-4 rounded border border-white/20 shrink-0 cursor-pointer flex items-center justify-center" onclick="ListView.toggleAll(this)"></label>
      <div class="flex-1 min-w-[140px] flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/35 text-[12px]">
        <i class="bi bi-search text-[12px]"></i>
        <input oninput="ListView.filter(this.value)" type="text" placeholder="Rechercher..." class="bg-transparent outline-none flex-1 text-white placeholder-white/35">
      </div>
      <button class="flex items-center gap-1.5 text-white/60 text-[11.5px] border border-white/10 rounded-lg px-3 py-2 hover:bg-white/5"><i class="bi bi-funnel"></i> Tous <i class="bi bi-chevron-down text-[9px]"></i></button>
      <button class="flex items-center gap-1.5 text-white/60 text-[11.5px] border border-white/10 rounded-lg px-3 py-2 hover:bg-white/5"><i class="bi bi-calendar3"></i> Date</button>
      <button class="flex items-center gap-1.5 text-white/60 text-[11.5px] border border-white/10 rounded-lg px-3 py-2 hover:bg-white/5"><i class="bi bi-sort-down"></i> Trier</button>
      <button onclick="ListView.importCurrent()" class="hidden sm:flex items-center gap-1.5 text-white/60 text-[11.5px] border border-white/10 rounded-lg px-3 py-2 hover:bg-white/5"><i class="bi bi-upload"></i> Importer</button>
      <button onclick="ListView.exportCurrent('csv')" class="hidden sm:flex items-center gap-1.5 text-white/60 text-[11.5px] border border-white/10 rounded-lg px-3 py-2 hover:bg-white/5"><i class="bi bi-download"></i> Exporter CSV</button>
      <button onclick="ListView.exportCurrent('excel')" class="hidden sm:flex items-center gap-1.5 text-white/60 text-[11.5px] border border-white/10 rounded-lg px-3 py-2 hover:bg-white/5"><i class="bi bi-download"></i> Exporter Excel</button>
    </div>
    <div id="genericTableWrap" class="border border-white/10 rounded-xl overflow-hidden"></div>
  </div>`;
};

// ---------------------------------------------------------------
// ARTICLE — FORMULAIRE
// ---------------------------------------------------------------
Views.articleForm = function(article){
  const isEdit = !!article;
  const a = article || { name:'', description:'', active:true, icon:null, category:null, tariffs:[] };
  return `
  <div class="fade-in max-w-2xl">
    <p class="text-white/40 text-[12px] mb-5 -mt-1">${isEdit ? "Modifiez les informations et tarifs de cet article." : "Définissez un article et ses tarifs spécifiques pour les différents services."}</p>
    <div class="flex items-center gap-6 border-b border-white/10 mb-5 text-[12.5px] overflow-x-auto scrollbar-thin">
      <button onclick="ArticleForm.setTab('general')" data-artt="general" class="art-tab pb-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap"><i class="bi bi-info-circle"></i> Général</button>
      <button onclick="ArticleForm.setTab('tarifs')" data-artt="tarifs" class="art-tab pb-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap"><i class="bi bi-tag"></i> Tarifs</button>
      <button onclick="ArticleForm.setTab('medias')" data-artt="medias" class="art-tab pb-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap"><i class="bi bi-image"></i> Médias</button>
    </div>
    <!-- GENERAL -->
    <div data-artpane="general" class="art-pane space-y-4">
      <div>
        <label class="text-white text-[12.5px] font-medium">Nom de l'article <span class="text-accent2">*</span></label>
        <input id="artName" type="text" value="${esc(a.name)}" placeholder="Ex : Chemise, Pantalon, Veste" class="input-base mt-1.5">
      </div>
      <div>
        <label class="text-white text-[12.5px] font-medium">Description</label>
        <textarea id="artDesc" rows="3" placeholder="Description de l'article..." class="input-base mt-1.5 resize-none">${esc(a.description||'')}</textarea>
      </div>
      <div>
        <label class="text-white text-[12.5px] font-medium block mb-1.5">Actif</label>
        <div id="artActiveToggle" onclick="UI.flipToggle(this)" class="toggle-track ${a.active!==false?'bg-accent':'bg-white/15'}" style="background:${a.active!==false?'#4DBBF8':'rgba(255,255,255,0.15)'}" data-on="${a.active!==false}">
          <span class="toggle-knob" style="left:${a.active!==false?'1rem':'0.125rem'}"></span>
        </div>
      </div>
      <div>
        <label class="text-white text-[12.5px] font-medium">Catégorie</label>
        <div onclick="ArticleForm.pickCategory()" id="artCategoryField" class="mt-1.5 cursor-pointer flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-[12.5px] ${a.category?'text-white':'text-white/25'}">
          <i class="bi bi-search text-[11px]"></i>
          <span id="artCategoryLabel" class="flex-1">${a.category ? esc(a.category) : 'Sélectionner des options...'}</span>
          <i class="bi bi-plus-lg text-[11px]"></i>
        </div>
      </div>
    </div>
    <!-- TARIFS -->
    <div data-artpane="tarifs" class="art-pane space-y-3 hidden">
      <div id="tarifsList" class="space-y-3"></div>
      <button onclick="ArticleForm.openAddTarif()" class="flex items-center gap-1.5 text-accent2 text-[12px] font-medium hover:underline"><i class="bi bi-plus-lg"></i> Ajouter</button>
    </div>
    <!-- MEDIAS -->
    <div data-artpane="medias" class="art-pane hidden">
      <label class="text-white text-[12.5px] font-medium">Icône de l'article <span class="text-accent2">*</span></label>
      <div class="mt-2 flex items-end gap-4">
        <button onclick="IconPicker.open()" id="iconPreviewBtn" class="w-20 h-20 rounded-lg border-2 border-dashed border-white/15 flex items-center justify-center text-white/20 hover:border-accent/50 transition">
          ${a.icon ? `<i class="bi ${a.icon} text-3xl text-white"></i>` : `<i class="bi bi-image text-2xl"></i>`}
        </button>
      </div>
      <button onclick="IconPicker.open()" class="mt-3 flex items-center gap-1.5 text-white/60 text-[11.5px] border border-white/10 rounded-lg px-3 py-1.5 hover:bg-white/5"><i class="bi bi-arrow-repeat"></i> ${a.icon?'Changer':'Ajouter'}</button>
      <p id="iconError" class="text-rose-400 text-[11px] mt-1.5 hidden">Ce champ est obligatoire</p>
    </div>
    <div class="flex items-center gap-4 mt-6">
      <button onclick="ArticleForm.submit('${isEdit ? a.id : ''}')" class="btn-primary">${isEdit ? "Enregistrer les modifications" : "Créer l'article"}</button>
      <button onclick="ArticleForm.reset()" class="btn-ghost">Réinitialiser</button>
      ${isEdit ? `<button onclick="Router.go('articles-list')" class="btn-ghost ml-auto">Annuler</button>` : ''}
    </div>
  </div>`;
};

// ---------------------------------------------------------------
// SERVICE — FORMULAIRE Créer
// ---------------------------------------------------------------
Views.serviceFormCreate = function(){
  return `
  <div class="fade-in max-w-2xl">
    <p class="text-white/40 text-[12px] mb-5 -mt-1">Créez les services proposés dans votre établissement.</p>
    <div class="flex items-center gap-6 border-b border-white/10 mb-5 text-[12.5px]">
      <button class="pb-2.5 flex items-center gap-1.5 border-b-2 border-accent text-accent2 font-medium"><i class="bi bi-info-circle"></i> Infos de base</button>
      <button class="pb-2.5 flex items-center gap-1.5 border-b-2 border-transparent text-white/40 cursor-not-allowed"><i class="bi bi-sliders"></i> Paramètres</button>
    </div>
    <div class="space-y-4">
      <div>
        <label class="text-white text-[12.5px] font-medium">Nom du service <span class="text-accent2">*</span></label>
        <input id="svcName" type="text" placeholder="Ex : Lavage classique simple" class="input-base mt-1.5">
      </div>
      <div>
        <label class="text-white text-[12.5px] font-medium">Groupe d'exclusivité <span class="text-accent2">*</span></label>
        <div id="svcExclusivityField" onclick="ServiceForm.cycleExclusivity()" class="mt-1.5 cursor-pointer flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-[12.5px]">
          <span id="svcExclusivityLabel">Traitement</span><i class="bi bi-chevron-down text-[10px] text-white/40"></i>
        </div>
      </div>
      <div>
        <label class="text-white text-[12.5px] font-medium">Description</label>
        <textarea id="svcDesc" rows="3" placeholder="Décrivez le service..." class="input-base mt-1.5 resize-none"></textarea>
      </div>
      <div>
        <label class="text-white text-[12.5px] font-medium">Groupe de taxes par défaut</label>
        <div class="mt-1.5 flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white/25 text-[12.5px]">
          <i class="bi bi-search text-[11px]"></i><span class="flex-1">Sélectionner des options...</span><i class="bi bi-plus-lg text-[11px]"></i>
        </div>
      </div>
      <div>
        <label class="text-white text-[12.5px] font-medium">Services incompatibles</label>
        <div class="mt-1.5 flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white/25 text-[12.5px]">
          <i class="bi bi-search text-[11px]"></i><span class="flex-1">Sélectionner...</span><i class="bi bi-plus-lg text-[11px]"></i>
        </div>
      </div>
    </div>
    <div class="flex items-center gap-4 mt-6">
      <button onclick="ServiceForm.submitCreate()" class="btn-primary">Enregistrer le service</button>
      <button onclick="Router.go('service-new')" class="btn-ghost">Réinitialiser</button>
    </div>
  </div>`;
};

// ---------------------------------------------------------------
// SERVICE — FORMULAIRE Modifier
// ---------------------------------------------------------------
Views.serviceFormEdit = function(svc){
  return `
  <div class="fade-in max-w-2xl">
    <p class="text-white/40 text-[12px] mb-5 -mt-1">Mettez à jour les détails de votre service ici.</p>
    <div class="flex items-center gap-6 border-b border-white/10 mb-5 text-[12.5px]">
      <button onclick="ServiceEdit.setTab('infos')" data-svct="infos" class="svc-tab pb-2.5 flex items-center gap-1.5 border-b-2"><i class="bi bi-info-circle"></i> Infos de base</button>
      <button onclick="ServiceEdit.setTab('params')" data-svct="params" class="svc-tab pb-2.5 flex items-center gap-1.5 border-b-2"><i class="bi bi-sliders"></i> Paramètres</button>
    </div>
    <div data-svcpane="infos" class="svc-pane space-y-4">
      <div>
        <label class="text-white text-[12.5px] font-medium">Nom du service <span class="text-accent2">*</span></label>
        <input id="svcEditName" type="text" value="${esc(svc.name)}" class="input-base mt-1.5">
      </div>
      <div>
        <label class="text-white text-[12.5px] font-medium">Groupe d'exclusivité</label>
        <div class="mt-1.5 flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-[12.5px]">
          <span>${esc(svc.exclusivityGroup||'Traitement')}</span><i class="bi bi-chevron-down text-[10px] text-white/40"></i>
        </div>
      </div>
      <div>
        <label class="text-white text-[12.5px] font-medium">Description</label>
        <textarea id="svcEditDesc" rows="3" class="input-base mt-1.5 resize-none">${esc(svc.description||'')}</textarea>
      </div>
    </div>
    <div data-svcpane="params" class="svc-pane hidden space-y-4">
      <div>
        <label class="text-white text-[12.5px] font-medium">Prix unitaire par défaut <span class="text-accent2">*</span></label>
        <div class="mt-1.5 flex items-center bg-white/5 border border-white/10 focus-within:border-accent rounded-lg px-3 py-2.5">
          <i class="bi bi-cash-coin text-white/30 text-[12px] mr-2"></i>
          <input id="svcUnitPrice" type="text" value="${svc.unitPrice ?? ''}" class="bg-transparent outline-none text-white text-[12.5px] flex-1">
          <span class="text-white/30 text-[11px]">FCFA</span>
        </div>
        <p class="text-white/25 text-[10.5px] mt-1">Tous les prix incluent la TVA (TTC)</p>
      </div>
      <div class="pt-2 border-t border-white/10">
        <h3 class="text-white text-[13px] font-semibold mb-3">Tarification au kilo</h3>
        <label class="flex items-center gap-2 text-white/50 text-[11.5px] mb-3 cursor-pointer select-none">
          <span id="svcKgEnabled" onclick="ServiceEdit.toggleKg(event)" class="w-4 h-4 rounded border ${svc.kgPricingEnabled?'border-accent bg-accent/20':'border-white/20'} flex items-center justify-center transition">
            <i class="bi bi-check text-accent2 text-[10px] ${svc.kgPricingEnabled?'':'hidden'}"></i>
          </span>
          Activer la facturation au kg
        </label>
        <div class="mt-1.5 flex items-center bg-white/5 border border-white/10 rounded-lg px-3 py-2.5">
          <i class="bi bi-cash-coin text-white/30 text-[12px] mr-2"></i>
          <input id="svcKgPrice" type="text" value="${svc.kgPrice ?? ''}" placeholder="Prix par kilogramme" class="bg-transparent outline-none text-white text-[12.5px] flex-1 placeholder-white/25">
          <span class="text-white/30 text-[11px]">FCFA</span>
        </div>
      </div>
      <div class="pt-2 border-t border-white/10">
        <h3 class="text-white text-[13px] font-semibold mb-3">Tarification express</h3>
        <div class="mt-1.5 flex items-center bg-white/5 border border-white/10 rounded-lg px-3 py-2.5">
          <i class="bi bi-lightning-charge text-white/30 text-[12px] mr-2"></i>
          <input id="svcExpressUnit" type="text" value="${svc.expressUnitImpact ?? ''}" placeholder="Impact express / unité" class="bg-transparent outline-none text-white text-[12.5px] flex-1 placeholder-white/25">
          <span class="text-white/30 text-[11px]">FCFA</span>
        </div>
      </div>
    </div>
    <div class="flex items-center gap-4 mt-6">
      <button onclick="ServiceEdit.submit('${svc.id}')" class="btn-primary">Enregistrer les modifications</button>
      <button onclick="Router.go('services-list')" class="btn-ghost">Retour</button>
    </div>
  </div>`;
};

// ---------------------------------------------------------------
// FORFAIT — FORMULAIRE Créer
// ---------------------------------------------------------------
Views.forfaitForm = function(){
  return `
  <div class="fade-in max-w-2xl">
    <p class="text-white/40 text-[12px] mb-5 -mt-1">Créez les forfaits d'abonnement pour vos clients.</p>
    <div class="flex items-center gap-6 border-b border-white/10 mb-5 text-[12.5px] flex-wrap">
      <button onclick="ForfaitForm.setTab('infos')" data-fft="infos" class="fft-tab pb-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap"><i class="bi bi-info-circle"></i> Infos de base</button>
      <button onclick="ForfaitForm.setTab('parametres')" data-fft="parametres" class="fft-tab pb-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap"><i class="bi bi-gear"></i> Paramètres</button>
      <button onclick="ForfaitForm.setTab('article')" data-fft="article" class="fft-tab pb-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap"><i class="bi bi-bag"></i> Article principal</button>
      <button onclick="ForfaitForm.setTab('speciaux')" data-fft="speciaux" class="fft-tab pb-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap"><i class="bi bi-stars"></i> Articles spéciaux</button>
    </div>
    <div data-fftpane="infos" class="fft-pane space-y-4">
      <div>
        <label class="text-white text-[12.5px] font-medium block mb-1.5">Actif</label>
        <div id="fftActiveToggle" onclick="UI.flipToggle(this)" class="toggle-track" style="background:#4DBBF8" data-on="true">
          <span class="toggle-knob" style="left:1rem"></span>
        </div>
      </div>
      <div>
        <label class="text-white text-[12.5px] font-medium">Nom du forfait <span class="text-accent2">*</span></label>
        <input id="fftName" type="text" placeholder="Ex : Pack Famille" class="input-base mt-1.5">
      </div>
      <div>
        <label class="text-white text-[12.5px] font-medium">Prix <span class="text-accent2">*</span></label>
        <div class="mt-1.5 flex items-center bg-white/5 border border-white/10 rounded-lg px-3 py-2.5">
          <i class="bi bi-cash-coin text-white/30 text-[12px] mr-2"></i>
          <input id="fftPrice" type="text" placeholder="Entrez le prix" class="bg-transparent outline-none text-white text-[12.5px] flex-1 placeholder-white/25">
          <span class="text-white/30 text-[11px]">FCFA</span>
        </div>
      </div>
      <div>
        <label class="text-white text-[12.5px] font-medium">Note</label>
        <textarea id="fftNote" rows="3" placeholder="Ajouter une note..." class="input-base mt-1.5 resize-none"></textarea>
      </div>
      <div class="flex items-center gap-4 pt-2">
        <button onclick="ForfaitForm.setTab('parametres')" class="btn-primary">Continuer</button>
        <button onclick="Router.go('forfait-new')" class="btn-ghost">Réinitialiser</button>
      </div>
    </div>
    <div data-fftpane="parametres" class="fft-pane hidden space-y-4">
      <div>
        <label class="text-white text-[12.5px] font-medium">Période de validité (jours)</label>
        <input id="fftValidity" type="text" placeholder="30" class="input-base mt-1.5">
      </div>
      <div>
        <label class="text-white text-[12.5px] font-medium">Limite de livraisons</label>
        <input id="fftDeliveryLimit" type="text" placeholder="Illimité si vide" class="input-base mt-1.5">
      </div>
      <div>
        <label class="text-white text-[12.5px] font-medium">Limite de collectes</label>
        <input id="fftPickupLimit" type="text" placeholder="Illimité si vide" class="input-base mt-1.5">
      </div>
      <div class="flex items-center gap-4 pt-2">
        <button onclick="ForfaitForm.setTab('article')" class="btn-primary">Continuer</button>
        <button onclick="ForfaitForm.setTab('infos')" class="btn-ghost">Retour</button>
      </div>
    </div>
    <div data-fftpane="article" class="fft-pane hidden space-y-4">
      <div>
        <label class="text-white text-[12.5px] font-medium">Article <span class="text-accent2">*</span></label>
        <div onclick="ForfaitForm.pickArticle()" id="fftArticleField" class="mt-1.5 cursor-pointer flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white/25 text-[12.5px]">
          <span id="fftArticleVal">Sélectionner un article...</span>
          <div class="flex items-center gap-2 text-white/30"><i class="bi bi-search text-[11px]"></i></div>
        </div>
      </div>
      <div>
        <label class="text-white text-[12.5px] font-medium">Services inclus <span class="text-accent2">*</span></label>
        <div onclick="ForfaitForm.pickService()" id="fftServiceField" class="cursor-pointer mt-1.5 flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white/25 text-[12.5px]">
          <span id="fftServiceVal">Sélectionner les services...</span>
          <div class="flex items-center gap-2 text-white/30"><i class="bi bi-search text-[11px]"></i></div>
        </div>
      </div>
      <div>
        <label class="text-white text-[12.5px] font-medium">Type de mesure <span class="text-accent2">*</span></label>
        <div class="mt-1.5 border border-white/10 rounded-lg p-3 space-y-2.5">
          <label onclick="ForfaitForm.setMeasure('quantite')" class="flex items-center gap-2 text-[12.5px] cursor-pointer measure-opt" data-measure="quantite">
            <span class="radio-dot w-3.5 h-3.5 rounded-full border-2 border-white/30 flex items-center justify-center"></span>
            <span class="text-white/70">Quantité</span>
          </label>
          <label onclick="ForfaitForm.setMeasure('poids')" class="flex items-center gap-2 text-[12.5px] cursor-pointer measure-opt" data-measure="poids">
            <span class="radio-dot w-3.5 h-3.5 rounded-full border-2 border-white/30 flex items-center justify-center"></span>
            <span class="text-white/70">Poids</span>
          </label>
        </div>
      </div>
      <div>
        <label class="text-white text-[12.5px] font-medium">Limite de quantité <span class="text-accent2">*</span></label>
        <input id="fftQty" type="text" placeholder="Entrez la quantité..." class="input-base mt-1.5">
      </div>
      <div class="flex items-center gap-4 pt-2">
        <button onclick="ForfaitForm.submit()" class="btn-primary">Enregistrer le forfait</button>
        <button onclick="ForfaitForm.setTab('parametres')" class="btn-ghost">Retour</button>
      </div>
    </div>
    <div data-fftpane="speciaux" class="fft-pane hidden">
      <div class="flex flex-col items-center justify-center text-center py-14 gap-2">
        <i class="bi bi-stars text-3xl text-white/15"></i>
        <p class="text-white/40 text-[12.5px]">Aucun article spécial ajouté.</p>
        <button onclick="UI.toast('Fonctionnalité non simulée dans ce prototype')" class="text-accent2 text-[12px] hover:underline mt-1">+ Ajouter un article spécial</button>
      </div>
    </div>
  </div>`;
};

// ---------------------------------------------------------------
// FORFAIT — DÉTAILS
// ---------------------------------------------------------------
Views.forfaitDetails = function(f){
  const article = DB.find(DB.articles, f.mainArticle.articleId);
  const svcs = f.mainArticle.serviceIds.map(id => DB.find(DB.services, id)).filter(Boolean);
  return `
  <div class="fade-in">
    <div class="flex items-center justify-between mb-1 flex-wrap gap-2">
      <div class="flex items-center gap-3">
        <h2 class="text-white text-[16px] font-semibold">${esc(f.name)}</h2>
        <div onclick="DetailsView.toggleForfaitActive('${f.id}', this)" class="toggle-track" style="background:${f.active?'#4DBBF8':'rgba(255,255,255,0.15)'}" data-on="${f.active}">
          <span class="toggle-knob" style="left:${f.active?'1rem':'0.125rem'}"></span>
        </div>
      </div>
      <div class="flex items-center gap-4 text-[12px]">
        <button onclick="UI.toast('Modification non simulée dans ce prototype')" class="flex items-center gap-1.5 text-white/60 hover:text-white"><i class="bi bi-pencil"></i> Modifier</button>
        <button onclick="DetailsView.deleteForfait('${f.id}')" class="flex items-center gap-1.5 text-rose-400 hover:text-rose-300"><i class="bi bi-trash"></i> Supprimer</button>
      </div>
    </div>
    <div class="flex items-center gap-6 border-b border-white/10 mt-4 mb-5 text-[12.5px] overflow-x-auto scrollbar-thin">
      <button onclick="DetailsView.setForfaitTab('infos')" data-fdt="infos" class="fd-tab pb-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap"><i class="bi bi-info-circle"></i> Infos de base</button>
      <button onclick="DetailsView.setForfaitTab('articles')" data-fdt="articles" class="fd-tab pb-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap"><i class="bi bi-tag"></i> Articles</button>
      <button onclick="DetailsView.setForfaitTab('params')" data-fdt="params" class="fd-tab pb-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap"><i class="bi bi-sliders"></i> Paramètres</button>
      <button onclick="DetailsView.setForfaitTab('meta')" data-fdt="meta" class="fd-tab pb-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap"><i class="bi bi-braces"></i> Métadonnées</button>
    </div>
    <div data-fdpane="infos" class="fd-pane grid grid-cols-1 sm:grid-cols-2 gap-4 hidden">
      <div class="bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <div class="text-white/50 text-[11px] mb-2 flex items-center gap-1.5"><i class="bi bi-toggle-on text-accent2"></i> Statut</div>
        <div class="text-white text-[15px] font-medium">${f.active?'Actif':'Inactif'}</div>
      </div>
      <div class="bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <div class="text-white/50 text-[11px] mb-2 flex items-center gap-1.5"><i class="bi bi-cash-coin text-accent2"></i> Prix</div>
        <div class="text-white text-[15px] font-medium">${DB.fmtFCFA(f.price)}</div>
      </div>
      <div class="bg-white/[0.03] border border-white/10 rounded-xl p-4 sm:col-span-2">
        <div class="text-white/50 text-[11px] mb-2 flex items-center gap-1.5"><i class="bi bi-card-text text-accent2"></i> Note</div>
        <div class="text-white/70 text-[12.5px]">${f.note ? esc(f.note) : '<span class="text-white/30">Aucune note</span>'}</div>
      </div>
    </div>
    <div data-fdpane="articles" class="fd-pane hidden space-y-3">
      <div class="bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <div class="text-white/50 text-[11px] mb-3 flex items-center gap-1.5"><i class="bi bi-bag text-accent2"></i> Article principal</div>
        <div class="flex items-center gap-2 text-white text-[13px] font-medium">
          <i class="bi ${article?.icon||'bi-handbag'}"></i> ${article ? esc(article.name) : '—'}
        </div>
      </div>
      <div class="bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <div class="text-white/50 text-[11px] mb-3 flex items-center gap-1.5"><i class="bi bi-check2-square text-accent2"></i> Services inclus</div>
        ${svcs.map(s=>`<div class="flex items-center gap-2 text-white/80 text-[12px] py-1"><span class="w-1.5 h-1.5 rounded-full bg-accent2 inline-block"></span> ${esc(s.name)}</div>`).join('') || '<span class="text-white/30 text-[12px]">Aucun service</span>'}
      </div>
    </div>
    <div data-fdpane="params" class="fd-pane grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <div class="text-white/50 text-[11px] mb-2 flex items-center gap-1.5"><i class="bi bi-calendar-event text-accent2"></i> Validité</div>
        <div class="text-white text-[22px] font-bold">${f.validityDays ?? '—'} <span class="text-[13px] font-normal text-white/50">Jours</span></div>
      </div>
      <div class="bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <div class="text-white/50 text-[11px] mb-2 flex items-center gap-1.5"><i class="bi bi-stack text-accent2"></i> Limite quantité</div>
        <div class="text-white text-[22px] font-bold">${f.quantityLimit ?? '—'}</div>
      </div>
      <div class="bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <div class="text-white/50 text-[11px] mb-2 flex items-center gap-1.5"><i class="bi bi-truck text-accent2"></i> Limite livraisons</div>
        <div class="${f.deliveryLimit?'text-white text-[22px] font-bold':'text-white/30 text-[18px]'}">${f.deliveryLimit ?? 'Illimitées'}</div>
      </div>
      <div class="bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <div class="text-white/50 text-[11px] mb-2 flex items-center gap-1.5"><i class="bi bi-box-seam text-accent2"></i> Limite collectes</div>
        <div class="${f.pickupLimit?'text-white text-[22px] font-bold':'text-white/30 text-[18px]'}">${f.pickupLimit ?? 'Illimitées'}</div>
      </div>
    </div>
    <div data-fdpane="meta" class="fd-pane hidden">
      <div class="bg-black/30 border border-white/10 rounded-xl p-4 font-mono text-[11px] text-white/60 overflow-x-auto">
        <pre>${esc(JSON.stringify(f, null, 2))}</pre>
      </div>
    </div>
  </div>`;
};

// ---------------------------------------------------------------
// TABLEAU DE BORD
// ---------------------------------------------------------------
Views.dashboard = function(){
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7*24*60*60*1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14*24*60*60*1000);
  
  const thisWeekOrders = DB.orders.filter(o => (o.createdAt || 0) >= sevenDaysAgo.getTime());
  const lastWeekOrders = DB.orders.filter(o => {
    const ts = o.createdAt || 0;
    return ts >= fourteenDaysAgo.getTime() && ts < sevenDaysAgo.getTime();
  });
  
  const thisWeekTotal = thisWeekOrders.reduce((s,o)=>s+(o.total||0),0);
  const lastWeekTotal = lastWeekOrders.reduce((s,o)=>s+(o.total||0),0);
  const trendPercent = lastWeekTotal > 0 ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100) : 0;
  const trendSign = trendPercent >= 0 ? '+' : '';
  
  const pending  = DB.orders.filter(o=>o.status==='en_attente').length;
  const inProg   = DB.orders.filter(o=>o.status==='en_cours').length;
  const ready    = DB.orders.filter(o=>o.status==='prete').length;

  const cards = [
    {label:"CA (semaine)", value:DB.fmtFCFA(thisWeekTotal), icon:'bi-graph-up-arrow', trend:`${trendSign}${trendPercent}%`, up:trendPercent>=0},
    {label:"En attente",   value:pending,  icon:'bi-hourglass-split',  trend:'à traiter', up:null},
    {label:"En cours",     value:inProg,   icon:'bi-arrow-repeat',     trend:'en cours',  up:null},
    {label:"Prêtes",       value:ready,    icon:'bi-check2-circle',    trend:'prêtes',    up:true},
  ];

  return `
  <div class="fade-in space-y-5">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      ${cards.map(c=>`
        <div class="bg-white/[0.03] border border-white/10 rounded-xl p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center"><i class="bi ${c.icon} text-accent2 text-[13px]"></i></div>
            ${c.up===true?`<span class="text-emerald-400 text-[10.5px] flex items-center gap-0.5"><i class="bi bi-arrow-up-right"></i>${c.trend}</span>`:`<span class="text-white/30 text-[10.5px]">${c.trend}</span>`}
          </div>
          <div class="text-white text-[19px] font-bold leading-tight">${c.value}</div>
          <div class="text-white/40 text-[11px] mt-0.5">${c.label}</div>
        </div>
      `).join('')}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
      <div class="lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-white text-[13.5px] font-semibold">Commandes récentes</h3>
          <button onclick="Router.go('orders-list')" class="text-accent2 text-[11.5px] hover:underline">Voir tout</button>
        </div>
        <div class="space-y-1">
          ${DB.orders.slice(0,5).map(o=>`
            <div onclick="Router.go('order-detail','${o.id}')" class="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0 cursor-pointer hover:bg-white/[0.02] -mx-2 px-2 rounded-lg">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center shrink-0 text-accent2 text-[10px] font-semibold">${initials(o.clientName)}</div>
                <div class="min-w-0">
                  <div class="text-white text-[12px] font-medium truncate">${esc(o.clientName)}</div>
                  <div class="text-white/30 text-[10.5px]">${o.ref} · ${DB.timeAgo(o.createdAt)}</div>
                </div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span class="text-white text-[12px] font-semibold">${DB.fmtFCFA(o.total)}</span>
                ${statusBadge(o.status)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <h3 class="text-white text-[13.5px] font-semibold mb-4">Statuts des commandes</h3>
        <div class="space-y-3">
          ${[
            {label:'Livrées', count: DB.orders.filter(o=>o.status==='livree').length, icon:'bi-truck', color:'text-violet-300'},
            {label:'Prêtes', count: DB.orders.filter(o=>o.status==='prete').length, icon:'bi-check2', color:'text-emerald-400'},
            {label:'En cours', count: DB.orders.filter(o=>o.status==='en_cours').length, icon:'bi-arrow-repeat', color:'text-indigo-300'}
          ].map(item=>{
            const total = DB.orders.length || 1;
            const percent = Math.round((item.count / total) * 100);
            return `
            <div>
              <div class="flex items-center justify-between text-[11.5px] mb-1">
                <span class="text-white/70 flex items-center gap-1.5"><i class="bi ${item.icon} ${item.color}"></i> ${item.label}</span>
                <span class="text-white/40">${item.count}</span>
              </div>
              <div class="w-full h-1.5 bg-white/5 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-accent to-accent2 rounded-full" style="width:${percent}%"></div></div>
            </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>

    <div class="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <h3 class="text-white text-[13.5px] font-semibold mb-4">Activité de la semaine (CA)</h3>
      <div class="flex items-end gap-2 h-32">
        ${(() => {
          const days = [];
          for(let i=6; i>=0; i--){
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
            const dayEnd = dayStart + 86400000;
            const dayTotal = DB.orders.filter(o => {
              const ts = o.createdAt || 0;
              return ts >= dayStart && ts < dayEnd;
            }).reduce((s,o)=>s+(o.total||0),0);
            days.push({date, total: dayTotal});
          }
          const maxTotal = Math.max(1, ...days.map(d=>d.total));
          return days.map((d,i)=>`
            <div class="flex-1 flex flex-col items-center gap-1.5" title="${DB.fmtFCFA(d.total)}">
              <div class="w-full bg-gradient-to-t from-accent to-accent2 rounded-t-md" style="height:${Math.max(5, Math.round((d.total / maxTotal) * 100))}%"></div>
              <span class="text-white/30 text-[9.5px]">${['L','M','M','J','V','S','D'][d.date.getDay()]}</span>
            </div>
          `).join('');
        })()}
      </div>
    </div>
  </div>`;
};

// ---------------------------------------------------------------
// COMMANDES — LISTE
// ---------------------------------------------------------------
Views.ordersList = function(){
  return `
  <div class="fade-in">
    <div class="flex items-center gap-2 mb-4 flex-wrap">
      <div class="flex-1 min-w-[160px] flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/35 text-[12px]">
        <i class="bi bi-search text-[12px]"></i>
        <input oninput="OrdersView.filter(this.value)" type="text" placeholder="Rechercher une commande, un client..." class="bg-transparent outline-none flex-1 text-white placeholder-white/35">
      </div>
      <button class="flex items-center gap-1.5 text-white/60 text-[11.5px] border border-white/10 rounded-lg px-3 py-2 hover:bg-white/5"><i class="bi bi-calendar3"></i> Date</button>
      <button onclick="Router.go('caisse')" class="flex items-center gap-1.5 bg-accent hover:bg-accent2 transition text-white text-[12px] font-medium px-3.5 py-2 rounded-lg whitespace-nowrap"><i class="bi bi-plus-lg"></i> Nouvelle commande</button>
    </div>
    <div id="ordersTableWrap" class="border border-white/10 rounded-xl overflow-hidden"></div>
  </div>`;
};

// ---------------------------------------------------------------
// COMMANDE — DÉTAIL
// ---------------------------------------------------------------
Views.orderDetail = function(o){
  return `
  <div class="fade-in max-w-3xl">
    <div class="flex items-center justify-between mb-5 flex-wrap gap-3">
      <div>
        <h2 class="text-white text-[16px] font-semibold">${o.ref}</h2>
        <p class="text-white/35 text-[11.5px] mt-0.5">Créée ${DB.timeAgo(o.createdAt)}</p>
      </div>
      ${statusBadge(o.status, true)}
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-3.5 mb-5">
      <div class="bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <div class="text-white/50 text-[11px] mb-1.5">Client</div>
        <div class="text-white text-[13px] font-medium">${esc(o.clientName)}</div>
      </div>
      <div class="bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <div class="text-white/50 text-[11px] mb-1.5">Montant total</div>
        <div class="text-white text-[13px] font-medium">${DB.fmtFCFA(o.total)}</div>
      </div>
      <div class="bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <div class="text-white/50 text-[11px] mb-1.5">Rendez-vous</div>
        <div class="text-white text-[13px] font-medium">${DB.fmtDate(o.rendezvousDate || o.rendezvous_date)}</div>
      </div>
      <div class="bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <div class="text-white/50 text-[11px] mb-1.5">Statut paiement</div>
        <div class="text-white text-[13px] font-medium">${o.status==='impayee'?'<span class="text-rose-400">Impayée</span>':'<span class="text-emerald-400">Payée</span>'}</div>
      </div>
    </div>
    <div class="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden mb-5">
      <div class="px-4 py-3 border-b border-white/10 text-white text-[13px] font-semibold">Articles</div>
      ${(o.items || []).map(it=>`
        <div class="flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-0">
          <div class="flex items-center gap-2.5 text-white text-[12.5px]"><i class="bi bi-handbag text-white/40"></i> ${it.name} <span class="text-white/30">× ${it.qty}</span></div>
          <span class="text-white text-[12.5px] font-medium">${DB.fmtFCFA(it.qty * (it.unitPrice || it.unit_price || 0))}</span>
        </div>
      `).join('')}
      <div class="flex items-center justify-between px-4 py-3 bg-white/[0.02]">
        <span class="text-white text-[13px] font-semibold">Total</span>
        <span class="text-white text-[14px] font-bold">${DB.fmtFCFA(o.total)}</span>
      </div>
    </div>
    <div class="flex items-center gap-2 flex-wrap">
      <button onclick="OrdersView.advanceStatus('${o.id}')" class="btn-primary flex items-center gap-2"><i class="bi bi-arrow-right-circle"></i> Avancer le statut</button>
      <button onclick="Router.go('orders-list')" class="btn-ghost">Retour à la liste</button>
    </div>
  </div>`;
};

// ---------------------------------------------------------------
// LOGISTIQUE
// ---------------------------------------------------------------
Views.logistique = function(){
  const pending = DB.orders.filter(o=>o.status==='en_attente');
  const inProgress = DB.orders.filter(o=>o.status==='en_cours');
  const ready = DB.orders.filter(o=>o.status==='prete');
  const collected = DB.orders.filter(o=>o.status==='collectee');
  return `
  <div class="fade-in space-y-5">
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-3.5">
      <div class="bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <div class="flex items-center gap-2 text-white text-[13px] font-semibold mb-3"><i class="bi bi-speedometer2 text-accent2"></i> Vue logistique</div>
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-white/5 border border-white/10 rounded-xl p-4">
            <div class="text-white/50 text-[11px] mb-2">Collectes</div>
            <div class="text-white text-[24px] font-bold">${pending.length}</div>
          </div>
          <div class="bg-white/5 border border-white/10 rounded-xl p-4">
            <div class="text-white/50 text-[11px] mb-2">En préparation</div>
            <div class="text-white text-[24px] font-bold">${inProgress.length}</div>
          </div>
          <div class="bg-white/5 border border-white/10 rounded-xl p-4">
            <div class="text-white/50 text-[11px] mb-2">Prêtes</div>
            <div class="text-white text-[24px] font-bold">${ready.length}</div>
          </div>
          <div class="bg-white/5 border border-white/10 rounded-xl p-4">
            <div class="text-white/50 text-[11px] mb-2">Livraisons</div>
            <div class="text-white text-[24px] font-bold">${collected.length}</div>
          </div>
        </div>
      </div>
      <div class="bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <div class="flex items-center gap-2 text-white text-[13px] font-semibold mb-3"><i class="bi bi-gear text-accent2"></i> Actions rapides</div>
        <div class="space-y-3 text-[12px] text-white/50">
          <div class="bg-white/5 border border-white/10 rounded-xl p-3">
            <div class="font-medium text-white mb-1">Collectes à traiter</div>
            <div>${pending.length} commande(s) en attente</div>
          </div>
          <div class="bg-white/5 border border-white/10 rounded-xl p-3">
            <div class="font-medium text-white mb-1">Préparation en cours</div>
            <div>${inProgress.length} commande(s) en cours</div>
          </div>
          <div class="bg-white/5 border border-white/10 rounded-xl p-3">
            <div class="font-medium text-white mb-1">Prêtes pour livraison</div>
            <div>${ready.length} commande(s) prêtes</div>
          </div>
        </div>
      </div>
      <div class="bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <div class="flex items-center gap-2 text-white text-[13px] font-semibold mb-3"><i class="bi bi-geo-alt text-accent2"></i> Zones de stockage</div>
        <div class="space-y-3">
          ${DB.stockZones.map(z=>`
          <div class="bg-white/5 border border-white/10 rounded-xl p-3">
            <div class="flex items-center justify-between text-[12px] mb-2">
              <span class="text-white/80">${esc(z.name)}</span>
              <span class="text-white/40">${z.used}/${z.capacity}</span>
            </div>
            <div class="w-full h-1.5 bg-white/5 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-accent to-accent2 rounded-full" style="width:${Math.round(z.used/z.capacity*100)}%"></div></div>
          </div>`).join('')}
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
      <div class="bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <div class="flex items-center gap-2 text-white text-[13px] font-semibold mb-3"><i class="bi bi-box-arrow-in-down text-accent2"></i> Collectes du jour</div>
        ${pending.map(o=>`
          <div class="flex items-center justify-between py-2 border-b border-white/5 last:border-0 gap-3">
            <div class="min-w-0">
              <div class="text-white text-[12.5px] font-medium">${esc(o.ref)}</div>
              <div class="text-white/40 text-[11px] truncate">${esc(o.clientName)} · ${DB.fmtFCFA(o.total)}</div>
            </div>
            <button onclick="OrdersView.advanceStatus('${o.id}')" class="btn-primary text-[11px] whitespace-nowrap">Marquer collectée</button>
          </div>
        `).join('') || '<p class="text-white/30 text-[12px]">Aucune collecte planifiée.</p>'}
      </div>
      <div class="space-y-3">
        <div class="bg-white/[0.03] border border-white/10 rounded-xl p-4">
          <div class="flex items-center gap-2 text-white text-[13px] font-semibold mb-3"><i class="bi bi-arrow-repeat text-accent2"></i> En préparation</div>
          ${inProgress.map(o=>`
            <div class="flex items-center justify-between py-2 border-b border-white/5 last:border-0 gap-3">
              <div class="min-w-0">
                <div class="text-white text-[12.5px] font-medium">${esc(o.ref)}</div>
                <div class="text-white/40 text-[11px] truncate">${esc(o.clientName)} · ${DB.fmtFCFA(o.total)}</div>
              </div>
              <button onclick="OrdersView.advanceStatus('${o.id}')" class="btn-primary text-[11px] whitespace-nowrap">Marquer prête</button>
            </div>
          `).join('') || '<p class="text-white/30 text-[12px]">Aucune commande en préparation.</p>'}
        </div>
        <div class="bg-white/[0.03] border border-white/10 rounded-xl p-4">
          <div class="flex items-center gap-2 text-white text-[13px] font-semibold mb-3"><i class="bi bi-truck text-accent2"></i> Livraisons du jour</div>
          ${ready.map(o=>`
            <div class="flex items-center justify-between py-2 border-b border-white/5 last:border-0 gap-3">
              <div class="min-w-0">
                <div class="text-white text-[12.5px] font-medium">${esc(o.ref)}</div>
                <div class="text-white/40 text-[11px] truncate">${esc(o.clientName)} · ${DB.fmtFCFA(o.total)}</div>
              </div>
              <button onclick="OrdersView.advanceStatus('${o.id}')" class="btn-primary text-[11px] whitespace-nowrap">Marquer livrée</button>
            </div>
          `).join('') || '<p class="text-white/30 text-[12px]">Aucune livraison prête.</p>'}
        </div>
      </div>
    </div>
  </div>`;
};

// ---------------------------------------------------------------
// ABONNEMENTS
// ---------------------------------------------------------------
Views.abonnements = function(){
  return `
  <div class="fade-in">
    <div class="flex items-center justify-between gap-3 mb-4 flex-wrap">
      <div>
        <h2 class="text-white text-[16px] font-semibold">Abonnements clients</h2>
        <p class="text-white/40 text-[12px]">Suivez les abonnements en cours et créez de nouveaux abonnements.</p>
      </div>
      <button onclick="AbonnementsView.openNewModal()" class="btn-primary">Nouvel abonnement</button>
    </div>
    <div id="abonnementsWrap" class="border border-white/10 rounded-xl overflow-hidden"></div>
  </div>`;
};

Views.promotions = function(){
  return `
  <div class="fade-in">
    <div class="flex items-center justify-between gap-3 mb-4 flex-wrap">
      <div>
        <h2 class="text-white text-[16px] font-semibold">Promotions</h2>
        <p class="text-white/40 text-[12px]">Gérez les offres actives, leur validité et leur activation.</p>
      </div>
      <button onclick="Router.go('promotion-new')" class="btn-primary">Ajouter une promotion</button>
    </div>
    <div class="flex items-center gap-2 mb-4 flex-wrap">
      <input oninput="PromotionsView.filter(this.value)" type="text" placeholder="Rechercher une promotion..." class="input-base max-w-md">
    </div>
    <div id="promotionsWrap" class="border border-white/10 rounded-xl overflow-hidden"></div>
  </div>`;
};

Views.promotionForm = function(){
  return `
  <div class="fade-in max-w-2xl">
    <p class="text-white/40 text-[12px] mb-5">Créez une promotion avec une valeur, un type et une date d'expiration.</p>
    <div class="space-y-4">
      <div>
        <label class="text-white text-[12.5px] font-medium">Nom de la promotion <span class="text-accent2">*</span></label>
        <input id="promoName" type="text" placeholder="Ex : Offre de rentrée" class="input-base mt-2">
      </div>
      <div>
        <label class="text-white text-[12.5px] font-medium">Type</label>
        <select id="promoType" class="input-base mt-2">
          <option value="percent">Pourcentage</option>
          <option value="fixed">Montant fixe</option>
        </select>
      </div>
      <div>
        <label class="text-white text-[12.5px] font-medium">Valeur <span class="text-accent2">*</span></label>
        <input id="promoValue" type="number" min="1" placeholder="10" class="input-base mt-2">
      </div>
      <div>
        <label class="text-white text-[12.5px] font-medium">Date d'expiration</label>
        <input id="promoExpires" type="date" class="input-base mt-2">
      </div>
    </div>
    <div class="flex items-center gap-3 mt-6">
      <button onclick="PromotionForm.submit()" class="btn-primary">Enregistrer la promotion</button>
      <button onclick="Router.go('promotions-list')" class="btn-ghost">Annuler</button>
    </div>
  </div>`;
};

Views.categoriesList = function(){
  return `
  <div class="fade-in">
    <div class="flex items-center justify-between gap-3 mb-4 flex-wrap">
      <div>
        <h2 class="text-white text-[16px] font-semibold">Catégories</h2>
        <p class="text-white/40 text-[12px]">Organisez vos articles par catégorie.</p>
      </div>
      <button onclick="CategoriesView.openNew()" class="btn-primary">Ajouter une catégorie</button>
    </div>
    <div class="flex items-center gap-2 mb-4 flex-wrap">
      <input oninput="CategoriesView.filter(this.value)" type="text" placeholder="Rechercher une catégorie..." class="input-base max-w-md">
    </div>
    <div id="categoriesWrap" class="border border-white/10 rounded-xl overflow-hidden"></div>
  </div>`;
};

Views.zonesList = function(){
  return `
  <div class="fade-in">
    <div class="flex items-center justify-between gap-3 mb-4 flex-wrap">
      <div>
        <h2 class="text-white text-[16px] font-semibold">Zones de stockage</h2>
        <p class="text-white/40 text-[12px]">Gérez vos zones physiques et leur capacité.</p>
      </div>
      <button onclick="ZonesView.openNew()" class="btn-primary">Nouvelle zone</button>
    </div>
    <div id="zonesWrap" class="border border-white/10 rounded-xl overflow-hidden"></div>
  </div>`;
};

Views.settings = function(){
  return `
  <div class="fade-in max-w-2xl">
    <div class="mb-4">
      <h2 class="text-white text-[16px] font-semibold">Paramètres</h2>
      <p class="text-white/40 text-[12px]">Configurez les informations de votre entreprise et les paramètres de facturation.</p>
    </div>
    <div class="grid grid-cols-1 gap-4">
      <div>
        <label class="text-white text-[12.5px] font-medium">Nom de l'organisation</label>
        <input id="set_org_name" type="text" class="input-base mt-2">
      </div>
      <div>
        <label class="text-white text-[12.5px] font-medium">Téléphone</label>
        <input id="set_org_phone" type="text" class="input-base mt-2">
      </div>
      <div>
        <label class="text-white text-[12.5px] font-medium">Email</label>
        <input id="set_org_email" type="email" class="input-base mt-2">
      </div>
      <div>
        <label class="text-white text-[12.5px] font-medium">Adresse</label>
        <input id="set_org_address" type="text" class="input-base mt-2">
      </div>
      <div>
        <label class="text-white text-[12.5px] font-medium">TVA (%)</label>
        <input id="set_tva_rate" type="number" min="0" class="input-base mt-2">
      </div>
    </div>
    <div class="flex items-center gap-3 mt-6">
      <button onclick="SettingsView.save()" class="btn-primary">Enregistrer</button>
      <button onclick="Router.go('articles-list')" class="btn-ghost">Retour</button>
    </div>
  </div>`;
};

Views.templates = function(){
  return `
  <div class="fade-in">
    <div class="flex items-center justify-between gap-3 mb-4 flex-wrap">
      <div>
        <h2 class="text-white text-[16px] font-semibold">Modèles</h2>
        <p class="text-white/40 text-[12px]">Gérez vos modèles de communication pour emails et SMS.</p>
      </div>
    </div>
    <div class="flex items-center justify-between gap-3 mb-4 flex-wrap mt-4">
      <div>
        <h2 class="text-white text-[16px] font-semibold">Modèles</h2>
        <p class="text-white/40 text-[12px]">Gérez vos modèles de communication pour emails et SMS.</p>
      </div>
      <button onclick="TemplatesView.openNew()" class="btn-primary">Ajouter un modèle</button>
    </div>
    <div id="templatesWrap" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
  </div>`;
};

// ---------------------------------------------------------------
// COMPTABILITÉ
// ---------------------------------------------------------------
Views.comptabilite = function(){
  return `
  <div class="fade-in space-y-5">
    <div class="grid grid-cols-1 lg:grid-cols-[1.8fr_0.95fr] gap-4">
      <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        ${[
          { id:'comptaCardRevenue', icon:'bi-cash-stack text-emerald-400', label:'CA livré + prêt' },
          { id:'comptaCardPending', icon:'bi-hourglass-split text-sky-400', label:'CA en attente' },
          { id:'comptaCardInProgress', icon:'bi-clock-history text-accent2', label:'CA en cours' },
          { id:'comptaCardUnpaid', icon:'bi-exclamation-circle text-rose-400', label:'Impayé' },
          { id:'comptaCardExpenses', icon:'bi-wallet2 text-red-400', label:'Dépenses' },
          { id:'comptaCardCredits', icon:'bi-bank2 text-emerald-400', label:'Crédits' }
        ].map(card => `
          <div class="bg-white/[0.03] border border-white/10 rounded-xl p-3 h-24 flex flex-col justify-between">
            <div class="text-white/50 text-[10px] flex items-center gap-2"><i class="bi ${card.icon}"></i> ${card.label}</div>
            <div id="${card.id}" class="text-white text-[18px] font-semibold">—</div>
          </div>
        `).join('')}
      </div>
      <div id="comptaPageHeader" class="bg-white/[0.03] border border-white/10 rounded-xl p-4"></div>
      <div class="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-4">
        <div>
          <div class="text-white text-[15px] font-semibold">Filtres</div>
          <p class="text-white/40 text-[12px]">Jour, semaine, mois, année et statut.</p>
        </div>
        <div class="grid grid-cols-1 gap-3">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-white/60 text-[11px] uppercase tracking-wide">Période rapide :</span>
            <button onclick="ComptabiliteView.setPeriodRange('today')" class="btn-ghost border border-white/10 text-[11px] px-2.5 py-1.5 rounded-lg">Aujourd'hui</button>
            <button onclick="ComptabiliteView.setPeriodRange('7d')" class="btn-ghost border border-white/10 text-[11px] px-2.5 py-1.5 rounded-lg">7 derniers jours</button>
            <button onclick="ComptabiliteView.setPeriodRange('month')" class="btn-ghost border border-white/10 text-[11px] px-2.5 py-1.5 rounded-lg">Ce mois</button>
            <button onclick="ComptabiliteView.setPeriodRange('quarter')" class="btn-ghost border border-white/10 text-[11px] px-2.5 py-1.5 rounded-lg">Trimestre</button>
            <button onclick="ComptabiliteView.setPeriodRange('year')" class="btn-ghost border border-white/10 text-[11px] px-2.5 py-1.5 rounded-lg">Cette année</button>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="text-white/60 text-[11px] uppercase tracking-wide">Depuis</label>
            <input id="comptaDateFrom" type="date" onchange="ComptabiliteView.setDateFrom(this.value)" class="input-base mt-2 bg-black/20 text-white">
          </div>
          <div>
            <label class="text-white/60 text-[11px] uppercase tracking-wide">Jusqu'à</label>
            <input id="comptaDateTo" type="date" onchange="ComptabiliteView.setDateTo(this.value)" class="input-base mt-2 bg-black/20 text-white">
          </div>
        </div>
        <div class="bg-white/5 border border-white/10 rounded-xl p-3">
          <div class="text-white/60 text-[11px] uppercase tracking-wide mb-2">Statuts inclus</div>
          <div class="flex flex-wrap gap-2">
            ${['en_attente','collectee','en_cours','prete','livree','impayee'].map(status=>`
            <button type="button" onclick="ComptabiliteView.toggleStatus('${status}')" id="comptaStatusBtn_${status}" class="text-white/60 text-[11px] px-3 py-2 rounded-lg border border-white/10 hover:border-accent hover:text-white transition">${statusBadge(status,true)}</button>
            `).join('')}
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="text-white/60 text-[11px] uppercase tracking-wide">Flux</label>
            <select id="comptaTransactionType" onchange="ComptabiliteView.setTransactionType(this.value)" class="input-base mt-2 bg-black/20 text-white w-full">
              <option value="all">Tous</option>
              <option value="expense">Dépenses</option>
              <option value="credit">Crédits</option>
            </select>
          </div>
          <div>
            <label class="text-white/60 text-[11px] uppercase tracking-wide">Recherche catégorie</label>
            <input id="comptaCategorySearch" type="text" oninput="ComptabiliteView.setCategorySearch(this.value)" placeholder="Fournisseurs, encaissement..." class="input-base mt-2 bg-black/20 text-white w-full">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <button onclick="ComptabiliteView.exportOrders('excel')" class="flex items-center justify-center gap-2 border border-white/10 rounded-lg px-3 py-2 text-white/70 hover:text-white hover:border-accent transition text-[12px]"><i class="bi bi-file-earmark-excel"></i> Commandes XLS</button>
          <button onclick="ComptabiliteView.exportTransactions('excel')" class="flex items-center justify-center gap-2 border border-white/10 rounded-lg px-3 py-2 text-white/70 hover:text-white hover:border-accent transition text-[12px]"><i class="bi bi-file-earmark-excel"></i> Flux XLS</button>
        </div>
      </div>
    </div>
    <div class="grid gap-4 xl:grid-cols-[1fr_1fr]">
      <div class="bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <h3 class="text-white text-[13.5px] font-semibold mb-3">Flux par statut de commande</h3>
        <div id="comptaStatusChart" class="space-y-3"></div>
      </div>
      <div class="bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <h3 class="text-white text-[13.5px] font-semibold mb-3">Tendances dépenses / crédits</h3>
        <div id="comptaFlowChart" class="space-y-3"></div>
      </div>
    </div>
    <div class="border border-white/10 rounded-xl overflow-hidden">
      <div class="px-4 py-3 border-b border-white/10 text-white text-[13px] font-semibold">Journal des flux comptables</div>
      <div id="comptaTransactionsWrap"></div>
    </div>
  </div>`;
};

// ---------------------------------------------------------------
// CLIENTS — LISTE
// ---------------------------------------------------------------
Views.clientsList = function(){
  return `
  <div class="fade-in">
    <div class="grid gap-3 lg:grid-cols-[1fr_auto] mb-4">
      <div class="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/35 text-[12px]">
        <i class="bi bi-search text-[12px]"></i>
        <input id="clientsSearch" oninput="ClientsView.filter(this.value)" type="text" placeholder="Rechercher par nom ou numéro..." class="bg-transparent outline-none flex-1 text-white placeholder-white/35">
      </div>
      <div class="flex flex-wrap gap-2 justify-end">
        <button onclick="ClientsView.importClients()" class="flex items-center gap-2 border border-white/10 rounded-lg px-3 py-2 text-white/70 hover:text-white hover:border-accent transition text-[12px]">
          <i class="bi bi-file-earmark-arrow-up"></i> Importer
        </button>
        <button onclick="ClientsView.exportClients('csv')" class="flex items-center gap-2 border border-white/10 rounded-lg px-3 py-2 text-white/70 hover:text-white hover:border-accent transition text-[12px]">
          <i class="bi bi-file-earmark-spreadsheet"></i> CSV
        </button>
        <button onclick="ClientsView.exportClients('excel')" class="flex items-center gap-2 border border-white/10 rounded-lg px-3 py-2 text-white/70 hover:text-white hover:border-accent transition text-[12px]">
          <i class="bi bi-file-earmark-excel"></i> Excel
        </button>
        <button onclick="ClientsView.openAddClient()" class="flex items-center gap-2 bg-accent hover:bg-accent2 transition text-white text-[12px] font-medium px-3.5 py-2 rounded-lg whitespace-nowrap"><i class="bi bi-plus-lg"></i> Ajouter</button>
      </div>
    </div>
    <div class="grid gap-3 lg:grid-cols-4 mb-4 text-white/50 text-[12px]">
      <div class="bg-white/5 border border-white/10 rounded-lg p-3">
        <div class="text-[11px] uppercase tracking-wide mb-2">Date d'inscription</div>
        <div class="grid gap-2">
          <input id="clientsDateFrom" onchange="ClientsView.setDateFrom(this.value)" type="date" class="input-base bg-black/20 text-white" placeholder="Depuis">
          <input id="clientsDateTo" onchange="ClientsView.setDateTo(this.value)" type="date" class="input-base bg-black/20 text-white" placeholder="Jusqu'à">
        </div>
      </div>
      <div class="bg-white/5 border border-white/10 rounded-lg p-3">
        <div class="text-[11px] uppercase tracking-wide mb-2">Montant dépensé</div>
        <div class="grid gap-2">
          <input id="clientsMinSpent" oninput="ClientsView.setMinSpent(this.value)" type="number" min="0" class="input-base bg-black/20 text-white" placeholder="Min FCFA">
          <input id="clientsMaxSpent" oninput="ClientsView.setMaxSpent(this.value)" type="number" min="0" class="input-base bg-black/20 text-white" placeholder="Max FCFA">
        </div>
      </div>
      <div class="lg:col-span-2 bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between gap-3">
        <div>
          <div class="text-[11px] uppercase tracking-wide mb-2">Affichage</div>
          <div class="text-white/60 text-[12px]">Voir les 10 derniers clients inscrits, cliquez pour dérouler.</div>
        </div>
        <button onclick="ClientsView.toggleShowAll()" class="btn-ghost text-[12px]">Voir tout / réduire</button>
      </div>
    </div>
    <div id="clientsTableWrap" class="border border-white/10 rounded-xl overflow-hidden"></div>
  </div>`;
};

// ---------------------------------------------------------------
// ADMINISTRATION
// ---------------------------------------------------------------
Views.admin = function(){
  return `
  <div class="fade-in space-y-5 max-w-2xl">
    <div class="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-white text-[13.5px] font-semibold flex items-center gap-2"><i class="bi bi-people text-accent2"></i> Utilisateurs &amp; rôles</h3>
        <button onclick="AdminView.openInvite()" class="text-accent2 text-[12px] hover:underline flex items-center gap-1.5"><i class="bi bi-plus-lg"></i> Inviter un utilisateur</button>
      </div>
      <div id="usersListEl" class="space-y-2"></div>
    </div>
    <div class="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <h3 class="text-white text-[13.5px] font-semibold mb-3 flex items-center gap-2"><i class="bi bi-shield-lock text-accent2"></i> Sécurité</h3>
      <label class="flex items-center justify-between py-2">
        <span class="text-white/70 text-[12.5px]">Authentification à deux facteurs</span>
        <div onclick="UI.flipToggle(this)" class="toggle-track" style="background:rgba(255,255,255,0.15)" data-on="false"><span class="toggle-knob" style="left:0.125rem"></span></div>
      </label>
      <label class="flex items-center justify-between py-2">
        <span class="text-white/70 text-[12.5px]">Déconnexion auto après 30 min</span>
        <div onclick="UI.flipToggle(this)" class="toggle-track" style="background:#4DBBF8" data-on="true"><span class="toggle-knob" style="left:1rem"></span></div>
      </label>
    </div>
    <div class="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <h3 class="text-white text-[13.5px] font-semibold mb-3 flex items-center gap-2"><i class="bi bi-clock-history text-accent2"></i> Journal d'activité</h3>
      <div class="space-y-2 text-[11.5px]">
        <div class="flex items-center gap-2 text-white/50"><i class="bi bi-dot text-accent2"></i> Boni a créé l'article "Linge" — il y a 3 min</div>
        <div class="flex items-center gap-2 text-white/50"><i class="bi bi-dot text-accent2"></i> Aïcha a validé la commande CMD-0231 — il y a 12 min</div>
        <div class="flex items-center gap-2 text-white/50"><i class="bi bi-dot text-accent2"></i> Ismaël a mis à jour une zone de stockage — il y a 1 h</div>
      </div>
    </div>
  </div>`;
};

// ---------------------------------------------------------------
// COMPTE
// ---------------------------------------------------------------
Views.account = function(){
  const user = window.Auth?.user ? window.Auth.user() : null;
  const name = user?.name || '';
  const role = user?.role || 'Visiteur';

  return `
  <div class="fade-in max-w-md">
    <div class="bg-white/[0.03] border border-white/10 rounded-xl p-5">
      <div class="w-16 h-16 rounded-full bg-gradient-to-br from-accent2 to-accent flex items-center justify-center mx-auto mb-3">
        <i class="bi bi-person-fill text-white text-2xl"></i>
      </div>
      <h2 class="text-white text-[15px] font-semibold mb-1">${esc(name)}</h2>
      <p class="text-white/40 text-[12px]">${esc(role.charAt(0).toUpperCase() + role.slice(1))} · PressingSana</p>
      <div class="mt-6 space-y-4 text-left">
        <div>
          <label class="text-white/70 text-[12.5px]">Nom complet</label>
          <input id="accountName" type="text" value="${esc(name)}" class="input-base bg-black/20 text-white mt-2">
        </div>
        <div>
          <label class="text-white/70 text-[12.5px]">Email</label>
          <input id="accountEmail" type="email" value="${esc(user?.email || '')}" class="input-base bg-black/20 text-white mt-2">
        </div>
        <div>
          <label class="text-white/70 text-[12.5px]">Nouveau mot de passe</label>
          <input id="accountPassword" type="password" placeholder="Laissez vide pour garder le mot de passe actuel" class="input-base bg-black/20 text-white mt-2">
        </div>
        <div>
          <label class="text-white/70 text-[12.5px]">Confirmation du mot de passe</label>
          <input id="accountPasswordConfirm" type="password" placeholder="Confirmez le nouveau mot de passe" class="input-base bg-black/20 text-white mt-2">
        </div>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-2 mt-6">
        <button onclick="AccountView.save()" class="btn-primary">Enregistrer le profil</button>
        <button onclick="Auth.logout()" class="btn-ghost">Déconnexion</button>
      </div>
    </div>
  </div>`;
};

// ---------------------------------------------------------------
// LOGIN
// ---------------------------------------------------------------
Views.login = function(){
  return `
  <div class="fade-in flex min-h-[calc(100vh-60px)] items-center justify-center py-12 px-4">
    <div class="w-full max-w-md bg-white/[0.06] border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/20">
      <div class="text-center mb-6">
        <div class="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-accent2 to-accent flex items-center justify-center">
          <i class="bi bi-lock-fill text-white text-2xl"></i>
        </div>
        <h1 class="text-white text-[22px] font-semibold mb-2">Connexion</h1>
        <p class="text-white/40 text-[13px]">Entrez vos identifiants pour accéder à PressingSana.</p>
      </div>
      <div class="space-y-4">
        <label class="block text-white/70 text-[12.5px]">Email</label>
        <input id="loginEmail" type="email" placeholder="admin@pressing.bf" class="input-base bg-black/20 text-white" autocomplete="username">
        <label class="block text-white/70 text-[12.5px]">Mot de passe</label>
        <input id="loginPassword" type="password" placeholder="••••••••" class="input-base bg-black/20 text-white" autocomplete="current-password">
        <button onclick="Auth.performLogin()" class="w-full bg-accent hover:bg-accent2 text-white py-3 rounded-xl text-[13px] font-medium">Se connecter</button>
      </div>
      <div class="mt-6 text-center text-white/40 text-[12px]">
        Utilisez <strong>admin@pressing.bf</strong> / <strong>admin123</strong> ou invitez un utilisateur depuis l'administration.
      </div>
    </div>
  </div>`;
};

// ---------------------------------------------------------------
// EMPTY
// ---------------------------------------------------------------
Views.empty = function(label){
  return `
  <div class="fade-in flex flex-col items-center justify-center text-center py-24 gap-3">
    <i class="bi bi-cone-striped text-3xl text-white/15"></i>
    <p class="text-white/40 text-[13px]">${label || "Cette section n'est pas encore disponible."}</p>
    <button onclick="Router.go('dashboard')" class="text-accent2 text-[12px] hover:underline">Retour au tableau de bord</button>
  </div>`;
};

