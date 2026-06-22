/* ============================================================
   PRESSINGSANA — MODAL TEMPLATES
   ============================================================ */

Views.modalIconPicker = function(){
  return `
  <div id="iconModal" class="hidden fixed inset-0 bg-[rgba(3,13,34,0.78)] z-50 items-center justify-center p-4 backdrop-blur-sm">
    <div class="bg-surface border border-accent/15 rounded-xl w-full max-w-[440px] max-h-[520px] flex flex-col overflow-hidden shadow-[0_24px_70px_-18px_rgba(77,187,248,0.38)]">
      <div class="flex items-center justify-between p-4 border-b border-accent/10 bg-accent/5">
        <h3 class="text-white text-[15px] font-semibold">Choisir une icône</h3>
        <button onclick="IconPicker.close()" class="text-white/50 hover:text-white transition"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="p-3 border-b border-white/10 space-y-2.5">
        <div class="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white/40 text-[12px] focus-within:border-accent focus-within:text-accent transition">
          <i class="bi bi-search text-[12px]"></i>
          <input id="iconSearchInput" oninput="IconPicker.filter()" type="text" placeholder="Rechercher une icône..." class="bg-transparent outline-none flex-1 text-white placeholder-white/30">
        </div>
        <div id="iconCatBar" class="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-1 text-[11px]"></div>
      </div>
      <div id="iconGrid" class="flex-1 overflow-y-auto scrollbar-thin p-4 grid grid-cols-5 sm:grid-cols-6 gap-2.5"></div>
    </div>
  </div>`;
};

Views.modalAddTarif = function(){
  return `
  <div id="tarifModal" class="hidden fixed inset-0 bg-[rgba(3,13,34,0.78)] z-50 items-center justify-center p-4 backdrop-blur-sm">
    <div class="bg-surface border border-accent/15 rounded-xl w-full max-w-[400px] overflow-hidden shadow-[0_24px_70px_-18px_rgba(77,187,248,0.38)]">
      <div class="flex items-center justify-between p-4 border-b border-accent/10 bg-accent/5">
        <h3 class="text-white text-[15px] font-semibold">Ajouter un tarif</h3>
        <button onclick="ArticleForm.closeTarifModal()" class="text-white/50 hover:text-white transition"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="p-4 space-y-4">
        <div>
          <label class="text-white text-[12px] font-medium">Service <span class="text-accent2">*</span></label>
          <div onclick="ArticleForm.pickTarifService()" id="tarifServiceField" class="mt-2 cursor-pointer flex items-center justify-between bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-accent/40 rounded-lg px-3 py-2.5 text-white/40 text-[12px] transition">
            <span id="tarifServiceName">Sélectionner un service...</span>
            <i class="bi bi-chevron-down text-[10px]"></i>
          </div>
        </div>
        <div>
          <label class="text-white text-[12px] font-medium">Prix unitaire <span class="text-accent2">*</span></label>
          <div class="mt-2 flex items-center bg-white/5 border border-accent rounded-lg px-3 py-2.5 focus-within:border-accent2 focus-within:shadow-lg focus-within:shadow-accent/20 transition">
            <i class="bi bi-cash-coin text-white/30 text-[12px] mr-2"></i>
            <input id="tarifPrice" type="text" value="500" class="bg-transparent outline-none text-accent2 text-[12px] flex-1 font-medium">
            <span class="text-white/30 text-[11px]">FCFA</span>
          </div>
          <p class="text-white/25 text-[10px] mt-1.5">Prix TTC</p>
        </div>
      </div>
      <div class="flex items-center gap-4 p-4 border-t border-white/10 bg-white/[0.02]">
        <button onclick="ArticleForm.confirmAddTarif()" class="btn-primary hover:scale-105">Ajouter</button>
        <button onclick="ArticleForm.closeTarifModal()" class="btn-ghost ml-auto">Annuler</button>
      </div>
    </div>
  </div>`;
};

Views.modalPickService = function(){
  return `
  <div id="servicePickModal" class="hidden fixed inset-0 bg-[rgba(3,13,34,0.78)] z-50 items-center justify-center p-4 backdrop-blur-sm">
    <div class="bg-surface border border-accent/15 rounded-xl w-full max-w-[380px] overflow-hidden shadow-[0_24px_70px_-18px_rgba(77,187,248,0.38)]">
      <div class="flex items-center justify-between p-4 border-b border-accent/10 bg-accent/5">
        <h3 class="text-white text-[15px] font-semibold">Sélectionner un service</h3>
        <button onclick="Picker.close('servicePickModal')" class="text-white/50 hover:text-white transition"><i class="bi bi-x-lg"></i></button>
      </div>
      <div id="servicePickList" class="max-h-[300px] overflow-y-auto scrollbar-thin p-2"></div>
    </div>
  </div>`;
};

