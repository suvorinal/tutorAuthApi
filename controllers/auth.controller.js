const pg = require('../pg/pgQueries');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const crypto = require('crypto');

const saltRound = 1;
const GLOBAL_SALT = '8a21cedf37a3c7afed52a24555e3411b808bba7da08382fa9018a2035499b1c7';
const secretKey = 'secretKey';
const jwtTime = 60 * 60;

module.exports.login = login;
module.exports.register = register;
module.exports.refresh = refresh;

async function login(req, res){
    const data = {
        email: req.body.email,
        password: req.body.password,
    }
    if (validateData(data)) {
        pg.login(data.email).then(async row => {
            if (row){
                bcrypt.compare(data.password, row.password).then(async (result) => {
                    if (result) {
                        const session = await createSession(row.id, req, {id: row.id});
                        if (session.err) res.status(500).end(); //DB error
                        else res.status(202).cookie('jwt', session.jwt, {httpOnly: true}).json({refresh: session.refresh});
                    } else
                        res.status(400).end(); //invalid_password
                })
            } else {
                res.status(400).end(); //does_not_exist
            }
        }).catch(err => {
            res.status(500).end() //DB error
            throw err
        })
    } else {
        res.status(403).end(); //invalid_data
    }
}

async function register(req, res){
    let data = {
        password: req.body.password,
        email: req.body.email
    }
    if (validateData(data)) {
        data.hash = await bcrypt.hash(data.password, saltRound);
        pg.register(data).then(async (row) => {
            if (row) {
                const session = await createSession(row.id, req, {id: row.id});
                if (session.err) res.status(500).end(); //DB error
                else res.status(201).cookie('jwt', session.jwt, {httpOnly: true}).json({refresh: session.refresh});
            } else res.status(500).end(); //DB error
        }).catch(err => {
            if (err.constraint === 'login_already_exists')
                res.status(400).end(); //email_already_exist
            else res.status(500).end(); //DB error
        })
    } else
        res.status(403).end(); //invalid_data
}

function refresh(req, res){
    let data = {
        refresh: req.body.refresh
    }
    data.jwt = req.cookies.jwt;
    if (validateRefresh(data)){
        let jwtDecoded = jsonwebtoken.decode(data.jwt, secretKey);
        if (!jwtDecoded || jwtDecoded.exp > Math.floor(Date.now() / 1000))
            res.status(400).end();
        else{
            pg.getToken(data.refresh).then(async (row) => {
                if (row){
                    const session = await createSession(row['user_id'], req, jwtDecoded);
                    if (session.err) res.status(500).end();
                    else res.status(200).cookie('jwt', session.jwt, {httpOnly: true}).json({refresh: session.refresh});
                } else{
                    res.status(404).end();
                }
            }).catch((err) => {
                console.log(err);
                res.status(500).end()
            })
        }
    } else res.status(400).end();
}

async function createSession(id, req, payload) {
    let data = {};
    let token = jsonwebtoken.sign({id: payload.id, exp: Math.floor(Date.now() / 1000) + jwtTime}, secretKey);
    data.os = req.useragent.os;
    data.platform = req.useragent.platform;
    data.version = req.useragent.version;
    data.browser = req.useragent.browser;
    data.ip = req.ipInfo.ip;
    data.hash = getRandomHash();
    let result = {jwt: token, refresh: data.hash};
    await pg.addToken(id, data).catch((err) => {
        result.err = err;
    });
    return result;
}

function validateData(data){
    return data.email && data.password && validator.isEmail(data.email) && validator.isLength(data.password, {min: 6, max: 80});
}

function validateRefresh(data) {
    return data.refresh && data.jwt && data.refresh.length === 64;
}

function getRandomHash(){
    return crypto.randomBytes(32).toString('hex');
}
