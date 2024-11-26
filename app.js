import app from './bin/www.js'
import jwt from "jsonwebtoken"
import login from './src/router/login/index.js'
import user from './src/router/user/index.js'
import { createToken, SECRET_KEY } from "./src/utils/token.js"
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

// 刷新token 以长换短
app.get('/refresh_token', (req,res) => {
    const authorization = req.headers.authorization
    const errMsg = {
        code: 401,
        msg: "Unauthorized"
    }
    if (!authorization) return res.status(401).send(errMsg)
    const token = authorization.replace('Bearer ', '')
    try {
        const decoded = jwt.verify(token, SECRET_KEY)
        if (decoded.token_type !== "REFRESH_TOKEN") {
            res.send(errMsg);
            return
        }
        let newToken = createToken();
        res.send({
            code: 1,
            msg: '刷新token成功',
            token: newToken
        });
    } catch (error) {
        console.log(error)
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).send({ code: 0, msg: "无效的token" });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).send({ code: -1, msg: "token已过期" });
        } else {
            return res.status(500).send({ code: 500, msg: "服务器错误" });
        }
    }
})

// 设置请求超时时间
app.use((req, res, next) => {
    res.setTimeout(10000, () => {
        console.log('Request Timeout!!!')
        res.status(408).send({
            message: '请求超时'
        })
    })
    next()
})
app.use('/static', express.static('upload/avatar'))
app.use('/login', login)
app.use('/user', user)