Views.modalPickArticle = function(){
  return `
  <div id="articlePickModal" class="hidden fixed inset-0 bg-[rgba(3,13,34,0.78)] z-50 items-center justify-center p-4 backdrop-blur-sm">
    <div class="bg-surface border border-accent/15 rounded-xl w-full max-w-[380px] overflow-hidden shadow-[0_24px_70px_-18px_rgba(77,187,248,0.38)]">
      <div class="flex items-center justify-between p-4 border-b border-accent/10 bg-accent/5">
        <h3 class="text-white text-[15px] font-semibold">Sélectionner un article</h3>
        <button onclick="Picker.close('articlePickModal')" class="text-white/50 hover:text-white transition"><i class="bi bi-x-lg"></i></button>
      </div>
      <div id="articlePickList" class="max-h-[300px] overflow-y-auto scrollbar-thin p-2"></div>
    </div>
  </div>`;
};

Views.modalPickClient = function(){
  return `
  <div id="clientPickModal" class="hidden fixed inset-0 bg-[rgba(3,13,34,0.78)] z-50 items-center justify-center p-4 backdrop-blur-sm">
    <div class="bg-surface border border-accent/15 rounded-xl w-full max-w-[380px] overflow-hidden shadow-[0_24px_70px_-18px_rgba(77,187,248,0.38)]">
      <div class="flex items-center justify-between p-4 border-b border-accent/10 bg-accent/5">
        <h3 class="text-white text-[15px] font-semibold">Sélectionner un client</h3>
        <button onclick="Picker.close('clientPickModal')" class="text-white/50 hover:text-white transition"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="p-3 border-b border-white/10 space-y-2">
        <div class="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white/40 text-[12px] focus-within:border-accent focus-within:text-accent transition">
          <i class="bi bi-search text-[12px]"></i>
          <input id="clientPickSearch" oninput="Caisse.filterClientPicker(this.value)" type="text" placeholder="Rechercher..." class="bg-transparent outline-none flex-1 text-white placeholder-white/30">
        </div>
      </div>
      <div id="clientPickList" class="max-h-[260px] overflow-y-auto scrollbar-thin p-2"></div>
    </div>
  </div>`;
};

Views.modalAddClient = function(){
  return `
  <div id="addClientModal" class="hidden fixed inset-0 bg-[rgba(3,13,34,0.78)] z-50 items-center justify-center p-4 backdrop-blur-sm">
    <div class="bg-surface border border-accent/15 rounded-xl w-full max-w-[400px] overflow-hidden shadow-[0_24px_70px_-18px_rgba(77,187,248,0.38)]">
      <div class="flex items-center justify-between p-4 border-b border-accent/10 bg-accent/5">
        <h3 class="text-white text-[15px] font-semibold">Ajouter un client</h3>
        <button onclick="Picker.close('addClientModal')" class="text-white/50 hover:text-white transition"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="p-4 space-y-3.5">
        <div>
          <label class="text-white text-[12px] font-medium">Nom complet <span class="text-accent2">*</span></label>
          <input id="newClientName" type="text" placeholder="Ex : Aminata Sawadogo" class="input-base mt-2">
        </div>
        <div>
          <label class="text-white text-[12px] font-medium">Téléphone <span class="text-accent2">*</span></label>
          <input id="newClientPhone" type="text" placeholder="+226 70 00 00 00" class="input-base mt-2">
        </div>
        <div>
          <label class="text-white text-[12px] font-medium">Email</label>
          <input id="newClientEmail" type="text" placeholder="client@example.com" class="input-base mt-2">
        </div>
      </div>
      <div class="flex items-center gap-4 p-4 border-t border-white/10 bg-white/[0.02]">
        <button onclick="ClientsView.confirmAddClient()" class="btn-primary hover:scale-105">Enregistrer</button>
        <button onclick="Picker.close('addClientModal')" class="btn-ghost ml-auto">Annuler</button>
      </div>
    </div>
  </div>`;
};

