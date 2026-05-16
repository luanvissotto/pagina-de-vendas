const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Não autenticado' });
    try {
        const products = await Product.findByUserId(req.session.userId);
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar produtos.' });
    }
};

exports.createProduct = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Não autenticado' });
    const { nome, descricao, preco, tipo } = req.body;
    if (!nome || !preco) return res.status(400).json({ error: 'Nome e preço são obrigatórios.' });

    try {
        const id = await Product.create(req.session.userId, nome, descricao, preco, tipo);
        res.json({ success: true, id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao criar produto.' });
    }
};

exports.deleteProduct = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Não autenticado' });
    try {
        await Product.delete(req.params.id, req.session.userId);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao deletar.' });
    }
};
