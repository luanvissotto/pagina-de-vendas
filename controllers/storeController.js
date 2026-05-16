const Product = require('../models/Product');

exports.getStoreProducts = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Não autenticado' });
    try {
        const products = await Product.findAllActiveWithUsers();
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar produtos da loja.' });
    }
};

exports.buyProduct = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Não autenticado' });
    const productId = req.params.id;
    try {
        const changes = await Product.incrementSales(productId);
        if (changes === 0) return res.status(404).json({ error: 'Produto não encontrado ou inativo.' });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro na compra' });
    }
};