Views.modalAddExpense = function(){
  return `
  <div id="comptaExpenseModal" class="hidden fixed inset-0 bg-[rgba(3,13,34,0.78)] z-50 items-center justify-center p-4 backdrop-blur-sm">
    <div class="bg-surface border border-accent/15 rounded-xl w-full max-w-[420px] overflow-hidden shadow-[0_24px_70px_-18px_rgba(77,187,248,0.38)]">
      <div class="flex items-center justify-between p-4 border-b border-accent/10 bg-accent/5">
        <h3 class="text-white text-[15px] font-semibold">Ajouter une dépense</h3>
        <button onclick="Picker.close('comptaExpenseModal')" class="text-white/50 hover:text-white transition"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="p-4 space-y-4">
        <div>
          <label class="text-white text-[12px] font-medium">Catégorie <span class="text-accent2">*</span></label>
          <input id="comptaExpenseCategory" type="text" placeholder="Fournisseur, transport, matériel..." class="input-base mt-2">
        </div>
        <div>
          <label class="text-white text-[12px] font-medium">Montant <span class="text-accent2">*</span></label>
          <input id="comptaExpenseAmount" type="number" min="0" placeholder="0" class="input-base mt-2">
        </div>
        <div>
          <label class="text-white text-[12px] font-medium">Description</label>
          <textarea id="comptaExpenseDescription" rows="3" class="input-base mt-2 resize-none" placeholder="Détails de la dépense..."></textarea>
        </div>
      </div>
      <div class="flex items-center gap-4 p-4 border-t border-white/10 bg-white/[0.02]">
        <button onclick="ComptabiliteView.submitExpense()" class="btn-primary hover:scale-105">Enregistrer</button>
        <button onclick="Picker.close('comptaExpenseModal')" class="btn-ghost ml-auto">Annuler</button>
      </div>
    </div>
  </div>`;
};

Views.modalAddCredit = function(){
  return `
  <div id="comptaCreditModal" class="hidden fixed inset-0 bg-[rgba(3,13,34,0.78)] z-50 items-center justify-center p-4 backdrop-blur-sm">
    <div class="bg-surface border border-accent/15 rounded-xl w-full max-w-[420px] overflow-hidden shadow-[0_24px_70px_-18px_rgba(77,187,248,0.38)]">
      <div class="flex items-center justify-between p-4 border-b border-accent/10 bg-accent/5">
        <h3 class="text-white text-[15px] font-semibold">Ajouter un crédit</h3>
        <button onclick="Picker.close('comptaCreditModal')" class="text-white/50 hover:text-white transition"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="p-4 space-y-4">
        <div>
          <label class="text-white text-[12px] font-medium">Client <span class="text-accent2">*</span></label>
          <select id="comptaCreditClient" class="input-base mt-2 w-full"></select>
        </div>
        <div>
          <label class="text-white text-[12px] font-medium">Montant <span class="text-accent2">*</span></label>
          <input id="comptaCreditAmount" type="number" min="0" placeholder="0" class="input-base mt-2">
        </div>
        <div>
          <label class="text-white text-[12px] font-medium">Description</label>
          <textarea id="comptaCreditDescription" rows="3" class="input-base mt-2 resize-none" placeholder="Objet de l'encaissement..."></textarea>
        </div>
      </div>
      <div class="flex items-center gap-4 p-4 border-t border-white/10 bg-white/[0.02]">
        <button onclick="ComptabiliteView.submitCredit()" class="btn-primary hover:scale-105">Enregistrer</button>
        <button onclick="Picker.close('comptaCreditModal')" class="btn-ghost ml-auto">Annuler</button>
      </div>
    </div>
  </div>`;
};

Views.modalNewAbonnement = function(){
  return `
  <div id="newAbonnementModal" class="hidden fixed inset-0 bg-[rgba(3,13,34,0.78)] z-50 items-center justify-center p-4 backdrop-blur-sm">
    <div class="bg-surface border border-accent/15 rounded-xl w-full max-w-[420px] overflow-hidden shadow-[0_24px_70px_-18px_rgba(77,187,248,0.38)]">
      <div class="flex items-center justify-between p-4 border-b border-accent/10 bg-accent/5">
        <h3 class="text-white text-[15px] font-semibold">Nouvel abonnement</h3>
        <button onclick="Picker.close('newAbonnementModal')" class="text-white/50 hover:text-white transition"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="p-4 space-y-4">
        <div>
          <label class="text-white text-[12px] font-medium">Client <span class="text-accent2">*</span></label>
          <select id="aboClientSel" class="input-base mt-2 w-full">
            <option value="">Chargement...</option>
          </select>
        </div>
        <div>
          <label class="text-white text-[12px] font-medium">Forfait <span class="text-accent2">*</span></label>
          <select id="aboForfaitSel" class="input-base mt-2 w-full">
            <option value="">Chargement...</option>
          </select>
        </div>
      </div>
      <div class="flex items-center gap-4 p-4 border-t border-white/10 bg-white/[0.02]">
        <button onclick="AbonnementsView.confirmNew()" class="btn-primary hover:scale-105">Créer l'abonnement</button>
        <button onclick="Picker.close('newAbonnementModal')" class="btn-ghost ml-auto">Annuler</button>
      </div>
    </div>
  </div>`;
};

