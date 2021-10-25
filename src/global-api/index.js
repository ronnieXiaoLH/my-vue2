import { mergeOptions } from "../utils"

export function initGlobalApi (Vue) {
  Vue.options = {}
  Vue.options._base = Vue

  Vue.mixin = function (options) {
    this.options = mergeOptions(this.options, options)
    return this
  }

  // debugger
  Vue.options._base = Vue // 无论后续创建多少个子类，都可以通过 _base 找到 Vue
  Vue.options.components = {}

  Vue.component = function (id, definition) {
    definition = this.options._base.extend(definition)
    this.options.components[id] = definition
  }

  // extend 方法就是创建一个继承自 Vue 的类，并且具有 Vue 的所有功能
  Vue.extend = function (opts) {
    const Super = this
    const Sub = function VueComponent (options) {
      this._init(options)
    }
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub
    Sub.options = mergeOptions(Super.options, opts)
    return Sub
  }
}