const Product = require('../models/Product');
const User = require('../models/User');

exports.getUserStats = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Não autenticado' });
    try {
        const products = await Product.findByUserId(req.session.userId);
        const total = products.length;
        const ativos = products.filter(p => p.status === 'ativo').length;
        const vendas = products.reduce((s, p) => s + p.vendas, 0);
        const receita = products.reduce((s, p) => s + (p.vendas * p.preco), 0);
        
        res.json({ totalProdutos: total, produtosAtivos: ativos, totalVendas: vendas, receitaTotal: receita });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro.' });
    }
};

exports.getGlobalStats = async (req, res) => {
    try {
        const usersCount = await User.countAll();
        const globalStats = await Product.getGlobalStats();

        res.json({
            users: usersCount,
            products: globalStats.totalProducts,
            sales: globalStats.totalSales,
            revenue: globalStats.totalRevenue
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro no servidor' });
    }
};
