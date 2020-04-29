/**
 * 将数字转换为字符串
 * @param num 需要转换的数字
 */
const convertNumberToString = (num: number): string => {
    if (isNaN(num)) return 'NaN'
    let [str, count, isPosi] = ['', 0, false]

    if (num < 0) {
        isPosi = true
        num = -num
    }

    while(num >> 0 !== num) {
        num = num * 10
        count++
    }

    while(num % 10 !== num && num >> 0 === num) {
        const remainder = num % 10
        num = num / 10 >> 0
        str = (--count === 0 ? '.' : '') + String.fromCharCode(48 + remainder) + str
    }

    return (isPosi ? '-' : '') + String.fromCharCode(48 + num) + str
}

console.log(`测试字符串：100, 测试状态：${convertNumberToString(100) === '100' ? '通过' : '出错'}`)
console.log(`测试字符串：-50, 测试状态：${convertNumberToString(-50) === '-50' ? '通过' : '出错'}`)
console.log(`测试字符串：+10, 测试状态：${convertNumberToString(+10) === '10' ? '通过' : '出错'}`)
console.log(`测试字符串：1.2, 测试状态：${convertNumberToString(1.2) === '1.2' ? '通过' : '出错'}`)
console.log(`测试字符串：1a2, 测试状态：${convertNumberToString(NaN) === 'NaN' ? '通过' : '出错'}`)