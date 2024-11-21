import jwt from 'jsonwebtoken'

export const SECRECT_KEY = "relife.monogatari"

/**
 * 生成token
 * @returns {string} token
 */
export const createToken = () => {
    return jwt.sign({
        id: 1,
        token_type: "TOKEN",
    }, SECRECT_KEY, {
        expiresIn: '15s'
    })
}

export const createRefreshToken = (res) => {
    return jwt.sign(
        {
            id: 1,
            token_type: "REFRESH_TOKEN",
        },
        SECRECT_KEY,
        { expiresIn: '1h' } // 这里为处理测试长token失效跳转登录页逻辑15s过期，可设置时间长些
    );
}