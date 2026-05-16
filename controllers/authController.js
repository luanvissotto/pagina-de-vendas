const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.register = async (req, res) => {
    const { nome, email, password } = req.body;
    if (!nome || !email || !password) return res.status(400).json({ error: 'Preencha todos os campos.' });
    if (password.length < 6) return res.status(400).json({ error: 'Senha mínimo 6 caracteres.' });

    try {
        const existing = await User.findByEmail(email);
        if (existing) return res.status(409).json({ error: 'E-mail já cadastrado.' });

        const hashed = await bcrypt.hash(password, 10);
        const userId = await User.create(nome, email, hashed);

        req.session.userId = userId;
        req.session.email = email;
        req.session.nome = nome;
        req.session.role = 'user';
        res.json({ success: true, redirectUrl: '/dashboard/painel.html' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro no servidor.' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'E-mail e senha obrigatórios.' });

    try {
        const user = await User.findByEmail(email);
        if (!user) return res.status(401).json({ error: 'Usuário não encontrado.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Senha incorreta.' });

        req.session.userId = user.id;
        req.session.email = user.email;
        req.session.nome = user.nome;
        req.session.role = user.role;
        res.json({ success: true, redirectUrl: '/dashboard/painel.html' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro no servidor.' });
    }
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'Erro ao sair.' });
        res.clearCookie('connect.sid');
        res.json({ success: true, redirectUrl: '/' });
    });
};

exports.me = (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Não autenticado' });
    res.json({ id: req.session.userId, email: req.session.email, nome: req.session.nome, role: req.session.role });
};
