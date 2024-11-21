import crypto from "crypto"

/**
 * 生成盐
 * @param {number} length - 需要随机的字符串长度
 * @returns {string}
 */
export const genRandomString =  (length) => {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length)
}

/**
 * 将密码和盐一起进行hash加密
 * @param {string} password - 密码
 * @param {string} salt - 盐
 * @returns {{salt, passwordHash: string}}
 */
export const sha512 = (password, salt) => {
    let hash = crypto.createHmac('sha512', salt)
    hash.update(password)
    let value = hash.digest('hex')
    return {
        salt: salt,
        passwordHash: value
    }
}

/**
 * 验证用户输入的密码是否正确
 * @param {string} inputPassword - 用户输入的密码
 * @param {string} storedPasswordHash - 存储的哈希密码
 * @param {string} storedSalt - 存储的盐
 * @returns {boolean} - 返回密码是否匹配
 */
export const verifyPassword = (inputPassword, storedPasswordHash, storedSalt) => {
    const hashData = sha512(inputPassword, storedSalt);
    return Object.is(hashData.passwordHash, storedPasswordHash)
}