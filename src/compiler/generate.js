import { isObject } from "../utils"

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // 匹配 {{}}

function genProps (attrs) {
  let str = ''
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i]
    if (attr.name === 'style') {
      let styleObj = {}
      attr.value.replace(/([^:;]+)\:([^:;]+)/g, function() {
        styleObj[arguments[1]] = arguments[2]
      })
      attr.value = styleObj
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`
  }
  return `{${str.slice(0, -1)}}` // 去掉末尾多余的一个逗号
}

function gen (el) {
  // 元素节点
  if (el.type === 1) {
    return generate(el)
  } else if (el.type === 3) {
    // 文本节点
    let text = el.text
    if (!defaultTagRE.test(text)) {
      return `_v('${text}')`
    }
    let tokens = []
    let match
    let lastIndex = defaultTagRE.lastIndex = 0
    while (match = defaultTagRE.exec(text)) {
      let index = match.index
      if (index > lastIndex) {
        tokens.push(JSON.stringify(text.slice(lastIndex, index)))
      }
      tokens.push(`_s(${match[1].trim()})`)
      lastIndex = index + match[0].length
    }
    if (lastIndex < text.length) {
      tokens.push(JSON.stringify(text.slice(lastIndex)))
    }
    return `_v(${tokens.join('+')})`
  }
}

function genChildren (el) {
  let children = el?.children
  if (children) {
    return children.map(child => gen(child)).join(',')
  }
  return false
}

function generate (el) {
  // 遍历 ast 生成字符串
  let children = genChildren(el)
  let code = `_c('${el.tag}',${
    el.attrs.length ? genProps(el.attrs) : '{}'
  }${
    children ? `,${children}` : ''
  })`

  return code
}

export {
  generate
}