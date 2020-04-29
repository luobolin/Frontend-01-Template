/**
 * 将字符串转换为数字
 * @param str 需要转换的字符串
 */
const convertStringToNumber = (str: string): number => {
    const obj: { int: number; float: number, dot: boolean} = { int: 0, float: 0, dot: false }
    let isPosi = true

    for (let i = 0; i < str.length; i++) {
        const point = str[i].charCodeAt(0)

        if (point === 43) {
            continue
        }

        if ((point < 48 && point !== 46 && point !== 45) || point > 57 || (point === 46 && obj.dot) || (point === 45 && !isPosi)) {
            return NaN
        }

        if (point === 46) {
            obj.dot = true
            continue
        }

        if (point === 45) {
            isPosi = false
            continue
        }

        obj.dot ? obj.float *= 0.1 : obj.int *= 10
        obj[obj.dot ? 'float' : 'int'] += point - 48
    }

    const num = obj.int + obj.float * 0.1
    return isPosi ? num : -num
}

console.log(`测试字符串：100, 测试状态：${convertStringToNumber('100') === 100 ? '通过' : '出错'}`)
console.log(`测试字符串：-50, 测试状态：${convertStringToNumber('-50') === -50 ? '通过' : '出错'}`)
console.log(`测试字符串：+10, 测试状态：${convertStringToNumber('+10') === +10 ? '通过' : '出错'}`)
console.log(`测试字符串：1.2, 测试状态：${convertStringToNumber('1.2') === 1.2 ? '通过' : '出错'}`)
console.log(`测试字符串：012, 测试状态：${convertStringToNumber('012') === 12 ? '通过' : '出错'}`)
console.log(`测试字符串：1a2, 测试状态：${isNaN(convertStringToNumber('1a2')) ? '通过' : '出错'}`)