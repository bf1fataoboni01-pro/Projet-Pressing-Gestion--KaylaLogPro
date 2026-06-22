# PressingSana — Logiciel de gestion de pressing

## Prérequis

- **Node.js v22** : Installer `node-v22.23.0-x64.msi`
  → https://nodejs.org/dist/v22.23.0/node-v22.23.0-x64.msi

## Démarrage (Windows)

1. Double-cliquez sur **START.bat**
2. Le navigateur s'ouvre automatiquement sur http://localhost:3000
3. Connexion par défaut :
   - Email : `admin@pressing.bf`
   - Mot de passe : `admin123`

## Démarrage (VPS Linux)

```bash
npm install
node server.js
# ou avec PM2 :
pm2 start server.js --name pressingsana
```

## Structure

```
pressingsana/
├── server.js          ← Serveur Node.js/Express
├── START.bat          ← Lanceur Windows
├── package.json
├── data/
│   └── pressing.db    ← Base SQLite (créée au 1er démarrage)
└── public/
    ├── index.html
    ├── data.js        ← Client API (remplace l'ancien in-memory)
    ├── app.js         ← Logique SPA
    ├── templates.js   ← Templates HTML
    ├── modals.js      ← Modales
    └── backend_patch.js ← Connexion API backend
```

## Sauvegarde

Copier simplement le fichier `data/pressing.db` — toutes les données sont dedans.

## Fonctionnalités

- ✅ Caisse (commandes temps réel)
- ✅ Gestion commandes + suivi statuts
- ✅ Logistique + zones de stockage
- ✅ Clients (CRUD complet)
- ✅ Articles + tarifs par service
- ✅ Services de pressing
- ✅ Forfaits + abonnements clients
- ✅ Promotions
- ✅ Comptabilité (journal des ventes)
- ✅ Paramètres organisation
- ✅ Administration utilisateurs
- ✅ Recherche globale
- ✅ Tableau de bord avec stats réelles
- ✅ Mode clair/sombre

## Port

Par défaut : **3000**. Pour changer : `set PORT=8080 && node server.js`
