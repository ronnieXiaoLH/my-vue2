import { initGlobalApi } from './global-api'
import { initMixin } from './init'
import { lifecycleMixin } from './lifecycle'
import { renderMixin } from './render'
import { stateMixin } from './state'

function Vue (options) {
  this._init(options)
}

// 扩展 Vue 原型
initMixin(Vue) // _init, $mount
renderMixin(Vue) // _render
lifecycleMixin(Vue) // _update
stateMixin(Vue) // $watch

// 在类上扩展 Vue.mixin, Vue.component, Vue.extend
initGlobalApi(Vue)

// 测试diff算法 ---------------------------------------------------------------------------------------
/* import { compileToFunction } from './compiler'
import { createEl, patch } from './vdom/patch'
const oldTemplate = `<div id="app" style="color:red;background:yellow;" a="1">
<li key="c">c</li>
<li key="a">a</li>
<li key="b">b</li>
<li key="d">d</li>
</div>`
const render1 = compileToFunction(oldTemplate)
const vm1 = new Vue({
  data: {
    message: 'hello world'
  }
})
const oldVnode = render1.call(vm1)
const el1 = createEl(oldVnode)
document.body.appendChild(el1)

const newTemplate = `<div id="app2" style="color:blue;" b="2">
<li key="b">b</li>
<li key="c">c</li>
<li key="d">d</li>
<li key="a">a</li>
</div>`
const render2 = compileToFunction(newTemplate)
const vm2 = new Vue({
  data: {
    message: 'zf'
  }
})
const vnode = render2.call(vm2)
setTimeout(() => {
  patch(oldVnode, vnode)
}, 2000) */

export default Vue