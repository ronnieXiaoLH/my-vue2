const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*` // 匹配标签名
const qnameCapture = `((?:${ncname}\\:)?${ncname})` // 获取标签名
const startTagOpen = new RegExp(`^<${qnameCapture}`) // 匹配开始标签
const startTagClose = /^\s*(\/?)>/ // 匹配标签结束
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) // 匹配结束标签
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/ // 匹配属性
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // 匹配 {{}}

function createAstElement (tagName, attrs) {
  return {
    tag: tagName,
    type: 1,
    children: [],
    parent: null,
    attrs
  }
}

function parseHTML(html) { // <div id="app">{{ name }}</div>
  let root = null
  
  let stack = []

  // root 为空，创建的第一个 ast 元素作为 root
  // root 不为空，创建的 ast 元素设置 parent 为栈顶元素，栈顶元素的 children push 进去 ast 元素
  function start (tagName, attrs) {
    let parent = stack[stack.length - 1]
    const element = createAstElement(tagName, attrs)
    if (!root) {
      root = element
    } else {
      element.parent = parent // 当入栈时，记录该元素的父元素
    }
    parent && parent.children.push(element)
    stack.push(element)
  }

  function end (tagName) {
    const element = stack.pop()
    if (element.tag !== tagName) {
      throw new Error('标签闭合有误')
    }
  }

  function chars (text) {
    text = text.trim()
    let parent = stack[stack.length - 1]
    if (text) {
      parent.children.push({
        type: 3,
        text
      })
    }
  }

  function advance(len) {
    // 匹配到之后就截取调匹配到的字符串
    html = html.substring(len)
  }

  function parseStartTag() {
    const start = html.match(startTagOpen)
    if (start) {
      const match = {
        tagName: start[1],
        attrs: []
      }
      advance(start[0].length)

      let end
      let attr
      // 如果没有遇到标签结尾，就不停的解析 --- 解析标签属性
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        let obj = {
          name: attr[1],
          value: attr[3] || attr[4] || attr[5]
        }
        match.attrs.push(obj)
        advance(attr[0].length)
      }
      // 解析完属性，最后匹配到标签结尾
      if (end) {
        advance(end[0].length)
      }
      return match
    }
    return false // 不是开始标签
  }

  while (html) {
    let textEnd = html.indexOf('<')
    if (textEnd === 0) {
      const startTagMatch = parseStartTag() // 匹配到是开始标签
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue
      }
      const endTagMatch = html.match(endTag) // 匹配到时结束标签
      if (endTagMatch) {
        end(endTagMatch[1])
        advance(endTagMatch[0].length)
        continue
      }
    }
    let text 
    if (textEnd > 0) {
      text = html.substring(0, textEnd)
    }
    if (text) {
      chars(text)
      advance(text.length)
    }
  }

  return root
}

export {
  parseHTML
}