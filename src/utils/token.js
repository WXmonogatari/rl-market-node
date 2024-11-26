import jwt from 'jsonwebtoken'

export const SECRET_KEY = "relife.monogatari"

/**
 * 生成token
 * @returns {string} token
 */
export const createToken = () => {
    return jwt.sign({
        id: 1,
        token_type: "TOKEN",
    }, SECRET_KEY, {
        expiresIn: '1h'
    })
}

/**
 * 长token
 * @param res
 */
export const createRefreshToken = (res) => {
    return jwt.sign(
        {
            id: 1,
            token_type: "REFRESH_TOKEN",
        },
        SECRET_KEY,
        { expiresIn: '7d' }
    );
}

export const authenticateToken = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) return res.sendStatus(401); // 没有 token 返回401

    const token = authorization.replace('Bearer ', '');
    jwt.verify(token, SECRET_KEY, (err) => {
        if (err) return res.sendStatus(403); // token 无效，返回403
        next(); // 继续处理请求
    });
}