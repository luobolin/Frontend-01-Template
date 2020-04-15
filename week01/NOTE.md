##### [前端技术总结](https://github.com/luobolin/Frontend-01-Template/blob/master/week01/frontend.md)(待完善)

**问：**`<html>`标签中`lang`属性如何取值？为什么有时是`zh`，有时候是`zh-cn`，或者`zh_CN`?

```html
<!-- 语法： -->
<html lang='language["-" script]["-" region]'>

<!-- 说明： -->
<!-- language: zh 中文 / en 英语 / ... -->
<!-- script: Hans 简体汉字 / Hant 繁体汉字 / ... -->
<!-- region: CN CHINA 中国 / HK HONG KONG 香港 / TW Taiwan 台湾 / SG Singapore 新加坡 -->
```

**例：**
```html
<!-- 简体中文推荐 zh-Hans-CN -->
<html lang='zh-Hans-CN'>

<!-- 繁体中文推荐 zh-Hant-HK -->
<html lang='zh-Hant-HK'>

<!-- 英语推荐 en-US -->
<html lang='en-US'>
```

**答：**`zh`及`zh-cn`符合规范，但不推荐使用。`zh_CN`表达方式无效

**附录：**
[BCP47规范](https://www.ietf.org/rfc/bcp/bcp47.txt)
[IANA语言子标签注册表](https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry)