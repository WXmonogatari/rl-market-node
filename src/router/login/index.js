import express from "express"
import { genRandomString, sha512, verifyPassword } from "../../utils/crypto.js"
import execTranstion from "../../db/execTranstion.js";
import { createRefreshToken, createToken } from "../../utils/token.js";
import { randomUsername } from "../../utils/generateUsername.js";

const router = express.Router()

// 登录
router.post('/login',(req, res) => {
    const { phone_number, password } = req.body
    if (!phone_number || !password) return res.send({
        code: 0,
        msg: '手机号码或密码不能为空'
    })

    let sqlArr = [
        {
            sql: 'SELECT * FROM user_tb WHERE phone_number = ?',
            values: [phone_number]
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


// 注册
router.post('/register', (req, res) => {
    const { phone_number, password } = req.body
    if (!phone_number || !password) return res.send({
        code: 0,
        msg: '用户名或密码不能为空'
    })

    const { passwordHash, salt } = sha512(password, genRandomString(16))
    let sqlArr = [
        {
            sql: `SELECT EXISTS (SELECT 1 FROM user_tb WHERE phone_number = ?) AS isExists`,
            values: [phone_number]
        },
        {
            sql: 'INSERT INTO user_tb(phone_number, username, password, salt, default_theme, admin) VALUES (?, ?, ?, ?, false, false)',
            values: [phone_number, randomUsername(phone_number), passwordHash, salt]
        }
    ]

    execTranstion(sqlArr).then(result => {
        if(result[0].rows[0].isExists) {
             res.send({
                code: -1,
                msg: '该账号已注册'
            })
        } else {
            const { success } = result[sqlArr.length - 1]
            if (success) res.send({
                code: 1,
                msg: '注册成功'
            })
        }
    }).catch((error) => {
        console.log(error)
        res.send({
            code: 0,
            msg: '注册失败'
        })
    })
})

export default router