/**
 * 邮箱校验（简单校验）
 * @param {String} email - 邮箱
 */
export const verifyEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
}

/**
 * 手机号校验
 * @param {String} value - 手机号
 */
export const verifyPhoneNumber = (value) => {
    let result = {
        bool: false,
        message: ''
    }
    const reg = new RegExp(/^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/)
    if (!reg.test(value)) {
        result.message = '请输入正确的手机号格式'
        return result
    } else {
        result.bool = true
        return result
    }
}

/**
 * 身份证校验
 * @param {String} value - 待校验数据
 * @returns {Object} result - 结果对象
 * @returns {boolean} result.bool - 布尔值
 * @returns {String} result.message - 返回信息
 */
export const verifyIdentityNumber = (value) => {
    let result = {
        bool: false,
        message: ''
    }
    const provinceArray = {
        12: '天津',
        11: '北京',
        13: '河北',
        14: '山西',
        15: '内蒙古',
        21: '辽宁',
        22: '吉林',
        23: '黑龙江',
        31: '上海',
        32: '江苏',
        33: '浙江',
        34: '安徽',
        35: '福建',
        36: '江西',
        37: '山东',
        41: '河南',
        42: '湖北',
        43: '湖南',
        44: '广东',
        45: '广西',
        46: '海南',
        50: '重庆',
        51: '四川',
        52: '贵州',
        53: '云南',
        54: '西藏',
        61: '陕西',
        62: '甘肃',
        63: '青海',
        64: '宁夏',
        65: '新疆',
        71: '台湾',
        81: '香港',
        82: '澳门'
    }
    const reg = new RegExp(/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i)
    if (!reg.test(value)) {
        result.message = '身份证号码格式错误'
        return result
    } else if (!provinceArray[value.substring(0, 2)]) {
        result.message = '无效的地址码'
        return result
    } else {
        if (value.length === 18) {
            value = value.split('')
            /*系数*/
            const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
            /*校验位*/
            const checkSum = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2]
            let sum = 0
            let ai = 0
            let wi = 0
            for (let i = 0; i < 17; i++) {
                ai = value[i]
                wi = factor[i]
                sum += ai * wi
            }
            const last = checkSum[sum % 11]
            if (last != value[17]) {
                result.message = '校验位错误'
                return result
            } else {
                result.bool = true
                return result
            }
        }
    }
}