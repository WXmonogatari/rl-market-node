/**
 * 返回随机用户名 格式 用户+大小写字母+手机号后四位
 * @param {String} phoneNumber - 手机号
 * @returns {string}
 */
export const randomUsername = (phoneNumber) => {
    const reg = new RegExp(/^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/)

    // 正则校验手机号
    if (reg.test(phoneNumber)) {
        // 获取手机号最后四位
        const lastFourDigits = phoneNumber.slice(-4)
        // 生成六个随机字母
        const randomLetters = generateRandomLetters(6)
        // 返回结果
        const user = '用户'
        return `${user}${randomLetters}${lastFourDigits}`
    } else {
        throw new Error('请输入正确的手机号格式')
    }
}

/**
 * 随机大小写六个字母
 * @param {Number} length - 长度
 * @returns {string}
 */
export const generateRandomLetters = (length) => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result
}