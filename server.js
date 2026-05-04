const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'vendafy-super-secret-key-12345',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Erro ao abrir o banco:', err.message);
    else { console.log('Conectado ao SQLite.'); inicializarBanco(); }
});

function inicializarBanco() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT,
            email TEXT UNIQUE,
            password TEXT,
            role TEXT DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            nome TEXT,
            descricao TEXT,
            preco REAL,
            tipo TEXT DEFAULT 'curso',
            status TEXT DEFAULT 'ativo',
            vendas INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);
    });
}

// Proteger dashboard
app.use((req, res, next) => {
    if (req.path.startsWith('/dashboard/') && req.path.endsWith('.html')) {
        if (!req.session.userId) return res.redirect('/');
    }
    next();
});

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Registro
app.post('/api/register', async (req, res) => {
    const { nome, email, password } = req.body;
    if (!nome || !email || !password) return res.status(400).json({ error: 'Preencha todos os campos.' });
    if (password.length < 6) return res.status(400).json({ error: 'Senha mínimo 6 caracteres.' });

    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, existing) => {
        if (err) return res.status(500).json({ error: 'Erro no servidor.' });
        if (existing) return res.status(409).json({ error: 'E-mail já cadastrado.' });

        const hashed = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (nome, email, password) VALUES (?, ?, ?)', [nome, email, hashed], function (err) {
            if (err) return res.status(500).json({ error: 'Erro ao criar conta.' });
            req.session.userId = this.lastID;
            req.session.email = email;
            req.session.nome = nome;
            req.session.role = 'user';
            res.json({ success: true, redirectUrl: '/dashboard/painel.html' });
        });
    });
});

// Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'E-mail e senha obrigatórios.' });

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Erro no servidor.' });
        if (!user) return res.status(401).json({ error: 'Usuário não encontrado.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Senha incorreta.' });

        req.session.userId = user.id;
        req.session.email = user.email;
        req.session.nome = user.nome;
        req.session.role = user.role;
        res.json({ success: true, redirectUrl: '/dashboard/painel.html' });
    });
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'Erro ao sair.' });
        res.clearCookie('connect.sid');
        res.json({ success: true, redirectUrl: '/' });
    });
});

// Dados do usuário
app.get('/api/me', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Não autenticado' });
    res.json({ id: req.session.userId, email: req.session.email, nome: req.session.nome, role: req.session.role });
});

// === PRODUTOS API ===
// Listar produtos do usuário
app.get('/api/products', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Não autenticado' });
    db.all('SELECT * FROM products WHERE user_id = ? ORDER BY created_at DESC', [req.session.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar produtos.' });
        res.json(rows || []);
    });
});

// Criar produto
app.post('/api/products', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Não autenticado' });
    const { nome, descricao, preco, tipo } = req.body;
    if (!nome || !preco) return res.status(400).json({ error: 'Nome e preço são obrigatórios.' });
    db.run('INSERT INTO products (user_id, nome, descricao, preco, tipo) VALUES (?, ?, ?, ?, ?)',
        [req.session.userId, nome, descricao || '', parseFloat(preco), tipo || 'curso'], function (err) {
            if (err) return res.status(500).json({ error: 'Erro ao criar produto.' });
            res.json({ success: true, id: this.lastID });
        });
});

// Deletar produto
app.delete('/api/products/:id', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Não autenticado' });
    db.run('DELETE FROM products WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId], function (err) {
        if (err) return res.status(500).json({ error: 'Erro ao deletar.' });
        res.json({ success: true });
    });
});

// Dashboard stats
app.get('/api/dashboard', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Não autenticado' });
    db.all('SELECT * FROM products WHERE user_id = ?', [req.session.userId], (err, products) => {
        if (err) return res.status(500).json({ error: 'Erro.' });
        const total = products ? products.length : 0;
        const ativos = products ? products.filter(p => p.status === 'ativo').length : 0;
        const vendas = products ? products.reduce((s, p) => s + p.vendas, 0) : 0;
        const receita = products ? products.reduce((s, p) => s + (p.vendas * p.preco), 0) : 0;
        res.json({ totalProdutos: total, produtosAtivos: ativos, totalVendas: vendas, receitaTotal: receita });
    });
});

app.listen(PORT, () => {
    console.log(`✨ VENDAFY rodando em http://localhost:${PORT}`);
});
