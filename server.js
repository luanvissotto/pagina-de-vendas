require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const dashboardRoutes = require('./routes/dashboard');
const storeRoutes = require('./routes/store');

const app = express();
const PORT = 3000;

// Segurança: Oculta headers e aplica políticas
app.use(helmet({
    contentSecurityPolicy: false // Desabilitado temporariamente para não quebrar scripts inline do design
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-development',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Proteção contra força bruta em rotas sensíveis
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 50, // 50 requisições por IP
    message: { error: 'Muitas requisições deste IP, tente novamente em 15 minutos.' }
});

// Proteger dashboard
app.use((req, res, next) => {
    if (req.path.startsWith('/dashboard/') && req.path.endsWith('.html')) {
        if (!req.session.userId) return res.redirect('/');
    }
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rotas da API
app.use('/api', apiLimiter, authRoutes); // Rate limiter aplicado na autenticação
app.use('/api/products', productsRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', storeRoutes);

app.listen(PORT, () => {
    console.log(`✨ BOOSTSELL rodando em http://localhost:${PORT}`);
});
