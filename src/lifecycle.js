import Watcher from "./observer/watcher"
import { nextTick } from "./utils"
import { patch } from "./vdom/patch"

function lifecycleMixin (Vue) {
  Vue.prototype._update = function (vnode) {
    const vm = this
    const preVnode = vm._vnode
    if (!preVnode) {
      vm.$el = patch(vm.$el, vnode)
      vm._vnode = vnode
    } else {
      vm.$el = patch(preVnode, vnode)
    }
  }

  Vue.prototype.$nextTick = nextTick
}

function mountComponent (vm, el) {
  callHook(vm, 'beforeMount')
  // 更新函数，数据变化后，会再次调用此方法
  const updateComponent = () => {
    // 调用 render 函数，生成 虚拟DOM
    // 用虚拟DOM生成真实的DOM
    vm._update(vm._render())
  }

  new Watcher(vm, updateComponent, () => {
    console.log('视图更新了')
  }, true)

  callHook(vm, 'mounted')
}

function callHook (vm, hook) {
  const handlers = vm.$options[hook]
  if (handlers) {
    for (let i = 0; i < handlers.length; i++) {
      handlers[i].call(vm)
    }
  }
}

export {
  mountComponent,
  lifecycleMixin,
  callHook
}