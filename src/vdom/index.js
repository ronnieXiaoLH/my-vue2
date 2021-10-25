import { isObject, isReservedTag } from "../utils"

export function createElement (vm, tag, data, ...children) {
  // console.log(tag, isReservedTag(tag))
  // 原生的HTML元素
  if (isReservedTag(tag)) {
    return vnode(vm, tag, data, data?.key, children, undefined)
  } else {
    // 组件
    const Ctor = vm.$options.components[tag]
    return createComponent(vm, tag, data, data?.key, children, Ctor)
  }
}

// 创建组件的 vnode ，首先从 vm.$options.components 拿到组件的 {template:'xxx'}，如果是 Vue.component 方法创建的组件就是 VueComponent 的构造函数
function createComponent (vm, tag, data, key, children, Ctor) {
  if (isObject(Ctor)) {
    // 通过 Vue.extend 方法生成子组件的构造函数 VueComponent
    Ctor = vm.$options._base.extend(Ctor)
  }
  // 给 data 新增一个 hook 对象，hook 有一个 init 方法，init 方法内部通过 构造函数 VueComponent 创建组件的实例，并把生成组件的 $el 挂载到 vnode 的 componentInstance 属性上
  data.hook = {
    init(vnode) {
      vnode.componentInstance = new Ctor({ isComponent: true })
      // console.log('vm', vm)
      // vm.$mount()
    }
  }
  return vnode(vm, `vue-component-${tag}`, data, key, undefined, undefined, { Ctor, children })
}

export function createTextElement (vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text)
}

function vnode (vm, tag, data, key, children, text, componentOptions) {
  return {
    vm,
    tag,
    data,
    key,
    children,
    text,
    componentOptions
  }
}