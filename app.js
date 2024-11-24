import app from './bin/www.js'
import jwt from "jsonwebtoken"
import login from './src/router/login/index.js'
import user from './src/router/user/index.js'
import { createToken, SECRECT_KEY } from "./src/utils/token.js"
import express from "express";

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        res.status(200).json({});
    }
    next()
})

app.get('/refresh_token',(req,res) => {
    const authorization = req.headers.authorization
    const errMsg = {
        code: 401,
        msg: "Unauthorized"
    }
    if (!authorization) return res.send(errMsg)
    const token = authorization.replace('Bearer ', '')
    try {
        const decoded = jwt.verify(token, SECRECT_KEY);
        if (decoded.token_type !== "REFRESH_TOKEN") {
            res.send(errMsg);
            return;
        }
        let newToken = createToken();
        res.send({
            code: 0,
            msg: '',
            data: {
                content: "刷新token成功",
                token: newToken,
            },
        });
    } catch {
        res.send(errMsg);
    }
})

app.use('/static', express.static('upload/avatar'))
app.use('/login', login)
app.use('/user', user)