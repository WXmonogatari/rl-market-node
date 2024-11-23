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
        expiresIn: '24h'
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
        SECRECT_KEY,
        { expiresIn: '7d' }
    );
}