Views.modalTemplateEditor = function(){
  return `
  <div id="templateEditorModal" class="hidden fixed inset-0 bg-[rgba(3,13,34,0.78)] z-50 items-center justify-center p-4 backdrop-blur-sm">
    <div class="bg-surface border border-accent/15 rounded-xl w-full max-w-[520px] overflow-hidden shadow-[0_24px_70px_-18px_rgba(77,187,248,0.38)]">
      <div class="flex items-center justify-between p-4 border-b border-accent/10 bg-accent/5">
        <h3 class="text-white text-[15px] font-semibold">Éditeur de modèle</h3>
        <button onclick="Picker.close('templateEditorModal')" class="text-white/50 hover:text-white transition"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="p-4 space-y-4">
        <input id="templateId" type="hidden">
        <div>
          <label class="text-white text-[12px] font-medium">Titre du modèle</label>
          <input id="templateTitle" type="text" class="input-base mt-2" placeholder="Ex : Confirmation commande">
        </div>
        <div>
          <label class="text-white text-[12px] font-medium">Type</label>
          <select id="templateType" class="input-base mt-2">
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </select>
        </div>
        <div>
          <label class="text-white text-[12px] font-medium">Contenu</label>
          <textarea id="templateContent" rows="6" class="input-base mt-2 resize-none" placeholder="Tapez le contenu du message..."></textarea>
        </div>
      </div>
      <div class="flex items-center gap-3 p-4 border-t border-white/10 bg-white/[0.02]">
        <button onclick="TemplatesView.saveTemplate()" class="btn-primary hover:scale-105">Enregistrer</button>
        <button onclick="TemplatesView.deleteTemplate()" class="btn-ghost ml-auto">Supprimer</button>
      </div>
    </div>
  </div>`;
};

Views.modalSuccess = function(){
  return `
  <div id="successModal" class="hidden fixed inset-0 bg-[rgba(3,13,34,0.78)] z-50 items-center justify-center p-4 backdrop-blur-sm">
    <div class="bg-surface border border-accent/15 rounded-xl w-full max-w-[380px] p-7 flex flex-col items-center text-center shadow-[0_24px_70px_-18px_rgba(77,187,248,0.38)]">
      <div class="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-4 animate-pulse">
        <i class="bi bi-check-circle-fill text-emerald-400 text-3xl"></i>
      </div>
      <h3 id="successTitle" class="text-white text-[16px] font-semibold">Élément créé !</h3>
      <p id="successSubtitle" class="text-white/50 text-[12px] mt-2">L'opération a été effectuée avec succès.</p>
      <div class="flex items-center gap-2 mt-6 w-full flex-wrap">
        <button onclick="UI.successAction('details')" class="flex-1 btn-primary text-[11.5px] whitespace-nowrap hover:scale-105">Voir les détails</button>
        <button onclick="UI.successAction('another')" class="flex-1 text-white text-[11.5px] font-medium px-3 py-2.5 rounded-lg whitespace-nowrap hover:bg-white/10 transition" style="background:rgba(255,255,255,0.08)">Créer un autre</button>
        <button onclick="UI.successAction('list')" class="flex-1 btn-ghost text-[11.5px] whitespace-nowrap">Retour à la liste</button>
      </div>
    </div>
  </div>`;
};

Views.modalConfirm = function(){
  return `
  <div id="confirmModal" class="hidden fixed inset-0 bg-[rgba(3,13,34,0.78)] z-50 items-center justify-center p-4 backdrop-blur-sm">
    <div class="bg-surface border border-accent/15 rounded-xl w-full max-w-[360px] p-6 flex flex-col items-center text-center shadow-[0_24px_70px_-18px_rgba(77,187,248,0.38)]">
      <div class="w-14 h-14 rounded-full bg-rose-500/20 flex items-center justify-center mb-4">
        <i class="bi bi-exclamation-triangle-fill text-rose-400 text-2xl"></i>
      </div>
      <h3 id="confirmTitle" class="text-white text-[16px] font-semibold">Confirmer la suppression</h3>
      <p id="confirmSubtitle" class="text-white/50 text-[12px] mt-2">Cette action est irréversible.</p>
      <div class="flex items-center gap-3 mt-6 w-full">
        <button onclick="UI.confirmYes()" class="flex-1 text-white text-[12px] font-medium py-2.5 rounded-lg hover:shadow-lg hover:shadow-accent/30 transition" style="background:#4DBBF8">Confirmer</button>
        <button onclick="UI.confirmNo()" class="flex-1 btn-ghost border border-white/10 py-2.5 rounded-lg hover:bg-white/5 transition">Annuler</button>
      </div>
    </div>
  </div>`;
};