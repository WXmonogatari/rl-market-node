import express from "express"
const router = express.Router()
import execTranstion from "../../db/execTranstion.js"
import * as fs from "fs"
import multer from 'multer'
import path from 'path'
import dotenv from "dotenv"
import { verifyEmail, verifyPhoneNumber } from "../../utils/RegExp.js"

const node_env = process.env.NODE_ENV || 'development'
const config = dotenv.config({ path: `.env.${node_env}` })
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.parsed.uploadPath); // 修改为希望保存的文件夹路径
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // 生成唯一文件名
    }
})
const upload = multer({ storage: storage })

// const upload = multer().single('avatar')
// const uploadOptions = (filename) => {
//     return {
//         destination: config.parsed.uploadPath,
//         filename: filename
//     }
// }

// 获取用户数据
router.get('/getMyInfo/:id', async (req, res) => {
    console.log(req.headers)
    const { id } = req.params
    if (!id) {
        return res.send({
            code: 2,
            message: '用户信息获取失败'
        })
    }

    let sqlArr = [
        {
            sql: 'SELECT id, admin, identity_number, username, avatar, email, phone_number, default_theme FROM user_tb WHERE id = ?',
            values: [id]
        }
    ]

    await execTranstion(sqlArr).then(result => {
        if (result[0].rows.length > 0) {
            const data = result[0].rows[0]
            res.status(200).send({
                code: 1,
                message: '用户信息获取成功',
                data
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

// 获取全部留言数据
router.get('/getMessage', (req, res) => {
    const { count, limit } = req.query
    let sqlArr = [
        {
            sql: 'SELECT * FROM message_tb ORDER BY id DESC LIMIT ?, ?',
            values: [Number(count), Number(limit)]
        }
    ]
    execTranstion(sqlArr).then(result => {
        let { rows } = result[0]
        if (rows.length > 0) {
            res.send({
                code: 1,
                message: '数据获取成功',
                data: rows
            })
        } else {
            res.send({
                code: -1,
                message: '没有更多数据',
                data: rows
            })
        }
    }).catch((error) => {
        res.send({
            code: 0,
            message: '数据获取失败'
        })
    })
})

// 创建一条留言
router.post('/createMessage', (req, res) => {
    const { user_id, username, createTime, text, colorIndex } = req.body
    if (!user_id || !username || !createTime || !text) {
        return res.send({
            code: -1,
            message: '用户未登录'
        })
    }

    let sqlArr = [
        {
            sql: 'INSERT INTO message_tb(user_id, username, createTime, text, colorIndex) VALUES (?, ?, ?, ?, ?)',
            values: [user_id, username, createTime, text, colorIndex]
        }
    ]

    execTranstion(sqlArr).then(result => {
        if (result[0].rows.affectedRows > 0) {
            return res.send({
                code: 1,
                message: '创建成功'
            })
        }
    }).catch(() => {
        res.send({
            code: 0,
            message: '创建失败'
        })
    })
})

// 返回一条指定留言
router.get('/getSingleMessage', (req, res) => {
    const { id } = req.query
    let sqlArr = [
        {
            sql: 'SELECT * FROM message_tb WHERE id = ?',
            values: [id]
        }
    ]

    execTranstion(sqlArr).then(result => {
        const data = result[0].rows[0]
        res.send({
            code: 1,
            message: '数据获取成功',
            data
        })
    }).catch(() => {
        res.send({
            code: 0,
            message: '数据获取失败'
        })
    })
})

// 返回一条随机留言
router.get('/getRandomMessage', (req, res) => {
    let sqlArr = [
        {
            sql: 'SELECT * FROM message_tb AS t1 JOIN (SELECT ROUND(RAND()*(SELECT MAX(id) FROM message_tb)) AS id)AS t2 WHERE t1.id>=t2.id ORDER BY t1.id LIMIT 1',
            values: []
        }
    ]

    execTranstion(sqlArr).then(result => {
        const data = result[0].rows[0]
        res.send({
            code: 1,
            message: '数据获取成功',
            data
        })
    }).catch(() => {
        res.send({
            code: 0,
            message: '数据获取失败'
        })
    })
})


// 返回传入用户id的全部留言
router.get('/myMessage', (req, res) => {
    const { id } = req.query
    let sqlArr = [
        {
            sql: 'SELECT * FROM message_tb WHERE user_id = ?',
            values: [id]
        }
    ]

    execTranstion(sqlArr).then(result => {
        const data = result[0].rows
        res.send({
            code: 1,
            message: '数据获取成功',
            data
        })
    }).catch(() => {
        res.send({
            code: 0,
            message: '数据获取失败'
        })
    })
})

// 删除一条留言
router.delete('/deleteMessage/:id/:user_id', (req, res) => {
    const { id, user_id } = req.params
    let sqlArr = [
        {
            sql: 'DELETE FROM message_tb WHERE id = ? AND user_id = ?',
            values: [id, user_id]
        }
    ]

    execTranstion(sqlArr).then(result => {
        if (result[0].rows.affectedRows > 0) {
            res.send({
                code: 1,
                message: '删除成功'
            })
        }
    }).catch(() => {
        res.send({
            code: 0,
            message: '删除失败'
        })
    })
})

// 删除全部留言
router.delete('/deleteAllMessage/:user_id', (req, res) => {
    const { user_id } = req.params
    let sqlArr = [
        {
            sql: 'DELETE FROM message_tb WHERE user_id = ?',
            values: [user_id]
        }
    ]

    execTranstion(sqlArr).then(result => {
        if (result[0].rows.affectedRows > 0) {
            res.send({
                code: 1,
                message: '已全部删除'
            })
        }
    }).catch((error) => {
        res.send({
            code: 0,
            message: '删除失败'
        })
    })
})

// 上传用户头像
router.post('/uploadAvatar', upload.single('avatar'), async (req, res) => {
    const { id, username, newUsername } = req.body
    let file = req.file
    let operation, fileOldName, sqlArr, handleFileName

    if (!id) {
        return res.status(400).send({
            code: 0,
            message: '修改失败，用户ID不存在'
        });
    }

    if (file) { // 有文件上传
        const checkResult = await execTranstion([
            {
                sql: 'SELECT avatar FROM user_tb WHERE id = ?',
                values: [id]
            }
        ])
        if (checkResult[0].rows.length === 0) {
            return res.status(404).send({
                code: 0,
                message: '用户未找到'
            });
        } else {
            fileOldName = result[0].rows[0].avatar
        }

        handleFileName = `${id}-${newUsername || username}-${file.originalname}`
        let newSource = path.join(config.parsed.uploadPath, handleFileName)
        fs.renameSync(file.path, newSource)
        if (!Object.is(username, newUsername)) { // 修改用户名和头像
            operation = 'both'
            sqlArr = [
                {
                    sql: 'UPDATE user_tb SET username = ?, avatar = ? WHERE id = ?',
                    values: [newUsername, handleFileName, id]
                },
                {
                    sql: 'UPDATE message_tb SET message_tb.username = (SELECT username FROM user_tb WHERE id = ?) WHERE user_id = ?',
                    values: [id, id]
                }
            ]
        } else if (Object.is(username, newUsername)) { // 只修改头像
            operation = 'onlyAvatar'
            sqlArr = [
                {
                    sql: 'UPDATE user_tb SET avatar = ? WHERE id = ?',
                    values: [handleFileName, id]
                }
            ]
        }
    } else { // 没有文件上传，只修改名字
        operation = 'onlyUsername'
        sqlArr = [
            {
                sql: 'UPDATE user_tb SET username = ? WHERE id = ?',
                values: [newUsername, id]
            },
            {
                sql: 'UPDATE message_tb SET message_tb.username = (SELECT username FROM user_tb WHERE id = ?) WHERE user_id = ?',
                values: [id, id]
            }
        ]
    }

    if (operation === 'both') {
        await execTranstion(sqlArr).then(result => {
            if (result[0].rows.affectedRows > 0) {
                if (fileOldName) {
                    const oldFilePath = path.join(config.parsed.uploadPath, fileOldName)
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath); // 删除旧文件（同步）
                        console.log('旧头像已删除');
                    }
                }
                res.send({
                    code: 1,
                    message: '用户名和头像修改成功',
                    username: newUsername,
                    avatarUrl: handleFileName
                })
            } else {
                res.send({
                    code: 0,
                    message: '修改失败'
                })
            }
        }).catch(error => {
            console.error(error)
            res.status(500).send({ code: 0, message: '服务器错误' })
        })
    } else if (operation === 'onlyAvatar') {
        await execTranstion(sqlArr).then(result => {
            if (result[0].rows.affectedRows > 0) {
                if (fileOldName) {
                    const oldFilePath = path.join(config.parsed.uploadPath, fileOldName)
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath); // 删除旧文件（同步）
                        console.log('旧头像已删除');
                    }
                }
                res.send({
                    code: 1,
                    message: '头像修改成功',
                    avatarUrl: handleFileName
                })
            } else {
                res.send({
                    code: 0,
                    message: '修改失败'
                })
            }
        }).catch(error => {
            console.error(error)
            res.status(500).send({ code: 0, message: '服务器错误' })
        })
    } else {
        await execTranstion(sqlArr).then(result => {
            if (result[0].rows.affectedRows > 0) {
                res.send({
                    code: 1,
                    message: '用户名修改成功',
                    username: newUsername,
                })
            } else {
                res.send({
                    code: 0,
                    message: '修改失败'
                })
            }
        }).catch(error => {
            console.error(error)
            res.status(500).send({ code: 0, message: '服务器错误' })
        })
    }

    // let sql, values, handleFileName
    // if (file) { // 有文件上传
    //     handleFileName = `${id}-${newUsername || username}-${file.originalname}`
    //     let newSource = path.join(config.parsed.uploadPath, handleFileName)
    //     fs.renameSync(file.path, newSource)
    //     if (!Object.is(username, newUsername)) { // 修改用户名和头像
    //         sql = 'UPDATE user_tb SET username = ?, avatar = ? WHERE id = ?'
    //         values = [newUsername, handleFileName, id]
    //     } else if (Object.is(username, newUsername)) { // 只修改头像
    //         sql = 'UPDATE user_tb SET avatar = ? WHERE id = ?'
    //         values = [handleFileName, id]
    //     }
    // } else { // 只修改名字
    //     sql = 'UPDATE user_tb SET username = ? WHERE id = ?'
    //     values = [newUsername, id]
    // }
    //
    // let sqlArr = [
    //     {
    //         sql: sql,
    //         values: values
    //     }
    // ]
    //
    // await execTranstion(sqlArr).then(result => {
    //     if (result[0].rows.affectedRows > 0) {
    //         if (fileOldName) {
    //             const oldFilePath = path.join(config.parsed.uploadPath, fileOldName)
    //             if (fs.existsSync(oldFilePath)) {
    //                 fs.unlinkSync(oldFilePath); // 删除旧文件（同步）
    //                 console.log('旧头像已删除');
    //             }
    //         }
    //         res.send({
    //             code: 1,
    //             message: '修改成功',
    //             username: newUsername,
    //             avatarUrl: handleFileName
    //         })
    //     } else {
    //         res.send({
    //             code: 0,
    //             message: '修改失败'
    //         })
    //     }
    // }).catch(error => {
    //     console.error(error)
    //     res.status(500).send({ code: 0, message: '服务器错误' })
    // })
})

// 修改邮箱
router.put('/updateEmail/:id', (req, res) => {
    const { id } = req.params
    const { email } = req.body

    if (!id) {
        return res.send({
            code: -1,
            message: '用户未登录'
        })
    }

    if (!verifyEmail(email)) {
        return res.send({
            code: 2,
            message: '邮箱格式不合法'
        })
    }

    let sqlArr = [
        {
            sql: 'UPDATE user_tb SET email = ? WHERE id = ?',
            values: [email, id]
        }
    ]

    execTranstion(sqlArr).then(result => {
        if (result[0].rows.affectedRows > 0) {
            res.send({
                code: 1,
                message: '修改成功',
                newEmail: email
            })
        } else {
            res.send({
                code: 0,
                message: '修改失败'
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

// 修改手机号
router.put('/updatePhoneNumber/:id', (req, res) => {
    const { id } = req.params
    const { phone_number } = req.body

    if (!id) return res.send({
        code: -1,
        message: '用户未登录'
    })

    if (!verifyPhoneNumber(phone_number)) {
        return res.send({
            code: 2,
            message: '手机号格式不合法'
        })
    }

    let sqlArr1 = [
        {
            sql: `SELECT EXISTS (SELECT 1 FROM user_tb WHERE phone_number = ?) AS isExists`,
            values: [phone_number]
        }
    ]

    let sqlArr2 = [
        {
            sql: 'UPDATE user_tb SET phone_number = ? WHERE id = ?',
            values: [phone_number, id]
        }
    ]

    execTranstion(sqlArr1).then(result => {
        if(result[0].rows[0].isExists) {
            return res.send({
                code: -1,
                msg: '该账号已存在'
            })
        } else {
            execTranstion(sqlArr2).then(result => {
                if (result[0].rows.affectedRows > 0) {
                    res.send({
                        code: 1,
                        message: '修改成功',
                        newPhoneNumber: phone_number
                    })
                } else {
                    res.send({
                        code: 0,
                        message: '修改失败'
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

// 修改身份证
// router.put()

export default router