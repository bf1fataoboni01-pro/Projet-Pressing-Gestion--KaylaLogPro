/* ============================================================
   PRESSINGSANA — Serveur Node.js/Express + SQLite (sql.js)
   Démarrage : node server.js
   ============================================================ */

const express    = require('express');
const cors       = require('cors');
const bcrypt     = require('bcryptjs');
const path       = require('path');
const fs         = require('fs');
const initSqlJs  = require('sql.js');

const app  = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data', 'pressing.db');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/* ── DB INIT ─────────────────────────────────────────────── */
let db;

async function initDB() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buf);
    createSchema();
  } else {
    db = new SQL.Database();
    createSchema();
    seedData();
    saveDB();
  }
}

function saveDB() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function run(sql, params = []) {
  db.run(sql, params);
  saveDB();
}

function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function get(sql, params = []) {
  const rows = all(sql, params);
  return rows[0] || null;
}

function createSchema() {
  db.run(`PRAGMA journal_mode=WAL`);

  db.run(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'caissier',
    created_at INTEGER DEFAULT (strftime('%s','now')*1000)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS activity_log (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_name TEXT,
    action TEXT,
    entity TEXT,
    entity_id TEXT,
    created_at INTEGER DEFAULT (strftime('%s','now')*1000)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    exclusivity_group TEXT DEFAULT 'Traitement',
    unit_price INTEGER DEFAULT 500,
    kg_pricing_enabled INTEGER DEFAULT 0,
    kg_price INTEGER,
    express_unit_impact INTEGER,
    active INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (strftime('%s','now')*1000)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    icon TEXT DEFAULT 'bi-handbag',
    category TEXT,
    active INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (strftime('%s','now')*1000)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS article_tariffs (
    id TEXT PRIMARY KEY,
    article_id TEXT NOT NULL,
    service_id TEXT NOT NULL,
    unit_price INTEGER DEFAULT 0,
    kg_price INTEGER,
    express_unit_impact INTEGER,
    FOREIGN KEY(article_id) REFERENCES articles(id),
    FOREIGN KEY(service_id) REFERENCES services(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'article',
    created_at INTEGER DEFAULT (strftime('%s','now')*1000)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT DEFAULT '',
    orders_count INTEGER DEFAULT 0,
    total_spent INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s','now')*1000)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    ref TEXT UNIQUE NOT NULL,
    client_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    status TEXT DEFAULT 'en_attente',
    total INTEGER DEFAULT 0,
    note TEXT DEFAULT '',
    created_at INTEGER DEFAULT (strftime('%s','now')*1000),
    rendezvous_date INTEGER,
    FOREIGN KEY(client_id) REFERENCES clients(id)
  )`);

  try {
    db.run(`ALTER TABLE orders ADD COLUMN rendezvous_date INTEGER`);
  } catch (e) {
    // ignore if column already exists
  }

  db.run(`CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    name TEXT NOT NULL,
    qty INTEGER DEFAULT 1,
    unit_price INTEGER DEFAULT 0,
    FOREIGN KEY(order_id) REFERENCES orders(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS forfaits (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price INTEGER DEFAULT 0,
    note TEXT DEFAULT '',
    validity_days INTEGER DEFAULT 30,
    quantity_limit INTEGER DEFAULT 0,
    delivery_limit INTEGER,
    pickup_limit INTEGER,
    main_article_id TEXT,
    measure_type TEXT DEFAULT 'quantite',
    active INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (strftime('%s','now')*1000)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS forfait_services (
    forfait_id TEXT NOT NULL,
    service_id TEXT NOT NULL,
    PRIMARY KEY(forfait_id, service_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS abonnements (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    forfait_id TEXT NOT NULL,
    forfait_name TEXT NOT NULL,
    quantity_limit INTEGER DEFAULT 0,
    used_qty INTEGER DEFAULT 0,
    expires_at INTEGER NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s','now')*1000),
    FOREIGN KEY(client_id) REFERENCES clients(id),
    FOREIGN KEY(forfait_id) REFERENCES forfaits(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS promotions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'percent',
    value INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    expires_at INTEGER,
    created_at INTEGER DEFAULT (strftime('%s','now')*1000)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS financial_entries (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    amount INTEGER NOT NULL,
    description TEXT DEFAULT '',
    created_at INTEGER DEFAULT (strftime('%s','now')*1000)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS stock_zones (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    capacity INTEGER DEFAULT 100,
    used INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s','now')*1000)
  )`);
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function seedData() {
  const now = Date.now();

  // Settings
  const settingsData = [
    ['org_name','PressingSana'],['org_phone','+226 70 00 00 00'],
    ['org_email','contact@pressingsana.bf'],['org_address','Ouagadougou, Burkina Faso'],
    ['tva_rate','18'],['currency','FCFA'],['order_counter','231']
  ];
  for (const [k,v] of settingsData) db.run(`INSERT OR IGNORE INTO settings VALUES (?,?)`, [k,v]);

  // Admin user
  const hash = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users VALUES (?,?,?,?,?,?)`,
    ['u1','Administrateur','admin@pressing.bf', hash,'admin', now]);

  // Services
  const services = [
    ['s1','Lavage classique simple','','Traitement',100,1,700,null,1,now-60000],
    ['s2','Lavage classique avec repassage','','Traitement',300,0,null,100,1,now-30000],
    ['s3','Nettoyage à sec','Nettoyage professionnel sans eau','Traitement',800,0,null,200,1,now-120000],
  ];
  for (const s of services)
    db.run(`INSERT OR IGNORE INTO services VALUES (?,?,?,?,?,?,?,?,?,?)`, s);

  // Articles
  const articles = [
    ['a1','Chemise','Chemises classiques et habillées','bi-handbag','Vêtements habillés',1,now-300000],
    ['a2','Linge','Vêtements du quotidien','bi-basket3-fill','Vêtements du quotidien',1,now-180000],
    ['a3','Pantalon','Pantalons classiques et de ville','bi-person-standing','Vêtements habillés',1,now-420000],
    ['a4','Veste / Blazer','Vestes de costume et blazers','bi-suit-heart','Vêtements habillés',1,now-600000],
    ['a5','Couverture / Drap','Couvertures, draps et literie','bi-square-half','Linge de maison',1,now-900000],
  ];
  for (const a of articles)
    db.run(`INSERT OR IGNORE INTO articles VALUES (?,?,?,?,?,?,?)`, a);

  // Article tariffs
  const tariffs = [
    ['at1','a1','s1',500,null,null],
    ['at2','a1','s3',1200,null,200],
    ['at3','a2','s1',100,700,null],
    ['at4','a2','s2',300,null,100],
    ['at5','a3','s1',600,null,null],
    ['at6','a3','s3',1500,null,300],
    ['at7','a4','s3',2500,null,500],
    ['at8','a5','s1',200,500,null],
  ];
  for (const t of tariffs)
    db.run(`INSERT OR IGNORE INTO article_tariffs VALUES (?,?,?,?,?,?)`, t);

  // Categories
  const cats = [
    ['c1','Vêtements du quotidien','article',now],
    ['c2','Vêtements habillés','article',now],
    ['c3','Linge de maison','article',now],
  ];
  for (const c of cats)
    db.run(`INSERT OR IGNORE INTO categories VALUES (?,?,?,?)`, c);

  // Clients
  const clients = [
    ['cl1','Aminata Sawadogo','+226 70 12 34 56','aminata.s@example.com',14,87500,now-1000*60*60*24*120],
    ['cl2','Boukary Ouédraogo','+226 76 98 11 22','b.ouedraogo@example.com',6,32000,now-1000*60*60*24*45],
    ['cl3','Fatimata Kaboré','+226 78 44 21 09','',22,145200,now-1000*60*60*24*210],
    ['cl4','Issouf Traoré','+226 65 33 77 88','issouf.t@example.com',8,54000,now-1000*60*60*24*80],
    ['cl5','Mariam Compaoré','+226 71 55 90 12','mariam.c@example.com',3,12500,now-1000*60*60*24*15],
  ];
  for (const c of clients)
    db.run(`INSERT OR IGNORE INTO clients VALUES (?,?,?,?,?,?,?)`, c);

  // Orders
  const orders = [
    ['o1','CMD-0231','cl1','Aminata Sawadogo','en_attente',4500,'',now-1000*60*40],
    ['o2','CMD-0230','cl3','Fatimata Kaboré','en_cours',12300,'',now-1000*60*60*3],
    ['o3','CMD-0229','cl2','Boukary Ouédraogo','prete',2100,'',now-1000*60*60*9],
    ['o4','CMD-0228','cl1','Aminata Sawadogo','livree',6300,'',now-1000*60*60*30],
    ['o5','CMD-0227','cl3','Fatimata Kaboré','impayee',8800,'',now-1000*60*60*52],
    ['o6','CMD-0226','cl4','Issouf Traoré','collectee',5400,'',now-1000*60*60*6],
  ];
  for (const o of orders)
    db.run(`INSERT OR IGNORE INTO orders VALUES (?,?,?,?,?,?,?,?)`, o);

  // Order items
  const items = [
    ['oi1','o1','Chemise',3,500],['oi2','o1','Linge',4,700],
    ['oi3','o2','Linge',12,700],['oi4','o2','Chemise',6,500],
    ['oi5','o3','Chemise',3,700],
    ['oi6','o4','Linge',9,700],
    ['oi7','o5','Chemise',8,500],['oi8','o5','Linge',7,700],
    ['oi9','o6','Pantalon',3,600],['oi10','o6','Veste / Blazer',1,2500],
  ];
  for (const i of items)
    db.run(`INSERT OR IGNORE INTO order_items VALUES (?,?,?,?,?)`, i);

  // Forfaits
  db.run(`INSERT OR IGNORE INTO forfaits VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    ['f1','Pack mensuel sans emballage',15000,'Idéal pour les familles.',30,100,null,null,'a2','quantite',1,now-480000]);
  db.run(`INSERT OR IGNORE INTO forfaits VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    ['f2','Pack Premium Habillé',35000,'Pour les professionnels.',30,20,4,4,'a1','quantite',1,now-1200000]);
  db.run(`INSERT OR IGNORE INTO forfait_services VALUES (?,?) `,['f1','s1']);
  db.run(`INSERT OR IGNORE INTO forfait_services VALUES (?,?)`,['f2','s3']);

  // Promotions
  db.run(`INSERT OR IGNORE INTO promotions VALUES (?,?,?,?,?,?,?)`,
    ['p1','Réduction rentrée scolaire','percent',15,1,now+1000*60*60*24*20,now]);

  // Flux financiers
  db.run(`INSERT OR IGNORE INTO financial_entries VALUES (?,?,?,?,?,?)`,
    ['fe1','expense','Fournisseurs',42000,'Achat de produits détachés',now-1000*60*60*24*15]);
  db.run(`INSERT OR IGNORE INTO financial_entries VALUES (?,?,?,?,?,?)`,
    ['fe2','credit','Encaissements',125000,'Règlements clients en espèce',now-1000*60*60*24*10]);

  // Stock zones
  db.run(`INSERT OR IGNORE INTO stock_zones VALUES (?,?,?,?,?)`,
    ['z1','Entrepôt Principal — Zaca',500,312,now]);
  db.run(`INSERT OR IGNORE INTO stock_zones VALUES (?,?,?,?,?)`,
    ['z2','Antenne Ouaga 2000',200,64,now]);
}

/* ── HELPERS ─────────────────────────────────────────────── */
function nextOrderRef() {
  const s = get(`SELECT value FROM settings WHERE key='order_counter'`);
  const n = parseInt(s?.value || '231') + 1;
  run(`UPDATE settings SET value=? WHERE key='order_counter'`, [n.toString()]);
  return 'CMD-' + n.toString().padStart(4, '0');
}

function parseRow(row) {
  if (!row) return null;
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    if (v === 0 || v === 1) {
      // might be boolean columns
      if (['active','kg_pricing_enabled'].includes(k)) { out[k] = v === 1; continue; }
    }
    out[k] = v;
  }
  return out;
}
function logActivity(action, entity, entity_id, user_id = null, user_name = 'Système') {
  run(`INSERT INTO activity_log VALUES (?,?,?,?,?,?,?)`,
      [uid(), user_id, user_name, action, entity, entity_id, Date.now()]);
}
/* ── API ROUTES ──────────────────────────────────────────── */


// Dashboard
app.get('/api/dashboard', (req, res) => {
  try {
    const orders = all(`SELECT * FROM orders`);
    const totalRevenue = orders.filter(o => o.status === 'livree').reduce((s, o) => s + (o.total || 0), 0);
    const pending = orders.filter(o => o.status === 'en_attente').length;
    const inProgress = orders.filter(o => o.status === 'en_cours').length;
    const ready = orders.filter(o => o.status === 'prete').length;
    const collected = orders.filter(o => o.status === 'collectee').length;
    const delivered = orders.filter(o => o.status === 'livree').length;
    const unpaid = orders.filter(o => o.status === 'impayee').length;

    // Top articles from order items
    const topRaw = all(`
      SELECT oi.name, SUM(oi.qty) as total
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      GROUP BY oi.name ORDER BY total DESC LIMIT 5`);

    const recentOrders = all(`
      SELECT o.*, GROUP_CONCAT(oi.name || ' x' || oi.qty, ', ') as items_label
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      GROUP BY o.id
      ORDER BY o.created_at DESC LIMIT 6`);

    const clientCount = (get(`SELECT COUNT(*) as n FROM clients`) || {}).n || 0;
    const totalClients = (get(`SELECT COUNT(*) as n FROM clients`) || {}).n || 0;

    res.json({
      totalRevenue, pending, inProgress, ready, collected, delivered, unpaid,
      topArticles: topRaw,
      recentOrders,
      clientCount: totalClients,
      totalOrders: orders.length
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── SERVICES ──
app.get('/api/services', (req, res) => {
  try { res.json(all(`SELECT * FROM services ORDER BY name`)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/services', (req, res) => {
  try {
    const { name, description='', exclusivity_group='Traitement', unit_price=500,
            kg_pricing_enabled=false, kg_price=null, express_unit_impact=null, active=true } = req.body;
    if (!name) return res.status(400).json({ error: 'Nom obligatoire' });
    const id = uid();
    run(`INSERT INTO services VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [id, name, description, exclusivity_group, unit_price,
       kg_pricing_enabled ? 1 : 0, kg_price, express_unit_impact, active ? 1 : 0, Date.now()]);
    logActivity('Création service', 'service', id);
    res.json(get(`SELECT * FROM services WHERE id=?`, [id]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/services/:id', (req, res) => {
  try {
    const { name, description='', exclusivity_group='Traitement', unit_price=500,
            kg_pricing_enabled=false, kg_price=null, express_unit_impact=null, active=true } = req.body;
    run(`UPDATE services SET name=?,description=?,exclusivity_group=?,unit_price=?,
         kg_pricing_enabled=?,kg_price=?,express_unit_impact=?,active=? WHERE id=?`,
      [name, description, exclusivity_group, unit_price,
       kg_pricing_enabled ? 1 : 0, kg_price, express_unit_impact, active ? 1 : 0, req.params.id]);
    logActivity('Modification service', 'service', req.params.id);
    res.json(get(`SELECT * FROM services WHERE id=?`, [req.params.id]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/services/:id', (req, res) => {
  try {
    run(`DELETE FROM services WHERE id=?`, [req.params.id]);
    logActivity('Suppression service', 'service', req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── ARTICLES ──
app.get('/api/articles', (req, res) => {
  try {
    const articles = all(`SELECT * FROM articles ORDER BY name`);
    for (const a of articles) {
      a.active = a.active === 1;
      a.tariffs = all(`SELECT * FROM article_tariffs WHERE article_id=?`, [a.id]);
    }
    res.json(articles);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/articles', (req, res) => {
  try {
    const { name, description='', icon='bi-handbag', category=null, active=true, tariffs=[] } = req.body;
    if (!name) return res.status(400).json({ error: 'Nom obligatoire' });
    const id = uid();
    run(`INSERT INTO articles VALUES (?,?,?,?,?,?,?)`,
      [id, name, description, icon, category, active ? 1 : 0, Date.now()]);
    for (const t of tariffs) {
      run(`INSERT INTO article_tariffs VALUES (?,?,?,?,?,?)`,
        [uid(), id, t.service_id, t.unit_price || 0, t.kg_price || null, t.express_unit_impact || null]);
    }
    logActivity('Création article', 'article', id);
    const a = get(`SELECT * FROM articles WHERE id=?`, [id]);
    a.tariffs = all(`SELECT * FROM article_tariffs WHERE article_id=?`, [id]);
    a.active = a.active === 1;
    res.json(a);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/articles/:id', (req, res) => {
  try {
    const { name, description='', icon='bi-handbag', category=null, active=true, tariffs=[] } = req.body;
    run(`UPDATE articles SET name=?,description=?,icon=?,category=?,active=? WHERE id=?`,
      [name, description, icon, category, active ? 1 : 0, req.params.id]);
    run(`DELETE FROM article_tariffs WHERE article_id=?`, [req.params.id]);
    for (const t of tariffs) {
      run(`INSERT INTO article_tariffs VALUES (?,?,?,?,?,?)`,
        [uid(), req.params.id, t.service_id, t.unit_price || 0, t.kg_price || null, t.express_unit_impact || null]);
    }
    const a = get(`SELECT * FROM articles WHERE id=?`, [req.params.id]);
    a.tariffs = all(`SELECT * FROM article_tariffs WHERE article_id=?`, [req.params.id]);
    a.active = a.active === 1;
    logActivity('Modification article', 'article', req.params.id);
    res.json(a);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/articles/:id', (req, res) => {
  try {
    run(`DELETE FROM article_tariffs WHERE article_id=?`, [req.params.id]);
    run(`DELETE FROM articles WHERE id=?`, [req.params.id]);
    logActivity('Suppression article', 'article', req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── CATEGORIES ──
app.get('/api/categories', (req, res) => {
  try { res.json(all(`SELECT * FROM categories ORDER BY name`)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/categories', (req, res) => {
  try {
    const { name, type='article' } = req.body;
    if (!name) return res.status(400).json({ error: 'Nom obligatoire' });
    const id = uid();
    run(`INSERT INTO categories VALUES (?,?,?,?)`, [id, name, type, Date.now()]);
    logActivity('Création catégorie', 'category', id);
    res.json(get(`SELECT * FROM categories WHERE id=?`, [id]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/categories/:id', (req, res) => {
  try {
    run(`DELETE FROM categories WHERE id=?`, [req.params.id]);
    logActivity('Suppression catégorie', 'category', req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── CLIENTS ──
app.get('/api/clients', (req, res) => {
  try { res.json(all(`SELECT * FROM clients ORDER BY name`)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/clients', (req, res) => {
  try {
    const { name, phone, email='' } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Nom et téléphone obligatoires' });
    const id = uid();
    run(`INSERT INTO clients VALUES (?,?,?,?,?,?,?)`, [id, name, phone, email, 0, 0, Date.now()]);
    logActivity('Création client', 'client', id);
    res.json(get(`SELECT * FROM clients WHERE id=?`, [id]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/clients/:id', (req, res) => {
  try {
    const { name, phone, email='' } = req.body;
    run(`UPDATE clients SET name=?,phone=?,email=? WHERE id=?`, [name, phone, email, req.params.id]);
    logActivity('Modification client', 'client', req.params.id);
    res.json(get(`SELECT * FROM clients WHERE id=?`, [req.params.id]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/clients/:id', (req, res) => {
  try {
    run(`DELETE FROM clients WHERE id=?`, [req.params.id]);
    logActivity('Suppression client', 'client', req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── ORDERS ──
app.get('/api/orders', (req, res) => {
  try {
    const orders = all(`SELECT * FROM orders ORDER BY created_at DESC`);
    for (const o of orders) {
      o.items = all(`SELECT * FROM order_items WHERE order_id=?`, [o.id]);
    }
    res.json(orders);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/orders/:id', (req, res) => {
  try {
    const o = get(`SELECT * FROM orders WHERE id=?`, [req.params.id]);
    if (!o) return res.status(404).json({ error: 'Commande non trouvée' });
    o.items = all(`SELECT * FROM order_items WHERE order_id=?`, [o.id]);
    res.json(o);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/orders', (req, res) => {
  try {
    const { client_id, client_name, items=[], note='', rendezvous_date = null } = req.body;
    if (!client_id || !client_name) return res.status(400).json({ error: 'Client obligatoire' });
    if (!items.length) return res.status(400).json({ error: 'Panier vide' });
    const id = uid();
    const ref = nextOrderRef();
    const total = items.reduce((s, i) => s + (i.qty * i.unit_price), 0);
    run(`INSERT INTO orders (id, ref, client_id, client_name, status, total, note, created_at, rendezvous_date) VALUES (?,?,?,?,?,?,?,?,?)`,
      [id, ref, client_id, client_name, 'en_attente', total, note, Date.now(), rendezvous_date]);
    for (const item of items) {
      run(`INSERT INTO order_items VALUES (?,?,?,?,?)`,
        [uid(), id, item.name, item.qty, item.unit_price]);
    }
    run(`UPDATE clients SET orders_count=orders_count+1, total_spent=total_spent+? WHERE id=?`,
      [total, client_id]);
    logActivity('Création commande', 'order', id);
    const o = get(`SELECT * FROM orders WHERE id=?`, [id]);
    o.items = all(`SELECT * FROM order_items WHERE order_id=?`, [id]);
    res.json(o);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/orders/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['en_attente','collectee','en_cours','prete','livree','impayee'];
    if (!valid.includes(status)) return res.status(400).json({ error: 'Statut invalide' });
    run(`UPDATE orders SET status=? WHERE id=?`, [status, req.params.id]);
    logActivity(`Commande ${req.params.id} statut ${status}`, 'order', req.params.id);
    const o = get(`SELECT * FROM orders WHERE id=?`, [req.params.id]);
    if (o) {
      o.items = all(`SELECT * FROM order_items WHERE order_id=?`, [req.params.id]);
    }
    res.json(o);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/orders/:id', (req, res) => {
  try {
    const { note, status } = req.body;
    if (note !== undefined) run(`UPDATE orders SET note=? WHERE id=?`, [note, req.params.id]);
    if (status !== undefined) run(`UPDATE orders SET status=? WHERE id=?`, [status, req.params.id]);
    logActivity(`Commande ${req.params.id} mise à jour`, 'order', req.params.id);
    const o = get(`SELECT * FROM orders WHERE id=?`, [req.params.id]);
    o.items = all(`SELECT * FROM order_items WHERE order_id=?`, [req.params.id]);
    res.json(o);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/orders/:id', (req, res) => {
  try {
    run(`DELETE FROM order_items WHERE order_id=?`, [req.params.id]);
    run(`DELETE FROM orders WHERE id=?`, [req.params.id]);
    logActivity('Suppression commande', 'order', req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── FORFAITS ──
app.get('/api/forfaits', (req, res) => {
  try {
    const forfaits = all(`SELECT * FROM forfaits ORDER BY name`);
    for (const f of forfaits) {
      f.active = f.active === 1;
      f.serviceIds = all(`SELECT service_id FROM forfait_services WHERE forfait_id=?`, [f.id]).map(r => r.service_id);
    }
    res.json(forfaits);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/forfaits/:id', (req, res) => {
  try {
    const f = get(`SELECT * FROM forfaits WHERE id=?`, [req.params.id]);
    if (!f) return res.status(404).json({ error: 'Forfait non trouvé' });
    f.active = f.active === 1;
    f.serviceIds = all(`SELECT service_id FROM forfait_services WHERE forfait_id=?`, [f.id]).map(r => r.service_id);
    res.json(f);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/forfaits', (req, res) => {
  try {
    const { name, price=0, note='', validity_days=30, quantity_limit=0,
            delivery_limit=null, pickup_limit=null, main_article_id=null,
            measure_type='quantite', active=true, serviceIds=[] } = req.body;
    if (!name) return res.status(400).json({ error: 'Nom obligatoire' });
    const id = uid();
    run(`INSERT INTO forfaits VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, name, price, note, validity_days, quantity_limit,
       delivery_limit, pickup_limit, main_article_id, measure_type, active ? 1 : 0, Date.now()]);
    for (const sid of serviceIds)
      run(`INSERT OR IGNORE INTO forfait_services VALUES (?,?)`, [id, sid]);
    const f = get(`SELECT * FROM forfaits WHERE id=?`, [id]);
    f.active = f.active === 1;
    f.serviceIds = serviceIds;
    res.json(f);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/forfaits/:id', (req, res) => {
  try {
    const { name, price=0, note='', validity_days=30, quantity_limit=0,
            delivery_limit=null, pickup_limit=null, main_article_id=null,
            measure_type='quantite', active=true, serviceIds=[] } = req.body;
    run(`UPDATE forfaits SET name=?,price=?,note=?,validity_days=?,quantity_limit=?,
         delivery_limit=?,pickup_limit=?,main_article_id=?,measure_type=?,active=? WHERE id=?`,
      [name, price, note, validity_days, quantity_limit,
       delivery_limit, pickup_limit, main_article_id, measure_type, active ? 1 : 0, req.params.id]);
    run(`DELETE FROM forfait_services WHERE forfait_id=?`, [req.params.id]);
    for (const sid of serviceIds)
      run(`INSERT OR IGNORE INTO forfait_services VALUES (?,?)`, [req.params.id, sid]);
    const f = get(`SELECT * FROM forfaits WHERE id=?`, [req.params.id]);
    f.active = f.active === 1;
    f.serviceIds = serviceIds;
    res.json(f);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/forfaits/:id', (req, res) => {
  try {
    run(`DELETE FROM forfait_services WHERE forfait_id=?`, [req.params.id]);
    run(`DELETE FROM forfaits WHERE id=?`, [req.params.id]);
    logActivity('Suppression forfait', 'forfait', req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── ABONNEMENTS ──
app.get('/api/abonnements', (req, res) => {
  try { res.json(all(`SELECT * FROM abonnements ORDER BY created_at DESC`)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/abonnements', (req, res) => {
  try {
    const { client_id, forfait_id } = req.body;
    if (!client_id || !forfait_id) return res.status(400).json({ error: 'Client et forfait obligatoires' });
    const client = get(`SELECT * FROM clients WHERE id=?`, [client_id]);
    const forfait = get(`SELECT * FROM forfaits WHERE id=?`, [forfait_id]);
    if (!client) return res.status(404).json({ error: 'Client introuvable' });
    if (!forfait) return res.status(404).json({ error: 'Forfait introuvable' });
    const id = uid();
    const expires_at = Date.now() + (forfait.validity_days * 24 * 60 * 60 * 1000);
    run(`INSERT INTO abonnements VALUES (?,?,?,?,?,?,?,?,?)`,
      [id, client_id, client.name, forfait_id, forfait.name,
       forfait.quantity_limit, 0, expires_at, Date.now()]);
    logActivity('Création abonnement', 'abonnement', id);
    res.json(get(`SELECT * FROM abonnements WHERE id=?`, [id]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/transactions', (req, res) => {
  try {
    res.json(all(`SELECT * FROM financial_entries ORDER BY created_at DESC`));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/transactions', (req, res) => {
  try {
    const { type, category, amount, description='' } = req.body;
    if (!type || !['expense','credit'].includes(type)) return res.status(400).json({ error: 'Type de flux invalide' });
    if (!category) return res.status(400).json({ error: 'Catégorie requise' });
    if (amount === undefined || amount === null || isNaN(Number(amount))) return res.status(400).json({ error: 'Montant invalide' });
    const id = uid();
    run(`INSERT INTO financial_entries VALUES (?,?,?,?,?,?)`, [id, type, category, Math.abs(Math.round(amount)), description, Date.now()]);
    logActivity(`Création flux financier ${type}`, 'financial_entry', id);
    res.json(get(`SELECT * FROM financial_entries WHERE id=?`, [id]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/transactions/:id', (req, res) => {
  try {
    run(`DELETE FROM financial_entries WHERE id=?`, [req.params.id]);
    logActivity('Suppression flux financier', 'financial_entry', req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/abonnements/:id', (req, res) => {
  try {
    run(`DELETE FROM abonnements WHERE id=?`, [req.params.id]);
    logActivity('Suppression abonnement', 'abonnement', req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── PROMOTIONS ──
app.get('/api/promotions', (req, res) => {
  try {
    const promos = all(`SELECT * FROM promotions ORDER BY created_at DESC`);
    res.json(promos.map(p => ({ ...p, active: p.active === 1 })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/promotions', (req, res) => {
  try {
    const { name, type='percent', value=0, expires_at=null } = req.body;
    if (!name || !value) return res.status(400).json({ error: 'Nom et valeur obligatoires' });
    const id = uid();
    run(`INSERT INTO promotions VALUES (?,?,?,?,?,?,?)`,
      [id, name, type, value, 1, expires_at, Date.now()]);
    logActivity('Création promotion', 'promotion', id);
    res.json(get(`SELECT * FROM promotions WHERE id=?`, [id]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/promotions/:id', (req, res) => {
  try {
    const { name, type, value, active, expires_at } = req.body;
    run(`UPDATE promotions SET name=?,type=?,value=?,active=?,expires_at=? WHERE id=?`,
      [name, type, value, active ? 1 : 0, expires_at || null, req.params.id]);
    logActivity('Modification promotion', 'promotion', req.params.id);
    res.json(get(`SELECT * FROM promotions WHERE id=?`, [req.params.id]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/promotions/:id', (req, res) => {
  try {
    run(`DELETE FROM promotions WHERE id=?`, [req.params.id]);
    logActivity('Suppression promotion', 'promotion', req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── STOCK ZONES ──
app.get('/api/zones', (req, res) => {
  try { res.json(all(`SELECT * FROM stock_zones ORDER BY name`)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/zones', (req, res) => {
  try {
    const { name, capacity=100 } = req.body;
    if (!name) return res.status(400).json({ error: 'Nom obligatoire' });
    const id = uid();
    run(`INSERT INTO stock_zones VALUES (?,?,?,?,?)`, [id, name, capacity, 0, Date.now()]);
    logActivity('Création zone', 'stock_zone', id);
    res.json(get(`SELECT * FROM stock_zones WHERE id=?`, [id]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/zones/:id', (req, res) => {
  try {
    const { name, capacity, used } = req.body;
    run(`UPDATE stock_zones SET name=?,capacity=?,used=? WHERE id=?`,
      [name, capacity, used, req.params.id]);
    logActivity('Modification zone', 'stock_zone', req.params.id);
    res.json(get(`SELECT * FROM stock_zones WHERE id=?`, [req.params.id]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/zones/:id', (req, res) => {
  try {
    run(`DELETE FROM stock_zones WHERE id=?`, [req.params.id]);
    logActivity('Suppression zone', 'stock_zone', req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── SETTINGS ──
app.get('/api/settings', (req, res) => {
  try {
    const rows = all(`SELECT * FROM settings`);
    const obj = {};
    for (const r of rows) obj[r.key] = r.value;
    res.json(obj);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/settings', (req, res) => {
  try {
    for (const [k, v] of Object.entries(req.body)) {
      run(`INSERT OR REPLACE INTO settings VALUES (?,?)`, [k, String(v)]);
      logActivity(`Mise à jour paramètre ${k}`, 'settings', k);
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── USERS ──
app.get('/api/users', (req, res) => {
  try { res.json(all(`SELECT id,name,email,role,created_at FROM users ORDER BY created_at`)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

const sessions = {};

app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
    const user = get(`SELECT * FROM users WHERE email=?`, [email]);
    if (!user) return res.status(400).json({ error: 'Identifiants invalides' });
    if (!bcrypt.compareSync(password, user.password_hash)) return res.status(400).json({ error: 'Identifiants invalides' });
    const token = uid();
    sessions[token] = user.id;
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, token });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/me', (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.replace(/^Bearer\s+/, '');
    const userId = sessions[token];
    if (!userId) return res.status(401).json({ error: 'Non authentifié' });
    const user = get(`SELECT id,name,email,role FROM users WHERE id=?`, [userId]);
    if (!user) return res.status(401).json({ error: 'Session invalide' });
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/users', (req, res) => {
  try {
    const { name, email, role='caissier', password='password123' } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Nom et email obligatoires' });
    const existing = get(`SELECT id FROM users WHERE email=?`, [email]);
    if (existing) return res.status(400).json({ error: 'Email déjà utilisé' });
    const id = uid();
    const hash = bcrypt.hashSync(password || 'password123', 10);
    run(`INSERT INTO users VALUES (?,?,?,?,?,?)`, [id, name, email, hash, role, Date.now()]);
    logActivity('Création utilisateur', 'user', id);
    res.json({ id, name, email, role, message: `Mot de passe: ${password || 'password123'}` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/users/:id', (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Nom et email obligatoires' });
    const existing = get(`SELECT id FROM users WHERE email=? AND id<>?`, [email, req.params.id]);
    if (existing) return res.status(400).json({ error: 'Email déjà utilisé' });
    const user = get(`SELECT * FROM users WHERE id=?`, [req.params.id]);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    const params = [name, email];
    let sql = `UPDATE users SET name=?,email=?`;
    if (role) { sql += `,role=?`; params.push(role); }
    if (password) {
      const hash = bcrypt.hashSync(password, 10);
      sql += `,password_hash=?`; params.push(hash);
    }
    sql += ` WHERE id=?`;
    params.push(req.params.id);
    run(sql, params);
    logActivity('Modification utilisateur', 'user', req.params.id);
    const updated = get(`SELECT id,name,email,role,created_at FROM users WHERE id=?`, [req.params.id]);
    res.json(updated);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/users/:id', (req, res) => {
  try {
    const u = get(`SELECT role FROM users WHERE id=?`, [req.params.id]);
    if (u?.role === 'admin') return res.status(400).json({ error: 'Impossible de supprimer l\'admin' });
    run(`DELETE FROM users WHERE id=?`, [req.params.id]);
    logActivity('Suppression utilisateur', 'user', req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── ACTIVITY LOG ──
app.get('/api/activity', (req, res) => {
  try { res.json(all(`SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 50`)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ── SEARCH ──
app.get('/api/search', (req, res) => {
  try {
    const q = `%${req.query.q || ''}%`;
    const orders = all(`SELECT * FROM orders WHERE ref LIKE ? OR client_name LIKE ? ORDER BY created_at DESC LIMIT 5`, [q, q]);
    const clients = all(`SELECT * FROM clients WHERE name LIKE ? OR phone LIKE ? LIMIT 5`, [q, q]);
    const articles = all(`SELECT * FROM articles WHERE name LIKE ? LIMIT 5`, [q]);
    res.json({ orders, clients, articles });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── CATCH ALL → SPA ──
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ── START ───────────────────────────────────────────────── */
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n✅ PressingSana démarré sur http://localhost:${PORT}`);
    console.log(`   Données : ${DB_PATH}`);
    console.log(`   Admin   : admin@pressing.bf / admin123\n`);
  });
}).catch(err => {
  console.error('❌ Erreur démarrage DB:', err);
  process.exit(1);
});
