const EOF = Symbol('EOF')

const layoutJs = require('../week07/layout')

let currentToken = null
let currentAttribute = null
let currentTextNode = null
let stack = [
    { type: 'document', children: [] }
]

function emit(token) {
    let top = stack[stack.length - 1]
    if (token.type === 'startTag') {
        let element = {
            type: 'element',
            children: [],
            attributes: []
        };

        (element as any).tagName = token.tagName

        for (let p in token) {
            if (p !== 'type' && p !== 'tagName') {
                element.attributes.push({
                    name: p,
                    value: token[p]
                })
            }
        }

        top.children.push(element);
        (element as any).parent = top

        if (!token.isSelfClosing) {
            stack.push(element)
        }

        // console.log('push', element)
        currentTextNode = null
    } else if (token.type === 'enTag') {
        if ((top as any).tagName !== token.tagName) {
            throw new Error("Tag start end doesn't match")
        } else {
            // console.log('pop', stack.pop())
            if ((top as any).tagName === 'style') {
                // addCSSRules(top.children[0].content)
            }
            layoutJs.layout(top)
            stack.pop()
        }
        currentTextNode = null
    } else if (token.type === 'text') {
        if (currentTextNode === null) {
            currentTextNode = {
                type: 'text',
                content: ''
            }
            top.children.push(currentTextNode)
        }
        currentTextNode.content += token.content
        // console.log('text', currentTextNode)
    }
}

const parseHTML = (html) => {
    let state = data
    for (let char of html) {
        state = state(char)
    }

    state = state(EOF)
    console.log(stack)
}

module.exports.parseHTML = parseHTML

function data(char): any {
    if (char === '<') {
        return tagOpen
    }
    // else if (char === '/') {
    //     return selfClosingStartTag
    // } else if (char === '>') {
    //     emit(currentToken)
    //     return data
    // } 
    else if (char === EOF) {
        emit({ type: EOF })
        return
    } else {
        emit({ type: 'text', content: char })
        return data
    }
}

function tagOpen(char) {
    if (char === '/') {
        return endTagOpen
    } else if (char.match(/^[a-z]$/)) {
        currentToken = {
            type: 'startTag',
            tagName: ''
        }
        return tagName(char)
    } else {
        // return
    }
}

function endTagOpen(char) {
    if (char.match(/^[a-z]$/)) {
        currentToken = {
            type: 'endTag',
            tagName: ''
        }

        return tagName(char)
    } else if (char === '>') {

    } else if (char === EOF) {

    }
}

function tagName(char) {
    if (char.match(/^[\n\r\f\s]$/)) {
        return beforeAttributeName(char)
    } else if (char === '/') {
        return selfClosingStartTag
    } else if (char.match(/^[a-z]$/)) {
        currentToken.tagName += char
        return tagName
    } else if (char === '>') {
        emit(currentToken)
        return data
    } else {
        return tagName
    }
}

function beforeAttributeName(char) {
    if (char.match(/^[\t\n\f\s]$/)) {
        return beforeAttributeName
    } else if (char === '>' || char == "/" || char == EOF) {
        return afterAttributeName(char)
    } else if (char === '=') {
        return
    } else {
        currentAttribute = {
            name: '',
            value: ''
        }
        return attributeName(char)
    }
}

function afterAttributeName(char) {
    if (char === '/') {
        return selfClosingStartTag
    } else if (char === EOF) {
        return
    } else {
        emit(currentToken)
        return data
    }
}

function attributeName(char) {
    if (char.match(/^[\t\n\f\s]$/) || char === '/' || char === '>' || char === EOF) {
        return afterAttributeName(char)
    } else if (char === '=') {
        return beforeAttributeValue
    } else if (char === '\u0000') {

    } else if (char === "'" || char === "\"" || char === '<') {
        return attributeName
    } else {
        currentAttribute.name += char
        return attributeName
    }
}

function beforeAttributeValue(char) {
    if (char.match(/^[\t\n\f\s]$/) || char === '/' || char === '>' || char === EOF) {
        return beforeAttributeValue
    } else if (char === "\"") {
        return doubleQuotedAttributeValue
    } else if (char === "'") {
        return singleQuotedAttributeValue
    } else if (char === '>') {
        emit(currentToken)
    } else {
        return UnquotedAttributeValue(char)
    }
}

function doubleQuotedAttributeValue(char) {
    if (char === "\"") {
        currentToken[currentAttribute.name] = currentAttribute.value
        return afterQuotedAttributeValue
    } else if (char === '\u0000') {

    } else if (char === EOF) {

    } else {
        currentAttribute.value += char
        return doubleQuotedAttributeValue
    }
}

function singleQuotedAttributeValue(char) {
    if (char === "'") {
        currentToken[currentAttribute.name] = currentAttribute.value
        return afterQuotedAttributeValue
    } else if (char === '\u0000') {

    } else if (char === EOF) {

    } else {
        currentAttribute.value += char
        return singleQuotedAttributeValue
    }
}

function afterQuotedAttributeValue(char) {
    if (char.match(/^[\t\n\f\s]$/)) {
        return beforeAttributeName
    } else if (char === '/') {
        return selfClosingStartTag
    } else if (char === '>') {
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentToken)
        return data
    } else if (char === EOF) {

    } else {

    }
}

function UnquotedAttributeValue(char) {
    if (char.match(/^[\t\n\f\s]$/)) {
        currentToken[currentAttribute.name] = currentAttribute.value
        return beforeAttributeName
    } else if (char === '/') {
        currentToken[currentAttribute.name] = currentAttribute.value
        return selfClosingStartTag
    } else if (char === '>') {
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentToken)
        return data
    } else if (char == "\u0000") {
        // return data
    } else if (char == "\"" || char == "\'" || char == "<" || char == "=" || char == "`") {
        // return data
    } else if (char == EOF) {
        // return data
    } else {
        currentAttribute.value += char
        return UnquotedAttributeValue
    }
}

function selfClosingStartTag(char) {
    if (char === '>' || char === '/') {
        currentToken.isSelfClosing = true
        currentToken.type = 'selfClosingTag'
        emit(currentToken)
        return data
    } else if (char === EOF) {

    } else {

    }
}