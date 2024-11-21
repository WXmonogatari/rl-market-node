import express from "express"
import { genRandomString, sha512, verifyPassword } from "../../utils/crypto.js"
import execTranstion from "../../db/execTranstion.js";
import { createRefreshToken, createToken } from "../../utils/token.js";

const router = express.Router()

router.post('/login',(req, res) => {
    const { username, password } = req.body
    if (!username || !password) return res.send({
        code: 0,
        msg: '用户名或密码不能为空'
    })

    let sqlArr = [
        {
            sql: 'SELECT * FROM user_tb WHERE username = ?',
            values: [username]
        }
    ]

    execTranstion(sqlArr).then(result => {
        const data = result[0].rows[0]
        if (data) {
            const { password: passwordHash, salt } = data
            if (verifyPassword(password, passwordHash, salt)) {
                let token = createToken()
                let refresh_token = createRefreshToken()
                res.send({
                    code: 1,
                    msg: '登录成功',
                    data,
                    token,
                    refresh_token
                })
            } else {
                res.send({
                    code: 0,
                    msg: '账号或密码错误'
                })
            }
        } else {
            res.send({
                code: 2,
                msg: '账号信息不存在'
            })
        }
    }).catch(error => {
        console.log(error)
    })
})

router.post('/register', (req, res) => {
    const { username, password } = req.body
    if (!username || !password) return res.send({
        code: 0,
        msg: '用户名或密码不能为空'
    })

    const { passwordHash, salt } = sha512(password, genRandomString(16))
    let sqlArr = [
        {
            sql: `SELECT EXISTS (SELECT 1 FROM user_tb WHERE username = ?) AS isExists`,
            values: [username]
        },
        {
            sql: 'INSERT INTO user_tb(username, password, salt, admin) VALUES (?, ?, ?, false)',
            values: [username, passwordHash, salt]
        }
    ]

    execTranstion(sqlArr).then(result => {
        const { success } = result[sqlArr.length - 1]
        if (success) res.send({
            code: 1,
            msg: '注册成功'
        })
    }).catch(error => {
        const { sqlState } = error
        switch (sqlState) {
            case '23000': {
                res.send({
                    code: 0,
                    msg: '用户名已存在'
                })
                break
            }
            default: {
                res.send({
                    code: 0,
                    msg: '注册失败'
                })
            }
        }
    })
})

export default router