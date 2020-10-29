const pool = require('./pg');

module.exports.register = register;
module.exports.login = login;
module.exports.addToken = addToken;
module.exports.getToken = getToken;

function register(data){
    return new Promise((resolve, reject) => {
        pool.connect((err, client, done) => {
            if (err) throw err;
            done();
            client.query('INSERT INTO users (password, email) VALUES ($1, $2) RETURNING *', [data.hash, data.email], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result.rows[0]);
                }
            });
        });
    });
}

function login(email){
    return new Promise((resolve, reject) => {
        pool.connect((err, client, done) => {
            if (err) throw err;
            client.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email], (err, res) => {
                done();
                if (err) {
                    reject(err);
                } else {
                    resolve(res.rows[0]);
                }
            });
        });
    });
}

function addToken(id, data){
    return new Promise((resolve, reject) => {
        pool.connect((err, client, done) => {
            if (err) throw err;
            client.query(`INSERT INTO tokens (user_id, ended, ip, token, os, platform, browser, version)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`, [id, Date.now() + 259200000, data.ip, data.hash, data.os, data.platform, data.browser, data.version],
                (err, result) => {
                done();
                if (err) {
                    reject(err);
                } else {
                    resolve(result.rows[0]);
                }
            });
        });
    });
}

function getToken(token){
    return new Promise((resolve, reject) => {
        pool.connect((err, client, done) => {
            if (err) throw err;
            client.query('DELETE FROM tokens WHERE token = $1 RETURNING *', [token], (err, res) => {
                done();
                if (err) {
                    reject(err);
                } else {
                    resolve(res.rows[0]);
                }
            });
        });
    });
}
