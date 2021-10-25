import { generate } from './generate'
import { parseHTML } from './parser'

export function compileToFunction(template) {
  const root = parseHTML(template) // root -> ast
  // console.log('root', root)

  // html => ast(只能描述语法，语法不存在的属性无法描述) => render函数 => 虚拟DOM(增加额外的属性) => 真实DOM

  // 生成代码
  const code = generate(root) // code -> _c('div', {}, ...)
  // console.log(code)
  const render = new Function(`with(this){return ${code}}`)
  return render
}