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
        const rows = result[0].rows[0]
        if (rows) {
            const { id, phone_number, identity_number, username, password: passwordHash, salt, avatar, email, default_theme, admin } = rows
            if (verifyPassword(password, passwordHash, salt)) {
                const data = {
                    id: id,
                    phone_number: phone_number,
                    identity_number: identity_number,
                    username: username,
                    avatar: avatar,
                    email: email,
                    default_theme: default_theme,
                    admin: admin
                }
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

    let sqlArr1 = [
        {
            sql: `SELECT EXISTS (SELECT 1 FROM user_tb WHERE phone_number = ?) AS isExists`,
            values: [phone_number]
        }
    ]
    let sqlArr2 = [
        {
            sql: 'INSERT INTO user_tb(phone_number, username, password, salt, default_theme, admin) VALUES (?, ?, ?, ?, false, false)',
            values: [phone_number, randomUsername(phone_number), passwordHash, salt]
        }
    ]

    execTranstion(sqlArr1).then(result => {
        if(result[0].rows[0].isExists) {
            return res.send({
                code: -1,
                msg: '该账号已注册'
            })
        } else {
            execTranstion(sqlArr2).then(result => {
                if (result[0].rows.affectedRows > 0) {
                    const { success } = result[sqlArr.length - 1]
                    if (success) res.send({
                        code: 1,
                        msg: '注册成功'
                    })
                } else {
                    res.send({
                        code: 0,
                        msg: '注册失败'
                    })
                }
            }).catch((error) => {
                console.log(error)
                res.status(500).send({
                    code: 0,
                    message: '服务器错误'
                })
            })
        }
    }).catch((error) => {
        console.log(error)
        res.status(500).send({
            code: 0,
            message: '服务器错误'
        })
    })
})

export default router