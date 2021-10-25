import { compileToFunction } from './compiler'
import { callHook, mountComponent } from './lifecycle'
import { initState } from './state'
import { mergeOptions } from './utils'

export function initMixin (Vue) {
  Vue.prototype._init = function (options) {
    const vm = this
    vm.$options = mergeOptions(this.constructor.options, options)
    callHook(vm, 'beforeCreate')
    // 初始化数据
    initState(vm)
    callHook(vm, 'created')
    vm.$mount(vm.$options.el)
  }

  Vue.prototype.$mount = function (el) {
    const vm = this
    const options = vm.$options
    el = document.querySelector(el)
    vm.$el = el

    if (!options.render) {
      let template = options.template
      if (!template && el) {
        template = el.outerHTML
      }
      // 如果没有 render，也没有 template，甚至没有 el，就补充一个根元素
      if (!template) {
        template = `<div></div>`
      }
      let render = compileToFunction(template)
      options.render = render
    }

    mountComponent(vm, el)
  }
}