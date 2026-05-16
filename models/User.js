const db = require('../config/db');

class User {
    static findByEmail(email) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static create(nome, email, hashedPw) {
        return new Promise((resolve, reject) => {
            db.run('INSERT INTO users (nome, email, password) VALUES (?, ?, ?)', [nome, email, hashedPw], function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    }

    static countAll() {
        return new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as totalUsers FROM users', (err, row) => {
                if (err) reject(err);
                else resolve(row ? row.totalUsers : 0);
            });
        });
    }
}

module.exports = User;
