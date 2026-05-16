const db = require('../config/db');

class Product {
    static findByUserId(userId) {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM products WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    }

    static create(userId, nome, descricao, preco, tipo) {
        return new Promise((resolve, reject) => {
            db.run('INSERT INTO products (user_id, nome, descricao, preco, tipo) VALUES (?, ?, ?, ?, ?)',
                [userId, nome, descricao || '', parseFloat(preco), tipo || 'curso'], function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
        });
    }

    static delete(id, userId) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM products WHERE id = ? AND user_id = ?', [id, userId], function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    static findAllActiveWithUsers() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT p.*, u.nome as produtor_nome 
                FROM products p 
                JOIN users u ON p.user_id = u.id 
                WHERE p.status = 'ativo' 
                ORDER BY p.created_at DESC
            `;
            db.all(query, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    }

    static incrementSales(id) {
        return new Promise((resolve, reject) => {
            db.run('UPDATE products SET vendas = vendas + 1 WHERE id = ? AND status = "ativo"', [id], function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    static getGlobalStats() {
        return new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as totalProducts, SUM(vendas) as totalSales, SUM(vendas * preco) as totalRevenue FROM products WHERE status = "ativo"', (err, row) => {
                if (err) reject(err);
                else resolve({
                    totalProducts: row ? (row.totalProducts || 0) : 0,
                    totalSales: row ? (row.totalSales || 0) : 0,
                    totalRevenue: row ? (row.totalRevenue || 0) : 0
                });
            });
        });
    }
}

module.exports = Product;
